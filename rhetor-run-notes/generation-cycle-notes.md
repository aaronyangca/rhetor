# Rhetor Test Cycle — My Human Retrospective Notes

Note: this file was written by AI and then heavily edited to make sure all contents were correct + understandable to a human reader

Covers one generation cycle: reading `idea.md` -> running two cases (GLP-1 fast-track, THO/Opposition; neurodivergence self-diagnosis, THR/Opening Opposition) -> four rounds of revision. This file is about what worked in *the process*

---

## What worked well from the start

- **Seperating into three stages (Idea Generation → Develop+Score → Rank)** 
    - The AI successfully seperated Stage 1's task (develop as many argument seeds as possible **without extending**) and Stage 2's task (extend argument seeds), etc.
    - Keeping "is this a good argument" and "is this the right argument for this bench right now" as separate questions made the final list of arguments decent.
- **Classifying motion and finding rules** 
    - Setting the motion type before generating anything helped the AI remember rules (fiat, burdens, etc.), which helped it catch errors before they were fully written as arguments
        - e.g., This House Regrets' no-future-fiat rule helped the AI identify a seed that depended on "and so this normalizes going forward"
- **Idea generation in four-rounds helped the AI to produce non-obvious arguments.** 
    - Round 3 (cross-round synthesis) led to generate the eventual highest-scoring arguments in both cases: "Precaution Cuts Both Ways" + "The Real Alternative Is Silence". 
    - The "what hasn't been generated that this combination makes possible" instruction seems to be working + adding something new
- **Tagging evidence with confidence levels led to the AI's honest evaluation of arguments.** 
    - Flagging "plausible-but-limited" on the weakest citations (e.g., self-diagnosis accuracy rates) instead than either omitting the evidence or overstating it meant the final arguments were defensible
- **The choice to run the generation process two times for different motion types (a THO defending an existing decision, a THR attacking a counterfactual)**
    - helped the AI to find diverse datasets

---

## Pattern for revision: find an error -> create rule -> check everything

Probably the most reusable finding w/ Rhetor so far:

Process for revision:
1. User finds a problem with an argument
2. Before fixing that instance, ask why the error happened to identify whether is this situation is a one-off, or a category of error the AI Agent has no test for?
3. If it's a category, write a checkable test into `idea.md`: i.e., a literal procedure ("delete the Claim and re-read the Mechanism alone," "read the Claim to the opposing bench and predict their honest reaction").
4. Look through the entire existing pool of arguments using the new test, as other arguments may have fallen into the same trap
5. Report what else the sweep caught

This caught problems every single time it ran (see log below).

**Corollary that showed up twice:** a corrected Label or Claim sometimes shows that two differently-worded arguments were the same argument underneath (Argument 1 merging into Argument 18 in the neurodivergence run). Worth checking for this specifically whenever a Claim or Label changes.

---

## Gaps

| # | Gap | Cause | Fix |
|---|---|---|---|
| 1 |<br>Jot-note formatting was recommended, but no specification on how to do it <br>&nbsp; | `idea.md` said what fields to include, never how tersely to write them | **Jot Note Fields**<br> Use a bullet structure for each field, "None" for empty fields |
| 2 | <br>"Delay Compounds Preventable Harm" was an Impact instead of an Argument. Five more arguments with the same problem after sweeping <br>&nbsp;| Round 2 idea generation starts with the impact area, which makes it easy to generate a Claim that's just an impact | **Argument vs. Impact check**<br> ignore the Claim, re-read the Mechanism. If it still just quantifies a benefit, it's Impact content |
| 3 | "Correcting Historic Underinvestment" did not argue for fast-tracking, since the same benefit occurs eventually either way | No check for whether argument's terminal impact engages with the disputed aspect of the round | <br>**Check Undebated Counterfactual**<br>would this occur on the counterfactual too? (forces the AI to debate on margin of change) <br>&nbsp;|
| 4 |<br> "Self-Knowledge Needs No Permission" did not describe what made it actually hard to rebut (i.e., clash)<br>&nbsp; | Labels were checked against Claims, but nothing checked whether either one named the strongest element | **Find which elements are the most important** for Labels — remove each component in turn; whichever removal collapses the argument is what gets named |
| 5 | Side Proposition would simply concede Argument 4's Claim the way it was written, as there wasn't any emphasis on the contest part of the argument |<br> Label-accuracy check only checks how accurately the Label represents the Claim. Nothing checked whether the Claim itself was the actual contested part of the argument<br>&nbsp;| **Claim vs. Premise check**, sequenced before Label accuracy, since a label can paraphrase a claim that was never the real claim |
| 6 | Argument 4 was vulnerable to a very obvious Government rebuttal, and the existing solution would have been to write a full rebuttal paragraph | "Preemptive argument development" already existed but was satisfied by writing a good comeback; nothing required the assumption itself to be proven constructively |<br>**Preemption that only reacts vs. preemption that removes the need to react** — if the counter attacks an important assumption, prove the assumption in the Mechanism itself. This is important because a rebuttal will leave a gap in the argument even if it's true<br>&nbsp;|
---

## An observation about where these bugs happened

Several of the "new" checks weren't really new criteria. Instead, they were intentions that had no test attached to them, so they were applied inconsistently:

- Criterion 1 already asked "would the opposing team know exactly what they need to rebut?" That question is exactly where Argument 4 failed, but `idea.md` only provided a call to the AI's judgement.

    - The AI then proceeded to ignore the question.
    - The solution was to turn the question to ("read it to the other side; is their honest answer 'agreed, so what' or 'no, I disagree'?").
    
- Second-Order Effect Analysis already told the AI to model the opponent's rebuttal. However, it didn't distinguish between "have a good comeback ready" and "prove the thing the comeback would otherwise have to argue **within the argument**."

**Lesson for writing the rest of this**:<br>
Instructions phrased as a quality to aim for ("be clear," "consider the opponent's response") are insufficient. Instructions that provide the AI with:

1. A procedure or script
2. A pass/fail test

Are the only instructions that **consistently** impact AI output. Worth checking the remaining sections of `idea.md` (Principled Argument Blueprint, Stage 3 criteria) for the same type of instruction pattern before they get tested the same way.

---

## Process/tooling note

One mistake worth noting: finding and replacing names (e.g., renaming "The Rise Is a Symptom, Not the Disease" → "Visible, Not New" across the neurodivergence file) somehow corrupted two historical references inside a revision note that were supposed to quote the old name for context ("...was 'The Rise Is a Symptom, Not the Disease'..." became "...was 'Visible, Not New'..." — self-referential nonsense). AI caught it on this read-through and fixed it. Global replace is safe for a term that only ever means one thing in the document; it's 100% not safe once the document contains its own edit history in prose, since old and new names for the same thing exist for different purposes. Worth doing a targeted check rather than `replace_all` whenever a doc has historical notes.

---

## What wasn't tested this cycle

Noting these so they don't get assumed to work just because the tested surface held up:

- Only Opposition was built
- Only Opening bench was tested.
- Only THO and THR were run.
- The Claim+Impact merge idea was discussed and deliberately not implemented

---

## File locations

- `idea.md` — the living spec, now at 6 rounds of rule additions past its original state.
- `rhetor-run/rhetor-run-glp1-opposition.md` — THO case, Opposition/OO.
- `rhetor-run/rhetor-run-neurodivergence-oo-opposition.md` — THR case, Opposition/OO.
