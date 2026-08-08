import type { ChatMessage, Motion, Position } from './types'

const politicalAdsStage2 = `STAGE 2 · ARGUMENT DEVELOPMENT

3 arguments developed for Opening Government, ranked by intrinsic score

---

### ARGUMENT 1 — Precision Targeting Enables Undetectable Manipulation \`8.6 / 10\`

**CLAIM**
Micro-targeted political ads let campaigns show mutually contradictory messages to different voters without any single voter or watchdog seeing the full pattern.

**MECHANISM**
- Platforms let campaigns target ads by ZIP code, browsing history, and inferred political leaning
- Different audience segments receive tailored, sometimes contradictory messaging
- No unified public record exists of what was shown to whom, unlike broadcast or print ads
- Journalists and fact-checkers can only sample a fraction of variants, so contradictions go undetected

**EVIDENCE**
- ProPublica's 2016 ad-catalogue project logged thousands of politically divergent Facebook ad variants from single campaigns. *Confidence: well-established.*
- Cambridge Analytica's psychographic targeting models were built specifically to exploit this opacity. *Confidence: well-established.*

**SECOND-ORDER EFFECT**
- Erodes voters' ability to hold candidates accountable to one consistent platform, since no two voters see the same platform.

**IMPACT**
Breadth: nearly all social-media-using voters. Depth: undermines coherent public accountability. Probability: high, this targeting granularity exists today. Comparative: outweighs Opp's free-expression concerns because the harm lands on the electorate's collective epistemic position, not on any single speaker's rights.

---

### ARGUMENT 2 — The Real Alternative Is Silence, Not Professional Moderation \`7.9 / 10\`

**CLAIM**
Removing targeted political ads doesn't restore neutral information — it just leaves resource-poor campaigns unable to reach voters at all.

**MECHANISM**
- Untargeted ad buys cost far more per persuadable voter reached than targeted ones
- Only well-funded incumbents and national parties can absorb that cost
- Challenger and local campaigns lose their cheapest voter-contact channel first

**EVIDENCE**
- Broadcast-only political advertising markets historically favor incumbents with pre-existing name recognition. *Confidence: plausible-but-unverified, limited direct comparison data.*

**SECOND-ORDER EFFECT**
None

**IMPACT**
Breadth: challenger and down-ballot campaigns specifically. Depth: structurally entrenches incumbency. Comparative: a ban's fairness rationale inverts once the actual distributional effect is traced through.

---

### ARGUMENT 3 — Enforcement Pushes Spend Into Opaquer Channels \`7.2 / 10\`

**CLAIM**
A ban shifts targeting budgets into private group chats and influencer deals that are even harder for regulators or researchers to observe.

**MECHANISM**
- Campaigns retain the same targeting incentive after a formal platform ban
- Spend migrates to WhatsApp groups, Discord servers, and paid influencer placements
- These channels carry no ad-library disclosure requirement at all

**EVIDENCE**
- Encrypted messaging apps have already become a documented vector for political content in jurisdictions with stricter ad rules. *Confidence: plausible-but-unverified, cross-jurisdiction generalization.*

**SECOND-ORDER EFFECT**
- Regulatory visibility drops below its pre-ban baseline, since today's ad libraries are searchable and tomorrow's group chats are not.

**IMPACT**
Breadth: same voter population, opaquer channel. Depth: net loss of oversight capacity. Comparative: undercuts the proposal's own transparency rationale.
`

