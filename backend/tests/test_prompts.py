"""Prompt assembly.

These are cheap structural checks, not judgements about model output. They
exist because the failure they guard against is silent: a prompt that has lost
part of idea.md still generates a perfectly fluent document, just not the one
idea.md asks for.

The rule the split has to keep is simple — every line of idea.md reaches the
model, split by stage and nothing else.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

from app.llm.prompts import system_prompt

IDEA_MD = Path(__file__).resolve().parents[2] / "idea.md"


def all_prompt_text() -> str:
    return "\n".join(system_prompt(stage) for stage in (1, 2, 3))


def test_the_split_loses_nothing():
    """The whole contract of the split, checked line by line."""
    idea = IDEA_MD.read_text(encoding="utf-8")
    blob = all_prompt_text()
    missing = [line for line in idea.splitlines() if line.strip() and line not in blob]
    assert missing == [], f"{len(missing)} lines of idea.md reach no prompt: {missing[:3]}"


def test_every_section_heading_survives():
    idea = IDEA_MD.read_text(encoding="utf-8")
    headings = re.findall(r"^## (.+?)\s*$", idea, flags=re.MULTILINE)
    blob = all_prompt_text()
    assert headings, "idea.md has no ## headings — has the format changed?"
    for heading in headings:
        assert f"## {heading}" in blob


@pytest.mark.parametrize("stage", [1, 2, 3])
def test_each_stage_carries_shared_rules_and_its_own_section(stage):
    prompt = system_prompt(stage)
    assert "Ordinary Intelligent Voter" in prompt
    assert "## Argument Format" in prompt
    assert f"You are currently working in Stage {stage}" in prompt


@pytest.mark.parametrize("stage", [1, 2, 3])
def test_stages_do_not_leak_into_each_other(stage):
    """The only thing the split is allowed to do is separate the stages."""
    prompt = system_prompt(stage)
    for other in {1, 2, 3} - {stage}:
        assert f"You are currently working in Stage {other}" not in prompt
        assert f"## STAGE {other}" not in prompt


def test_stage_1_states_the_ideation_method():
    """The four rounds and the pool quota live deep inside the Stage 1 section,
    which is exactly the kind of content a lossy split drops silently."""
    prompt = system_prompt(1)
    for round_name in ("First Premises Sweep", "Domain + Actor Sweep",
                       "Cross-Round Synthesis", "Coverage Check"):
        assert round_name in prompt
    assert "20-25 seeds per side" in prompt


def test_shared_rules_explain_what_each_stage_is_for():
    """The architecture summary was dropped by the original allowlist split. It
    is the sharpest statement of Stage 1's intent anywhere in idea.md."""
    prompt = system_prompt(1)
    assert "Prioritize numbers over quality" in prompt
    assert "No filtering or in-depth development" in prompt


def test_motion_context_is_appended_last():
    prompt = system_prompt(1, motion_text="THW ban zoos", position="OG")
    assert "THW ban zoos" in prompt
    assert prompt.index("## STAGE 1") < prompt.index("## This motion")


def test_motion_context_needs_both_halves():
    """Position is extracted on the first turn, so it is absent then."""
    assert "## This motion" not in system_prompt(1, motion_text="THW ban zoos")
    assert "## This motion" not in system_prompt(1, position="OG")


def test_unknown_stage_is_rejected():
    with pytest.raises(ValueError):
        system_prompt(4)


def test_title_clamping():
    """The schema specifies the format; the server only enforces length."""
    from app.blueprints.motions import TITLE_MAX, _clamp_title

    assert _clamp_title("THW Ban Zoos (OG)") == "THW Ban Zoos (OG)"
    assert _clamp_title("  THW   Ban  Zoos (OG) ") == "THW Ban Zoos (OG)"

    long = "THBT " + "Very Long Motion Wording " * 6 + "(CO)"
    clamped = _clamp_title(long)
    assert len(clamped) <= TITLE_MAX + 1  # the ellipsis is one character
    assert clamped.endswith("…")
    assert not clamped.endswith(" …")  # cut at a word boundary, no dangling space


def test_title_clamping_handles_one_long_word():
    from app.blueprints.motions import TITLE_MAX, _clamp_title

    clamped = _clamp_title("x" * 200)
    assert len(clamped) == TITLE_MAX + 1
