r"""Incremental extraction of string fields from a JSON object as it streams.

Every provider returns the turn as one JSON object, so a naive stream gives
back raw JSON text — `{"reply":"Here you go.","document":"# Stage 1\n\n..."` —
which is useless to show a user. This walks that text as it arrives and yields
the decoded contents of the fields we care about, character by character.

Field order follows the schema, so `reply` completes before `document` starts:
the chat answer lands first and the document then fills in top to bottom.
"""

from __future__ import annotations

import re

#: Recognised JSON string escapes, minus \u which is handled separately.
_SIMPLE_ESCAPES = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    "b": "\b",
    "f": "\f",
    "n": "\n",
    "r": "\r",
    "t": "\t",
}


class StructuredStreamParser:
    """Feed it JSON text; it hands back decoded deltas for the named fields.

    Deliberately not a full JSON parser. The payload shape is fixed and flat —
    an object of string fields — and a real parser cannot emit anything until
    its input is complete, which is the one thing this needs to avoid.
    """

    def __init__(self, fields: tuple[str, ...] = ("reply", "document")):
        self._patterns = {
            field: re.compile(r'"%s"\s*:\s*"' % re.escape(field)) for field in fields
        }
        self._raw = ""
        self._search_from = 0
        self._field: str | None = None
        self._scan = 0
        self.values: dict[str, str] = {field: "" for field in fields}
        self.finished: set[str] = set()

    def feed(self, chunk: str) -> list[tuple[str, str]]:
        """Append streamed text, returning `(field, decoded_delta)` pairs."""
        if not chunk:
            return []
        self._raw += chunk

        deltas: list[tuple[str, str]] = []
        while True:
            if self._field is None and not self._open_next_field():
                break

            assert self._field is not None
            text, closed, consumed = self._decode_from(self._scan)
            self._scan = consumed

            if text:
                self.values[self._field] += text
                deltas.append((self._field, text))

            if not closed:
                break

            self.finished.add(self._field)
            self._search_from = self._scan
            self._field = None

        return deltas

    def _open_next_field(self) -> bool:
        """Position the cursor at the start of the next field's value."""
        best: tuple[int, str] | None = None
        for field, pattern in self._patterns.items():
            if field in self.finished:
                continue
            match = pattern.search(self._raw, self._search_from)
            if match and (best is None or match.end() < best[0]):
                best = (match.end(), field)

        if best is None:
            return False

        self._scan, self._field = best
        return True

    def _decode_from(self, start: int) -> tuple[str, bool, int]:
        """Decode a JSON string body from `start`.

        Returns the decoded text, whether the closing quote was reached, and
        how far the input was consumed. Stops short of a truncated escape so a
        chunk boundary mid-`\\u00` is picked up on the next feed rather than
        being mangled.
        """
        out: list[str] = []
        i = start
        end = len(self._raw)

        while i < end:
            char = self._raw[i]

            if char == '"':
                return "".join(out), True, i + 1

            if char != "\\":
                out.append(char)
                i += 1
                continue

            if i + 1 >= end:
                break  # a lone trailing backslash — wait for more

            escape = self._raw[i + 1]
            if escape == "u":
                if i + 6 > end:
                    break  # truncated \uXXXX
                try:
                    out.append(chr(int(self._raw[i + 2 : i + 6], 16)))
                except ValueError:
                    # Not a valid escape; pass it through rather than drop it.
                    out.append(self._raw[i : i + 6])
                i += 6
                continue

            out.append(_SIMPLE_ESCAPES.get(escape, escape))
            i += 2

        return "".join(out), False, i
