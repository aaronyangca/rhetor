# Rhetor Webapp — Build Progress

Tracks what's been built in `webapp/` against `../webapp-design.md` (product spec)
and `../ui-design.pen` (visual design). Update this file as work continues —
it's the handoff doc for picking the build back up.

## Scope decision

Built as **frontend only, mock data** — no backend, no database, no real auth,
no real LLM calls. Chosen explicitly over building the full Flask + Postgres
stack from `webapp-design.md`, to get the actual designed UI running and
clickable first. See "Not built yet" below for what a full-stack pass adds.

## Status: done

**Pages** (`src/pages/`)
- `Welcome.tsx` — landing page. Nav, hero copy, CTA. Background is a from-scratch
  CSS reconstruction of the .pen file's colonnade/basilica illustration
  (columns with capitals/shafts/bases, arched niches with torchlight glow,
  entablature + dentil frieze, upper gallery arcade) — not a pixel copy of the
  original ~300-node illustration, but a faithful structural match. See "Known
  gaps" below.
- `Auth.tsx` — Sign Up and Login, shared form panel (`mode="signup"|"login"` prop).
- `Workspace.tsx` — the core app screen: sidebar (motion list + new motion +
  account footer), top bar (title/rename, position badge, stage stepper,
  advance button), chat column, document column (renders the active stage's
  Markdown). Stage 3 adds an export bar (Markdown download, copy, print-to-PDF).
- `AccountSettings.tsx` — API key rows (OpenAI/Anthropic) + profile section.

**Shared components** (`src/components/`)
Logo (mark + wordmark), Button (primary/outline/ghost/accent variants),
Badge, FormInput, ChatBubble, SidebarMotionItem, Stepper, DocumentView
(Markdown renderer styled to match the design's jot-note field format).

**State** (`src/state/AppContext.tsx`)
Single React context holding auth, the motions list, and API key state.
No backend calls — everything is local `useState`. Covers:
- login/logout (any email "logs in", no real auth)
- creating a motion → assistant asks for motion text + BP position → first
  reply parses `OG|OO|CG|CO` out of the user's message and generates a title
  + Stage 1 doc
- sending a chat message → templated assistant reply + (for a brand-new
  motion) Stage 1 document generation
- advancing a stage → generates the next stage's document
- renaming a motion, connecting a mock API key

**Mock content** (`src/lib/mockData.ts`)
Four seeded sample motions with hand-written Stage 1/2/3 documents using the
real Claim/Mechanism/Evidence/Second-Order Effect/Impact field structure from
`../idea.md` (not placeholder lorem ipsum) — plus generic templated generators
for motions/stages the user creates during a session.

**Design tokens** (`src/index.css`)
Tailwind v4 `@theme` block with the color/font values read directly out of
the .pen file's variable definitions (primary navy `#2C3968`, accent
terracotta `#C1622B`, Inter + Source Serif 4 + Fraunces + Cinzel, etc).

**Verified**
- All routes manually clicked through and screenshotted against the .pen
  design — Sign Up, Account Settings, and the Motion Workspace (all 3 stages)
  are visually close matches.
- End-to-end flow tested live: create motion → send message → advance stage →
  stage 3 export.
- `npx tsc -b` and `npm run build` both pass clean.
- Fixed one real bug found during testing: duplicate React key in
  `AppContext.createMotion` (id counter was read before being incremented).

**Process note**: for the data-dense screens (Motion Workspace, Account
Settings, Sign Up) building from the full `export_html` markup + copying
exact strings worked well and matched closely on the first pass. The Welcome
page's illustration was different — it's ~300 decorative nodes in one frame,
and skimming a screenshot instead of reading the full export line-by-line
caused an entire layer of props (torches, lamps, stairs) to be missed
silently, since a screenshot glance doesn't reveal what's *absent*, only
that something plausible-looking is present. For any illustration-heavy
node going forward: read the complete `export_html` dump for that node
top to bottom before building, not just enough of it to get oriented.

## Known gaps

