"""The AI Agent Core.

No orchestration framework — one thin adapter over the two provider SDKs, as
laid out in webapp-design.md § Decision Engine. Conversation history lives in
the ChatMessage table and is converted to provider format immediately before
the call.
"""

from __future__ import annotations

import json
from collections.abc import Iterator

from flask import current_app

from .. import crypto
from ..models import Motion, User
from . import anthropic_provider, catalogue, gemini_provider, openai_provider, openrouter_provider
from .base import Generation, InvalidProviderKey, LLMError, Turn, unescape_literal_escapes
from .streaming import StructuredStreamParser
from .prompts import ADVANCE_INSTRUCTIONS, FIRST_TURN_INSTRUCTIONS, system_prompt
from .schemas import FIRST_TURN_SCHEMA, TURN_SCHEMA

# Stage 2's Evidence field needs real-world facts and precedents, so search is
# enabled there and nowhere else — Stage 1 is ideation and Stage 3 is ranking
# what already exists.
WEB_SEARCH_STAGES = {2}

# Bound at import, not inside the request. Importing a provider SDK lazily put
# several seconds of module loading — and the .pyc writes that go with it —
# inside the first generation call, where the dev server's reloader can see
# them and restart mid-request.
PROVIDER_IMPLS = {
    "openai": openai_provider,
    "anthropic": anthropic_provider,
    "gemini": gemini_provider,
    "openrouter": openrouter_provider,
}


def _provider_key(user: User, provider: str) -> str:
    ciphertext = user.encrypted_key_for(provider)
    if not ciphertext:
        raise LLMError(
            f"No {provider} API key on file. Add one in account settings before "
            f"using this motion.",
            status=400,
        )
    return crypto.decrypt(ciphertext)


def _model_for(motion: Motion) -> str:
    return catalogue.resolve(motion.provider, motion.model)


def generate(
    *,
    user: User,
    provider: str,
    model: str,
    system: str,
    history: list[Turn],
    schema: dict,
    web_search: bool = False,
) -> Generation:
    """`generate(provider, model, system_prompt, history, schema) -> {reply, document}`."""
    impl = PROVIDER_IMPLS.get(provider)
    if impl is None:
        raise LLMError(f"Unknown provider '{provider}'", status=400)

    return impl.generate(
        api_key=_provider_key(user, provider),
        model=model,
        system_prompt=system,
        history=history,
        schema=schema,
        web_search=web_search,
        max_tokens=current_app.config["LLM_MAX_TOKENS"],
    )


def _history_for_stage(motion: Motion, stage: int) -> list[Turn]:
    """Chat history for the current stage only — stages don't share threads."""
    return [Turn(role=m.role, content=m.content) for m in motion.messages_for_stage(stage)]


def turn_context(motion: Motion, stage: int) -> dict:
    """Everything one conversational turn needs, independent of how it is sent.

    Assumes the user's new message has already been appended to the motion.
    """
    first_turn = not motion.is_started

    system = system_prompt(stage, motion_text=motion.motion_text, position=motion.position)
    system += "\n\n---\n\n" + (
        FIRST_TURN_INSTRUCTIONS if first_turn else _document_context(motion, stage)
    )

    return {
        "user": motion.user,
        "provider": motion.provider,
        "model": _model_for(motion),
        "system": system,
        "history": _history_for_stage(motion, stage),
        "schema": FIRST_TURN_SCHEMA if first_turn else TURN_SCHEMA,
        "web_search": stage in WEB_SEARCH_STAGES,
    }


def run_turn(motion: Motion, stage: int) -> Generation:
    """One conversational turn, buffered: call once, return the whole result."""
    return generate(**turn_context(motion, stage))


def advance_context(motion: Motion, to_stage: int) -> dict:
    """Everything needed to open `to_stage` from the finalized previous one.

    Any chat history that already exists for the target stage is included, so a
    user who has been here before doesn't lose their earlier refinement
    discussion when the document is regenerated.
    """
    previous = motion.document(to_stage - 1) or ""

    system = system_prompt(to_stage, motion_text=motion.motion_text, position=motion.position)
    system += (
        f"\n\n---\n\n## Stage {to_stage - 1} output (final)\n\n{previous}"
        f"\n\n---\n\n{ADVANCE_INSTRUCTIONS}"
    )

    history = _history_for_stage(motion, to_stage)
    if not history:
        history = [Turn(role="user", content=f"Begin Stage {to_stage}.")]

    return {
        "user": motion.user,
        "provider": motion.provider,
        "model": _model_for(motion),
        "system": system,
        "history": history,
        "schema": TURN_SCHEMA,
        "web_search": to_stage in WEB_SEARCH_STAGES,
    }


def run_advance(motion: Motion, to_stage: int) -> Generation:
    """Buffered variant of `advance_context`."""
    return generate(**advance_context(motion, to_stage))


def supports_streaming(provider: str, *, web_search: bool) -> bool:
    """Whether a turn can be streamed, given what it needs.

    Searching stages cannot: Gemini has to run its research as a separate
    ungrounded-then-grounded pair, and Anthropic cannot force the submit tool
    while search is available. Both would sit silent through the research leg
    anyway, so those turns take the buffered path.
    """
    return provider in PROVIDER_IMPLS and not web_search


def stream_generation(
    *,
    user: User,
    provider: str,
    model: str,
    system: str,
    history: list[Turn],
    schema: dict,
    web_search: bool = False,
) -> Iterator[tuple[str, str, Generation | None]]:
    """Run a turn, yielding `(field, delta, result)` as the answer is written.

    Every tuple but the last carries a text delta for `reply` or `document`
    and a null result; the final one carries the assembled Generation. Callers
    persist on that last tuple, so a stream that dies partway writes nothing.
    """
    impl = PROVIDER_IMPLS.get(provider)
    if impl is None:
        raise LLMError(f"Unknown provider '{provider}'", status=400)

    parser = StructuredStreamParser()
    raw: list[str] = []

    for chunk in impl.stream(
        api_key=_provider_key(user, provider),
        model=model,
        system_prompt=system,
        history=history,
        schema=schema,
        web_search=web_search,
        max_tokens=current_app.config["LLM_MAX_TOKENS"],
    ):
        raw.append(chunk)
        for field, delta in parser.feed(chunk):
            yield field, delta, None

    if "reply" not in parser.finished and "document" not in parser.finished:
        raise LLMError("The response ended before anything usable arrived.")

    # Parse the whole payload for the fields the incremental pass ignores
    # (title, motionText, position); fall back to the streamed values if the
    # JSON turned out to be malformed.
    try:
        payload = json.loads("".join(raw))
    except json.JSONDecodeError:
        payload = {}

    payload.setdefault("reply", parser.values["reply"])
    payload.setdefault("document", parser.values["document"])
    yield "", "", Generation.from_payload(payload)


def _document_context(motion: Motion, stage: int) -> str:
    current = motion.document(stage)
    if not current:
        return (
            f"## This turn\n\nThere is no Stage {stage} document yet. Produce the "
            f"first one."
        )
    return (
        f"## Current Stage {stage} document\n\n{current}\n\n"
        f"Return the complete revised document in `document`, incorporating "
        f"whatever the user asks for. Leave everything they did not ask you to "
        f"change exactly as it is."
    )


__all__ = [
    "Generation",
    "InvalidProviderKey",
    "LLMError",
    "Turn",
    "advance_context",
    "generate",
    "run_advance",
    "run_turn",
    "stream_generation",
    "supports_streaming",
    "turn_context",
]
