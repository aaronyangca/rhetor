You are currently working in Stage 2. These rules apply now.

## STAGE 2: Argument Development + Intrinsic Quality Scoring

*This stage first develops every Stage 1 seed that cleared the entry threshold into a fully-specified argument — explicit step-by-step Mechanism, dimensioned Impact, and (for principled arguments) concrete grounding per the Principled Argument Blueprint in Stage 1. Only once an argument is developed to this level can its intrinsic quality actually be judged: a seed's "rough mechanism" and "rough impact area" (the Stage 1 bar) are not yet scoreable against Criteria 1-3 below — scoring a seed instead of a developed argument means guessing. Scoring is applied second, to the developed argument, and filters out whatever the development process reveals to be weak: a mechanism that could not actually be built into a real causal chain, or an impact that stayed generic even under the dimensioned Impact format.*

*(This costs more than filtering first would — developing the full surviving pool before scoring is more work than scoring bare seeds. That cost is accepted deliberately: a fast score on an undeveloped seed is not a real score.)*

---

### Development Round

Every seed that cleared the Stage 1 entry threshold — relevant to the motion, sketched mechanism, identified impact area — is developed here before scoring, using the Argument Format above. This is distinct from Stage 1 ideation: ideation produces breadth, this produces depth on what ideation already found. Nothing is filtered out yet on the basis of intrinsic quality; development may reveal an argument is weak, but that gets confirmed by scoring next, not decided here.

**Generation order**: Develop field-by-field across the whole surviving pool, not argument-by-argument. Write every argument's Claim first, then every argument's Mechanism, then every Evidence/second-order extension, then every Impact — rather than fully completing argument 1 before starting argument 2. Argument-by-argument generation reliably produces more effort on the first few items and less on later ones, because the pattern feels "established" after the first two or three and later items get filled in by pattern-completion instead of fresh work. Field-by-field generation prevents this: no single argument is ever mid-buildup while attention drifts toward wrapping up.

**1. Mechanism Deepening**

Expand the seed's rough mechanism into the explicit step-by-step chain the Argument Format requires: the exact actors, incentives, and conditions that make each step probable. The goal is to go from "this could happen" to "here is why this is likely" — and to produce a chain that can actually be scored against Criterion 2, not just described.

**2. Second-Order Effect Analysis**

For each argument, take the mechanism's first-order effect (what the policy or claim directly does) and ask "and then what?" at least once, extending the causal chain. The downstream consequence is often the most compelling part of the Impact, and sometimes reveals that the first-order effect is actually undermined by second-order dynamics — the "counterintuitive flip" that preempts the opponent's expected response.

Second-order thinking also enables *preemptive argument development*: model the opponent's most likely counter to this argument, trace that counter's second-order consequences, and check whether those consequences undermine the counter itself. If they do, the argument now contains a built-in preemption that can be deployed in speech.

**Preemption that only reacts is weaker than preemption that removes the need to react.** When the opponent's most likely counter targets an assumption the argument's Claim silently depends on — not a side detail, but the load-bearing premise the whole comparative logic rests on — writing "if they say X, we say Y" as a rebuttal paragraph is not enough, even if Y is correct. The stronger move is to fold the proof of that assumption into the argument's own Mechanism as constructive reasoning, so the argument affirmatively establishes the point before the opponent ever raises it, rather than merely surviving the raise once it's made. Test: does the Mechanism, read on its own with no rebuttal paragraph attached, already establish why the assumption holds — or does establishing it require a separate bolted-on response? If the latter, the Mechanism has an unproven load-bearing gap, not just an unaddressed objection, and that gap should be treated the same as any other incomplete Mechanism at the Development Round. (Failure case: an argument comparing self-diagnosis favorably to silence implicitly assumes self-diagnosis is net-beneficial despite real risk of inaccuracy. "Self-diagnosis is often wrong, so silence would have been better" is not a side objection to that argument — it attacks its central comparative claim directly. Writing a rebuttal paragraph for this isn't the fix; mechanizing, as part of the argument itself, why a process with bounded and revisable error still beats a process that guarantees zero correct outcomes is. Note also that this frequently surfaces a load-bearing assumption *several* arguments share, not just the one under development — check the rest of the pool for the same dependency once it's found, the same way a Label fix or Claim fix can reveal it elsewhere.)

