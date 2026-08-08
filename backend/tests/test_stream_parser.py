r"""The incremental JSON field extractor used for streaming turns."""

import json

import pytest

from app.llm.streaming import StructuredStreamParser


def feed_all(chunks: list[str]) -> tuple[list[tuple[str, str]], StructuredStreamParser]:
    parser = StructuredStreamParser()
    deltas: list[tuple[str, str]] = []
    for chunk in chunks:
        deltas.extend(parser.feed(chunk))
    return deltas, parser


def test_extracts_both_fields_from_a_single_chunk():
    payload = json.dumps({"reply": "Here you go.", "document": "# Stage 1\n\n* one"})
    _, parser = feed_all([payload])

    assert parser.values["reply"] == "Here you go."
    assert parser.values["document"] == "# Stage 1\n\n* one"
    assert parser.finished == {"reply", "document"}


def test_reply_completes_before_the_document_starts():
    """Schema order is what lets the chat answer land first."""
    payload = json.dumps({"reply": "Done.", "document": "# Doc"})
    deltas, _ = feed_all([payload])

    fields = [field for field, _ in deltas]
    assert fields.index("reply") < fields.index("document")


@pytest.mark.parametrize("size", [1, 2, 3, 7, 13])
def test_result_is_identical_however_the_stream_is_split(size):
    """Chunk boundaries are arbitrary and must not change the output."""
    payload = json.dumps(
        {"reply": 'He said "go" — now.\n', "document": "# A\n\n* one\n* two\t end"}
    )
    chunks = [payload[i : i + size] for i in range(0, len(payload), size)]
    _, parser = feed_all(chunks)

    assert parser.values == json.loads(payload)


def test_escapes_split_across_chunks_are_not_mangled():
    payload = json.dumps({"reply": "a\nb", "document": "x\ty"})
    # Split so a backslash lands at the very end of a chunk.
    cut = payload.index("\\n") + 1
    _, parser = feed_all([payload[:cut], payload[cut:]])

    assert parser.values["reply"] == "a\nb"
    assert parser.values["document"] == "x\ty"


def test_unicode_escape_split_across_chunks():
    payload = '{"reply": "caf\\u00e9", "document": "d"}'
    for cut in range(len(payload)):
        _, parser = feed_all([payload[:cut], payload[cut:]])
        assert parser.values["reply"] == "café", f"failed at cut {cut}"


def test_quotes_inside_the_document_do_not_end_it_early():
    document = 'The claim is "zoos fail" — see below.'
    payload = json.dumps({"reply": "ok", "document": document})
    _, parser = feed_all([payload])

    assert parser.values["document"] == document


def test_escaped_backslashes_decode_to_single_backslashes():
    value = "a single \\ backslash"
    payload = json.dumps({"reply": value, "document": "d"})
    _, parser = feed_all([payload])

    assert parser.values["reply"] == value
    assert parser.finished == {"reply", "document"}


def test_deltas_concatenate_to_the_full_value():
    payload = json.dumps({"reply": "one two three", "document": "# Long\n\nbody text"})
    deltas, parser = feed_all([payload[i : i + 4] for i in range(0, len(payload), 4)])

    for field in ("reply", "document"):
        joined = "".join(text for name, text in deltas if name == field)
        assert joined == parser.values[field]


def test_incomplete_stream_yields_what_arrived_and_stays_unfinished():
    """A truncated response should still show the user what was written."""
    partial = '{"reply": "Working on it", "document": "# Stage 1\\n\\nPartial'
    _, parser = feed_all([partial])

    assert parser.values["reply"] == "Working on it"
    assert parser.values["document"] == "# Stage 1\n\nPartial"
    assert "document" not in parser.finished


def test_extra_fields_are_ignored():
    payload = json.dumps(
        {"reply": "r", "document": "d", "title": "T", "motionText": "m", "position": "OG"}
    )
    _, parser = feed_all([payload])

    assert parser.values == {"reply": "r", "document": "d"}
