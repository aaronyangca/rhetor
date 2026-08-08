"""Provider-agnostic types for the one call the app makes."""

from __future__ import annotations

from dataclasses import dataclass, field


class LLMError(Exception):
    """A provider call failed in a way worth showing the user."""

    def __init__(self, message: str, *, status: int = 502):
        super().__init__(message)
        self.message = message
        self.status = status


class InvalidProviderKey(LLMError):
    """The user's stored key was rejected by the provider."""

    def __init__(self, provider: str):
        super().__init__(
            f"Your {provider} API key was rejected. Check it in account settings.",
            status=400,
        )


@dataclass
class Turn:
    """One message of prior conversation, in provider-neutral form."""

    role: str  # "user" | "assistant"
    content: str


def unescape_literal_escapes(text: str) -> str:
    r"""Repair prose whose escape sequences survived JSON decoding.

    Every provider returns the document as a string *inside* a JSON object, so
    a newline has to be written `\n` in the wire format and comes back as a
    real newline. Models fairly often escape it twice — emitting `\\n` — and
    then `json.loads` yields a two-character backslash-n that renders as
    literal `\n` in the chat and turns the whole Markdown document into one
    unbroken line.

    Only rewrite when the escapes outnumber the real newlines. Well-formed
    Markdown has many real line breaks and effectively no literal `\n`, so that
    test leaves correct output untouched while catching both the fully- and
    mostly-escaped cases.
    """
    if not text or text.count("\\n") <= text.count("\n"):
        return text
    return (
        text.replace("\\r\\n", "\n")
        .replace("\\n", "\n")
        .replace("\\r", "\n")
        .replace("\\t", "\t")
        .replace('\\"', '"')
    )


@dataclass
class Generation:
    """The parsed structured output of one turn."""

    reply: str
    document: str
    title: str | None = None
    motion_text: str | None = None
    position: str | None = None
    raw: dict = field(default_factory=dict)

    @classmethod
    def from_payload(cls, payload: dict) -> "Generation":
        return cls(
            # The two prose fields are the ones that carry line breaks, and so
            # the only ones that can arrive double-escaped.
            reply=unescape_literal_escapes(payload.get("reply", "")),
            document=unescape_literal_escapes(payload.get("document", "")),
            title=payload.get("title"),
            motion_text=payload.get("motionText"),
            position=payload.get("position"),
            raw=payload,
        )
