"""Turns run as background jobs that outlive the request that started them."""

import threading
import time
import uuid
from datetime import datetime, timedelta, timezone

import pytest

from app import generation, llm
from app.extensions import db
from app.llm.base import Generation
from app.models import Motion

PAYLOAD = {
    "reply": "Here you go.",
    "document": "# Stage 1\n\n* one",
    "title": "Ban private schools",
    "motionText": "THW ban private schools",
    "position": "OG",
}


@pytest.fixture
def gated_stream(monkeypatch):
    """A provider stream that writes the reply, then waits for `release`."""
    release = threading.Event()

    def fake(**kwargs):
        yield "reply", "Here ", None
        release.wait(10)
        yield "reply", "you go.", None
        yield "", "", Generation.from_payload(PAYLOAD)

    monkeypatch.setattr(llm, "stream_generation", fake)
    return release


def wait_until_idle(client, motion_id, timeout=10):
    deadline = time.time() + timeout
    while time.time() < deadline:
        body = client.get(f"/api/motions/{motion_id}").get_json()
        if body["generation"] is None:
            return body
        time.sleep(0.05)
    raise AssertionError("generation never finished")


def wait_for_reply_text(client, motion_id, text, timeout=10):
    deadline = time.time() + timeout
    while time.time() < deadline:
        body = client.get(f"/api/motions/{motion_id}").get_json()
        if body["generation"] and body["generation"]["reply"] == text:
            return body
        time.sleep(0.05)
    raise AssertionError(f"never saw partial reply {text!r}")


def test_a_dropped_connection_still_saves_the_reply(keyed_client, motion, gated_stream):
    """The reload case: the client goes away and never reads the stream."""
    response = keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream", json={"content": "THW x, OG"}
    )
    response.close()  # the page reloaded

    gated_stream.set()
    stored = wait_until_idle(keyed_client, motion["id"])

    assert [m["role"] for m in stored["messages"]] == ["assistant", "user", "assistant"]
    assert stored["messages"][-1]["content"] == "Here you go."
    assert stored["stageDocs"]["1"] == PAYLOAD["document"]


def test_a_reloaded_page_sees_the_turn_in_progress(keyed_client, motion, gated_stream):
    response = keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream", json={"content": "THW x, OG"}
    )
    response.close()

    body = wait_for_reply_text(keyed_client, motion["id"], "Here ")
    assert body["generation"]["kind"] == "turn"
    assert body["generation"]["stage"] == 1
    # The user's message is already there, waiting for its answer.
    assert body["messages"][-1]["role"] == "user"

    gated_stream.set()
    wait_until_idle(keyed_client, motion["id"])


def test_a_second_message_is_refused_while_one_is_running(keyed_client, motion, gated_stream):
    keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream", json={"content": "THW x, OG"}
    ).close()
    wait_for_reply_text(keyed_client, motion["id"], "Here ")

    again = keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream", json={"content": "and another"}
    )
    assert again.status_code == 409
    assert again.get_json()["error"]["code"] == "busy"

    gated_stream.set()
    wait_until_idle(keyed_client, motion["id"])


def test_cancel_drops_the_message_and_nothing_is_saved(keyed_client, motion, gated_stream):
    keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream", json={"content": "THW x, OG"}
    ).close()
    wait_for_reply_text(keyed_client, motion["id"], "Here ")

    cancelled = keyed_client.post(f"/api/motions/{motion['id']}/cancel").get_json()
    assert cancelled["generation"] is None
    assert [m["role"] for m in cancelled["messages"]] == ["assistant"]

    # Let the job run to completion: it must notice and write nothing.
    gated_stream.set()
    time.sleep(0.3)
    stored = keyed_client.get(f"/api/motions/{motion['id']}").get_json()
    assert [m["role"] for m in stored["messages"]] == ["assistant"]
    assert stored["stageDocs"]["1"] is None


def test_a_failure_while_disconnected_is_reported_on_next_load(keyed_client, motion, monkeypatch):
    def boom(**kwargs):
        raise llm.LLMError("Provider fell over")
        yield  # pragma: no cover - makes this a generator

    monkeypatch.setattr(llm, "stream_generation", boom)
    keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream", json={"content": "THW x, OG"}
    ).close()

    stored = wait_until_idle(keyed_client, motion["id"])
    # Either the poll that saw it idle carried the error, or the next one does.
    error = stored["generationError"] or keyed_client.get(
        f"/api/motions/{motion['id']}"
    ).get_json()["generationError"]
    assert "fell over" in error
    assert [m["role"] for m in stored["messages"]] == ["assistant"]
    # Shown once.
    again = keyed_client.get(f"/api/motions/{motion['id']}").get_json()
    assert again["generationError"] is None


def test_a_job_whose_server_died_is_reaped(app, keyed_client, motion):
    """Simulate a restart: the row says busy, but nothing is heartbeating."""
    with app.app_context():
        row = db.session.get(Motion, uuid.UUID(motion["id"]))
        from app.models import ChatMessage

        orphan = ChatMessage(motion=row, stage=1, role="user", content="lost")
        db.session.add(orphan)
        db.session.flush()
        row.generation_id = uuid.uuid4()
        row.generation_kind = "turn"
        row.generation_stage = 1
        row.generation_message_id = orphan.id
        row.generation_heartbeat_at = datetime.now(timezone.utc) - timedelta(minutes=5)
        db.session.commit()
        db.session.remove()

    body = keyed_client.get(f"/api/motions/{motion['id']}").get_json()
    assert body["generation"] is None
    assert body["generationError"] == generation.SERVER_STOPPED
    assert all(m["content"] != "lost" for m in body["messages"])
