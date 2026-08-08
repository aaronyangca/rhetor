"""OpenAI adapter — Responses API with strict structured output.

Web search uses OpenAI's own hosted tool: the provider runs the search
server-side and returns the results inside the same response, so there is no
search service for Rhetor to call and no third credential to collect.
"""

from __future__ import annotations

import json
from collections.abc import Iterator

from openai import APIStatusError, AuthenticationError, OpenAI

from .base import Generation, InvalidProviderKey, LLMError, Turn


def _request(
    *,
    model: str,
    system_prompt: str,
    history: list[Turn],
    schema: dict,
    web_search: bool,
    max_tokens: int,
) -> dict:
    """The call arguments, shared by the buffered and streaming paths so the
    two cannot drift apart."""
    kwargs: dict = {
        "model": model,
        "instructions": system_prompt,
        "input": [{"role": t.role, "content": t.content} for t in history],
        "max_output_tokens": max_tokens,
        "text": {
            "format": {
                "type": "json_schema",
                "name": "rhetor_turn",
                "schema": schema,
                "strict": True,
            }
        },
    }
    if web_search:
        kwargs["tools"] = [{"type": "web_search"}]
    return kwargs


def _translate_error(exc: Exception) -> LLMError:
    if isinstance(exc, AuthenticationError):
        return InvalidProviderKey("OpenAI")
    if isinstance(exc, APIStatusError):
        return LLMError(f"OpenAI returned {exc.status_code}: {exc.message}")
    return LLMError(f"OpenAI error: {exc}")


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
    client = OpenAI(api_key=api_key)
    kwargs = _request(
        model=model,
        system_prompt=system_prompt,
        history=history,
        schema=schema,
        web_search=web_search,
        max_tokens=max_tokens,
    )

    try:
        response = client.responses.create(**kwargs)
    except Exception as exc:  # noqa: BLE001 - re-raised as our own error type
        raise _translate_error(exc) from exc

    text = response.output_text
    if not text:
        raise LLMError("OpenAI returned an empty response.")

    try:
        return Generation.from_payload(json.loads(text))
    except json.JSONDecodeError as exc:
        raise LLMError("OpenAI returned malformed JSON.") from exc


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
    """Yield the response JSON as it is written."""
    client = OpenAI(api_key=api_key)
    kwargs = _request(
        model=model,
        system_prompt=system_prompt,
        history=history,
        schema=schema,
        web_search=web_search,
        max_tokens=max_tokens,
    )

    try:
        for event in client.responses.create(**kwargs, stream=True):
            # Web-search progress arrives as other event types; only the output
            # text carries the JSON we are assembling.
            if getattr(event, "type", None) == "response.output_text.delta":
                delta = getattr(event, "delta", "")
                if delta:
                    yield delta
    except Exception as exc:  # noqa: BLE001 - re-raised as our own error type
        raise _translate_error(exc) from exc
