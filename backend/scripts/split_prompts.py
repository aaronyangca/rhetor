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

# Which top-level sections of idea.md go into which prompt file. Everything not
# listed here (the overview, the architecture summary, "Sections To Be Added")
# is deliberately dropped — it describes the pipeline to a human reader rather
# than instructing the model.
SECTIONS = {
    "shared.md": [
        "Evaluation Standard: The Ordinary Intelligent Voter (OIV)",
        "Argument Format",
    ],
    "stage1.md": ["STAGE 1: Argument Ideation"],
    "stage2.md": ["STAGE 2: Argument Development + Intrinsic Quality Scoring"],
    "stage3.md": ["STAGE 3: Holistic Contextual Ranking"],
}

PREAMBLES = {
    "shared.md": (
        "You are Rhetor, an assistant that helps a British Parliamentary debater "
        "build a case before their round. You work with the user in conversation, "
        "and every turn you return both a short chat reply and the full Markdown "
        "document for the current stage.\n\n"
        "The rules below govern everything you produce, at every stage."
    ),
    "stage1.md": "You are currently working in Stage 1. These rules apply now.",
    "stage2.md": "You are currently working in Stage 2. These rules apply now.",
    "stage3.md": "You are currently working in Stage 3. These rules apply now.",
}


def parse_sections(markdown: str) -> dict[str, str]:
    """Return {h2 title: section body including the heading}."""
    lines = markdown.splitlines()
    heading_re = re.compile(r"^## (.+?)\s*$")

    starts: list[tuple[int, str]] = [
        (i, m.group(1)) for i, line in enumerate(lines) if (m := heading_re.match(line))
    ]

    sections: dict[str, str] = {}
    for idx, (line_no, title) in enumerate(starts):
        end = starts[idx + 1][0] if idx + 1 < len(starts) else len(lines)
        sections[title] = "\n".join(lines[line_no:end]).strip()
    return sections


def main() -> int:
    if not SOURCE.exists():
        print(f"error: {SOURCE} not found", file=sys.stderr)
        return 1

    sections = parse_sections(SOURCE.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    missing = [
        title
        for titles in SECTIONS.values()
        for title in titles
        if title not in sections
    ]
    if missing:
        print(
            "error: idea.md is missing expected sections:\n  "
            + "\n  ".join(missing)
            + "\n\nHeadings found:\n  "
            + "\n  ".join(sections),
            file=sys.stderr,
        )
        return 1

    for filename, titles in SECTIONS.items():
        parts = [PREAMBLES[filename], *(sections[t] for t in titles)]
        text = "\n\n".join(parts).strip() + "\n"
        (OUT_DIR / filename).write_text(text, encoding="utf-8")
        print(f"wrote {filename:12} {len(text):>7,} chars  ({', '.join(titles)})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
