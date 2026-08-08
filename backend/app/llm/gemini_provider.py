"""Google Gemini adapter.

Two things differ from the OpenAI and Anthropic adapters:

1. Gemini names the assistant role "model", not "assistant".
2. Its JSON-schema response mode and the Google Search grounding tool are
   mutually exclusive — a request cannot ask for both. So when a stage needs
   evidence, this runs two calls: one grounded and free-form to do the
   research, then one schema-constrained to write the document from those
   notes. Stages without search stay a single call, like the other providers.
"""

from __future__ import annotations

import json
from collections.abc import Iterator

from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from .base import Generation, InvalidProviderKey, LLMError, Turn

RESEARCH_INSTRUCTION = """
Research the evidence needed for the work described above. Use Google Search to
find real, checkable facts, precedents, studies, and examples that bear on this
motion.

Do not write the document yet. Produce research notes only: what you found, the
figures and dates, and how confident the source makes you. Note explicitly where
you looked and found nothing solid.
""".strip()


def _to_gemini_schema(schema: dict) -> dict:
    """Strip keys Gemini's schema subset rejects.

    `additionalProperties` in particular is not accepted, and passing it
    through fails the whole request.
    """
    cleaned = {k: v for k, v in schema.items() if k != "additionalProperties"}
    if "properties" in cleaned:
        cleaned["properties"] = {
            name: _to_gemini_schema(prop) if isinstance(prop, dict) else prop
            for name, prop in cleaned["properties"].items()
        }
    return cleaned


def _to_contents(history: list[Turn]) -> list[types.Content]:
    return [
        types.Content(
            # Gemini's counterpart to "assistant".
            role="model" if turn.role == "assistant" else "user",
            parts=[types.Part(text=turn.content)],
        )
        for turn in history
    ]


def _call(client, *, model: str, contents, config: types.GenerateContentConfig) -> str:
    try:
        response = client.models.generate_content(model=model, contents=contents, config=config)
    except genai_errors.ClientError as exc:
        # 400 with an API-key complaint and 403 both mean the key is bad.
        if exc.code in (400, 401, 403) and "api key" in str(exc).lower():
            raise InvalidProviderKey("Gemini") from exc
        raise LLMError(f"Gemini returned {exc.code}: {exc.message}") from exc
    except genai_errors.APIError as exc:
        raise LLMError(f"Gemini error: {exc}") from exc

    text = response.text
    if not text:
        raise LLMError("Gemini returned an empty response.")
    return text


def generate(
    *,
    api_key: str,
    model: str,
    system_prompt: str,
    history: list[Turn],
    schema: dict,
    web_search: bool = False,
    max_tokens: int = 16000,
) -> Generation:
    client = genai.Client(api_key=api_key)
    contents = _to_contents(history)

    if web_search:
        notes = _call(
            client,
            model=model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=f"{system_prompt}\n\n---\n\n{RESEARCH_INSTRUCTION}",
                max_output_tokens=max_tokens,
                tools=[types.Tool(google_search=types.GoogleSearch())],
            ),
        )
        # Hand the notes to the structured pass as the model's own prior turn,
        # so it reads as research it just did rather than user-supplied fact.
        contents = [
            *contents,
            types.Content(role="model", parts=[types.Part(text=notes)]),
            types.Content(
                role="user",
                parts=[types.Part(text="Now write the document, using those findings.")],
            ),
        ]

    text = _call(
        client,
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=max_tokens,
            response_mime_type="application/json",
            response_json_schema=_to_gemini_schema(schema),
        ),
    )

    try:
        return Generation.from_payload(json.loads(text))
    except json.JSONDecodeError as exc:
        raise LLMError("Gemini returned malformed JSON.") from exc


def stream(
    *,
    api_key: str,
    model: str,
    system_prompt: str,
    history: list[Turn],
    schema: dict,
    web_search: bool = False,
    max_tokens: int = 16000,
) -> Iterator[str]:
    """Yield the response JSON as it is written.

    Search is not enabled here: grounding cannot be combined with the JSON
    schema mode, and the two-call research shape has nothing to stream during
    its first leg. Searching stages fall back to the buffered path.
    """
    client = genai.Client(api_key=api_key)

    try:
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=_to_contents(history),
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=max_tokens,
                response_mime_type="application/json",
                response_json_schema=_to_gemini_schema(schema),
            ),
        ):
            text = chunk.text
            if text:
                yield text
    except genai_errors.ClientError as exc:
        if exc.code in (400, 401, 403) and "api key" in str(exc).lower():
            raise InvalidProviderKey("Gemini") from exc
        raise LLMError(f"Gemini returned {exc.code}: {exc.message}") from exc
    except genai_errors.APIError as exc:
        raise LLMError(f"Gemini error: {exc}") from exc
