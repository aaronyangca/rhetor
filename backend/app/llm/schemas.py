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
        # Left to itself the model renames the same motion differently every
        # run ("THW ban zoos", "Banning zoos as OG", "Banning Zoos Opening
        # Government"), which makes the sidebar unreadable across sessions.
        # The format is therefore fully determined by the motion and position.
        "title": {
            "type": "string",
            "description": (
                "The sidebar title, in exactly this format: "
                "'<PREFIX> <Core> (<POSITION>)'. "
                "PREFIX is the motion's own abbreviation in capitals — THW, "
                "THBT, THS, THO, THP, THR, THR — or omitted entirely if the "
                "motion does not start with one. "
                "Core is the motion's proposition in Title Case with articles "
                "lowercased, keeping the motion's own nouns and verbs rather "
                "than paraphrasing: 'This House Would ban zoos' becomes 'Ban "
                "Zoos'. POSITION is OG, OO, CG or CO. "
                "Examples: 'THW Ban Zoos (OG)', 'THBT Social Media Has Harmed "
                "Democracy (CO)'. "
                "For a long motion, keep only the part that distinguishes it "
                "and drop subordinate clauses, qualifiers and examples — "
                "'THO the FDA's decision to fast track the approval of "
                "Glucagon-like Peptide-1 drugs' becomes 'THO Fast-Tracking "
                "GLP-1 Approval (OO)'. Never exceed 60 characters including "
                "the position; if it still would, cut at a word boundary and "
                "end with a single ellipsis character before the position."
            ),
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
