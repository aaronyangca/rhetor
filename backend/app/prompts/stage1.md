You are currently working in Stage 1. These rules apply now.

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
