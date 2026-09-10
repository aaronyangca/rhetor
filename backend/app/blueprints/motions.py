"""Motions — the core loop: create, converse, advance, export."""

from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone

from flask import Blueprint, Response, current_app, jsonify, stream_with_context
from flask_login import current_user, login_required
from sqlalchemy import select

from .. import llm
from ..errors import ApiError
from ..llm import catalogue
from ..extensions import db
from ..models import PROVIDERS, ChatMessage, Motion
from ..security import body, one_of, required_str
from ..serializers import message_json, motion_json, motion_summary_json

bp = Blueprint("motions", __name__, url_prefix="/api/motions")

OPENING_MESSAGE = (
    "Let's build your case. What's the motion, and which position are you "
    "preparing — OG, OO, CG, or CO?"
)


def _get_motion(motion_id: uuid.UUID) -> Motion:
    motion = db.session.get(Motion, motion_id)
    # 404 rather than 403 for someone else's motion, so ids aren't probeable.
    if motion is None or motion.user_id != current_user.id:
        raise ApiError("Motion not found", 404)
    return motion


def _add_message(motion: Motion, stage: int, role: str, content: str) -> ChatMessage:
    message = ChatMessage(motion=motion, stage=stage, role=role, content=content)
    db.session.add(message)
    return message


def _invalidate_later_stages(motion: Motion, from_stage: int) -> None:
    """Editing a stage's document invalidates every stage built on top of it.

    Chat history for those stages is deliberately kept — re-advancing feeds it
    back in, so prior refinement discussion isn't lost.
    """
    for stage in range(from_stage + 1, 4):
        motion.set_document(stage, None)
    if motion.current_stage > from_stage:
        motion.current_stage = from_stage


TITLE_MAX = 60

# Words that describe the process or a single stage, not the debate topic. A
# model occasionally leaks one into the title (e.g. "... Seeds"); the title is
# fixed for the motion's life, so strip a trailing one.
_STAGE_WORDS = re.compile(
    r"[ \-–—]+(seeds?|bench|shortlist|pool|scoring|ranking|ideas?|drafts?"
    r"|case\s*file)\s*(\([A-Z]{2}\))?\s*$",
    re.IGNORECASE,
)
# A position belongs in a trailing "(OG)", never as a leading "OG — ...".
_LEAD_POSITION = re.compile(r"^(OG|OO|CG|CO)\s*[-–—:]\s*", re.IGNORECASE)


def _clamp_title(title: str) -> str:
    """Hold the model to the format the schema asks for.

    The format itself is the schema's job; this enforces the parts a model
    reliably gets wrong — overrunning the length, appending a stage word,
    leading with the position — and cuts at a word boundary so a truncated
    title still reads as words.
    """
    title = " ".join(title.split())
    title = _LEAD_POSITION.sub("", title)
    stripped = _STAGE_WORDS.sub(lambda m: f" {m.group(2)}" if m.group(2) else "", title)
    title = stripped.strip() or title
    if len(title) <= TITLE_MAX:
        return title
    head = title[:TITLE_MAX].rsplit(" ", 1)[0].rstrip(" ,;:-—")
    return f"{head or title[:TITLE_MAX]}…"


def _apply_turn(motion: Motion, stage: int, result) -> ChatMessage:
    """Fold one generation into the motion. Shared by both send paths."""
    if result.title and motion.title == "New motion":
        motion.title = _clamp_title(result.title)
    if result.motion_text and not motion.motion_text:
        motion.motion_text = result.motion_text
    if result.position and not motion.position:
        motion.position = result.position

    if result.document:
        motion.set_document(stage, result.document)
        _invalidate_later_stages(motion, stage)

    assistant_message = _add_message(motion, stage, "assistant", result.reply)
    motion.updated_at = datetime.now(timezone.utc)
    return assistant_message


@bp.get("")
@login_required
def list_motions():
    motions = db.session.scalars(
        select(Motion).where(Motion.user_id == current_user.id).order_by(Motion.updated_at.desc())
    ).all()
    return jsonify([motion_summary_json(m) for m in motions])


def _check_model(provider: str, model: object) -> str | None:
    """Validate an optional model choice against the provider's catalogue."""
    if model is None:
        return None
    if not isinstance(model, str) or not catalogue.is_valid(provider, model):
        raise ApiError(
            f"'{model}' is not a model available for {provider}.", 422, code="unknown_model"
        )
    return model