**3. Principled Argument Grounding**

If the argument's core claim rests on a normative value rather than a consequentialist outcome (a principled argument), this step attaches a concrete "so what?" Impact before scoring, per the Stage 1 Principled Argument Blueprint. A principled argument without this grounding cannot receive a real Impact score — it can only be guessed at.

**4. Completeness & Label Audit**

Before any argument proceeds to scoring, audit the full developed set together — this is the Stage 2 equivalent of Stage 1's Round 4 coverage check, applied to depth and accuracy instead of domain coverage:

- *Completeness*: does every argument have every required field filled (Mechanism steps, Second-Order Effect or the bare word "None," Evidence with confidence flags, dimensioned Impact)? An argument with a visibly shorter Mechanism or thinner Impact than the rest of the set is not necessarily weaker — but it must be re-examined before scoring to confirm the gap is real and not an artifact of generation order.
- *Claim vs. Premise check (run before Label accuracy — a Label can only be checked against a Claim that is already correct)*: a Claim can be clear, specific, and well-formed while still failing to be a Claim, if the opposing bench would simply concede it. Test: read the candidate Claim as a sentence spoken to the other side. If their honest reaction is "agreed — so what?", the sentence is a premise the Mechanism runs on, not the position the Mechanism is arguing for; the real Claim is further down the chain, at whichever step the opposing bench would actually say "no, I disagree" to. Re-read the Mechanism in order and find the *last* step neither side already grants — that is the Claim, not the first one. This is a different failure from Criterion 1's "vague hedging" or "trivially true" red flags: a premise-as-claim can be perfectly specific, informative, and non-trivial while still not being the site of actual disagreement between the two sides of the motion. (Failure case: a Mechanism proving "the visible rise in self-diagnosis is the resolution of a pre-existing, already-invisible gap becoming visible — not a new problem" was Claimed as "the rise in self-diagnosis is a downstream consequence of a diagnostic system that already failed large numbers of people" — a sentence Government would happily concede, since granting it doesn't require granting that the rise isn't *also* a new, regrettable problem in its own right. The site of actual disagreement was the Mechanism's last step, not its first.)
- *Label accuracy*: re-derive each Label from its own Claim independently and compare to the Label actually assigned. If they don't match, the original Label was drawn from Evidence or narrative color instead of the claim, and must be rewritten. This is necessary but not sufficient — a Label can faithfully paraphrase a Claim that itself understates the argument. Also apply the *load-bearing element test* (see Argument Format, Label): does the Claim/Label center the comparative or consequential insight that actually carries the argument, or does it center the premise the argument merely leans on? If a later field — typically the Mechanism's comparative reasoning, or the Impact's comparative claim — turns out to be doing the real persuasive work, rewrite the Claim and Label to center it, then re-check the rest of the pool for hidden duplication this can surface: two arguments stated from different premises sometimes turn out to be the same argument once correctly centered, in which case they get collapsed like any other duplicate, not kept alive as two labels for one point.
- *Argument vs. Impact check*: does the Mechanism prove a contestable Claim about the motion, or does it just quantify how much an already-agreed-on consequence matters? Test: delete the Claim sentence and re-read the Mechanism steps alone. If they still just describe the magnitude or timing of a benefit or harm — rather than argue *why* the Claim is true — the entry is an Impact wearing an argument's clothes. It does not get its own scored slot; fold it into the Impact or Evidence of whichever surviving argument it actually supports. This failure mode is easy to miss because Round 2 of Stage 1 ideation is impact-area-first by design (see Round 2) — that direction is necessary for coverage, but it means Round 2 seeds need this check applied more skeptically than Round 1 seeds, not less.
- *Differential check*: for any Claim whose force depends on comparing the decision or claim under debate against a counterfactual (a slower timeline, a different actor, an alternative policy), does the stated Impact actually differ between that counterfactual and the world being defended — or would it occur either way, just later or by a different route? If the outcome is the same and only its timing changes, the timing gap itself is the real Impact and must be argued as such explicitly (e.g. "N months of harm during the gap") — the outcome's mere eventual existence is not evidence for the specific decision the motion contests. An argument that would be equally true of the undisputed alternative is defending the underlying policy or technology in general, not the variable actually in dispute, and does not survive as differentiating material. (See also Criterion 3's Differential Check Against the Undebated Counterfactual, which states this in full.)
- *Fiat check*: does any Mechanism or Impact step depend on the debate's own outcome causing a real-world actor to behave differently in the future? Check each surviving argument against the Fiat by Motion Type table in Stage 1. This fails by default on THBT/THS/THO and THR motions — reframe the Impact around what is already true, or cut the step.
- *Culpability/provability check*: does the Impact actually change harm magnitude, probability, scope, timeframe, or reversibility — or does it just explain *why* the underlying event happened? Test it by removing the explanation and checking whether the stated harm shrinks; if it doesn't shrink, the explanation isn't an Impact (see Criterion 3, Impact vs. Culpability). For any forward-looking claim that survives this, also apply the Provability & Differential Check under Criterion 3 — if an argument fails either check and has no other independent Impact, it doesn't get cut outright; check first whether its content is better used as Evidence supporting another surviving argument's Mechanism.
- *Precedent-as-mechanism check*: for any argument whose Mechanism proves a forward-looking claim by citing a historical or structurally-similar precedent, apply Criterion 2's Precedent-as-Mechanism check now — delete the precedent and confirm an independent, case-specific causal chain still remains. Do not wait for scoring to discover the Mechanism was borrowed rather than built.
- *Rebuttal magnitude check*: for any argument built specifically to answer another bench's named argument, apply Criterion 3's Rebuttal Magnitude Check before finalizing Impact — check whether a real-world factor independent of the debate already mitigates part of what's being rebutted, and score Impact against the residual gap, not the opposing argument's full stated scope.
- *Mechanism-sharing check (for Closing-bench runs developed against supplied opening-half material)*: apply Stage 3's Bench Position Fit Mechanism-sharing test now rather than deferring it to Stage 3 — an argument sharing a borrowed mechanism with the opening half is often visible as soon as it's fully written out, the same way Argument vs. Impact failures are.