- **Welcome page background**: now built from `.pen`'s exact node data rather
  than approximated. Two follow-up passes on top of the first (which had the
  right elements but wrong shapes/alignment for several of them):
  1. Pulled every rectangle's precise x/y/w/h/fill directly via
     `mcp__pencil__execute` + `Get` (not just the HTML export) — 212 nodes —
     and confirmed the CSS `border-radius: 50% 50% 0 0 / 100% 100% 0 0`
     semicircle trick used for the arches is mathematically exact, not an
     approximation.
  2. Pulled the literal SVG path `d` strings (`includePathGeometry: true`)
     for every organic/curved shape and render those verbatim inside inline
     `<svg viewBox="0 0 1440 900">` layers instead of faking them with
     rounded divs — this is what actually fixed the flame and lamp-bowl
     shapes, which read as generic pill/capsule blobs before. Also caught
     and fixed a real ~10px brazier misalignment (was eyeballed at
     cx=1027/1337, real centers are 1018/1334) and added two missing pieces
     (`VaultShadow` ceiling gradient, `Imposts` arch-spring blocks).
  3. Found and fixed a real math bug in the shared `Arch()` helper (used for
     the upper gallery, the clerestory windows, and the big niches): the
     semicircular cap's bounding box used `height: r * 2` when a semicircle's
     height is its radius `r`, not its diameter. Paired with the
     `border-radius: 50% 50% 0 0 / 100% 100% 0 0` trick, mismatched
     horizontal/vertical radii produced an elongated, pointed dome instead of
     a true semicircle — most visible on the small upper-gallery and
     clerestory arches, which is exactly what got flagged. Also switched
     `LightShafts` from a flat rectangle to the source's actual trapezoid
     path (66 wide at the sill, 74 by the floor) so the beams sit flush under
     their windows instead of just approximately under them.
  4. That fix in isolation made the arches *shorter*, not longer, because of
     a second, more fundamental error underneath it: I'd been misreading the
     source path syntax itself. `l0,-59 a35,35 0 0 1 70,0` means "draw the
     59px straight side, *then* the 35px-radius arc" — the arc adds a full
     radius of height *on top of* the straight run, it doesn't eat into it.
     I'd been treating the straight-run's end (the spring line) as if it
     were the shape's true top, so every arch in the scene — gallery,
     clerestory, niches — was rendered exactly one radius short. Fixed by
     anchoring the semicircular cap at `y - r` instead of `y`, so the
     straight sides keep their real length and the dome sits on top of them
     instead of overlapping the top portion of them.
  Now includes: colonnade with fluted capitals/shafts/bases, molded arch
  niches (rim/archivolt/void rings + floor-lit gradient + sill ledges),
  entablature + dentil frieze, 13-arch upper gallery with piers/keystones,
  clerestory windows (dim + lit), 3-tier stone steps, 3 hanging oil lamps
  with exact flame/bowl geometry, 2 braziers with exact flame geometry and
  rising embers, rim-light strips, and window light shafts. Still not a
  pixel-identical port of literally every one of the ~300 source nodes
  (e.g. individual column flute counts near canvas edges are rounded to a
  uniform 4), but every named element group and every organic curve now
  matches the source geometry rather than being redrawn by eye.
  **Lesson for next time**: for illustration-heavy nodes, skip the
  HTML-export-and-read-it-as-prose step entirely — go straight to
  `Get(nodeId, visitor, {includePathGeometry: true})` for structured,
  authoritative x/y/w/h/fill/path data. That's what should have happened
  from the start of this file.
- Markdown→PDF export just calls `window.print()` (no real server-side PDF
  rendering, since there's no server).
- "Change Password" and "Replace [API key]" buttons in Account Settings are
  inert (no modal/flow wired up).
- New-motion position parsing is a naive regex (`\b(OG|OO|CG|CO)\b`) — no
  validation or error state if the user's first message doesn't include one.

## Not built yet (out of scope for this pass)

Everything in `../webapp-design.md`'s Architecture/Data Model/AI Agent Design
sections:
- Flask backend, PostgreSQL, SQLAlchemy models
- Real email/password auth + session handling
- Encrypted API key storage (Fernet)
- Real OpenAI/Anthropic calls implementing the Stage 1→2→3 pipeline from
  `../idea.md`, including hosted web search for Stage 2 Evidence
- Flask-Admin backend (user list, motion list, chat/document detail view)
- Server-rendered Markdown→PDF export
- Deployment (Heroku/Render/DigitalOcean — still an open question in the
  design doc itself)

## Running it

```
cd webapp
npm install
npm run dev      # http://localhost:5173 (or next free port)
npm run build    # production build + typecheck
```

## Next steps (suggested order)

1. Decide on backend framework/hosting (still an open question in
   `webapp-design.md` itself).
2. Stand up the Flask app + Postgres models from the Data Model section.
3. Replace `AppContext`'s local state with real API calls, keeping the same
   context shape so components don't need to change.
4. Wire real BYOK key storage + the `generate(provider, system_prompt,
   history, schema) -> {reply, document}` adapter described in the design doc.
5. Build the Flask-Admin panel.
