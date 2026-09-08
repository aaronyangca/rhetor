# Handoff: Rhetor — landing page and argument workspace

## Overview

Rhetor is an AI assistant for competitive debate in the British Parliamentary
format. A debater gives it a motion and a position; Rhetor helps them push
their own arguments further, scores them against the standard real adjudicators
judge by, ranks them, and lets them refine claim / mechanism / evidence /
impact stage by stage before the round.

This bundle covers two designs:

1. **Landing page** — marketing page with a photographic Roman-forum hero, a
   rotating-verb headline, a real product-preview panel, a three-stage
   explanation, a closing CTA band and a footer.
2. **Argument workspace** — the signed-in app: motion sidebar, chat with
   Rhetor on the left, the live argument document on the right.

A third file explores logo directions and is reference only.

## About the Design Files

The files in this bundle are **design references created in HTML** — prototypes
showing intended look and behaviour, not production code to copy directly.

The task is to **recreate these designs in the target codebase's existing
environment** (React, Next.js, Vue, whatever is already in place) using its
established patterns and component library. If no environment exists yet,
choose the framework that best fits the project and implement there. A
shadcn/ui theme port of the design tokens is included in `shadcn/` as a
starting point for exactly that.

Two implementation details of the prototypes that should NOT be carried across:

- Styling is written as inline `style` attributes referencing CSS custom
  properties. That is an artefact of the prototyping environment. In a real
  codebase, use the token system (see `shadcn/globals.css`) with Tailwind
  classes or whatever the codebase uses.
- The markup sits inside a custom `<x-dc>` element with `{{ value }}`
  template holes and a small logic class at the end of each file. Those holes
  map to ordinary component state — read the logic class to see what each one
  computes.

## Fidelity

**High-fidelity.** Colours, typography, spacing and interaction states are
final and were iterated on with the client. Recreate pixel-for-pixel using the
codebase's existing libraries. Copy is final and should not be rewritten.

---

## Design tokens

Derived from the "Classical" editorial design system, with a warm
terracotta-and-cream override. Full token sheet, as HSL channel triples for
shadcn, is in `shadcn/globals.css`.

### Colour

| Token | Hex | Use |
| --- | --- | --- |
| `--color-bg` | #f5ead8 | Page ground (cream) |
| `--color-surface` | #fffaf3 | Raised surfaces: product panel, composer, user messages |
| `--color-text` | #201f1d | Body ink |
| ink (hero) | #1a1512 | Hero headline, over photography |
| deep | #4b423a | Hero sub-meta |
| `--color-accent` | #c67139 | Terracotta base — strokes, marks, drag handle active |
| `--color-accent-100` | #f8e7d8 | Lightest tint — sidebar ground, chat bubbles |
| `--color-accent-200` | #f1cfb4 | Selected row, hover tint |
| `--color-accent-300` | #e5b48d | Borders |
| `--color-accent-600` | #b0602e | Pressed |
| `--color-accent-700` | #96501f | Accent text at paragraph size (4.5:1 on cream) |
| `--color-accent-800` | #7a3f18 | Active stage label, link hover |
| `--color-accent-900` | #5b2d10 | Closing band field |
| `--color-divider` | rgba(90,45,16,.2) | Hairlines |

Contrast note: the accent at full strength clears 3:1 — fine for icons, large
type and chrome, not for body copy. For paragraph-size accent text use
`--color-accent-700` or deeper.

### Type

- **Display / headings:** Cormorant Garamond (400, 500, 600) — landing page only.
- **Body, and ALL app chrome:** Lora (400, 500, 600, 400 italic).
- Bold is retired. Interface headings cap at 500–600; the bigger the type, the
  lighter it sets — the hero `h1` is 500 at clamp(46px, 7vw, 96px).
- Figures set tabular (`font-feature-settings: 'tnum' 1`) wherever they stand
  as figures; running prose keeps text figures.

