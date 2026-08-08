"""Anthropic adapter.

Structured output is obtained by giving the model a single `submit_turn` tool
whose input schema is the output contract, and reading the tool call's input.
Web search uses Anthropic's hosted server tool, executed provider-side.

The two interact: when web search is available the model must be free to choose
it, so `tool_choice` can only be forced when search is off. With search on we
instruct the model to finish by calling `submit_turn` and loop until it does.
"""

from __future__ import annotations

from collections.abc import Iterator

from anthropic import Anthropic, APIStatusError, AuthenticationError

from .base import Generation, InvalidProviderKey, LLMError, Turn

SUBMIT_TOOL = "submit_turn"
WEB_SEARCH_TOOL = {"type": "web_search_20250305", "name": "web_search", "max_uses": 8}

# Guards against a model that keeps searching and never submits, and against
# `pause_turn` resend loops.
MAX_ROUNDS = 12


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
    client = Anthropic(api_key=api_key)

    tools: list[dict] = [
        {
            "name": SUBMIT_TOOL,
            "description": "Submit this turn's chat reply and the full stage document. "
            "You must call this exactly once, as the last thing you do.",
            "input_schema": schema,
        }
    ]
    system = system_prompt
    if web_search:
        tools.append(WEB_SEARCH_TOOL)
        system += (
            f"\n\nYou may use web search to find evidence. When you are done "
            f"researching, you must finish by calling the `{SUBMIT_TOOL}` tool."
        )

    messages: list[dict] = [{"role": t.role, "content": t.content} for t in history]

    for _ in range(MAX_ROUNDS):
        kwargs: dict = {
            "model": model,
            "max_tokens": max_tokens,
            "system": system,
            "messages": messages,
            "tools": tools,
        }
        if not web_search:
            kwargs["tool_choice"] = {"type": "tool", "name": SUBMIT_TOOL}

        try:
            response = client.messages.create(**kwargs)
        except AuthenticationError as exc:
            raise InvalidProviderKey("Anthropic") from exc
        except APIStatusError as exc:
            raise LLMError(f"Anthropic returned {exc.status_code}: {exc.message}") from exc

        for block in response.content:
            if getattr(block, "type", None) == "tool_use" and block.name == SUBMIT_TOOL:
                return Generation.from_payload(dict(block.input))

        # `pause_turn` means a long-running server tool was interrupted — resend
        # the accumulated turn so the model can carry on where it left off.
        if response.stop_reason == "pause_turn":
            messages.append({"role": "assistant", "content": response.content})
            continue

        if response.stop_reason == "max_tokens":
            raise LLMError(
                "The response was cut off before it was complete. Try asking for a "
                "narrower change."
            )

        # Searched (or just talked) without submitting — prompt it to finish.
        messages.append({"role": "assistant", "content": response.content})
        messages.append(
            {
                "role": "user",
                "content": f"Now call the `{SUBMIT_TOOL}` tool with your reply and "
                f"the complete document.",
            }
        )

    raise LLMError("Anthropic did not return a usable response after several attempts.")


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
    """Yield the `submit_turn` tool input as it is written.

    Anthropic streams a forced tool call's arguments as `input_json_delta`
    fragments, which is exactly the JSON text the parser upstream expects.

    Search is not enabled here even when the stage asks for it: with search
    available the model must be free to choose it, so the tool call cannot be
    forced, and the turn may take several rounds before any JSON appears —
    which defeats the point of streaming. Searching stages fall back to the
    buffered path.
    """
    client = Anthropic(api_key=api_key)

    tools = [
        {
            "name": SUBMIT_TOOL,
            "description": "Submit this turn's chat reply and the full stage document.",
            "input_schema": schema,
        }
    ]

    try:
        with client.messages.stream(
            model=model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": t.role, "content": t.content} for t in history],
            tools=tools,
            tool_choice={"type": "tool", "name": SUBMIT_TOOL},
        ) as stream_manager:
            for event in stream_manager:
                if (
                    getattr(event, "type", None) == "content_block_delta"
                    and getattr(event.delta, "type", None) == "input_json_delta"
                ):
                    fragment = getattr(event.delta, "partial_json", "")
                    if fragment:
                        yield fragment
    except AuthenticationError as exc:
        raise InvalidProviderKey("Anthropic") from exc
    except APIStatusError as exc:
        raise LLMError(f"Anthropic returned {exc.status_code}: {exc.message}") from exc
