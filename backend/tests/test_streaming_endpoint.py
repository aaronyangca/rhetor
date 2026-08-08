"""The SSE turn endpoints, with the provider stream stubbed."""

import json

import pytest

from app import llm
from app.llm.base import Generation


def drain(response) -> list[tuple[str, dict]]:
    """Read the stream to completion and return its frames.

    Reading matters: the response body is a lazy generator, so the turn is not
    generated — or persisted — until a consumer pulls on it.
    """
    return parse_sse(response.get_data(as_text=True))


def parse_sse(body: str) -> list[tuple[str, dict]]:
    """Return `(event, data)` for each frame."""
    frames = []
    for block in body.strip().split("\n\n"):
        if not block.strip():
            continue
        event, data = None, None
        for line in block.splitlines():
            if line.startswith("event: "):
                event = line[len("event: ") :]
            elif line.startswith("data: "):
                data = json.loads(line[len("data: ") :])
        frames.append((event, data))
    return frames


@pytest.fixture
def fake_stream(monkeypatch):
    """Emit the payload one character at a time, like a real stream."""
    payload = json.dumps(
        {
            "reply": "Here you go.",
            "document": "# Stage 1\n\n* one",
            "title": "Ban private schools",
            "motionText": "THW ban private schools",
            "position": "OG",
        }
    )

    def fake(**kwargs):
        from app.llm.streaming import StructuredStreamParser

        parser = StructuredStreamParser()
        for char in payload:
            for field, delta in parser.feed(char):
                yield field, delta, None
        yield "", "", Generation.from_payload(json.loads(payload))

    monkeypatch.setattr(llm, "stream_generation", fake)
    # Stub the buffered path too. Tests here also exercise routes that fall
    # back to it, and leaving it live sends a real request to the provider.
    monkeypatch.setattr(
        llm, "generate", lambda **kwargs: Generation.from_payload(json.loads(payload))
    )
    return payload


def test_streaming_send_emits_deltas_then_done(keyed_client, motion, fake_stream):
    response = keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream",
        json={"content": "THW ban private schools, OG"},
    )

    assert response.status_code == 200
    assert response.mimetype == "text/event-stream"

    frames = drain(response)
    assert [e for e, _ in frames][-1] == "done"
    assert all(e == "delta" for e, _ in frames[:-1])


def test_deltas_reassemble_into_the_stored_document(keyed_client, motion, fake_stream):
    response = keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream",
        json={"content": "THW ban private schools, OG"},
    )
    frames = drain(response)

    streamed = {"reply": "", "document": ""}
    for event, data in frames:
        if event == "delta":
            streamed[data["field"]] += data["text"]

    _, done = frames[-1]
    assert streamed["document"] == done["motion"]["stageDocs"]["1"]
    assert streamed["reply"] == done["motion"]["messages"][-1]["content"]


def test_reply_streams_before_the_document(keyed_client, motion, fake_stream):
    """Field order is what makes the chat answer land first."""
    response = keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream",
        json={"content": "THW x, OG"},
    )
    fields = [d["field"] for e, d in drain(response) if e == "delta"]

    assert fields.index("reply") < fields.index("document")


def test_streaming_persists_the_turn(keyed_client, motion, fake_stream):
    drain(
        keyed_client.post(
            f"/api/motions/{motion['id']}/messages/stream",
            json={"content": "THW ban private schools, OG"},
        )
    )

    stored = keyed_client.get(f"/api/motions/{motion['id']}").get_json()
    assert stored["title"] == "Ban private schools"
    assert stored["position"] == "OG"
    assert stored["stageDocs"]["1"] == "# Stage 1\n\n* one"
    assert [m["role"] for m in stored["messages"]] == ["assistant", "user", "assistant"]


def test_a_failed_stream_persists_nothing(keyed_client, motion, monkeypatch):
    def boom(**kwargs):
        yield "reply", "Here", None
        raise llm.LLMError("Provider fell over")

    monkeypatch.setattr(llm, "stream_generation", boom)

    response = keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream", json={"content": "THW x, OG"}
    )
    frames = drain(response)

    assert frames[-1][0] == "error"
    assert "fell over" in frames[-1][1]["message"]

    # The motion is untouched: no user message, no document.
    stored = keyed_client.get(f"/api/motions/{motion['id']}").get_json()
    assert len(stored["messages"]) == 1
    assert stored["stageDocs"]["1"] is None


def test_searching_stages_refuse_to_stream(keyed_client, motion, fake_stream):
    """Stage 2 needs search, which neither Gemini nor Anthropic can stream."""
    drain(
        keyed_client.post(
            f"/api/motions/{motion['id']}/messages/stream", json={"content": "THW x, OG"}
        )
    )
    keyed_client.post(f"/api/motions/{motion['id']}/advance", json={})

    response = keyed_client.post(
        f"/api/motions/{motion['id']}/messages/stream", json={"content": "sharpen impacts"}
    )
    assert response.status_code == 409
    assert response.get_json()["error"]["code"] == "no_streaming"


def test_streaming_advance_moves_to_the_next_stage(keyed_client, motion, fake_stream, monkeypatch):
    drain(
        keyed_client.post(
            f"/api/motions/{motion['id']}/messages/stream", json={"content": "THW x, OG"}
        )
    )
    # Stage 2 needs search, so pretend this provider can stream it anyway.
    monkeypatch.setattr(llm, "supports_streaming", lambda provider, *, web_search: True)

    response = keyed_client.post(f"/api/motions/{motion['id']}/advance/stream", json={})
    frames = drain(response)

    assert frames[-1][0] == "done"
    assert frames[-1][1]["motion"]["currentStage"] == 2