@bp.post("")
@login_required
def create_motion():
    data = body()
    provider = one_of(data, "provider", PROVIDERS)
    model = _check_model(provider, data.get("model"))

    if not current_user.encrypted_key_for(provider):
        raise ApiError(
            f"Add your {provider} API key in account settings before creating a motion.",
            400,
        )

    # `model` is left unset at creation — no generation happens here, so there
    # is nothing to pin yet. It resolves to the provider default at call time
    # unless the user chooses one from the workspace.
    motion = Motion(
        user=current_user,
        provider=provider,
        model=model,
        title="New motion",
        current_stage=1,
    )
    db.session.add(motion)
    # The AI speaks first, asking for the motion and position — there is no
    # separate creation form.
    _add_message(motion, 1, "assistant", OPENING_MESSAGE)
    db.session.commit()

    return jsonify(motion_json(motion)), 201


@bp.get("/<uuid:motion_id>")
@login_required
def get_motion(motion_id: uuid.UUID):
    return jsonify(motion_json(_get_motion(motion_id)))


@bp.patch("/<uuid:motion_id>")
@login_required
def update_motion(motion_id: uuid.UUID):
    motion = _get_motion(motion_id)
    data = body()

    if "title" in data:
        motion.title = required_str(data, "title", max_length=200)

    # Switching model mid-motion is allowed: it only affects the next call, and
    # a user who starts on a cheap model may well want to finish on a better one.
    if "model" in data:
        motion.model = _check_model(motion.provider, data["model"])

    if "currentStage" in data:
        stage = data["currentStage"]
        if stage not in (1, 2, 3):
            raise ApiError("'currentStage' must be 1, 2, or 3", 422)
        if stage > motion.current_stage:
            # Forward moves happen one stage at a time, and only from a stage
            # that has actually produced something to build on. This is the
            # lightweight path the user takes by typing "move to stage N" — it
            # just switches the stage; the next message generates the document.
            # `/advance` is the other path, which generates it up front.
            if stage != motion.current_stage + 1:
                raise ApiError("Move forward one stage at a time.", 409)
            if motion.document(motion.current_stage) is None:
                raise ApiError(
                    f"Stage {motion.current_stage} has nothing to build on yet — "
                    f"work on it a little first.",
                    409,
                )
        motion.current_stage = stage

    db.session.commit()
    return jsonify(motion_summary_json(motion))


@bp.delete("/<uuid:motion_id>")
@login_required
def delete_motion(motion_id: uuid.UUID):
    db.session.delete(_get_motion(motion_id))
    db.session.commit()
    return "", 204


@bp.post("/<uuid:motion_id>/messages")
@login_required
def send_message(motion_id: uuid.UUID):
    motion = _get_motion(motion_id)
    content = required_str(body(), "content", max_length=20000)
    stage = motion.current_stage

    user_message = _add_message(motion, stage, "user", content)
    db.session.flush()

    try:
        result = llm.run_turn(motion, stage)
    except llm.LLMError as exc:
        # Drop the user's message rather than leaving a turn the AI never
        # answered — the client re-sends on retry.
        db.session.rollback()
        raise ApiError(exc.message, exc.status, code="provider_error") from exc

    assistant_message = _apply_turn(motion, stage, result)
    db.session.commit()

    return jsonify(
        {
            "userMessage": message_json(user_message),
            "assistantMessage": message_json(assistant_message),
            "motion": motion_json(motion),
        }
    )


@bp.post("/<uuid:motion_id>/advance")
@login_required
def advance_stage(motion_id: uuid.UUID):
    motion = _get_motion(motion_id)
    current = motion.current_stage

    if current >= 3:
        raise ApiError("Stage 3 is the final stage", 409)
    if not motion.document(current):
        raise ApiError(
            f"Stage {current} has no document yet — work on it before advancing.", 409
        )

    target = current + 1

    try:
        result = llm.run_advance(motion, target)
    except llm.LLMError as exc:
        raise ApiError(exc.message, exc.status, code="provider_error") from exc

    motion.set_document(target, result.document)
    motion.current_stage = target
    _add_message(motion, target, "assistant", result.reply)
    motion.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(motion_json(motion))


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def _stream_response(generator):
    """Wrap a generator as an SSE response.

    `stream_with_context` keeps the app and request context alive for the
    generator's lifetime, which the database session needs — the body runs
    after the view has already returned.
    """
    return Response(
        stream_with_context(generator),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # don't let a proxy sit on the chunks
            "Connection": "keep-alive",
        },
    )


def _discard(message_id: uuid.UUID | None) -> None:
    """Remove the user message a failed turn never answered."""
    if message_id is None:
        return
    db.session.rollback()
    message = db.session.get(ChatMessage, message_id)
    if message is not None:
        db.session.delete(message)
        db.session.commit()


