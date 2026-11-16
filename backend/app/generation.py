"""Generation jobs that outlive the HTTP request that started them.

A turn used to run inside the request's response generator, so anything that
closed the connection — a page reload, navigating away, a flaky network —
killed the generation partway. The user's message was already committed, so
the motion was left with a question and no answer, and nothing told a freshly
loaded page that a reply had ever been coming.

Now each turn runs on a background thread. The request that started it only
*listens*: it relays frames while it is connected, and if it goes away the job
carries on and commits the result anyway.

The motion row records the in-flight job (`generation_id` and friends), so any
request, in any worker process, can tell that one is running:

* `generation_heartbeat_at` is refreshed every few seconds by the job. A job
  whose heartbeat has gone quiet died with its process (a server restart), and
  is reaped the next time the motion is read.
* Cancelling clears `generation_id` and drops the unanswered user message
  straight away. The job notices on its next heartbeat, stops reading the
  provider stream, and — because it only persists while its id still matches
  — can never write a result after being cancelled.
"""

from __future__ import annotations

import queue
import threading
import uuid
from contextlib import closing
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

from flask import Flask, current_app
from sqlalchemy import update

from . import llm
from .extensions import db
from .models import ChatMessage, Motion

HEARTBEAT_SECONDS = 3
#: A job that hasn't checked in for this long is presumed dead.
STALE_AFTER = timedelta(seconds=30)