Google Fonts:
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap
```

### Radius, spacing, elevation

- Radius 4px (`--radius-md`), 8px for the composer and message surfaces, 999px
  for the circular send button.
- Spacing scale is the Classical scale at density 1.15×.
- Elevation is a whisper: `--shadow-sm` only, on the hero product panel.

### Four rules that make it read as Rhetor

1. **Buttons are outlined, not filled.** 1px accent border on transparent,
   tinted on hover. This is the single most important rule.
2. **Bold is retired** (see above).
3. **Hairlines, not cards.** Structure comes from 1px rules and whitespace.
   Boxed surfaces are reserved for genuinely discrete things.
4. **No coloured pills or badges for metadata.** Scores, ranks and stage labels
   set as plain muted text. This was a deliberate call — badges read as less
   trustworthy.

---

## Screen 1 — Landing page (`Rhetor Forum.dc.html`)

Fluid width, reflows down to ~600px. Sections in order:

### Nav
Height ~72px, transparent over the hero photograph. Left: "Rhetor" wordmark,
Cormorant Garamond ~23px. Right: text links ("How it works", "Pricing",
"Sign in") at 15px, plus an outlined "Start free trial" button.

### Hero
- **Background:** photograph of the Roman forum, near full strength, with a
  radial cream wash (`radial-gradient(760px 400px at 50% 26%, …)`) plus a
  vertical cream-to-page gradient over it so type stays readable. Height 900px
  for the gradient overlay; the photograph is `background-size: cover`,
  positioned to keep the colonnade behind the type.
- **Headline:** two lines, centred.
  Line 1: `#1 AI for <verb>` — the verb ROTATES every 2.8s through
  `ameliorating → bolstering → strengthening → sharpening → improving`,
  in `--color-accent-800`.
  Line 2: `your arguments.`
  Cormorant Garamond 500, `clamp(46px, 7vw, 96px)`, line-height 1.02,
  letter-spacing -0.01em, colour #1a1512, with a cream text-shadow
  (`0 1px 26px rgba(251,243,230,.95), 0 1px 3px rgba(251,243,230,.9)`) to
  hold contrast over the photograph.
- **Rotating-verb mechanics (important):** a hidden sizer span measures the
  current word; the visible word is absolutely positioned inside a slot whose
  width animates to that measurement
  (`transition: width .42s cubic-bezier(.4,0,.2,1)`), so the line closes up
  smoothly instead of jumping or leaving a gap. The word itself fades and
  rises 6px on entry (.46s ease). Re-measure on resize and on
  `document.fonts.ready`.
- **Subtext:** "An AI assistant that makes your own arguments stronger. Generic
  AI wants to do all the thinking for you. We built Rhetor to think with you,
  not for you. Step inside the AI brainstorming process to push your ideas
  further." Lora 19.5px / 1.66, max-width 54ch, centred, colour #2b241f.
- **CTAs:** primary outlined "Start free trial"; secondary low-weight text link
  beside it.
- **Sub-meta:** "British Parliamentary. …" Lora 14.5px, colour #4b423a.
- **Product preview panel:** a real argument card on `--color-surface` with a
  1px ink border and `--shadow-sm`. Contains a full argument — heading, then
  Claim / Mechanism / Evidence / Impact as complete prose. This is genuine,
  copy-pasteable content, deliberately not truncated and with no "read more".

### How it works
Three stages in a tinted band, parted by hairlines rather than boxed as cards.
Mapped to the real product stages: bring your idea → scoring → refinement.
Body copy ragged-right (justification opened rivers at this measure).

### Pull quote
Single italic Cormorant line, centred, generous margins.

### Closing CTA band
Deep terracotta field (`--color-accent-900`), paper type reversed out,
outlined CTA in cream.

### Footer
Hairline top rule, wordmark, three link columns, fine print. Lora 14px.

---

## Screen 2 — Argument workspace (`Rhetor Chat - Compact.dc.html`)

**This is the approved version of the app screen** — the only one; earlier
drafts were discarded.

Full-viewport, `height: 100vh`, `overflow: hidden`. Set entirely in **Lora**
— the app deliberately shares the landing page's body serif; do not introduce
a sans-serif.

### Layout

```
┌──────────────┬────────────────────────────────────────────────┐
│ sidebar      │ header (52px)                                  │
│ 230px        ├─────────────────────┬───┬──────────────────────┤
│ (48px when   │ chat column         │ ▍ │ argument document    │
│  collapsed)  │  ├ messages (scroll)│ 5 │  (scroll)            │
│              │  └ composer         │px │                      │
└──────────────┴─────────────────────┴───┴──────────────────────┘
```

