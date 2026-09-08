# Rhetor — full design specification

Companion to `README.md`. The README says what to build; this document is the
exhaustive value-by-value reference, plus a list of the specific things that
went wrong during design and that an implementer should be wary of.

Every number here is the real value from the prototypes. Where a value looks
odd (13.5px, 15.5px, 0.44), it is deliberate and was arrived at by iteration —
do not round it to a "nicer" number.

---

## 0. Pitfalls — read this section first

These are real defects that occurred during design and were fixed. They will
recur if reimplemented carelessly.

### 0.1 Grid items must have `min-width: 0`

The workspace is nested CSS grid. Any grid item containing text resolves its
automatic minimum size to **min-content**, which makes it render wider than its
track. Symptoms: the chat panel painting *underneath* the argument panel, text
clipping mid-word, the header's advance button spilling out of the viewport.

Required:
- `<main>`: `min-width: 0`
- `<header>`: `min-width: 0; overflow: hidden`
- chat `<section>`: `min-width: 0` **and** an explicit
  `grid-template-columns: minmax(0, 1fr)` — the section is itself a grid with
  an implicit column, and that implicit column needs the `minmax(0, …)` too.
  This one is easy to miss: adding `min-width: 0` to the section alone fixes
  the overlap but leaves the *clipping*.
- document `<section>`: `min-width: 0` (it also has `overflow: auto`, which
  independently forces min-width to 0, but be explicit)

If reimplementing in flexbox instead, the equivalent trap is
`min-width: 0` on flex children plus `flex: 0 1 auto` vs `flex: 1 1 auto`
behaviour — see 0.2.

### 0.2 The header's flex behaviour is exact

Order matters and so do the flex values:

| Item | flex | Why |
| --- | --- | --- |
| Motion title `<h1>` | `flex: 0 1 auto; min-width: 0` | must NOT grow — if it grows, the edit icon is pushed far from the title it edits, which the client rejected. It must still *shrink* and ellipsise. |
| Edit icon button | `flex: none` | sits tight against the title |
| Position label | `flex: none; margin-right: auto` | this `margin-right: auto` is what pushes the stage readout and advance button right — there is no spacer div |
| Stage readout | `flex: none; white-space: nowrap` | |
| Advance button | `flex: none` | |

Do not add a flex spacer `<div>`; the `margin-right: auto` on the position
label is the mechanism.

### 0.3 The composer must never overflow

Three controls share one row inside a bordered box. Total intrinsic width can
exceed the panel at preview widths. The resolution: the **input yields width
first** — `flex: 1 1 120px; min-width: 60px` — while the model switcher and
send button are `flex: none`. An earlier attempt gave the input a 152px floor
and the send button spilled outside the box. Do not raise that floor.

### 0.4 The rotating headline verb

Naïve implementations do one of two wrong things:
- no width management → the following words reflow and jump on every change
- a fixed-width slot sized to the longest word → a permanent ugly gap

Correct: measure the current word in a hidden sizer and animate the slot's
width to that measurement. Details in 2.3.

### 0.5 Things the client explicitly rejected

Do not reintroduce any of these:

- **A left accent bar on the selected sidebar row.** Called out as "a key
  marker of AI". Plain background highlight only.
- **An underline under the active stage number.** It made the stage readout
  look like an interactive tab bar. Weight and colour only.
- **Coloured pills / badges** for scores, ranks, stage labels or any metadata.
  Plain text. Rationale: badges read as less trustworthy.
- **Small-caps, letter-spaced "eyebrow" labels in an accent colour** above
  headings. Reads as an AI-generated template.
- **A sans-serif for UI chrome.** The app is set in Lora, the same body serif
  as the landing page. A "readable sans" was tried and rejected as
  inconsistent with the landing page.
- **Bold on the motion title or argument titles.** Weight 400.
- **Justified text in narrow columns.** It opened rivers. The landing hero's
  product panel is justified at 70ch; nothing narrower is.
- **Display-size argument titles** (30px+) in the document column. 21px.
- **Meta strings joined by middot** ("1st · not scored · evidence") in the
  document column. Prose sentences instead — everything in that column must be
  copy-pasteable.
- **"Send" as a button label.** Icon only.
- **A rule between the composer and the message list.** The composer is a
  self-contained bordered box, Gemini-style.