SERVER_STOPPED = (
    "The server stopped before Rhetor finished that reply. Send your message again."
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


class _Cancelled(Exception):
    pass


@dataclass
class Job:
    id: uuid.UUID
    motion_id: uuid.UUID
    kind: str  # "turn" | "advance"
    stage: int
    user_message_id: uuid.UUID | None
    streaming: bool
    #: Frames for whichever request is listening; `None` marks the end.
    frames: queue.Queue = field(default_factory=queue.Queue)
    cancel: threading.Event = field(default_factory=threading.Event)
    #: Partial text so far, served to pages that reconnect mid-turn.
    reply: str = ""
    document: str = ""


#: Jobs running in *this* process. Only used for partial text and a fast
#: cancel; correctness never depends on it, since other processes can't see it.
_jobs: dict[uuid.UUID, Job] = {}
_jobs_lock = threading.Lock()


# --- state on the motion row ------------------------------------------------


def is_running(motion: Motion) -> bool:
    return motion.generation_id is not None


def _clear(motion: Motion) -> None:
    motion.generation_id = None
    motion.generation_kind = None
    motion.generation_stage = None
    motion.generation_message_id = None
    motion.generation_heartbeat_at = None


def _drop_message(message_id: uuid.UUID | None) -> None:
    if message_id is None:
        return
    message = db.session.get(ChatMessage, message_id)
    if message is not None:
        db.session.delete(message)


def reap_if_stale(motion: Motion) -> None:
    """Clean up after a job whose process died. Commits if it changes anything."""
    beat = motion.generation_heartbeat_at
    if motion.generation_id is None or beat is None or _now() - beat < STALE_AFTER:
        return
    _drop_message(motion.generation_message_id)
    _clear(motion)
    motion.generation_error = SERVER_STOPPED
    db.session.commit()


def progress_json(motion: Motion) -> dict | None:
    """The in-flight job as the client sees it, or None."""
    if motion.generation_id is None:
        return None
    job = _jobs.get(motion.generation_id)
    return {
        "kind": motion.generation_kind,
        "stage": motion.generation_stage,
        "reply": job.reply if job else "",
        "document": job.document if job else "",
    }


def cancel(motion: Motion) -> None:
    """Stop the motion's job, if any, and forget the message it was answering."""
    motion = db.session.get(Motion, motion.id, with_for_update=True, populate_existing=True)
    if motion is None or motion.generation_id is None:
        db.session.commit()
        return
    job = _jobs.get(motion.generation_id)
    _drop_message(motion.generation_message_id)
    _clear(motion)
    db.session.commit()
    if job is not None:
        job.cancel.set()


# --- starting and listening ---------------------------------------------------


def start(
    motion: Motion,
    *,
    kind: str,
    stage: int,
    user_message_id: uuid.UUID | None,
    streaming: bool,
) -> Job:
    """Mark the motion busy, commit, and launch the job.

    The caller has already checked `is_running` and added the user message.
    """
    job = Job(
        id=uuid.uuid4(),
        motion_id=motion.id,
        kind=kind,
        stage=stage,
        user_message_id=user_message_id,
        streaming=streaming,
    )
    motion.generation_id = job.id
    motion.generation_kind = kind
    motion.generation_stage = stage
    motion.generation_message_id = user_message_id
    motion.generation_heartbeat_at = _now()
    motion.generation_error = None
    db.session.commit()

    with _jobs_lock:
        _jobs[job.id] = job
    app = current_app._get_current_object()
    threading.Thread(target=_run, args=(app, job), daemon=True, name=f"gen-{job.id}").start()
    return job


def listen(job: Job):
    """Yield `(event, data)` frames until the job ends.

    Stopping early (the client went away) is harmless: the job keeps going.
    """
    while True:
        frame = job.frames.get()
        if frame is None:
            return
        yield frame


def consume_error(motion_id: uuid.UUID) -> None:
    """The listener delivered the job's error itself — don't show it again."""
    db.session.execute(
        update(Motion).where(Motion.id == motion_id).values(generation_error=None)
    )
    db.session.commit()


# --- the job itself -------------------------------------------------------------


def _heartbeat(app: Flask, job: Job, stop: threading.Event) -> None:
    """Keep the job looking alive, and notice when it has been cancelled.

    Runs on its own thread because the provider can sit silent for a long time
    (reasoning models think before they write), and a heartbeat that only
    ticked on output would let a healthy job look dead.
    """
    with app.app_context():
        try:
            while not stop.wait(HEARTBEAT_SECONDS):
                result = db.session.execute(
                    update(Motion)
                    .where(Motion.id == job.motion_id, Motion.generation_id == job.id)
                    .values(generation_heartbeat_at=_now())
                )
                db.session.commit()
                if result.rowcount == 0:  # cancelled, superseded, or deleted
                    job.cancel.set()
                    return
        except Exception:  # noqa: BLE001 - a missed beat must not kill the job
            app.logger.exception("Generation heartbeat failed")
        finally:
            db.session.remove()


def _generate(job: Job, motion: Motion):
    if job.kind == "advance":
        context = llm.advance_context(motion, job.stage)
    else:
        context = llm.turn_context(motion, job.stage)
    # The provider call can take minutes; don't sit in an open transaction.
    db.session.commit()

    if not job.streaming:
        return llm.generate(**context)

    # closing(): on cancel, shut the provider stream (and its trace) right away.
    with closing(llm.stream_generation(**context)) as stream:
        for name, delta, result in stream:
            if job.cancel.is_set():
                raise _Cancelled
            if result is not None:
                return result
            if name == "reply":
                job.reply += delta
            elif name == "document":
                job.document += delta
            job.frames.put(("delta", {"field": name, "text": delta}))
    raise llm.LLMError("The response ended before it was complete.")


def _persist(job: Job, result) -> dict | None:
    """Write the result if the job still owns the motion. Returns its JSON."""
    # Imported here: the blueprint imports this module.
    from .blueprints.motions import apply_generation
    from .serializers import motion_json

    motion = db.session.get(Motion, job.motion_id, with_for_update=True, populate_existing=True)
    if motion is None or motion.generation_id != job.id:
        db.session.commit()
        raise _Cancelled
    apply_generation(motion, job.kind, job.stage, result)
    _clear(motion)
    db.session.commit()
    # Serialising re-reads the motion; end that transaction too.
    payload = motion_json(motion)
    db.session.commit()
    return payload


def _fail(job: Job, message: str) -> None:
    """Undo the turn and record why, unless it was cancelled meanwhile."""
    db.session.rollback()
    motion = db.session.get(Motion, job.motion_id, with_for_update=True, populate_existing=True)
    if motion is not None and motion.generation_id == job.id:
        _drop_message(job.user_message_id)
        _clear(motion)
        motion.generation_error = message
    db.session.commit()


def _run(app: Flask, job: Job) -> None:
    stop_heartbeat = threading.Event()
    beat = threading.Thread(
        target=_heartbeat, args=(app, job, stop_heartbeat), daemon=True
    )
    beat.start()
    final: tuple[str, dict]

    with app.app_context():
        try:
            motion = db.session.get(Motion, job.motion_id)
            if motion is None:
                raise _Cancelled
            result = _generate(job, motion)
            if job.cancel.is_set():
                raise _Cancelled
            final = ("done", {"motion": _persist(job, result)})
        except _Cancelled:
            db.session.rollback()
            final = ("cancelled", {})
        except llm.LLMError as exc:
            _fail(job, exc.message)
            final = ("error", {"message": exc.message, "code": "provider_error"})
        except Exception:  # noqa: BLE001 - the listener needs a frame, not silence
            app.logger.exception("Generation failed")
            _fail(job, "Something went wrong.")
            final = ("error", {"message": "Something went wrong.", "code": "internal_error"})
        finally:
            db.session.remove()
            # Stop the heartbeat before announcing the end, so nothing is
            # still writing to the row once a listener sees the final frame.
            stop_heartbeat.set()
            beat.join()
            with _jobs_lock:
                _jobs.pop(job.id, None)

    job.frames.put(final)
    job.frames.put(None)
