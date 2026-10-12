"""Best-effort Langfuse tracing around LLM calls.

One observation per call to `generate()`/`stream_generation()` in
`app/llm/__init__.py` — the single chokepoint every provider already goes
through, so this covers OpenAI, Anthropic, Gemini, and OpenRouter without
touching any of the four adapters.

Tracing is strictly an observability add-on: a missing key, an unreachable
Langfuse host, or any internal SDK error must degrade to "no trace", never to
a broken turn. Every Langfuse call in this module is wrapped accordingly.
"""

from __future__ import annotations

import atexit
import os
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from .base import Turn

_ENABLED = bool(os.environ.get("LANGFUSE_PUBLIC_KEY")) and bool(
    os.environ.get("LANGFUSE_SECRET_KEY")
)


class _NullObservation:
    """Stood in for a real observation when tracing is off or failed to start."""

    def update(self, **_kwargs: Any) -> None:
        return None


if _ENABLED:
    # Queued spans are exported on a background thread; flush what's pending
    # rather than losing the last turn's trace when the process exits (this
    # matters most for short-lived scripts — the dev/prod server is long-running
    # and flushes periodically on its own).
    @atexit.register
    def _flush_on_exit() -> None:  # pragma: no cover - best effort on shutdown
        try:
            from langfuse import get_client

            get_client().flush()
        except Exception:  # noqa: BLE001
            pass


@contextmanager
def traced_generation(
    *,
    name: str,
    provider: str,
    model: str,
    system: str,
    history: list[Turn],
    web_search: bool,
    max_tokens: int,
    user_id: str,
) -> Iterator[Any]:
    """Wrap one LLM call as a Langfuse 'generation' observation.

    Always yields an object with `.update(output=..., level=..., status_message=...)`
    — callers never need to check whether tracing actually started.
    """
    if not _ENABLED:
        yield _NullObservation()
        return

    cm = None
    obs = None
    try:
        from langfuse import get_client

        cm = get_client().start_as_current_observation(
            name=name,
            as_type="generation",
            model=model,
            input={
                "system": system,
                "history": [{"role": t.role, "content": t.content} for t in history],
            },
            metadata={"provider": provider, "web_search": web_search, "user_id": user_id},
            model_parameters={"max_tokens": max_tokens},
        )
        obs = cm.__enter__()
    except Exception:  # noqa: BLE001 - tracing must never break a turn
        obs = None

    if obs is None:
        yield _NullObservation()
        return

    try:
        yield obs
    finally:
        try:
            cm.__exit__(None, None, None)
        except Exception:  # noqa: BLE001
            pass