---

### Criterion 1: Claim Clarity

**What it is:** A strong argument has a single, clear, specific claim that is directly tied to the motion and signals the team's stance. Judges cannot credit arguments they cannot clearly identify.

**How to evaluate:**
- Can the claim be stated in one sentence?
- Is it directly connected to the motion's specific framing?
- Would the opposing team know exactly what they need to rebut — or would they simply agree and move on?

**Red flags:** Vague hedging, claims so broad they're trivially true, claims that drift mid-argument, a claim the opposing bench would simply concede. That last one is distinct from "trivially true" — a conceded premise can be specific, substantive, and informative while still not being where the two sides of the motion actually disagree. See the Claim vs. Premise check in the Stage 2 Development Round.

---

### Criterion 2: Reasoning / Mechanism

**What it is:** The argument must explain *how* and *why* the claim is true — not just assert it. This means a clear causal chain that demonstrates not only that something is possible, but that it is probable. Every step in the chain must be plausible to the OIV without specialist knowledge.

**How to evaluate:**
- Does it explain the mechanism step by step?
- Does it prove probability, not just possibility?
- Is each step in the causal chain independently plausible?
- Does the reasoning actually prove the claim, or does it assume what it's trying to prove?

**Red flags:** Bare assertions, logical leaps, circular reasoning, overly abstract reasoning with no grounding.