- **The word "Studio"** in the wordmark, and any display/novelty face for it.
  Several were tried (Bagel Fat One, Honk, Ranchers, Bricolage Grotesque) and
  all rejected. It is "Rhetor", in Lora, at 17px.

---

## 1. Tokens

### 1.1 Colour

```css
--color-bg:          #f5ead8;   /* cream page ground */
--color-surface:     #fffaf3;   /* raised surfaces */
--color-text:        #201f1d;   /* body ink */
--color-accent:      #c67139;   /* terracotta base */
--color-accent-100:  #f8e7d8;
--color-accent-200:  #f1cfb4;
--color-accent-300:  #e5b48d;
--color-accent-600:  #b0602e;
--color-accent-700:  #96501f;
--color-accent-800:  #7a3f18;
--color-accent-900:  #5b2d10;
--color-divider:     rgba(90,45,16,.2);
```

Hero-only literals (they sit over photography and are not tokens):
`#1a1512` headline ink, `#2b241f` subtext, `#4b423a` sub-meta,
`#fbf3e6` and `#f7ecdb` gradient washes, `#fdf6ea` reversed type.

**Derived colours.** The designs use `color-mix()` against `--color-text`
rather than a grey ramp. Recreate these exactly; they are how the hierarchy
works:

| Mix | Where |
| --- | --- |
| `--color-text` 82% | landing three-stage body copy |
| `--color-text` 76% | product-panel non-first bench rows |
| `--color-text` 72% | completed stage number |
| `--color-text` 70% | position label, document status prose, footer-ish text |
| `--color-text` 68% | product-panel score line |
| `--color-text` 64% | landing footer |
| `--color-text` 62% | product-panel chrome bar |
| `--color-text` 60% | product-panel field labels |
| `--color-text` 58% | sidebar group labels, "Rhetor" message label |
| `--color-text` 48% | sidebar row meta |
| `--color-text` 40% | upcoming stage number |
| `--color-text` 20% | composer border |
| `--color-text` 16% | product-panel border |
| `--color-text` 15% | user-message border |
| `--color-text` 12% | product-panel internal rules |
| `--color-text` 10% | product-panel bench row rules |

Panel grounds:
- sidebar: `color-mix(in srgb, var(--color-accent-100) 10%, var(--color-bg))`
- document column: `color-mix(in srgb, var(--color-surface) 55%, var(--color-bg))`
- selected sidebar row: `color-mix(in srgb, var(--color-accent-200) 30%, transparent)`