Outer shell: `display: grid; grid-template-columns: 230px minmax(0,1fr)`,
transition `.22s ease` on the columns so collapse animates.

**Critical layout constraint (this bit bit us repeatedly):** every grid item
that holds text needs `min-width: 0`, and the chat `<section>` additionally
needs an explicit `grid-template-columns: minmax(0,1fr)`. Without both, the
automatic minimum size resolves to min-content and the panel renders wider
than its track — text either paints under the neighbouring panel or clips.

### Sidebar

- Ground: `color-mix(in srgb, var(--color-accent-100) 10%, var(--color-bg))`.
- **Head bar:** 52px tall with a bottom hairline, so it aligns exactly with the
  main header. Contains the "Rhetor" wordmark (Lora 17px — same size as the
  motion title, deliberately not larger) and a collapse icon button
  (Lucide `panel-left`, 17px). When collapsed the rail is 48px, the wordmark
  is `display: none` and the button centres.
- 14px spacer, then a full-width outlined **"New Motion"** button (38px min
  height, 15px plus icon, `white-space: nowrap`). Its top edge sits level with
  the first line of both other columns — the columns use `padding-top: 14px`
  to match. Keep this alignment.
- **Motion list**, grouped under plain muted labels "Today" / "Earlier this
  week" (Lora 12.5px, 58% ink). Each row is a single line:
  `display: flex; gap: 10px; padding: 7px 10px` — title left (13.5px,
  ellipsised), meta right ("Stage 1", "Stage 3", "Closed" — 12px, 48% ink).
  Selected row: `color-mix(in srgb, var(--color-accent-200) 30%, transparent)`
  background only. **No left accent bar** — plain highlight.
- **Footer:** hairline top, "A. Mensah" and a "Settings" link, 13px.

### Header (52px)

Single row, `gap: 10px`, `padding: 0 16px`, `min-width: 0; overflow: hidden`,
bottom hairline. In order, left to right:

1. Motion title — "This House Would abolish private schools". Cormorant
   Garamond 17px **weight 400** (not bold), `flex: 0 1 auto; min-width: 0`,
   ellipsised.
2. Edit icon button immediately after it (Lucide `pencil`, 15px, 28px button).
   It must sit tight against the title — it edits the title.
3. Position — "Opening Opposition", 14px, 70% ink, `margin-right: auto`.
   Hidden below 900px viewport width.
4. Stage indicator, right-aligned: `Stage 1`  `2`  `3`, 8px gap, tabular
   figures. Active step = `--color-accent-800` at weight 600; completed = 72%
   ink; upcoming = 40% ink. **No underline and no pill** — it is a status
   readout, not a tab bar; an underline made testers read it as interactive.
5. Advance button — outlined, 32px min height, label "Advance to stage 2"
   (or "Finish and export" at stage 3) with a **20px** right-arrow (larger
   than the 13.5px label, deliberately). Label hidden below 1100px, arrow
   remains.

Stage is a component prop (1–3) and drives items 4 and 5.

### Chat column

- Messages scroll, `padding: 14px 20px 8px`, `gap: 26px`.
- **User message:** `align-self: flex-end`, max-width 70%, `--color-surface`
  with a 1px 15%-ink border, radius 8px, padding 13px 16px, 15.5px / 1.6.
  The border is what makes the two voices legible — an earlier tint-only
  version read as mush.
- **Rhetor message:** no surface at all. Full column width, a 13px 58%-ink
  "Rhetor" label above, then paragraphs at 15.5px / 1.68 with 12px gaps.
- **Composer:** one bordered box (1px 20% ink, radius 8px,
  `--color-surface`, padding `7px 8px 7px 14px`), no rule above it — the
  Gemini pattern. Single row: text input (`flex: 1 1 120px; min-width: 60px`,
  borderless, transparent, placeholder "Send message here…"), then a 2px gap,
  then the model switcher ("Sonnet 4.5" + 13px caret, ghost button), then a
  36px circular outlined send button with a 16px Lucide `send` glyph,
  optically centred. Nothing overlaps; the input yields width first.

### Argument document (right column)

