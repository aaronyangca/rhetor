"""Unit tests for the pure parts of the Gemini adapter.

The network call itself still needs a real key, but the two translation steps
that are easy to get wrong — schema cleaning and role mapping — are testable
on their own.
"""

from app.llm.base import Turn
from app.llm.gemini_provider import _to_contents, _to_gemini_schema
from app.llm.schemas import FIRST_TURN_SCHEMA, TURN_SCHEMA


def test_schema_drops_additional_properties_at_every_level():
    """Gemini rejects `additionalProperties`, which our schemas set."""
    cleaned = _to_gemini_schema(FIRST_TURN_SCHEMA)

    assert "additionalProperties" not in cleaned
    assert all("additionalProperties" not in prop for prop in cleaned["properties"].values())


def test_schema_keeps_the_parts_gemini_needs():
    cleaned = _to_gemini_schema(FIRST_TURN_SCHEMA)

    assert cleaned["type"] == "object"
    assert set(cleaned["required"]) == set(FIRST_TURN_SCHEMA["required"])
    assert cleaned["properties"]["position"]["enum"] == ["OG", "OO", "CG", "CO"]
    assert cleaned["properties"]["reply"]["description"]


def test_schema_cleaning_does_not_mutate_the_original():
    _to_gemini_schema(TURN_SCHEMA)
    assert TURN_SCHEMA["additionalProperties"] is False


def test_assistant_turns_are_relabelled_as_model():
    contents = _to_contents(
        [Turn(role="user", content="THW ban private schools"), Turn(role="assistant", content="Noted.")]
    )

    assert [c.role for c in contents] == ["user", "model"]
    assert contents[0].parts[0].text == "THW ban private schools"