def _stream_turn(motion_id: uuid.UUID, stage: int, mode: str, user_message_id=None):
    """Shared body of both streaming endpoints.

    Everything is re-fetched here rather than captured from the view. The
    response body runs after the view returns, at which point Flask-SQLAlchemy
    has already torn the session down — any ORM object carried across that
    boundary is detached and raises on first attribute access.

    The generation is persisted only once it completes, so a stream that dies
    partway leaves the motion as it was. The user's own message is the
    exception: it is committed before the stream opens, because an uncommitted
    flush does not survive that same boundary, and is deleted here if the turn
    fails.
    """
    try:
        motion = db.session.get(Motion, motion_id)
        if motion is None:
            yield _sse("error", {"message": "Motion not found", "code": "not_found"})
            return

        if mode == "advance":
            context = llm.advance_context(motion, stage)
        else:
            context = llm.turn_context(motion, stage)

        for field, delta, result in llm.stream_generation(**context):
            if result is None:
                yield _sse("delta", {"field": field, "text": delta})
                continue

            if mode == "advance":
                motion.set_document(stage, result.document)
                motion.current_stage = stage
                _add_message(motion, stage, "assistant", result.reply)
                motion.updated_at = datetime.now(timezone.utc)
            else:
                _apply_turn(motion, stage, result)

            db.session.commit()
            # Serialising re-reads the motion, opening a fresh transaction
            # after the commit. End it before yielding — nothing downstream
            # will, so it would sit idle holding locks.
            payload = motion_json(motion)
            db.session.commit()
            yield _sse("done", {"motion": payload})
            return

        raise llm.LLMError("The response ended before it was complete.")
    except llm.LLMError as exc:
        _discard(user_message_id)
        yield _sse("error", {"message": exc.message, "code": "provider_error"})
    except Exception:  # noqa: BLE001 - the client needs a frame, not a dead socket
        current_app.logger.exception("Streaming turn failed")
        _discard(user_message_id)
        yield _sse("error", {"message": "Something went wrong.", "code": "internal_error"})
    finally:
        db.session.remove()


@bp.post("/<uuid:motion_id>/messages/stream")
@login_required
def send_message_streaming(motion_id: uuid.UUID):
    """Server-sent events version of send_message.

    `reply` streams first and `document` second — that is the schema's field
    order — so the chat answers immediately and the document then fills in.
    """
    motion = _get_motion(motion_id)
    content = required_str(body(), "content", max_length=20000)
    stage = motion.current_stage

    if not llm.supports_streaming(motion.provider, web_search=stage in llm.WEB_SEARCH_STAGES):
        raise ApiError(
            "This turn cannot be streamed; use the plain endpoint.", 409, code="no_streaming"
        )

    user_message = _add_message(motion, stage, "user", content)
    db.session.commit()

    return _stream_response(
        _stream_turn(motion_id, stage, "turn", user_message_id=user_message.id)
    )


@bp.post("/<uuid:motion_id>/advance/stream")
@login_required
def advance_stage_streaming(motion_id: uuid.UUID):
    motion = _get_motion(motion_id)
    current = motion.current_stage

    if current >= 3:
        raise ApiError("Stage 3 is the final stage", 409)
    if not motion.document(current):
        raise ApiError(
            f"Stage {current} has no document yet — work on it before advancing.", 409
        )

    target = current + 1
    if not llm.supports_streaming(motion.provider, web_search=target in llm.WEB_SEARCH_STAGES):
        raise ApiError(
            "This turn cannot be streamed; use the plain endpoint.", 409, code="no_streaming"
        )

    return _stream_response(_stream_turn(motion_id, target, "advance"))


@bp.get("/<uuid:motion_id>/export")
@login_required
def export_motion(motion_id: uuid.UUID):
    """Download a stage document as Markdown or PDF.

    Copy-to-clipboard is client-side and needs no endpoint.
    """
    from flask import request

    motion = _get_motion(motion_id)
    fmt = request.args.get("format", "markdown")
    if fmt not in ("markdown", "pdf"):
        raise ApiError("'format' must be 'markdown' or 'pdf'", 422)

    stage = request.args.get("stage", type=int) or motion.current_stage
    if stage not in (1, 2, 3):
        raise ApiError("'stage' must be 1, 2, or 3", 422)

    document = motion.document(stage)
    if not document:
        raise ApiError(f"Stage {stage} has no document to export", 409)

    slug = re.sub(r"[^a-z0-9]+", "-", motion.title.lower()).strip("-") or "motion"
    filename = f"{slug}-stage-{stage}.{'pdf' if fmt == 'pdf' else 'md'}"

    if fmt == "pdf":
        from ..pdf import render_pdf

        body = render_pdf(
            title=motion.title,
            position=motion.position,
            stage=stage,
            markdown_text=document,
        )
        mimetype = "application/pdf"
    else:
        body = document
        mimetype = "text/markdown; charset=utf-8"

    return Response(
        body,
        mimetype=mimetype,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
