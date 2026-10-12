"""OpenRouter adapter — OpenAI-compatible Chat Completions against
https://openrouter.ai/api/v1.

OpenRouter proxies many upstream providers behind one key and one API, so this
is the only adapter that isn't tied to a single vendor. Model IDs are
`upstream/model` slugs from https://openrouter.ai/models. Structured output uses
`response_format` json_schema; web search (Stage 2) uses the `:online` model
suffix, which routes the request through OpenRouter's web plugin.

Unlike the Responses-API OpenAI adapter, this speaks plain Chat Completions:
the system prompt is the first message, and the JSON payload comes back as
`choices[0].message.content`.
"""

from __future__ import annotations

import json
from collections.abc import Iterator

from openai import APIStatusError, AuthenticationError, OpenAI

from .base import Generation, InvalidProviderKey, LLMError, Turn

_BASE_URL = "https://openrouter.ai/api/v1"
# Optional attribution headers OpenRouter uses for its dashboards.
_HEADERS = {"X-Title": "Rhetor", "HTTP-Referer": "https://rhetor.app"}


def _client(api_key: str) -> OpenAI:
    return OpenAI(api_key=api_key, base_url=_BASE_URL, default_headers=_HEADERS)


def _request(
    *,
    model: str,
    system_prompt: str,
    history: list[Turn],
    schema: dict,
    web_search: bool,
    max_tokens: int,
) -> dict:
    return {
        # `:online` prepends web-search results via OpenRouter's web plugin.
        "model": f"{model}:online" if web_search else model,
        "messages": [
            {"role": "system", "content": system_prompt},
            *({"role": t.role, "content": t.content} for t in history),
        ],
        "max_tokens": max_tokens,
        # `strict` is off deliberately: several OpenRouter routes accept the
        # schema but not strict mode, and the whole payload is json.loads()'d
        # afterwards regardless.
        "response_format": {
            "type": "json_schema",
            "json_schema": {"name": "rhetor_turn", "strict": False, "schema": schema},
        },
        "extra_body": {
            # Only route to upstream providers that actually implement every
            # parameter we send — without this OpenRouter will happily hand
            # the request to a provider that ignores `response_format` /
            # `reasoning` and returns an empty or non-JSON completion.
            "provider": {"require_parameters": True},
            # Reasoning-capable routes (DeepSeek, and whatever `openrouter/free`
            # lands on) spend an *uncapped* slice of `max_tokens` on hidden
            # chain-of-thought before writing anything into `content`. On
            # Rhetor's long structured documents that reasoning alone can eat
            # the whole budget, leaving the stream to end with nothing in
            # `reply` or `document` at all ("The response ended before
            # anything usable arrived"). Capping it guarantees headroom for
            # the actual answer; `require_parameters` above means this is only
            # sent to backends that honour the cap rather than ignoring it.
            "reasoning": {"max_tokens": min(4000, max_tokens // 3)},
        },
    }


def _truncated_message(reason: str | None) -> str | None:
    """A specific, accurate message when generation stopped before finishing
    cleanly — distinct from a model that completed (`finish_reason: "stop"`)
    but produced text that doesn't parse. `"error"` means the routed upstream
    provider itself died partway through (observed in practice on a
    `:online` route: a full, valid response most calls, an `Unterminated
    string` JSONDecodeError on others, same model, same prompt — this is the
    routed backend failing mid-generation, not the model ignoring the
    schema), so retrying is the right suggestion, not switching models.
    """
    if reason == "length":
        return (
            "OpenRouter's response hit the token limit before it finished. Try "
            "again, or ask for something shorter."
        )
    if reason == "error":
        return (
            "OpenRouter's routed provider failed partway through generating the "
            "response — this is usually transient. Try sending it again."
        )
    return None


def _translate_error(exc: Exception) -> LLMError:
    if isinstance(exc, AuthenticationError):
        return InvalidProviderKey("OpenRouter")
    if isinstance(exc, APIStatusError):
        return LLMError(f"OpenRouter returned {exc.status_code}: {exc.message}")
    return LLMError(f"OpenRouter error: {exc}")


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
    client = _client(api_key)
    kwargs = _request(
        model=model,
        system_prompt=system_prompt,
        history=history,
        schema=schema,
        web_search=web_search,
        max_tokens=max_tokens,
    )
    try:
        response = client.chat.completions.create(**kwargs)
    except Exception as exc:  # noqa: BLE001 - re-raised as our own error type
        raise _translate_error(exc) from exc

    if not response.choices:
        raise LLMError("OpenRouter returned no choices.")
    choice = response.choices[0]
    text = (choice.message.content or "").strip()
    reason = getattr(choice, "finish_reason", None)
    if not text:
        message = _truncated_message(reason) or (
            "OpenRouter returned an empty response. The routed provider may not "
            "support structured output for this model — try a different model."
        )
        raise LLMError(message)

    try:
        return Generation.from_payload(json.loads(text))
    except json.JSONDecodeError as exc:
        message = _truncated_message(reason) or (
            "OpenRouter returned text that was not valid JSON — the routed "
            "provider likely ignored the response format. Try a different model."
        )
        raise LLMError(message) from exc


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
    client = _client(api_key)
    kwargs = _request(
        model=model,
        system_prompt=system_prompt,
        history=history,
        schema=schema,
        web_search=web_search,
        max_tokens=max_tokens,
    )
    try:
        for chunk in client.chat.completions.create(**kwargs, stream=True):
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as exc:  # noqa: BLE001 - re-raised as our own error type
        raise _translate_error(exc) from exc