One continuous document, NOT a card plus a list. Ground
`color-mix(in srgb, var(--color-surface) 55%, var(--color-bg))`. Padding
`14px 28px 28px`. No max-width — it takes the width it is given.

Per argument:
- **Heading:** "1. Abolition relocates selection from the fee to the postcode".
  Lora **21px weight 400** — plain, no bold, no accent colour.
- **Status line as prose:** "Provisionally your first argument. Not yet scored;
  the evidence stage is the weakest part." 15.5px / 1.7, 70% ink. Deliberately
  a sentence, not "1st · not scored · evidence" — the client wanted everything
  in this column to be plain, copy-pasteable text.
- **Body:** four paragraphs beginning `Claim.`, `Mechanism.`, `Evidence.`,
  `Impact.` — labels are unstyled text, not italic or bold. Ordinary document
  rhythm: `margin: 0 0 1em` per paragraph, NOT flex gaps. 15.5px / 1.72.
- **Actions:** plain text links, 14px — "Edit in place", "Ask for harder
  evidence", "Copy".
- Arguments separated by a hairline `<hr>` at 34px margins.
- Below-the-line arguments described in one prose sentence.

### Drag-to-resize

The 5px divider between the chat and document columns is draggable
(`cursor: col-resize`). Grid becomes
`minmax(0, {split}fr) 5px minmax(0, {1-split}fr)`; split defaults to 0.44 and
clamps to 0.25–0.70. Handle is `--color-divider`, tinting to
`--color-accent` while dragging, `transition: background .15s ease`. Uses
pointer events on window with `touch-action: none`, and sets
`document.body.style.cursor` for the duration of the drag.

---

## Interactions & behaviour

| Element | Behaviour |
| --- | --- |
| Hero verb | Rotates every 2800ms; slot width animates to each word (see above) |
| Sidebar collapse | 230px ↔ 48px, `.22s ease`; wordmark and list hidden when collapsed |
| Panel divider | Pointer drag, clamped 25–70%, accent tint while active |
| Stage indicator | Reflects current stage prop; not clickable |
| Advance button | Moves to next stage; becomes "Finish and export" at stage 3 |
| Responsive header | Position label drops < 900px; advance label drops < 1100px |
| All buttons | Accent-tint hover, one ramp step deeper on press |
| Focus | `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }` — never the browser default |

## State

Landing page: `verbIndex` (interval-driven), `slotWidth` (measured).

Workspace: `collapsed` (bool), `split` (0.25–0.70), `dragging` (bool),
`viewportWidth` (for the responsive header), `stage` (1–3, a prop).

Real data model, for whoever wires it up: a Motion has a title, a position
(one of Opening Government / Opening Opposition / Closing Government /
Closing Opposition), a stage (1–3) or closed, a message thread, and a bench of
Arguments. An Argument has a title, rank, score (null until stage 2), a
weakest-stage flag, and claim / mechanism / evidence / impact bodies.

## Assets

- `assets/` — the Roman forum photograph used in the landing hero. Client
  supplied; the originals they provided are in `uploads/`.
- Icons are **Lucide** (https://lucide.dev) throughout — `panel-left`,
  `pencil`, `plus`, `arrow-right`, `chevron-down`, `send`. Use the real
  Lucide package rather than the inline paths in the prototypes.
- Fonts are Google Fonts (Cormorant Garamond, Lora).

## Files in this bundle

| File | What it is |
| --- | --- |
| `Rhetor Forum.dc.html` | Landing page — build this |
| `Rhetor Chat - Compact.dc.html` | Argument workspace — build this |
| `Rhetor Logos.dc.html` | Eight logo explorations — reference only, none chosen |
| `shadcn/` | Token port: `globals.css`, `tailwind.config.ts`, `layout.tsx` (font loading), `button.tsx` (outlined-primary override), and its own README |
| `assets/`, `uploads/` | Imagery |
| `support.js` | Prototype runtime. **Do not port.** Needed only to open the HTML files in a browser. |

To view any prototype as intended, open the `.dc.html` file in a browser with
`support.js` and the `_ds/` folder alongside it. The `_ds/` folder is the
design system stylesheet the prototypes link; its values are already captured
in `shadcn/globals.css`, so port from there rather than from that folder.