const ubiStage3 = `STAGE 3 · FINAL SHORTLIST

Holistic contextual ranking for Opening Opposition — top arguments selected for strategic relevance and bench fit

---

### 1. Targeting Precision Breaks the Political-Compromise Rationale \`9.1 / 10\`

**CLAIM**
UBI's simplicity argument only holds if it fully replaces means-tested welfare, but full replacement strips support precisely from claimants whose needs exceed the flat rate.

**MECHANISM**
- Disability, housing, and dependent-care benefits are calibrated to variable need, not a flat average
- A UBI sized for fiscal feasibility sits below what high-need claimants currently receive
- "Replacing" rather than "supplementing" welfare is the only version that delivers the promised simplicity savings

**EVIDENCE**
- Finland's 2017–18 basic income trial preserved most existing conditional benefits rather than replacing them, because full replacement was fiscally unworkable at adequate levels. *Confidence: well-established.*

**SECOND-ORDER EFFECT**
- Forces a second, quieter means-tested layer back into existence to catch high-need claimants — recreating the complexity UBI was meant to remove.

**IMPACT**
Breadth: disabled and high-dependent-care populations specifically. Depth: severe for those below the coverage gap. Comparative: outweighs Gov's simplicity gain because the gain is illusory once the second layer returns.

---

### 2. Labor-Supply Effects Are Empirically Contested, Not Settled \`8.3 / 10\`

**CLAIM**
Gov's framing treats reduced work-hours under UBI as a straightforwardly positive freedom gain, but the aggregate fiscal effect of that reduction is exactly what determines whether the scheme is sustainable.

**MECHANISM**
- A UBI funded through general taxation depends on a stable labor-tax base
- Trial evidence shows modest but real reductions in hours worked among some recipient groups
- Compounded nationally over time, that reduction pressures the same tax base funding the transfer

**EVIDENCE**
- The Ontario Basic Income Pilot and Finland trial both recorded small negative labor-supply effects among specific subgroups. *Confidence: plausible-but-debated, effect sizes are contested across trials.*

**SECOND-ORDER EFFECT**
None

**IMPACT**
Breadth: whole-economy fiscal base. Depth: moderate, compounding. Timeframe: long-run. Comparative: this is the crux the round should turn on, not a peripheral concern.
`

const nationalServiceStage1 = `STAGE 1 · ARGUMENT SEEDS

6 seeds generated for Closing Government — rough mechanism and impact area only, not yet scored

---

**Seed 1 — Civic Cohesion Through Shared Obligation**
Rough mechanism: mandatory service places people from different class and regional backgrounds into the same institution for an extended period, which is one of few remaining forces that reliably builds cross-group contact.
Impact area: social trust / polarization.

**Seed 2 — Skills Transfer for Disadvantaged Youth**
Rough mechanism: structured service years function as a de facto training program for young people who would otherwise have no equivalent access to structured skills development.
Impact area: youth employment outcomes.

**Seed 3 — Opportunity Cost Falls Hardest on the Poor**
Rough mechanism: a mandatory year is a flat cost in absolute time, but its relative cost (foregone wages, delayed education) is far higher for lower-income conscripts than wealthier ones who can absorb the gap.
Impact area: distributive fairness.

**Seed 4 — Compulsion Undermines the Civic Value It's Meant to Build**
Rough mechanism: values like duty and solidarity are normally understood as freely chosen; compelling the act may produce compliance without producing the underlying disposition it's meant to instill.
Impact area: whether the stated mechanism even fires.

**Seed 5 — Institutional Capacity to Absorb Conscripts Is Not Guaranteed**
Rough mechanism: a national service scheme at population scale requires supervisory and placement infrastructure that most states proposing this do not currently have.
Impact area: implementation feasibility.

**Seed 6 — Precedent From Existing National Service Models**
Rough mechanism: countries with existing mandatory service (military or civil) show mixed evidence on whether the cohesion effect claimed in Seed 1 actually materializes.
Impact area: empirical grounding for Seed 1.
`

const adAgeStage2 = `STAGE 2 · ARGUMENT DEVELOPMENT

2 arguments developed for Opening Opposition, ranked by intrinsic score

---

### ARGUMENT 1 — Verification Requires the Surveillance It Claims to Prevent \`8.1 / 10\`

**CLAIM**
Any verification method precise enough to reliably block minors also requires collecting identity data that creates a larger privacy exposure than the harm it prevents.

**MECHANISM**
- Age gates weak enough to preserve anonymity are trivially bypassed by minors
- Age gates strong enough to actually work require government ID or biometric verification
- That verification data becomes a centralized target, held by platforms with uneven security track records

**EVIDENCE**
- Multiple age-verification vendors have suffered data breaches exposing government ID scans submitted for exactly this purpose. *Confidence: well-established.*

**SECOND-ORDER EFFECT**
- Adult users who decline to submit ID lose access entirely, shrinking the platform's function as a general public forum.

**IMPACT**
Breadth: all users, not just minors. Depth: severe for those affected by a breach. Comparative: the traded-away privacy harm is broader and more severe than the targeted harm the policy addresses.

---

### ARGUMENT 2 — Verification Displaces Rather Than Reduces Exposure \`7.4 / 10\`

**CLAIM**
Motivated minors route around verified platforms to unverified ones with weaker moderation, so total exposure to harmful content is not reduced, only relocated.

**MECHANISM**
- Verification friction on major platforms doesn't reduce underlying demand from minors
- Minors migrate to smaller platforms without equivalent moderation or verification infrastructure
- Those platforms have measurably worse content-moderation outcomes

**EVIDENCE**
- Migration patterns following prior platform-level restrictions show measurable shifts to less-moderated alternatives. *Confidence: plausible-but-unverified, direct causal attribution is difficult.*

**SECOND-ORDER EFFECT**
None

**IMPACT**
Breadth: same population, redistributed. Depth: net effect may be negative if destination platforms moderate worse. Comparative: undercuts the proposal's stated protective aim.
`

