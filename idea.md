# Rhetor: BP Debate Argument Generation — Design Document

## Overview

This document captures the design decisions for how Rhetor generates, formats, and evaluates British Parliamentary debate arguments. It will grow to cover argument ideation, format, evaluation criteria, and ranking.

---

## Architecture: The Three Stages of Rhetor

Rhetor's argument generation pipeline consists of three sequential stages, each operating on the output of the one before it.

**Stage 1 — Argument Ideation** is the foundational stage. Generate as many argument *seeds*. No filtering or in-depth development. Output pool of arguments, each with a claim, rough mechanism, and impact. Prioritize numbers over quality.

**Stage 2 — Argument Development + Intrinsic Quality Scoring** Develop every Stage 1 seed into a fully-specified argument first: step-by-step mechanism, dimensioned impact, grounded principled claims. Only then apply intrinsic quality criteria (Claim Clarity, Mechanism, Impact) to the developed pool — filtering out what development reveals to be weak.

**Stage 3 — Holistic Contextual Ranking** is the end stage. Rank stage 2 arguments on their fit in the round: motion clash, comparativity, derivativity (relative to what other teams can run, and team's bench position.)

Each stage has its own section below.

---

## Evaluation Standard: The Ordinary Intelligent Voter (OIV)

Arguments are evaluated from the perspective of a smart, broadly informed non-specialist. Arguments that need jargon, implausible premises, or special knowledge without explanation fail.

**Language accessibility is part of the OIV standard, not separate from it.** The frame and criterion names used throughout this document ("Epistemic Autonomy," "Distributive Justice," "Precautionary Premise," etc.) are internal labels for the AI's own reasoning — they organize ideation and scoring. They must never appear as-is in an argument's actual Claim, Mechanism, or Impact text. Every generated argument must be expressed in language an OIV would use unprompted: "epistemic autonomy" becomes "the right to decide for yourself with the full picture"; "distributive justice" becomes "who ends up paying the price and who doesn't."

**Plain language is a description, not a shorter label.** The most common failure mode is a synonym swap: replacing the jargon noun phrase with a shorter or more familiar-sounding noun phrase — "epistemic autonomy" → "thought autonomy," "distributive justice" → "equitable allocation." The vocabulary got easier; the shape didn't change. It's still a compressed label standing in for a concept, not a sentence that states the concept — still something nobody would actually say out loud mid-argument, just with quieter syllables. That is not a translation, and the framework must not accept it as satisfying this rule.

The test: could an ordinary person say this phrase, unprompted, while explaining why they hold this position — as an ordinary clause naming concrete stakes or actors, not as a term of art? "The right to decide for yourself with the full picture" and "who ends up paying the price and who doesn't" pass. "Thought autonomy" and "equitable allocation" do not — put them back in a sentence and they still read like frame names, just quieter ones. If a first-pass plain-language rewrite is still short enough to fit in the slot the frame name came from, it hasn't been translated yet — keep rewriting until it becomes a clause that names who does what to whom, not a compressed label for a concept.

If the plain-language version of a frame sounds weaker than its jargon name, that is a signal the underlying mechanism needs more work — not a reason to keep the jargon. Rhetorical strength comes from a clear mechanism and a concrete impact, never from vocabulary.

Source: WUDC Debating & Judging Manual (2022, 2025)

---

## Argument Format

*Applies from the moment a Stage 1 seed exists through Stage 3 ranking. This is a discipline for the AI, not a delivery convention — it is what makes Stage 2 scoring possible at all. An argument scored from a single undifferentiated paragraph is being guessed at, not scored: the scorer cannot tell which sentence to weigh against which criterion.*

Every argument must be recorded in labeled parts:

**Label**: A short name (2-5 words), used only for reference in scoring tables and shortlists. **The label must be a compressed paraphrase of the Claim, never of the Mechanism's supporting Evidence.** If the label names a historical example, a study, or any other piece of supporting detail rather than the underlying causal claim, it is mislabeled — rewrite it from the Claim, not from whatever is most vivid in the Mechanism. (Failure case to avoid: an argument whose real claim is "speed shortens the window to catch rare harms" mislabeled "Historical Precedent" because it cites past cases as evidence — the label described the evidence, not the argument.)

**The label must name the argument's load-bearing element, not merely its opening premise.** An argument frequently states an abstract premise or normative frame before arriving at the comparative or consequential insight that actually carries its persuasive weight — and it is easy to label the argument from the premise, since that's what gets stated first, rather than from whatever makes the argument actually hard to rebut. Test each component (premise, mechanism step, comparative claim, impact) by asking: *if this were removed or shown false, does the argument still work?* Whichever component the answer is "no" for is load-bearing, and that is what the Label — and, if the current Claim doesn't already center it, the Claim itself — must name. (Failure case to avoid: an argument framed around an autonomy premise — "you don't need institutional permission to know your own mind" — that actually wins because the realistic alternative to self-diagnosis for the population in question is not professional care but total silence, since professional care is priced or gatekept out of reach. Labeling this "Self-Knowledge Needs No Permission" names the premise it leans on; the argument only becomes hard to rebut once labeled for the comparative claim — something closer to "The Real Alternative Is Silence" — because removing the autonomy premise barely weakens the argument, while removing the comparative claim collapses it entirely.) Re-deriving a Label this way sometimes reveals that two arguments built from different premises are actually the same argument once correctly centered — when that happens, collapse the duplicate rather than keeping both labels alive; see the Stage 2 Label-accuracy audit.

**Claim**: One sentence. The specific position being taken, tied to the motion. No hedging, no compound claims.

**Mechanism**: An explicit causal chain, written as discrete steps (Step 1 → Step 2 → Step 3...), not a description of the topic. Each step must be independently plausible to the OIV. A mechanism that cannot yet be broken into steps has not been developed — it is still a seed.

**Evidence** (developed-level only): Any real-world fact, precedent, or example used to support the Mechanism's plausibility, recorded as its own field — never folded silently into a Mechanism step. Kept separate specifically so a vivid piece of evidence cannot get promoted into the argument's Label or mistaken for the Claim itself. Each Evidence item carries a confidence flag: state plainly whether it is well-established, plausible-but-unverified, or a structural inference, rather than presenting all supporting facts with uniform certainty.

**Impact**: Names the affected group(s) and states magnitude using at least one of the five dimensions from Stage 2 Criterion 3 (breadth, depth, probability, timeframe, significance) as an explicit, operative claim — not as background color. Must include a comparative statement: why this outcome outweighs competing considerations in the round.

**Field formatting (jot notes):** From Stage 2 onward, Mechanism, Evidence, Second-Order Effect, and Impact are written as jot notes, not prose paragraphs — Claim stays the one sentence its own rule requires.
- *Mechanism* is a bulleted list, one causal step per bullet, in order. The bullet order **is** the chain — no "Step 1 → Step 2" connective prose once the list itself carries the sequence.
- *Evidence* is one bullet per fact, each ending with its confidence tag in italics (e.g. `*Confidence: well-established.*`, `*Confidence: plausible-but-unverified, [reason].*`, `*Confidence: plausible-but-debated, [reason].*`).
- *Second-Order Effect* is a single bullet if one was identified. If none was identified, the field is the bare word **None** — not "none identified," not a sentence explaining the absence. Terse and explicit are the same thing here; they are not in tension.
- *Impact* is written as short dimension fragments (`Breadth: ...` `Depth: ...` `Probability: ...` `Timeframe: ...` `Reversibility: ...`), only the dimensions actually load-bearing for that argument — omit ones that don't apply rather than padding all five. Close with one `Comparative:` fragment.
- *Test*: a field is a real jot note if it can be scanned in under five seconds and each bullet reads as one claim. A bullet that needs a second read to find where one idea ends and the next begins is prose wearing a bullet character, not a jot note.

**Detail required by stage:**
- *Seed-level (Stage 1)*: a rough Mechanism (may be one line) and a named Impact area are sufficient — full step chains, Evidence, and dimensioned Impact are not required yet.
- *Developed-level (Stage 2 onward)*: the full format above is mandatory, including Second-Order Effect and Evidence where applicable (see Development Round). No field may be silently omitted — if a field genuinely doesn't apply, it must say so explicitly (per the jot-note rule above, this means the bare word "None") rather than being left out, since an omission is indistinguishable from an unfinished argument.

**Language rule**: Label, Claim, Mechanism, and Impact must independently satisfy the OIV standard — see the language-accessibility note above. Internal frame or taxonomy names never appear inside these fields.

---

## STAGE 1: Argument Ideation

*GOAL: Make maximum amount of functional argument seeds. "functional argument seed": clear claim, a plausible rough mechanism, and a rough impact area. Does not need to be polished or fully developed.*

*For argument seed to enter the candidate pool, must: be relevant to the motion, have at least sketched mechanism, identified impact area. Beyond this threshold, all candidates proceed — selecting the BEST arguments is Stage 2's job, not this stage's.*

*That threshold governs the AI's **thinking**, not its **output**. A seed must have a plausible mechanism and impact behind it so that ideation cannot produce slogans with nothing underneath — not so that they get written out for the user. Which seeds are worth developing, and what their mechanisms actually are, is decided by the human and the AI together in Stage 2. Stage 1 hands the human a wide menu, not a set of finished dishes.*

---

### Stage 1 Output Format

The Stage 1 document is jot notes. Every seed is **one line**.

```
1. *Harm premise / status-quo-flaws*: Freezing preserves today's specific AI flaws (hallucination, jailbreak vulnerability, unsafe child-directed chatbot design) permanently, since fixing them is itself an "advancement" the motion forecloses `Pragmatic`
2. *Distributive justice / power concentration*: Freezing locks in today's concentration of AI capability among current leaders (a few firms/states) permanently `Principled/Pragmatic`
```

A seed line carries four fields, separated by formatting rather than punctuation — the seed sentence uses commas, semicolons and dashes freely, so no character is safe as a delimiter:

- **Number** — a running number, continuous across all four rounds; every later stage refers to seeds by it. Written as a Markdown ordered list whose first item is the next number, not a restart at 1.
- **Frame / Domain** — italic, ending at the colon. What produced the seed. Round 1: the normative frame. Round 2: the domain and the affected group (`Health — rural/low-income/uninsured populations`). Round 3: the crossed pair, named by number (`Power concentration (3) × Development rights (4)`). **The impact area lives here**, which is why the seed sentence does not have to name it.
- **Seed** — one sentence, roughly 15-40 words, no closing full stop.
- **Type** — a Markdown code span, last thing on the line: `Pragmatic`, `Principled`, or `Principled/Pragmatic`. Qualify where warranted: `Pragmatic (low-confidence)`. One backtick either side, never two.

Flag obvious seeds with `(STANDARD)` inside the sentence. A Round 3 cross that was attempted but produced nothing workable still gets its line — prefix the sentence with *Attempted*: and give it no type. A failed cross is information for Stage 2, not waste.

**On the mechanism.** A seed may carry a clause that shows why the claim would be true — "…, since fixing them is itself an advancement the motion forecloses" — but this is a *permission, not a requirement*. Many good seeds carry none at all: "Freezing locks in today's balance between attack and defense capability" is a complete seed. Add the clause only where the claim does not land without it. Never as a second sentence.

**`Claim:`, `Mechanism:` and `Impact Area:` must never appear in Stage 1.** They belong to the developed-level Argument Format, from Stage 2 onward. A seed written in labeled fields has been developed rather than generated, and the pool it sits in will be a fraction of the size it should be — the fields create room, the room gets filled, and twenty-five seeds become eight essays.

**Pass/fail test, applied to every line before moving on:** does it fit on one line at a comfortable reading width? Does it contain exactly one sentence, no colon-labeled field, and no second full stop? If not, it has been developed — cut it back and spend the effort on another seed instead. If a round takes more than about a minute to scan, the seeds are too long, not too many.

**Document structure:**

1. `## Motion Classification` — bullets: structural type and the burden it sets, fiat scope, primary and secondary topic domains. Where the ideation approach for that motion type calls for groundwork before seeds (e.g. THP's comparison dimensions), it goes here as a short italic note.
2. A line stating the count — *"20 seeds generated across four rounds."*
3. One `### Round N — [name]` heading per round, each followed by its seed lines.
4. `### Round 4 — Coverage Check` — bullets rather than seed lines: zero-candidate domains, forced attempts, frames not used and why, seeds flagged STANDARD, and duplicates or overlaps noted for the Stage 2 audit but deliberately left unresolved here. Any seed forced in at this stage follows as an ordinary seed line.
5. A closing line: `**N seeds cleared the Stage 1 entry threshold.**`

---

### Motion Classification

Before argument seeds, classify the motion. This determines which ideation approaches and first-premises sets are activated.

**Axis 1: Structural Motion Type** — determines the burden of proof and the appropriate ideation approach (see next section).

**Axis 2: Topic Domain** — activates the relevant first-premises set (see Topic Domain → First Premises Map below). Most motions touch multiple domains; classify by the primary domain and note secondary ones.

---

### Structural Motion Types and Ideation Approaches

The structural type of a motion determines what must fundamentally be proven — and therefore shapes which kinds of argument seeds are worth generating. Each type has a distinct ideation approach.

---

**THW — Policy Motions** (*"This House Would [implement policy X]"*)

*Burden*: Show that the world under this policy is better than the world without it.

*Ideation approach*:
1. Define the policy mechanically first: what does it actually do? Who implements it, enforces it, and is directly subject to it?
2. Identify the status quo failure: what problem currently exists that this policy addresses? Pro-policy argument seeds grow from here.
3. Identify who bears the costs and who captures the benefits — both directly and among those affected by those direct effects (second-order chain development happens at Stage 2).
4. Ask what new problems the policy's mechanism creates that do not exist in the status quo. Anti-policy argument seeds grow from here.
5. Consider implementation realities: what happens when the policy is enforced imperfectly, selectively, or against resistant actors?

As a default for THW motions, generate roughly 70% pragmatic/consequentialist seeds and 30% principled seeds. Pragmatic arguments dominate because the core question is about outcomes.

---

**THBT / THS / THO — Analysis/Belief Motions** (*"This House Believes That [claim]"*)

*Burden*: Show that the claim is true and that accepting it is good — or that it is false or harmful.

*Ideation approach*:
1. First determine whether the motion makes primarily an *empirical* claim (is this true about the world?), a *normative* claim (is this the right way to value things?), or both.
2. For empirical claims: what causal mechanisms make this true? Under what conditions and for which populations? What are the strongest counter-examples?
3. For normative claims: what values or frameworks endorse this claim? What competing values reject it?
4. Ask: what does it mean in practice if this belief is widely held and acted on? What institutions, policies, or behaviors follow from it?

THBT motions are where values debates and principled argument seeds are most appropriate — a roughly equal weighting of pragmatic and principled is typical.

---

**THP — Prefer Motions** (*"This House Prefers [world A] over [world B / the status quo]"*)

*Burden*: Show that world A is comparatively better than world B on the most important dimensions.

*Ideation approach*:
1. Describe both worlds concretely before generating arguments. What does each world actually look like? Who lives in it, what do they do, and what do they have access to?
2. Identify the comparison dimensions: what criteria matter most for judging which world is better? These dimensions are the central battleground of THP debates.
3. For each dimension, ask: which world wins, by how much, and for whom?
4. THP motions require explicitly comparative argument seeds. A seed that only describes world A without comparing it to world B is incomplete at this stage.
5. Pay particular attention to distributional effects: who fares better/worse in each world? Strong THP arguments often hinge on whose interests are prioritized.

Roughly equal weighting of pragmatic and principled seeds is typical for THP motions.

---

**TH as [Actor] — Actor Motions** (*"This House, as [specific actor], would [take action]"*)

*Burden*: Show that the action is what the actor should rationally and/or normatively do, given their goals, values, capabilities, and relationships.

*Ideation approach*:

**The mandatory first step for actor motions is building a detailed actor profile before generating any arguments.** Arguments generated without this profile will be generic rather than actor-specific and will fail to engage the motion. The actor profile has four components:

1. **Goals**: What does this actor primarily want? (Security, power, economic gain, legitimacy, ideological objectives, survival, regional influence, etc.) Rank these by priority.
2. **Values and identity**: What constraints does the actor operate under regardless of cost or benefit? What image must they maintain with their key audiences? What commitments have they made that they cannot easily walk back? What would they never do even if it were effective?
3. **Capabilities and resources**: What can the actor actually do? What tools, leverage, and reach do they have? What is beyond their means?
4. **Relationships and dependencies**: Who are their allies, rivals, patrons, and dependents? Whose cooperation do they need to function? Who can impose costs on them for this action?

Once the profile is complete, argument seeds are generated by asking: *"Given this profile, does this action advance the actor's goals, align with their values, use their capabilities effectively, and navigate their relationships well — or does it undermine one or more of these?"*

The central argument axis in actor motions is almost always the tension between the actor's **self-interest** (what serves their goals) and their **obligations** (what they owe to others or are committed to). Both kinds of seeds should be generated.

---

**THR — Regrets Motions** (*"This House Regrets [past event or development X]"*)

*Burden*: Show that the outcome of X was harmful AND that a concretely better counterfactual world existed.

*Ideation approach*:
1. **Characterize the harm of what actually happened**: What went wrong? Who was hurt, how severely, and with what lasting consequences? What was permanently foreclosed or damaged?
2. **Build the counterfactual**: This is where the majority of ideation effort belongs for THR motions. Ask: if X had not happened, what *would* plausibly have happened instead? Pick *one* counterfactual — do not hedge between alternatives. It must be realistic (a world that could have actually occurred, not a utopia).
3. Generate argument seeds from both directions: what the harm of X was (the regret case) and why the counterfactual is concretely better (the comparative case). Both are required.
4. THR motions heavily favor pragmatic argument seeds. Principled seeds appear mainly when the regret concerns a normative commitment that was made or abandoned.

---

### Fiat by Motion Type

**Fiat is the scope of what a team is actually allowed to assume happens as a result of the motion — and it is bounded far more tightly than it feels during ideation.** A Mechanism or Impact chain that quietly relies on the debate's own outcome changing real-world behavior beyond what the motion grants is not a real argument — it is a wish, and it must be caught before scoring, not after. Fiat by structural type:

- **THW (Policy)**: Fiat covers the stated policy being implemented — its direct and reasonably foreseeable indirect mechanical effects. It does not cover unrelated third parties voluntarily changing their future behavior beyond what the policy's mechanism itself causes.
- **THBT / THS / THO (Analysis/Belief)**: **No fiat at all.** Nothing is implemented or enacted by winning the debate — the motion asks whether a claim is true or a decision was right, not what should be done about it. Mechanism and Impact must be grounded in what is already true (harm already caused, what the claim's truth or falsity already entails) — never in a hypothetical future correction, reform, or behavior change that winning the debate is imagined to cause. **This is the most common fiat error**: reaching for "and so this won't happen again" when the motion grants no mechanism by which the debate's outcome causes that.
- **THP (Prefer)**: No fiat over the transition between worlds — the comparison is between two described states as they are, not a claim about how one becomes the other or what happens after the round.
- **TH as [Actor] (Actor motions)**: Fiat covers the actor taking the stated action, grounded in the actor's real profiled capabilities and relationships. It does not extend to guaranteeing how third parties respond beyond what's plausible given those actual relationships, and it does not extend past the single action the motion states.
- **THR (Regrets)**: No forward fiat — purely retrospective. Impact must be grounded in the harm of what happened and the comparative goodness of the counterfactual, never in a claim about correcting future decisions.

**Fiat check (apply during Development Round, before scoring)**: for every Mechanism and Impact, ask whether any step depends on the debate's outcome itself causing a real-world actor to behave differently in the future. If the motion is THBT/THS/THO or THR, that step is illegitimate by default — remove it, or reframe the Impact around what is already true (why the decision is wrong or worse than it looks) rather than what would supposedly be prevented by winning.

---

### The Four Ideation Rounds

For any motion, ideation proceeds in four sequential rounds. All four rounds complete before any argument from any round is scored or ranked. The goal is to populate a broad candidate pool; overlap between rounds is expected and acceptable.

---

**Round 1 — First Premises Sweep**

Enumerate the normative frames the motion activates. For each activated frame, generate at least one argument seed: a claim that follows from that frame applied to this specific motion. Frames that the motion clearly does not touch can be skipped, but err on the side of inclusion — a frame that seems distant may still produce a non-obvious seed.

*(See Topic Domain → First Premises Map for the organized list of frames.)*

---

**Round 2 — Domain + Actor Sweep**

Enumerate the affected domains (economic, social, political, psychological, legal, environmental, security, international, cultural) and the primary stakeholder groups for this motion. For each domain-actor combination that produces a meaningful effect, generate an argument seed: a claim about what happens to whom in that domain as a result of the motion.

Domain scanning works from **impact area → argument**: identify what is affected, then ask what follows from that for the argument. This is the opposite direction from Round 1, which works from **normative frame → argument**. Both directions are needed and neither replaces the other.

---

**Round 3 — Cross-Round Synthesis**

Cross the outputs of Rounds 1 and 2: for each normative frame identified in Round 1 and each impact area identified in Round 2, ask "what happens in this domain, and what normative frame makes that matter?" A domain-actor result from Round 2 gains a normative backbone from Round 1; a normative frame from Round 1 gains concrete domain-grounding from Round 2.

Cross-domain pairing is the primary mechanism for generating non-obvious arguments. An economic motion examined through a dignity frame, or an international relations motion examined through an environmental frame, produces argument seeds that are less predictable and harder to rebut than same-domain single-frame arguments.

When generating synthesis candidates, explicitly ask: "What argument has not yet been generated that this combination makes possible?" — rather than staying within what the round-1 and round-2 outputs most obviously suggest.

---

**Round 4 — Coverage Check**

Before closing ideation, audit the candidate pool:
- Which domains have produced zero candidates? Force at least one attempt into each uncovered domain.
- Which normative frames have not been used? Attempt them even if the connection is non-obvious.
- Has the motion been approached from both sides (and from all four bench positions where possible)?
- Are any candidates identical or near-identical? Collapse duplicates.
- Which candidates are "obvious" — the arguments any debater would generate in the first 30 seconds? Label these "standard." Their presence is valid and they should be included, but they should not crowd out less obvious candidates generated later in the process.

---

### Topic Domain → First Premises Map

**Important**: This map is a starting guide, not a complete or mandatory taxonomy. The AI must treat it as a checklist of *available* frames to consider for a given motion — not a forced structure to apply in full. Many motions will activate only a subset of these frames, and some motions will require frames not listed here. Always prioritize what the specific motion actually requires over what the map suggests. The map exists to expand what gets considered, not to constrain it.

---

**Criminal Justice / Law Enforcement**
- *Retributive justice*: punishment is deserved as a matter of moral desert, independent of its effects
- *Rehabilitative justice*: the purpose of punishment is reducing future harm, not expressing desert
- *Deterrence*: severity and certainty of punishment changes behavior at the margin
- *Social contract and its breach*: crime violates the cooperative arrangement among citizens; state punishment is the legitimate response
- *Rights of the accused*: due process, proportionality, and presumption of innocence as side-constraints on what the state may do regardless of outcome
- *Structural causation*: crime is produced by social conditions; punishing individuals without addressing conditions is both unjust and ineffective

Pragmatic argument seeds dominate. Principled seeds (rights of the accused, desert-based retribution) appear mainly on motions about enforcement *methods*, not sentencing magnitude.

---

**Economic Policy**
- *Efficiency vs. equity*: markets maximize aggregate welfare but not distributional welfare; intervention trades one for the other
- *Market failure*: externalities, information asymmetry, public goods, and monopoly power as legitimate justifications for intervention
- *Economic freedom*: individuals and firms have the right to transact without coercion; intervention imposes real costs on that right
- *Distributive justice*: who captures the gains and who bears the costs matters morally, not just the aggregate sum
- *Systemic risk*: individually rational decisions can produce collectively irrational outcomes; coordination requires external enforcement
- *Innovation and dynamism*: regulation that reduces risk also reduces the variance that produces progress

Heavily pragmatic. Principled seeds (property rights, exploitation, consent to exchange) appear mainly in labour and ownership motions.

---

**International Relations**
- *State sovereignty and non-intervention*: the foundational premise of international order; violation requires extraordinary justification
- *Humanitarian intervention*: extreme human rights violations override sovereignty when the state fails its protective function
- *National interest / realism*: states act from self-interest; arguments about what they "should" do must be grounded in what serves their actual goals
- *Self-determination*: peoples have the right to decide their own political status
- *International law legitimacy*: whether international norms are binding based on consent or on cosmopolitan human rights grounds
- *Balance of power / deterrence*: stability through mutual threat and credible commitment

Mixed pragmatic and principled. Actor motions in IR almost always require principled reasoning about what the actor's own values imply; IR policy motions are more pragmatic.

---

**Social Policy**
- *Paternalism vs. autonomy*: the state's right to override individual choices "for their own good" vs. the individual's right to choose
- *Harm premise* (Mill): restricting liberty is only legitimate to prevent harm to others, not to prevent self-harm
- *Social solidarity*: some risks and costs should be pooled across society rather than borne by individuals alone
- *Equality of opportunity vs. outcome*: whether the goal is equalizing starting positions or equalizing results
- *Expressive harm*: state policies signal whose interests and lives matter; the signal itself causes harm even absent direct material effect
- *Individual responsibility vs. structural causation*: who is morally responsible for bad outcomes in someone's life

High mix of pragmatic and principled. The motion framing itself usually poses a normative question, so principled seeds are expected and should be generated.

---

**Gender, Identity, and Representation**
- *Structural oppression*: unequal outcomes reflect systemic constraints, not individual failures or choices
- *Liberal autonomy*: individuals — including members of disadvantaged groups — have the right to make their own choices, including choices others consider harmful to their group
- *Symbolic representation*: who holds power shapes social norms and self-perception; representation matters beyond its direct material effects
- *Intersectionality*: disadvantage compounds across race, gender, and class; single-axis analysis misses those most affected
- *Stereotype threat and epistemic harm*: who is represented in positions of power or visibility shapes what affected groups believe is possible for themselves

Heavily principled. Requires concrete grounding per the Principled Argument Blueprint below — principled seeds in this domain are most vulnerable to the "so what?" dismissal.

---

**Environment and Climate**
- *Intergenerational justice*: future generations have interests the present generation has obligations to protect
- *Commons tragedy*: individually rational behavior produces collectively irrational environmental outcomes; coordination must be externally imposed
- *Economic externalities*: costs currently borne by the commons should be internalized by those who create them
- *Precautionary premise*: under irreversible catastrophic risk, the burden of proof shifts against the risky action
- *Development rights*: countries that have not yet industrialized have the right to the same developmental path wealthy nations took

Primarily pragmatic. Principled seeds appear mainly in intergenerational justice and development rights framings.

---

**Political Systems and Democratic Governance**
- *Democratic legitimacy*: decisions affecting people should be made through processes those people control
- *Rule of law*: no actor is above the law; predictability and accountability are the basis of legitimate order
- *Separation of powers*: checks against concentration of authority prevent abuse regardless of who holds power
- *Technocratic vs. democratic trade-off*: expertise produces better outcomes but removes accountability; democracy preserves legitimacy but may produce worse decisions
- *Epistemic democracy*: deliberation among diverse participants produces better decisions than expert judgment alone

Mixed. Legitimacy arguments are principled; governance-outcome arguments are pragmatic.

---

**Science, Technology, and Information**
- *Epistemic autonomy*: individuals have the right to form their own beliefs without manipulation or information control
- *Truth and public knowledge as public goods*: accurate shared information enables coordination and prevents exploitation
- *Innovation freedom*: restricting research or technology imposes real costs on future knowledge and capability
- *Chilling effects*: restrictions on expression or inquiry suppress behavior well beyond the directly regulated
- *Power asymmetry*: technology concentrates capabilities in ways that distort existing power relations

Mixed. Epistemic autonomy and privacy seeds are principled; innovation and power asymmetry seeds are pragmatic.

---

**Culture, Media, and Aesthetics**
- *Intrinsic aesthetic value*: artistic and cultural goods have value independent of their social effects
- *Cultural preservation vs. assimilation*: minority cultures have value worth protecting against majoritarian pressure
- *Authenticity*: genuine expression vs. performance shaped by audience expectations
- *Artistic freedom*: creative production should not be constrained by its social or political implications

Primarily a values debate. Pragmatic seeds are secondary unless framed through economic effects (cultural industries) or psychological effects (representation and identity formation).

---

**Labour and Work**
- *Dignity of labour*: work has value beyond its economic product; exploitation denies that value
- *Worker autonomy and collective action*: workers have the right to organize and bargain collectively; individual contracts between unequal parties are not genuinely voluntary
- *Market-clearing wages vs. fairness*: whether wages are just because they result from voluntary exchange, or whether fairness requires a floor independent of market outcomes
- *Meaning of work*: work structures identity, routine, and community; its elimination or radical transformation has effects beyond income loss

Mixed. Labour motions sit at the intersection of economic pragmatics (efficiency, employment, wages) and principled dignity and exploitation arguments.

---

### Principled Argument Blueprint

A principled argument is one whose core claim rests on a normative value rather than a consequentialist outcome — for example, that something violates autonomy, dignity, or fairness *as such*, not merely that it produces bad downstream effects. These arguments are powerful when they land, but they have a structural vulnerability: a judge can dismiss them as abstract ("so what if it violates a value?").

The solution is to always attach a concrete "so what?" that flows *necessarily* from the normative violation. Every principled argument must carry both a principled claim and a grounded impact. In Stage 1, if the grounded impact cannot yet be specified, the seed should be passed to Stage 2 for the Principled Argument Grounding step. It should not be discarded.

The blueprint below gives a reminder for each major principled argument type of what the concrete grounding must establish. The reminders are not examples — they describe the *required structure* of the impact, and the AI must instantiate that structure specifically for the motion at hand.

**Verification test, applied to every filled-in Reminder before it proceeds to Stage 2 scoring:** could each named element — the foreclosed choice, the affected group, the concrete fallback, the systemic norm, or whichever the specific blueprint calls for — be copy-pasted into a different motion's argument of the same type without editing a word? If yes, it is still a placeholder wearing the shape of the required element, not an actual instantiation of it. A genuine fallback names a specific worse option a specific group faces on this specific motion ("unregulated compounded medication," "years of unrecognized symptoms") — not "a worse outcome." A genuine systemic norm names what this specific case licenses for future actors on this specific motion, not "a bad precedent" in the abstract. This is the same failure mode the language-accessibility rule catches for jargon: a term that could apply to any argument of its type hasn't actually been done yet, no matter how correctly formatted it looks.

---

**AUTONOMY / SELF-DETERMINATION**

Reminder: Name the specific choice that is foreclosed or coerced. Identify which group loses that choice and why they are particularly affected. Show the concrete fallback they now face — what worse option do they have to use instead, and what does that cost them? Then name what systemic norm this establishes about who has the right to decide for whom, and which adjacent choices that norm eventually forecloses.

---

**DIGNITY / NON-INSTRUMENTALIZATION**

Reminder: Name the specific act of instrumentalization — what is the person being used for, and by whom? Describe the experiential harm (shame, stigma, social exclusion, or psychological damage). Name the expressive harm — what does the policy or action signal, at an institutional level, about whose humanity can be traded away for what benefit? Show how that signal reproduces or legitimizes a social hierarchy.

---

**RIGHTS VIOLATION**

Reminder: Name what the right specifically licenses people to do — the right is not its label, it is what it permits. Show who loses that protection most, since enforcement is always unequal. Add the chilling effect: those who are technically still permitted will also self-restrict out of fear or uncertainty, extending the harm beyond the directly regulated. Name the adjacent restriction that the same justificatory standard would equally support — this is the precedent cost.

---

**FAIRNESS / EQUAL TREATMENT**

Reminder: Name who is treated differently and on what characteristic. Show the material consequence of that differential treatment. Explain the compounding mechanism — how does the gap grow over time? Add the legitimacy harm: unequal treatment by institutions signals that formal equality is hollow, eroding the compliance and trust on which the institution depends to function at all.

---

**DEMOCRATIC LEGITIMACY / SELF-GOVERNANCE**

Reminder: Name who captures the decision instead of the democratic process, and what their structural incentives are. Show what they systematically prioritize differently from what a democratic majority would choose. Name the concrete policy consequence of that capture. Add the precedent erosion: accepting this mechanism as legitimate establishes that adjacent decisions can equally be removed from democratic control by the same logic.

---

**SOCIAL NORMS / PRECEDENT / "SETS A NORM"**

Reminder: Name the specific norm or precedent being established — not generically "a bad precedent" but precisely what principle has now been accepted as legitimate. Show the spread mechanism: through what institutional, legal, or social channel does this norm extend to adjacent cases? Name the structural feature that prevents case-distinguishing — why the next case cannot be separated from this one. This argument must show probability of harm, not mere possibility.

---

**EPISTEMIC AUTONOMY / TRUTH**

Reminder: Name whose beliefs are being distorted, and in what specific direction. Name the decisions those distorted beliefs will produce. Name the concrete harm that follows from those decisions. The chain must be specific throughout: distorted belief → specific decision → specific harm. Generic "people will be misinformed" does not qualify as an impact.

---

### Cognitive Science Applications for Ideation

The following design constraints on the ideation process are derived from research on creative idea generation. They govern *how* the AI structures its ideation rounds, not *what* it generates.

**Generate a minimum quota before evaluating anything.** Evaluating ideas during generation significantly reduces the quantity and creativity of what is produced. The ideation stage must complete all four rounds and assemble a full candidate pool of at least 20-25 seeds per side before any argument is scored or ranked. Early winners must not be selected.

**Track coverage actively and force entry into uncovered areas.** The strongest bias in ideation is staying close to the first ideas generated — fixation on early outputs. The Round 4 coverage check operationalizes the correction: explicitly identify which domains and frames have produced zero candidates and force at least one attempt into each before closing.

**Flag obvious arguments as "standard" — do not let them crowd out the pool.** The most available argument for any motion is often valid but rarely the strongest strategically. Labeling these "standard" candidates makes their presence visible without allowing them to substitute for the less obvious candidates that later rounds should generate.

**Cross-domain association is the primary mechanism for non-obvious arguments.** Round 3 synthesis is the structured version of this: applying a normative frame from one domain to an impact area in another produces arguments that are less predictable and less easily rebutted than single-domain single-frame arguments.

**Suppressing the obvious must be an explicit instruction.** When generating Round 3 synthesis candidates, the AI should actively ask "what has not yet been generated that this combination makes possible?" rather than defaulting to what the round-1 and round-2 outputs most obviously suggest.

---

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

## STAGE 3: Holistic Contextual Ranking

*This stage evaluates arguments based on their fit within the specific debate round — how central they are to the core clash of the motion, how comparative and non-derivative they are relative to what other teams will argue, and whether they are the right arguments for the team's bench position. No argument is ranked here in isolation; all assessments are relative to what the round actually looks like. Stage 3 outputs a ranked shortlist of 4 arguments — BP cases will typically deploy only the top 1-2, while longer formats (e.g. WSDC) can draw on more of the ranked list.*

---

### Criterion 1 for Contextual Ranking: Strategic Relevance

**What it is:** An argument's value is partly determined by whether it speaks to the *core tension* of the motion as the debate actually plays out. Arguments that address peripheral issues get weighed less by judges because other teams won't engage with them — and low engagement signals low centrality. This is not about direct rebuttal; it is about whether the argument occupies genuinely contested ground.

Note: There is also a related quality called *flipping* — where an argument is framed in a way that anticipates and preempts the natural opposing response, inverting the opposition's expected line against them. This is a higher-order quality of how an argument is framed, distinct from rebuttal.

**How to evaluate:**
- Does the argument engage with what teams on both sides will naturally spend time on?
- Is it addressing the core of the motion's tension, or a safe peripheral point?
- Would teams on the other side *have* to engage with this to win the debate?

**Red flags:** Arguments teams can safely ignore, arguments that are technically sound but speak to a side issue, arguments framed so broadly they don't force any specific clash.

**Test:** could a competent opposing team draft a complete, persuasive case for their side while never once mentioning this argument? If yes, it's peripheral regardless of how well-constructed the argument itself is — strategic relevance is measured by whether the other side is forced to spend time on it, not by whether the argument is internally sound.

---

### Criterion 2 for Contextual Ranking: Bench Position Fit

**What it is:** This criterion is about whether the *right* argument is being run given the bench position. An argument can be perfectly constructed but wrong to deploy if it is derivative of what another bench already ran. This is a contextual criterion — it cannot be evaluated in isolation, only relative to bench position and what has already been argued.

**Bench-position logic:**
- **Opening Government / Opening Opposition**: Arguments should define and occupy the core terrain of the debate.
- **Closing Government / Closing Opposition**: Arguments must be genuinely new — a new angle, stakeholder, or principle not already covered by the opening bench. Derivative arguments (repackaging opening material) are penalized.

**How to evaluate:**
- Is this argument available to this bench, or does it belong to opening?
- For closing benches: is this a genuine extension, or a repetition?
- Does running this argument serve the team's position in the round?

**Red flags:** Closing bench running opening bench arguments, arguments that repeat the opening team's framing without adding new analysis.

**Test for Closing benches:** subtract the opening bench's material from the round entirely — does this argument's Claim still stand as a complete, distinct contribution, or does it collapse into a restatement of what opening already established? If nothing is left once the opening bench's content is removed, the argument is derivative regardless of how differently it's worded on the surface. This is the same removal test used to find an argument's load-bearing element in Stage 2 (see Argument Format, Label) — applied here to the bench's contribution as a whole rather than a single argument's internal components.

**Mechanism-sharing test (apply alongside the Claim-level removal test above, not as a substitute for it):** the removal test above operates on the Claim/stakeholder layer — does the Claim still stand once the opening bench's material is subtracted. That is necessary but not sufficient: an argument can name a new stakeholder or example while its Mechanism is the opening bench's own causal chain wearing a different noun — the same general capability improves, applied to a different domain, with nothing else added. Run a second, independent pass: with the opening bench's material subtracted, does this argument's *Mechanism* still contain an independently-stated causal or comparative claim proving *why this stakeholder or example's stakes are structurally different in kind* — not just different in name — from the shared material? Or is the only new content a substituted example plugged into an unchanged, borrowed causal chain?

A shared premise does not, by itself, fail this test. Sharing a premise with the opening bench while building genuine new nuance or a new comparative structure on top of it is a legitimate, named category in competitive BP — a *derivative extension* — not a lesser one; the standard it must clear is that the new material is "as well explained, as well impacted, and as relevant" as the opening bench's own. What fails the test is a shared premise with nothing built on top of it. Apply the same removal logic the Argument Format's Label rule uses to find a load-bearing element within a single argument, here applied across the bench boundary: remove the *new* layer (the stakeholder-specific comparative structure) — if the Claim collapses, that layer was load-bearing and the argument is real. Then remove the *shared* premise and substitute any other plausible source of the same general effect — if the Claim is unaffected, that confirms the premise was never what the argument stood on. If instead removing the new layer leaves the Claim intact (because the shared premise alone was doing all the work), the "new" layer was decorative, not load-bearing, and the argument is a relabeled instance of the opening bench's material, not an extension of it — cut it, the same as any other bench-fit failure, regardless of how much Stage 2 development it received.

---

## Sections To Be Added

*(Argument Format is now specified above. No other sections currently pending.)*