**Precedent-as-Mechanism check**: A Mechanism proving a forward-looking claim ("this will happen because something structurally similar happened before") must state an independent, case-specific causal chain as the Mechanism itself — the precedent belongs in Evidence, supporting that chain's plausibility, never standing in for it (see the Argument Format's Evidence rule). Test: delete the historical/precedent example and re-read the Mechanism alone. If no causal steps remain — if the only reason given for why *this* case follows the pattern is that other cases did — the Mechanism hasn't been built yet, it's been borrowed. A mechanism that survives this test still typically proves *necessity* (the precedent's condition is required for the outcome) more firmly than *likelihood* (the outcome will actually follow); score Probability under Criterion 3 at that more honest, lower level rather than inheriting the confidence of the historical pattern itself. (Failure case: an argument that continued AI advancement would eventually create new complementary job categories, argued entirely by citing that electrification and computing followed a disruptive-then-generative pattern. The precedent is real, but stated as the Mechanism's first step it proves nothing about AI specifically. The fix is a Mechanism stating why *this* technology's reliability/cost trajectory would let third parties build new roles on top of it — with the historical pattern moved to Evidence, and Probability scored as the more modest "necessary but not clearly likely" claim that mechanism actually supports.)

---

### Criterion 3: Impact & Weighing

**What it is:** Every argument must explain why it matters and how much it matters relative to other arguments in the debate. Impact is not just a conclusion — it is a comparative claim about importance.

**Dimensions of impact:**
- **Breadth / Scope** — how many people are affected?
- **Depth / Magnitude** — how severely are they affected?
- **Probability** — how likely is this outcome, established with an actual reason, not just asserted?
- **Timeframe** — short-term or long-term? How long do effects last?
- **Reversibility** — can the harm be undone, or is it permanent? A harm that can't be reversed outweighs an equally severe one that can.
- **Significance** — are the affected people particularly vulnerable or important? (Narrow use only — see red flag below. This is about who is affected, not about what the decision reveals or implies.)

**How to evaluate:**
- Does the argument quantify or meaningfully describe scale?
- Is there a comparative claim — why does this matter *more* than what the other side is saying?
- Is the impact a logical consequence of the reasoning, or tacked on?

**Red flags:** Generic impacts ("this affects everyone"), impacts not grounded in the reasoning, no comparative weighing.

**Impact vs. Culpability**: An explanation of *why* something happened (negligence, bias, institutional incentive, bad faith, honest mistake) is not itself an Impact. It only becomes one if it changes the actual magnitude, probability, scope, timeframe, or reversibility of harm to real, already-affected or concretely-at-risk people. "This reveals a pattern," "this sets a precedent," or "this could happen again" measure blameworthiness, not harm — do not let "Significance" become a catch-all that smuggles a culpability claim in as if it were weighing material. If removing the explanation of *why* the decision was made would leave the harm's magnitude completely unchanged, the explanation is not an Impact.

**Differential Check Against the Undebated Counterfactual**: Many motions contest one specific variable of an otherwise-uncontested policy or fact — e.g. a motion about the *speed* of an approval that both sides would agree should have happened eventually, or a motion about *which actor* did something both sides agree needed doing. For any Impact offered as a reason the actual decision was right (or wrong), ask: would this same outcome have occurred under the most natural counterfactual the other side is implicitly defending — just delayed or rerouted — or does it depend specifically on the disputed variable? If the outcome is identical either way and only its timing or path changes, that gap is the real Impact and must be argued as such explicitly, not left implicit. An Impact that would be equally true of the undisputed alternative is not evidence for the decision under debate; it is evidence for the underlying policy nobody is contesting, and it does not survive as weighing material. This compounds with Impact vs. Culpability above — both catch an argument smuggling in weight that doesn't actually depend on how the round's central, disputed question resolves. Unlike the Provability & Differential Check below, this check applies regardless of timeframe — it catches retrospective and already-true claims just as often as forward-looking ones.

**Provability & Differential Check for forward-looking claims**: An Impact projecting consequences into the future must clear two bars: (1) it must be a specific, justified probability increase — not "this could happen again" asserted without a mechanism for *why* it's more likely now than it would otherwise be; and (2) per the Fiat by Motion Type table, it must not assume this debate's outcome, or which side's characterization is correct, changes what an independent real-world actor (a regulator, a court, a foreign government) actually does next. If the future is identical regardless of who wins the room — because nothing in the round is positioned to act on the conclusion — the claim cannot function as weighing material. At most it can support another argument's Mechanism (evidence that the underlying risk was foreseeable), never stand as its own Impact.

**Rebuttal Magnitude Check**: When an argument is built specifically to answer a named opposing argument — rather than to stand as independent constructive material — its Impact must be scored against that opposing argument's *actual* real-world magnitude, not its stated framing. Before scoring, ask: does a factor already in place independent of the debate's outcome — existing law, established practice, prior technology — already mitigate a substantial share of the harm or benefit the opposing argument claims? If so, the rebuttal's real stakes are the residual gap that factor doesn't reach, not the opposing argument's full stated scope, and Impact must be scored against that narrower, residual claim rather than the headline one. This is distinct from the Differential Check above, which asks whether an outcome differs between two counterfactual worlds; this check asks whether the underlying phenomenon is smaller than either side's framing implies once real-world context is accounted for. It does not discount rebuttals as a category — a rebuttal that clears this check can still score at the top of the pool — it only prevents an argument's Impact from silently inheriting an opposing case's own possibly-inflated framing. (Failure case: a rebuttal to an opposing argument about AI harming children scored a perfect Impact by treating the full claimed harm as foreclosed by a freeze, without checking that existing child-data-protection and minimum-age-access law already mitigates much of that harm independent of any AI policy. The correction was not to abandon the rebuttal — the residual, law-can't-reach gap was still real — but to score Impact against that narrower residual, not the opposing argument's full headline claim.) See also the note on Criterion 4 below: this check is what should absorb a weak opposing case's actual strength, not the Clash multiplier.

---

### Scoring & Ranking Arguments

#### Two-Layer Scoring Model

Scoring is split into two layers to reflect the difference between intrinsic argument quality and contextual fit.

**Layer 1 — Intrinsic Quality Score (Criteria 1-3)**

Each criterion is scored on a 1-5 scale, then multiplied by its weight. The weighted scores are summed to produce a total intrinsic quality score out of 5.

| Criterion | Scale |
|---|---|
| Claim Clarity | 1-5 |
| Reasoning / Mechanism | 1-5 |
| Impact & Weighing | 1-5 |

**Layer 2 — Contextual Modifiers (Criteria 4-5)**

These are not scored on the same scale as criteria 1-3. They are applied as adjustments after the intrinsic score is calculated.

- **Criterion 4 (Intrinsic Clash)**: Applied as a multiplier to the intrinsic score.
  - 0.7 — argument is peripheral to the motion's core tension
  - 1.0 — argument is relevant to the debate
  - 1.2 — argument speaks directly to the heart of the debate's core clash

  **Criterion 4 measures topical centrality only — how directly the argument sits on the motion's core contested ground — never the strength or magnitude of whatever it argues against.** A rebuttal that engages the heart of a live clash point earns the 1.2 multiplier regardless of how strong the opposing argument turns out to be. If that opposing argument is weaker in the real world than its own framing suggests, that has to show up in the rebuttal's own Impact score (Criterion 3 — see the Rebuttal Magnitude Check) instead, not in a discounted Clash multiplier. Centrality and magnitude are different questions; conflating them either lets a low-magnitude rebuttal borrow undeserved weight from its topicality, or wrongly discounts a genuinely central clash point over an unrelated concern about its target's strength.

- **Criterion 5 (Argument Selection)**: Applied as a binary flag.
  - Pass — argument is appropriate for the given bench position
  - Fail — argument is derivative or belongs to a different bench; deprioritized or filtered out regardless of intrinsic score

**Final Score Formula:**

```
Final Score = (Weighted Intrinsic Score) x (Clash Multiplier)
              filtered by Bench Position Flag
```

---

#### Weighting Variants for Experimentation

The weights for criteria 1-3 are not fixed. Three variants are defined for experimentation. The same set of arguments will be scored under all three variants and ranked. The variant whose ranking best matches expert debater judgment will be adopted.

**Variant A: Mechanism-Dominant**

*Philosophy: The quality of reasoning is what separates arguments. A powerful impact built on weak logic doesn't hold. Rewards depth of analysis above all.*

| Criterion | Weight |
|---|---|
| Claim Clarity | 15% |
| Reasoning / Mechanism | 50% |
| Impact & Weighing | 35% |

**Variant B: Impact-Dominant**

*Philosophy: Winning the weighing game is what wins ballots in competitive BP. A solid mechanism with a weak impact loses to a slightly weaker mechanism with a compelling impact.*

| Criterion | Weight |
|---|---|
| Claim Clarity | 15% |
| Reasoning / Mechanism | 35% |
| Impact & Weighing | 50% |

**Variant C: Balanced**

*Philosophy: Mechanism and impact are co-equal — neither compensates for the other. Claim gets slightly more weight than a pure prerequisite since poor framing creates downstream problems for the whole argument.*

| Criterion | Weight |
|---|---|
| Claim Clarity | 20% |
| Reasoning / Mechanism | 40% |
| Impact & Weighing | 40% |

---