function msg(id: string, stage: 1 | 2 | 3, role: 'user' | 'assistant', content: string): ChatMessage {
  return { id, stage, role, content }
}

export const sampleMotions: Motion[] = [
  {
    id: 'm-political-ads',
    title: 'Ban Targeted Political Ads',
    motionText: 'This House would ban microtargeted political advertising on social media platforms.',
    position: 'OG',
    provider: 'anthropic',
    currentStage: 2,
    stageDocs: { 1: 'Stage 1 seeds — superseded by Stage 2 development.', 2: politicalAdsStage2, 3: null },
    messages: [
      msg('1', 2, 'user', "Can you sharpen the evidence on the first argument — the Cambridge Analytica case feels a bit generic. Anything more specific we can cite?"),
      msg('2', 2, 'assistant', 'Good catch. I swapped in the ProPublica ad-catalogue study — it gives a concrete count of divergent ad variants rather than a general scandal reference. I also tightened the Second-Order Effect line. Updated Argument 1 is on the right.'),
      msg('3', 2, 'user', "Nice. Let's also give Argument 2's impact a comparative that survives an Opp free-expression rebuttal."),
      msg('4', 2, 'assistant', "Done — reframed the Comparative around collective epistemic harm to the electorate rather than any individual speaker's rights, so it doesn't collide with a free-expression line. Check the document."),
    ],
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'm-ubi',
    title: 'UBI Replacing Welfare',
    motionText: 'This House would replace all means-tested welfare programs with a universal basic income.',
    position: 'OO',
    provider: 'openai',
    currentStage: 3,
    stageDocs: { 1: 'Stage 1 seeds — superseded.', 2: 'Stage 2 development — superseded by Stage 3 shortlist.', 3: ubiStage3 },
    messages: [
      msg('1', 3, 'user', 'These two feel strong. Can you double check the shortlist is only two arguments — is that intentional?'),
      msg('2', 3, 'assistant', "Yes — Stage 2 produced four developed arguments, but the other two overlapped heavily with Argument 1's coverage-gap logic once re-centered, so they were collapsed per the Label-accuracy rule rather than kept as near-duplicates. These two cover distinct ground: distributive fairness and fiscal sustainability."),
    ],
    createdAt: '2026-07-28T14:20:00Z',
  },
  {
    id: 'm-national-service',
    title: 'Mandatory National Service',
    motionText: 'This House would introduce mandatory national service for all citizens aged 18-20.',
    position: 'CG',
    provider: 'anthropic',
    currentStage: 1,
    stageDocs: { 1: nationalServiceStage1, 2: null, 3: null },
    messages: [
      msg('1', 1, 'assistant', "I've drafted six seeds for Closing Government covering cohesion, skills transfer, distributive cost, the compulsion-undermines-value objection, feasibility, and existing precedent. Seeds 4-6 are worth developing carefully since they're the strongest Opp responses you'll need to pre-empt. Want me to prioritize any particular angle before we move to Stage 2?"),
    ],
    createdAt: '2026-08-05T09:15:00Z',
  },
  {
    id: 'm-age-verification',
    title: 'Social Media Age Verification',
    motionText: 'This House would require government-issued ID verification for all social media accounts.',
    position: 'OO',
    provider: 'openai',
    currentStage: 2,
    stageDocs: { 1: 'Stage 1 seeds — superseded by Stage 2 development.', 2: adAgeStage2, 3: null },
    messages: [
      msg('1', 2, 'user', 'The breach evidence in Argument 1 — is that well-established or should it carry a softer confidence tag?'),
      msg('2', 2, 'assistant', "It's well-established — there have been multiple documented breaches at age-verification vendors specifically, so I kept that tag. I gave the migration claim in Argument 2 the softer 'plausible-but-unverified' tag instead, since direct causal attribution there is genuinely harder to pin down."),
    ],
    createdAt: '2026-08-06T16:45:00Z',
  },
]

