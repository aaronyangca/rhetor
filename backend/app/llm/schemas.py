"""The structured-output contract every chat turn requests.

webapp-design.md § Structured Output Contract: each call returns the chat
`reply` plus the full `document` that replaces the stage document. The first
turn of a motion additionally names the motion, position, and sidebar title.
"""

from __future__ import annotations

from ..models import POSITIONS

_REPLY = {
    "type": "string",
    "description": "The conversational message shown in the chat panel. Do not "
    "repeat the document here.",
}

_DOCUMENT = {
    "type": "string",
    "description": "The complete Markdown document for the current stage. This "
    "replaces the previous document wholesale, so it must always be the full "
    "text, never a diff or excerpt.",
}

TURN_SCHEMA: dict = {
    "type": "object",
    "properties": {"reply": _REPLY, "document": _DOCUMENT},
    "required": ["reply", "document"],
    "additionalProperties": False,
}

FIRST_TURN_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "reply": _REPLY,
        "document": _DOCUMENT,
        "title": {
            "type": "string",
            "description": "A 3-6 word title for this motion, for the sidebar.",
        },
        "motionText": {
            "type": "string",
            "description": "The motion exactly as the user stated it, e.g. "
            "'This House Would ban private schools'.",
        },
        "position": {
            "type": "string",
            "enum": list(POSITIONS),
            "description": "The BP position the user is preparing.",
        },
    },
    "required": ["reply", "document", "title", "motionText", "position"],
    "additionalProperties": False,
}
