"""Split idea.md into the stage-scoped prompt files the backend sends.

webapp-design.md § Prompt Construction calls for a one-time editorial split so
each turn carries only the rules for its stage. This script performs the split
mechanically from idea.md's existing `## ` headings, so the prompts can be
regenerated whenever idea.md changes rather than drifting from it.

Usage:
    python backend/scripts/split_prompts.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE = REPO_ROOT / "idea.md"
OUT_DIR = REPO_ROOT / "backend" / "app" / "prompts"

# This split is lossless by construction, and deliberately so. Only the three
# stage sections are named here; *everything else* in idea.md goes to shared.md
# in document order, whatever it happens to be. Nothing is judged
# "human-facing" and dropped.
#
# The earlier version listed the shared sections explicitly and dropped the
# rest. That silently withheld the architecture summary — the one place
# idea.md says "No filtering or in-depth development... Prioritize numbers
# over quality" — so the model was being asked to follow a document it had
# never been shown in full. An allowlist fails closed on every future edit to
# idea.md too: a new section would be dropped without anyone noticing.
STAGE_SECTIONS = {
    "stage1.md": "IDEA GENERATION",
    "stage2.md": "DEVELOPMENT & SCORING",
    "stage3.md": "FINAL RANKING",
}

PREAMBLES = {
    "shared.md": (
        "You are Rhetor, an assistant that helps a British Parliamentary debater "
        "build a case before their round. You work with the user in conversation, "
        "and every turn you return both a short chat reply and the full Markdown "
        "document for the current phase.\n\n"
        "The rules below govern everything you produce, at every phase."
    ),
    "stage1.md": "You are currently working in Idea Generation. These rules apply now.",
    "stage2.md": "You are currently working in Development & Scoring. These rules apply now.",
    "stage3.md": "You are currently working in Final Ranking. These rules apply now.",
}


def parse_sections(markdown: str) -> tuple[str, list[tuple[str, str]]]:
    """Split on `## ` headings.

    Returns everything before the first heading, then (title, body) pairs in
    document order. Order matters: shared.md is assembled by document position,
    not by a list someone has to remember to update.
    """
    lines = markdown.splitlines()
    heading_re = re.compile(r"^## (.+?)\s*$")

    starts: list[tuple[int, str]] = [
        (i, m.group(1)) for i, line in enumerate(lines) if (m := heading_re.match(line))
    ]
    if not starts:
        return markdown.strip(), []

    head = "\n".join(lines[: starts[0][0]]).strip()
    sections: list[tuple[str, str]] = []
    for idx, (line_no, title) in enumerate(starts):
        end = starts[idx + 1][0] if idx + 1 < len(starts) else len(lines)
        sections.append((title, "\n".join(lines[line_no:end]).strip()))
    return head, sections


def main() -> int:
    if not SOURCE.exists():
        print(f"error: {SOURCE} not found", file=sys.stderr)
        return 1

    head, sections = parse_sections(SOURCE.read_text(encoding="utf-8"))
    titles = [title for title, _ in sections]
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    missing = [t for t in STAGE_SECTIONS.values() if t not in titles]
    if missing:
        print(
            "error: idea.md is missing expected sections:\n  "
            + "\n  ".join(missing)
            + "\n\nHeadings found:\n  "
            + "\n  ".join(titles),
            file=sys.stderr,
        )
        return 1

    claimed = set(STAGE_SECTIONS.values())
    files: dict[str, list[str]] = {
        # Everything idea.md says that is not stage-specific, in its own order.
        "shared.md": [PREAMBLES["shared.md"], head]
        + [body for title, body in sections if title not in claimed],
    }
    for filename, title in STAGE_SECTIONS.items():
        body = next(b for t, b in sections if t == title)
        files[filename] = [PREAMBLES[filename], body]

    for filename, parts in files.items():
        text = "\n\n".join(p for p in parts if p).strip() + "\n"
        (OUT_DIR / filename).write_text(text, encoding="utf-8")
        print(f"wrote {filename:12} {len(text):>7,} chars")

    # The whole point of the split is that it loses nothing. Prove it rather
    # than trusting the bookkeeping above.
    written = "\n".join((OUT_DIR / f).read_text(encoding="utf-8") for f in files)
    dropped = [t for t in titles if f"## {t}" not in written]
    if dropped:
        print(
            "error: these sections of idea.md reached no prompt file:\n  "
            + "\n  ".join(dropped),
            file=sys.stderr,
        )
        return 1
    print(f"all {len(titles)} sections of idea.md accounted for")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