const openingPrompt =
  "Tell me the motion you're arguing and your position — Opening Government (OG), Opening Opposition (OO), Closing Government (CG), or Closing Opposition (CO). I'll draft the first round of argument seeds from there."

export function newMotionAssistantOpening(): string {
  return openingPrompt
}

function titleFromMotionText(motionText: string): string {
  const words = motionText
    .replace(/^this house (would|believes|supports|opposes)\s*/i, '')
    .split(/\s+/)
    .slice(0, 5)
    .join(' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function createMotionFromFirstMessage(motionText: string, position: Position): { title: string; stage1Doc: string } {
  const title = titleFromMotionText(motionText)
  const stage1Doc = `STAGE 1 · ARGUMENT SEEDS

4 seeds generated for ${positionLabel(position)} — rough mechanism and impact area only, not yet scored

---

**Seed 1 — Core Mechanism**
Rough mechanism: the motion's central causal claim, traced through the most direct first-order effect for ${positionLabel(position)}.
Impact area: the group most immediately affected by the policy change.

**Seed 2 — Structural Comparative**
Rough mechanism: how the proposed state of the world compares to the realistic counterfactual, not an idealized status quo.
Impact area: distributive effects across affected groups.

**Seed 3 — Second-Order Consideration**
Rough mechanism: a downstream effect that only emerges once the first-order mechanism has played out.
Impact area: institutional or behavioral adaptation over time.

**Seed 4 — Strongest Opposing Response**
Rough mechanism: the most likely rebuttal from the other side, developed here so it can be pre-empted or absorbed in Stage 2.
Impact area: round-level strategic risk.

*This is a mocked draft — connect a real API key in Account Settings to generate seeds tailored to your actual motion.*`
  return { title, stage1Doc }
}

function positionLabel(position: Position): string {
  return { OG: 'Opening Government', OO: 'Opening Opposition', CG: 'Closing Government', CO: 'Closing Opposition' }[position]
}

const mockReplyVariants = [
  "Good direction. I've tightened the Mechanism into discrete steps and pulled the Evidence field forward so the causal chain reads clearly under time pressure. Updated document is on the right.",
  "Makes sense — I re-centered the Claim on the load-bearing comparative rather than the opening premise, per the Label-accuracy check. Take a look at the revision.",
  "Adjusted. I kept the Second-Order Effect field honest — flagged it as 'None' rather than padding it, since nothing downstream was actually identified here.",
  "Done. I gave the Impact field an explicit Comparative fragment so it survives the most likely Opp response rather than just asserting magnitude.",
]

export function mockAssistantReply(userMessage: string, stage: 1 | 2 | 3): string {
  const idx = Math.abs(hashCode(userMessage)) % mockReplyVariants.length
  const stagePrefix = stage === 1 ? 'Seed updated.' : stage === 2 ? 'Argument updated.' : 'Shortlist updated.'
  return `${stagePrefix} ${mockReplyVariants[idx]}`
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return h
}

export function advanceStageDoc(fromStage: 1 | 2, motionTitle: string, position: Position): string {
  if (fromStage === 1) {
    return `STAGE 2 · ARGUMENT DEVELOPMENT

Arguments developed for ${positionLabel(position)}, ranked by intrinsic score

---

### ARGUMENT 1 — ${motionTitle}: Core Mechanism Developed \`7.8 / 10\`

**CLAIM**
The seed's central mechanism, restated as a single specific claim tied directly to the motion.

**MECHANISM**
- Step one of the causal chain, independently plausible on its own
- Step two, following directly from step one
- Step three, arriving at the claimed effect

**EVIDENCE**
- A representative real-world example supporting the mechanism's plausibility. *Confidence: plausible-but-unverified.*

**SECOND-ORDER EFFECT**
None

**IMPACT**
Breadth: the population most directly affected. Depth: moderate. Comparative: outweighs the most likely opposing consideration because it addresses the mechanism directly rather than a downstream symptom.

*This is a mocked draft — connect a real API key in Account Settings to generate development tailored to your actual arguments.*`
  }
  return `STAGE 3 · FINAL SHORTLIST

Holistic contextual ranking for ${positionLabel(position)} — top arguments selected for strategic relevance and bench fit

---

### 1. ${motionTitle}: Strongest Developed Argument \`8.2 / 10\`

Carried forward from Stage 2 as the highest-scoring, most round-relevant argument. Full field detail preserved from development.

*This is a mocked draft — connect a real API key in Account Settings to generate a shortlist tailored to your actual arguments.*`
}