These percentages were lowered three times on client feedback ("colour is
still a bit glaring"). Do not raise them.

**Contrast.** Accent at full strength (`#c67139`) clears 3:1 — icons, large
type, chrome only. Paragraph-size accent text uses `--color-accent-700`
(4.5:1 on cream) or deeper.

### 1.2 Type

- Landing display/headings: **Cormorant Garamond** 400 / 500 / 600 + 400 italic
- Landing body, and **all** app chrome and copy: **Lora** 400 / 500 / 600 + 400 italic
- Bold is retired. Interface headings cap at 500–600. The larger the type, the
  lighter it sets: hero `h1` is 500, section `h2` 400, card `h3` 500.
- `font-feature-settings: 'tnum' 1` on anything that stands as a figure —
  stage readout, scores, numerals. **Not** on running prose (Lora's tabular
  feature widens word-spaces and loosens the paragraph).
- `text-wrap: pretty` on `body`.

```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap
```

### 1.3 Radius, shadow, links

- `--radius-md` 4px (design-system default), 8px for composer / message
  surfaces, 999px for the send button.
- `--shadow-lg` on the hero product panel. Nothing else is elevated.
- Links: `--color-accent-700`, no underline; hover `--color-accent-800` with
  underline.
- Focus: `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }`
  everywhere. Never the browser default.

### 1.4 Buttons

Primary = **accent outline on transparent**, never a fill. Hover = accent-100
tint. Press = one ramp step deeper (accent-600 border / accent-200 fill).
Secondary = ink hairline. Ghost = no border, accent text, tint on hover.

The one exception in the whole design: the closing CTA band's button, which is
transparent with a `#f1cfb4` border and `#fdf6ea` text because it sits on a
dark field.

---

## 2. Landing page — `Rhetor Forum.dc.html`

Fluid. Reflows to ~600px. Root is `position: relative; overflow: hidden`.

### 2.1 Hero background — two stacked layers

Layer 1, the photograph (`assets/forum-illustration.webp`):
```css
position:absolute; inset:0; height:900px;
background-image:url('assets/forum-illustration.webp');
background-size:cover; background-position:50% 34%;
filter:saturate(1.02) contrast(1.02);
opacity:0.96;
mask-image:linear-gradient(to bottom,
  rgba(0,0,0,1) 0%, rgba(0,0,0,1) 46%,
  rgba(0,0,0,.62) 70%, rgba(0,0,0,.18) 88%, rgba(0,0,0,0) 100%);
pointer-events:none;
```
Include `-webkit-mask-image` as well.

Layer 2, the readability wash:
```css
position:absolute; inset:0; height:900px;
background:
  radial-gradient(760px 400px at 50% 26%,
    color-mix(in srgb,#fbf3e6 84%,transparent) 0%,
    color-mix(in srgb,#fbf3e6 52%,transparent) 62%,
    transparent 100%),
  linear-gradient(to bottom,
    color-mix(in srgb,#f7ecdb 76%,transparent) 0%,
    color-mix(in srgb,#f7ecdb 58%,transparent) 34%,
    color-mix(in srgb,var(--color-bg) 40%,transparent) 64%,
    var(--color-bg) 100%);
pointer-events:none;
```
The radial is what makes the headline legible; the linear is what dissolves the
photograph into the page. Both are needed. The mask on layer 1 plus the linear
on layer 2 is deliberate belt-and-braces — an earlier version had a hard cutoff
where the image ended, which the client rejected.

### 2.2 Nav

Design-system `.nav` class, `padding-inline: clamp(20px,5vw,64px)`,
`background: transparent`, `border-bottom: none`. Contents: `.nav-brand`
"Rhetor", then links "How it works" / "Scoring" / "Sign in", then an outlined
"Start free trial" button.

### 2.3 Hero content

Container: `max-width:1160px; margin:0 auto;`
`padding: clamp(48px,7vw,104px) clamp(20px,5vw,48px) 0; text-align:center`.

**Headline** `<h1>`:
```css
font-family: Cormorant Garamond; font-weight:500;
font-size: clamp(40px,5.6vw,80px); line-height:1.06;
letter-spacing:-0.012em; margin:0;
font-feature-settings:'tnum' 1;
color:#1a1512;
text-shadow: 0 1px 26px rgba(251,243,230,.95), 0 1px 3px rgba(251,243,230,.9);
```
Two `display:block` lines:
1. `#1 AI for {verb}`
2. `your arguments.`

Splitting onto two lines is deliberate — on one line the rotating word made the
whole line reflow, which the client found painful.

**The rotating verb.** Words, in order:
`ameliorating, bolstering, strengthening, sharpening, improving`.
Interval **2800ms**. Colour `--color-accent-800`.

Markup is three nested spans:
```
<span class="slot">            <!-- position:relative; display:inline-block;
                                    white-space:nowrap;
                                    transition:width .42s cubic-bezier(.4,0,.2,1);
                                    width:<measured>px -->
  <span class="sizer">…</span> <!-- display:inline-block; visibility:hidden;
                                    white-space:nowrap — holds the CURRENT word -->
  <span class="word">…</span>  <!-- position:absolute; left:0; top:0;
                                    white-space:nowrap -->
</span>
```
Measurement: read `sizer.getBoundingClientRect().width` and store it; only
update if it differs by more than 0.5px (prevents a feedback loop). Re-measure
on mount, in a `requestAnimationFrame` after every update, on window resize,
and on `document.fonts.ready` (the serif metrics change once the webfont
lands — without this the slot is sized to the fallback).

Entry animation: `opacity 0 → 1`, `translateY(6px) → 0`, `.46s ease both`.
The prototype alternates between two identical `@keyframes` (`rh-verb-in` /
`rh-verb-in-b`) so the animation restarts on every change; in React, a
`key={word}` on the word span achieves the same thing more cleanly.

**Subtext:** Lora 19.5px / 1.66, `margin: 28px auto 0`, `max-width: 54ch`,
`color:#2b241f`, `text-shadow: 0 1px 18px rgba(251,243,230,.95)`. Copy:

> An AI assistant that makes your own arguments stronger. Generic AI wants to
> do all the thinking for you. We built Rhetor to think with you, not for you.
> Step inside the AI brainstorming process to push your ideas further.

**CTA row:** `display:flex; justify-content:center; gap:28px; flex-wrap:wrap;`
`margin-top:34px`. Primary outlined button, `min-height:54px`,
`padding-inline:34px`, 17px, "Start free trial". Beside it a plain text link,
16px, "See a worked motion".

**Sub-meta:** Lora 14.5px, `margin:22px 0 0`, `color:#4b423a`,
`text-shadow: 0 1px 14px rgba(251,243,230,.9)`.
"British Parliamentary. Three motions on the trial, no card."

### 2.4 Hero product-preview panel

The client's requirement: a real screenshot-style panel with a complete,
copy-pasteable argument. Not a teaser, no truncation, no "read more".

Outer: `max-width:1200px; margin:0 auto;`
`padding: clamp(44px,5vw,72px) clamp(16px,4vw,48px) clamp(56px,6vw,96px)`.

Panel: `background: var(--color-surface)`, `1px solid color-mix(--color-text 16%)`,
`box-shadow: var(--shadow-lg)`, `text-align:left`.

**Chrome bar:** `padding:13px 20px`, bottom rule at 12% ink, Lora 13.5px at
62% ink, space-between:
- left: `rhetor.app / case file 41 / abolish-private-schools`
- right: `Opening Opposition · drafted 11:04 · autosaved`

**Body:** `display:grid; grid-template-columns: minmax(0,252px) minmax(0,1fr)`.

*Left rail* — `padding:24px 20px 28px`, right rule at 12% ink. Field pattern is
a 13px 60%-ink label then a 15.5px value:
- Motion → "This House Would abolish private schools"
- Position → "Opening Opposition"
- "Bench, ranked by intrinsic score" → five rows, `tnum`, space-between,
  `padding:9px 10px`, 14.5px. Rows and scores:
  Selection moves to housing **8.4** (first row: `border-left:2px solid var(--color-accent)`
  and `color-mix(--color-accent-100 55%, transparent)` background) /
  Bursary pipeline collapses **7.6** / State capacity shock **7.1** /
  Freedom of association **5.9** / Emigration of teachers **5.2**.
  Rows 2–5 at 76% ink with a 10%-ink top rule.
  *Note:* this is the one place a left accent bar survives — it is inside a
  screenshot-style panel, not in the real app chrome.
- "Stages" → four lines, 14.5px / 1.65, `<br>`-separated:
  `Claim · locked` / `Mechanism · in revision` (in `--color-accent-700`) /
  `Evidence · thin` / `Impact · locked`

*Right article* — `padding: 28px clamp(20px,3vw,38px) 32px`.
- 13px 60%-ink line: "Argument 1 of 6"
- `h2`: Cormorant Garamond **400**, `clamp(26px,2.6vw,34px)` / 1.14,
  `margin:10px 0 0`, `max-width:34ch` —
  "Abolition relocates selection from the fee to the postcode"
- score line: 14.5px / 1.6, 68% ink, `tnum` —
  "Intrinsic score 8.4 — ranked 1st of 6. Truth 8 · Relevance 9 · Logic 8 ·
  Importance of impact 9. Weakest stage: evidence."
- `<hr class="hr">` at `margin:22px 0`
- body: `display:flex; flex-direction:column; gap:19px;` 16px / 1.7,
  `max-width:70ch`, `text-align:justify; hyphens:auto`. Four paragraphs,
  each opening with an italic label: `<em>Claim.</em>`, `<em>Mechanism.</em>`,
  `<em>Evidence.</em>`, `<em>Impact.</em>`. Full copy is in the file — carry it
  verbatim. This is the *only* justified text in the designs, and the only
  place the italic stage labels survive.
- actions: `gap:12px; margin-top:26px` — secondary "Refine mechanism", ghost
  "Ask for harder evidence", ghost "Re-rank bench"

### 2.5 "How it works"

Section `id="how"`, ground
`linear-gradient(to bottom, color-mix(in srgb, var(--color-accent-100) 72%, var(--color-bg)) 0%, var(--color-bg) 100%)`,
hairline top and bottom.

Inner `max-width:1140px`, `padding: clamp(48px,6vw,88px) clamp(20px,5vw,48px)`,
`text-align:center`.

`h2`: Cormorant 400, `clamp(32px,4vw,52px)` / 1.08, `max-width:24ch` —
"Three stages, the same three you'd do on paper"

Three columns: `grid-template-columns:repeat(3,minmax(0,1fr))`,
`gap: clamp(28px,3.4vw,52px)`, `margin-top: clamp(34px,4vw,56px)`,
`text-align:left`. Columns 2 and 3 carry
`border-left:1px solid var(--color-divider); padding-left:clamp(20px,2.6vw,40px)`
— hairlines part the columns; they are not cards.

Each column:
- Roman numeral `I` / `II` / `III` — Cormorant 400, 44px / 1, `tnum`,
  `--color-accent-700`
- `h3` Cormorant 500, 24px / 1.2, `margin:14px 0 0`
- body Lora 16px / 1.7, `margin:12px 0 0`, 82% ink, ragged right

Headings and copy, verbatim:
1. **Bring your idea** — "Give it the motion, your side, and the line you
   already have in mind. Rhetor builds the bench out around it — the variants
   you would have reached eventually, and the ones you wouldn't."
2. **Score and rank** — "Each argument is marked on the axes a judge marks it
   on: is it true, is it relevant, does the logic hold, does the impact matter.
   The bench sorts by intrinsic score and shows which stage lost the marks."
3. **Refine stage by stage** — "Open one stage at a time and rewrite it against
   the score. Push the mechanism, demand a harder source, weigh the impact
   against the other side's, and watch the mark move before the round rather
   than after it."

### 2.6 Pull quote

`max-width:1140px`, `padding: clamp(48px,6vw,88px) clamp(20px,5vw,48px)`.
`figure` `max-width:46ch`, flush left (not centred).
`blockquote`: Cormorant **italic** 400, `clamp(24px,2.7vw,36px)` / 1.32,
`--color-accent-900`. Curly quotes.
`figcaption`: Lora 15.5px / 1.7, `margin:24px 0 0`, 70% ink —
"— A. Mensah, university open, semifinalist"

### 2.7 Closing CTA band

Section `id="start"`,
`background: linear-gradient(160deg,#5b2d10 0%,#7a3f18 55%,#b0602e 100%)`,
`color:#f7ecdb`. Inner `max-width:1140px`,
`padding: clamp(52px,7vw,104px) clamp(20px,5vw,48px)`, centred.

- `h2` Cormorant 400, `clamp(32px,4.4vw,58px)` / 1.05, `max-width:22ch`,
  `#fdf6ea` — "Your round is Saturday. Your case can be ready tonight."
- `p` Lora 17px / 1.66, `max-width:48ch`, `rgba(253,246,234,.8)` — "Three
  motions on the free trial, no card. After that it's the price of a coffee a
  month."
- CTA row `gap:26px; margin-top:30px`: button `min-height:54px`,
  `padding-inline:34px`, 17px, transparent, `1px solid #f1cfb4`, `#fdf6ea`;
  beside it a link at `rgba(253,246,234,.82)`, 16px, "Read how scoring works"

### 2.8 Footer

`max-width:1140px`, `padding: 34px clamp(20px,5vw,48px) 56px`, Lora 14.5px,
64% ink, `display:flex; justify-content:space-between; gap:24px; flex-wrap:wrap`.
Left: "Rhetor" in Cormorant 20px at full ink. Middle: links `gap:26px` —
How it works / Scoring / Pricing / Contact. Right: "© 2026 Rhetor".

---

## 3. Argument workspace — `Rhetor Chat - Compact.dc.html`

`body { margin:0; overflow:hidden; }`. Everything in **Lora**
(`--font-heading` and `--font-body` are both overridden to Lora on this page).

### 3.1 Shell

```css
display:grid;
grid-template-columns: 230px minmax(0,1fr);   /* 48px when collapsed */
height:100vh;
font-family:var(--font-body); color:var(--color-text);
transition: grid-template-columns .22s ease;
```

`<main>`: `display:grid; grid-template-rows:auto minmax(0,1fr); min-width:0; min-height:0`.

### 3.2 Sidebar

`display:flex; flex-direction:column;`
`border-right:1px solid var(--color-divider);`
`background:color-mix(in srgb, var(--color-accent-100) 10%, var(--color-bg));`
`min-height:0; overflow:hidden`.

**Head bar** — `height:52px`, `border-bottom:1px solid var(--color-divider)`,
`padding:0 12px 0 20px`. This 52px + hairline exactly matches the main header;
the alignment was requested explicitly and is easy to break.
- "Rhetor" — Lora 17px, `letter-spacing:.01em`. Same size as the motion title;
  do not make it larger.
- flex spacer
- collapse icon button — Lucide `panel-left`, 17px, `stroke-width:1.5`,
  `min-height:30px; padding:5px`
- When collapsed: rail 48px, wordmark and spacer `display:none`, head bar
  becomes `justify-content:center` so the button centres (an earlier version
  left it off-centre).

Then a **14px spacer div**, then the New Motion row. That 14px is what makes
the button's top edge align with the first line of both other columns, which
use `padding-top:14px`. Change one, change all three.

**New Motion button** — row is `display:flex; padding:0 14px 14px`; button is
`flex:1`, outlined primary, `min-height:38px`, 14.5px, `white-space:nowrap`
(without nowrap it wraps to two lines at 230px), `gap:9px`, Lucide `plus` at
15px `stroke-width:1.6`.

**Motion list** — `overflow:auto; padding:2px 10px 16px`.
- Group labels: `<p>` 12.5px, 58% ink, `margin:6px 10px 6px` (first) /
  `margin:20px 10px 6px` (subsequent). "Today", "Earlier this week".
- Row group: `display:flex; flex-direction:column; gap:1px`.
- Row: `display:flex; align-items:center; gap:10px; padding:7px 10px`.
  Title span `flex:1; min-width:0`, 13.5px / 1.35, ellipsised, nowrap.
  Meta span `flex:none`, 12px, nowrap, 48% ink.
- Selected row adds
  `background: color-mix(in srgb, var(--color-accent-200) 30%, transparent)`.
  Nothing else. No border, no left bar.

Sample data as designed: Today — THW abolish private schools (Stage 1,
selected) / THBT the EU should federalise defence (Stage 3) / THW ban political
donations from firms (Stage 2). Earlier this week — THR the rise of the expert
witness / THW pay reparations for colonial rule / THBT unions should run pension
funds (all "Closed").

**Footer** — `flex:1` spacer above it, then
`border-top:1px solid var(--color-divider); padding:12px 20px;`
`display:flex; justify-content:space-between; gap:10px;` 13px, 70% ink,
`white-space:nowrap; overflow:hidden`. "A. Mensah" and a "Settings" link.
Fades to `opacity:0` when collapsed.

### 3.3 Header

```css
display:flex; align-items:center; gap:10px; flex-wrap:nowrap;
padding:0 16px; height:52px;
min-width:0; overflow:hidden;
border-bottom:1px solid var(--color-divider);
```
The uniform 10px gap is deliberate — the client asked for equal spacing between
title, edit icon and position.

1. **Motion title** `<h1>`: Lora **400**, 17px, `letter-spacing:-0.005em`,
   line-height 1.2, `margin:0`, nowrap + ellipsis,
   `flex:0 1 auto; min-width:0`.
2. **Edit icon button**: Lucide `pencil`, 15px `stroke-width:1.5`,
   `min-height:28px; padding:4px; flex:none`, `aria-label="Rename motion"`.
3. **Position label**: 14px, nowrap, 70% ink, `flex:none; margin-right:auto`.
   `display:none` below 900px viewport width.
4. **Stage readout**: `display:flex; gap:8px;` 13.5px, `flex:none`, nowrap,
   `tnum`. Three spans: `Stage 1`, `2`, `3` — only the first carries the word.
   - active: `color:var(--color-accent-800); font-weight:600`
   - completed (`n < stage`): `color-mix(--color-text 72%)`
   - upcoming: `color-mix(--color-text 40%)`
   No underline, no border, no background.
5. **Advance button**: outlined primary, `display:flex; gap:7px;`
   `min-height:32px; padding:0 13px;` 13.5px, nowrap, `flex:none`.
   Label "Advance to stage {n+1}", or "Finish and export" at stage 3;
   `display:none` below 1100px. Arrow is Lucide `arrow-right` at **20px**
   with `display:block; margin:-2px 0` — larger than the label, deliberately,
   and the negative margin keeps the 32px button height.

### 3.4 Split container

```css
display:grid;
grid-template-columns: minmax(0, {split}fr) 5px minmax(0, {1-split}fr);
min-height:0;
```
`split` defaults to **0.44**, clamped **0.25–0.70**.

**Handle** — the middle 5px track.
`cursor:col-resize; touch-action:none;`
`background: var(--color-divider)` → `var(--color-accent)` while dragging,
`transition: background .15s ease`.
`role="separator"`, `aria-label="Resize panels"`, `title="Drag to resize"`.

Drag: on `pointerdown`, `preventDefault()`, attach `pointermove` and
`pointerup` to **window** (not the handle), compute
`(clientX - containerRect.left) / containerRect.width`, clamp, set state. Set
`document.body.style.cursor = 'col-resize'` for the duration and clear it on
release. Remove both listeners on release and on unmount.

Consider persisting `split` per user; the prototype does not.

### 3.5 Chat column

```css
display:grid;
grid-template-rows: minmax(0,1fr) auto;
grid-template-columns: minmax(0,1fr);   /* required — see 0.1 */
min-height:0; min-width:0; overflow:hidden;
```

**Message list**: `overflow:auto; padding:14px 20px 8px;`
`display:flex; flex-direction:column; gap:26px; min-height:0`.

**User message**: `align-self:flex-end; max-width:70%;`
`background:var(--color-surface);`
`border:1px solid color-mix(in srgb, var(--color-text) 15%, transparent);`
`border-radius:8px; padding:13px 16px;` 15.5px / 1.6.
The border is essential — a tint-only version was rejected as unclear.

**Rhetor message**: no surface, no border, `max-width:100%`, 15.5px / 1.68.
A 13px 58%-ink `<p>` reading "Rhetor" above, `margin:0 0 12px`; then
paragraphs at `margin:0 0 12px`, last one `margin:0`.

**Composer** — wrapper `padding:8px 16px 16px` (no top rule).
Box: `border:1px solid color-mix(in srgb, var(--color-text) 20%, transparent);`
`border-radius:8px; background:var(--color-surface);`
`padding:7px 8px 7px 14px; display:flex; align-items:center; gap:6px`.
- Input: `flex:1 1 120px; min-width:60px; border:0; outline:none;`
  `background:transparent;` Lora 15.5px / 1.6, `color:var(--color-text)`,
  placeholder "Send message here…", `aria-label="Message Rhetor"`.
- Controls group: `display:flex; align-items:center; gap:2px; flex:none`.
  The 2px gap is deliberate — the client asked for the switcher and send button
  to sit close together.
  - Model switcher: ghost button, `gap:6px; min-height:30px; padding:0 8px;`
    13.5px, nowrap. Label "Sonnet 4.5" + Lucide `chevron-down` at 13px.
    Always shows the label; an earlier version hid it at narrow widths and the
    client read that as broken.
  - Send: outlined primary icon button, `width:36px; height:36px;`
    `min-height:36px; flex:none; padding:0;`
    `display:flex; align-items:center; justify-content:center;`
    `border-radius:999px; line-height:0`. Lucide `send` at 16px
    `stroke-width:1.6`, `display:block; transform:translate(-0.5px,0.5px)`
    for optical centring (the glyph is visually bottom-left weighted).
    `aria-label="Send message"`. **Check the glyph direction** — an early
    hand-written path pointed left and read as "back".

### 3.6 Argument document column

`overflow:auto; min-height:0; min-width:0;`
`background: color-mix(in srgb, var(--color-surface) 55%, var(--color-bg))`.
Inner `max-width:none; padding:14px 28px 28px` — no measure cap; the column
takes the width the drag handle gives it.

One continuous document. Per argument:

- `h2`: Lora **400**, **21px** / 1.4, `margin:0 0 4px`. Numbered:
  "1. Abolition relocates selection from the fee to the postcode".
- Status prose `<p>`: `margin:0 0 1em`, 15.5px / 1.7, 70% ink. Full sentences:
  - 1 — "Provisionally your first argument. Not yet scored; the evidence stage
    is the weakest part."
  - 2 — "Provisionally second. Not yet scored; drafted with you in the chat."
  - 3 — "Provisionally third. Your own idea, but the mechanism is still thin."
- Body wrapper: `font-size:15.5px; line-height:1.72` — a plain block, **not**
  a flex column. Paragraphs carry `margin:0 0 1em`. This was specifically
  requested: flex gaps produced "weird vertical spacing" that didn't read as
  plain text.
- Paragraphs open with `Claim.`, `Mechanism.`, `Evidence.`, `Impact.` as
  **unstyled text** — no `<em>`, no bold, no colour.
- Actions: `display:flex; gap:14px; flex-wrap:wrap; margin-top:14px;` 14px.
  Plain links, not buttons: "Edit in place" / "Ask for harder evidence" /
  "Copy". Argument 3 instead has "Build this out" / "Merge into 2".
- Separator: `<hr class="hr">` at `margin:34px 0`.

Argument 3 is deliberately incomplete — one Claim paragraph, then a 70%-ink
paragraph reading "Mechanism, evidence and impact are still open. This is close
to argument 2 — one of the two should probably be cut before the round." It
shows the unfinished state.

Below the line, one closing paragraph at 15.5px / 1.7, 70% ink: "Three more sit
below the line: freedom of association, which still needs a mechanism;
emigration of teachers, which is thin; and selection by aptitude returning,
which is parked for now."

Full argument copy is in the prototype file — carry it verbatim.

---

## 4. State and data

### Landing page
`verbIndex: number` (interval, 2800ms) · `slotWidth: number` (measured)

### Workspace
`collapsed: boolean` · `split: number` (0.25–0.70, default 0.44) ·
`dragging: boolean` · `viewportWidth: number` (responsive header) ·
`stage: 1 | 2 | 3` (a prop in the prototype; real app should read it from the
motion)

### Implied data model

```ts
type Position =
  | 'Opening Government' | 'Opening Opposition'
  | 'Closing Government' | 'Closing Opposition';

interface Motion {
  id: string;
  title: string;              // "This House Would abolish private schools"
  position: Position;
  stage: 1 | 2 | 3 | 'closed';
  updatedAt: string;          // drives Today / Earlier this week grouping
  messages: Message[];
  bench: Argument[];
}

interface Message {
  id: string;
  role: 'user' | 'rhetor';
  paragraphs: string[];       // Rhetor replies render as multiple <p>
}

interface Argument {
  id: string;
  title: string;
  rank: number;               // provisional before scoring
  score: number | null;       // null until stage 2 — 8.4, 7.6, …
  subscores?: {               // the axes adjudicators mark on
    truth: number; relevance: number;
    logic: number; impact: number;
  };
  weakestStage: 'claim' | 'mechanism' | 'evidence' | 'impact' | null;
  provenance: string;         // "your idea", "drafted with you", …
  claim: string;
  mechanism: string | null;
  evidence: string | null;
  impact: string | null;
  belowTheLine: boolean;
}
```

Sidebar grouping is by `updatedAt`; the meta column shows
`Stage {n}` or `Closed`.

---

## 5. Responsive behaviour

The landing page is fully fluid via `clamp()` and reflows to ~600px.

The workspace is a desktop app layout. Two documented breakpoints, both driven
by measured viewport width rather than media queries in the prototype
(a media query is fine and preferable in production):

| Width | Change |
| --- | --- |
| < 1100px | advance-button label hidden, arrow remains |
| < 900px | position label hidden |

Below ~700px the two-column split stops being usable. That case was never
designed — if mobile matters, ask before inventing it. The obvious move is
tabs between chat and document, but it is not specified.

## 6. Accessibility

- `aria-label` on every icon-only button: "Collapse sidebar", "Rename motion",
  "Send message", "Message Rhetor" (the input).
- Divider is `role="separator"` with `aria-label="Resize panels"`. Keyboard
  resize is NOT implemented in the prototype — add arrow-key handling.
- Stage readout is a status, not a control. Consider
  `aria-live="polite"` on it, and `aria-current` on the selected motion row.
- Focus ring is the themed 2px accent `:focus-visible` outline, everywhere.
- Rotating hero verb: wrap the interval in a
  `prefers-reduced-motion: reduce` check and hold a single word if set. Not
  handled in the prototype.
- Colour contrast: see 1.1. The muted `color-mix` steps at 48% and 40% ink are
  used only for non-essential metadata; do not use them for body copy.
