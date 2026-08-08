# Rhetor Webapp — Build Progress

Tracks what's been built in `webapp/` against `../webapp-design.md` (product spec)
and `../ui-design.pen` (visual design). Update this file as work continues —
it's the handoff doc for picking the build back up.

## This session (Aug 2026) — full stack, end to end

The project went from "designed UI on mock data" to a running full-stack app.
In order:

1. **Local Postgres in Docker** — `../docker-compose.yml` (Postgres 17-alpine,
   healthcheck, named volume) plus `../docker/postgres/init/01-init.sh`, which
   creates a separate `rhetor_test` database and enables `citext`/`pgcrypto` on
   both. Config lives in `../.env` (gitignored; `.env.example` is the template).
2. **A root `Makefile`** — one entry point for everything: `make dev` runs
   database + API + frontend together, plus `db-*`, `api-*`, and `web-*`
   targets. `make` alone lists them.
3. **The Flask backend** — `../backend`, built from scratch against
   `../webapp-design.md`. Models, migrations, session auth, Fernet-encrypted
   BYOK keys, the motions loop, Flask-Admin, and the AI agent core. See
   [`../backend/README.md`](../backend/README.md) for its architecture; it is
   the authoritative doc for that side.
4. **Google Gemini as a third provider** — alongside OpenAI and Anthropic.
5. **This frontend, wired to that backend** — mock data deleted entirely.
6. **User-facing model choice** — per motion, switchable, with free-tier-safe
   defaults.

Two design-doc decisions were overridden along the way, and
`../webapp-design.md` has been updated to record both:

- **"Model choice is not user-exposed in v1"** — reversed. Gemini's Pro models
  are effectively unusable on a free API key, so a user holding one had no
  working option at all under a fixed-model design. Model is now chosen per
  motion from a catalogue, and every provider's default is reachable on a free
  key (there's a test pinning that).
- **"BYOK support for OpenAI and Anthropic"** — widened to include Gemini.

## Scope decision

Originally built as **frontend only, mock data**, to get the designed UI
running and clickable before standing up a backend. That mock layer is now
**gone** — `src/lib/mockData.ts` was deleted and every screen talks to the
Flask API in `../backend`. See "Now wired to the backend" below.

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

`Stepper` gained an optional `onSelect` + `isAvailable`, which is how "return
to an earlier stage" from the design doc is actually reached — stages with a
document are clickable, and advancing stays the explicit button.

**State** (`src/state/AppContext.tsx`)
Single React context over the API client in `src/lib/api.ts`. Holds the
session, the motion summary list, the one fully-loaded active motion, and the
API key state — plus `sending` / `advancing` / `loadingMotion` flags and a
shared `error` string. No mock data anywhere.

**API client** (`src/lib/api.ts`)
Typed wrapper over the `/api` endpoints. Session-cookie auth, so every call
sends credentials and there are no tokens to manage. Throws `ApiError` carrying
the backend's `{code, message}` so the UI can render the server's own wording.
`make api-routes` prints the live route list to check against it.

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

## Known gaps (design fidelity vs the .pen file)

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
  5. A follow-up pass specifically audited the **logo and nav/hero text**
     against the source (`Get("oNfWU", {depth: 10})` for the Logo/Mark
     component, `Get(..., n => n.name === "NavBar" / "CenterLayer" / ...)`
     for the rest). Confirmed the logo is genuinely built from two
     overlapping text glyphs (Fraunces 900 italic, rotated -6°) with no
     vector/image asset behind it anywhere in the file — so there was
     nothing to swap in, only positioning to correct. Found and fixed: the
     glyph offsets in `LogoMark` were hand-approximated and wrong (back
     glyph should sit at 15.7% from the left, not 5%; front glyph at +4.8%,
     not -2% — it was offset in the wrong direction entirely); the nav's
     logo instance should render at 44px, not 40px; an erroneous
     `letterSpacing: 1px` on the nav wordmark's outer span that isn't in the
     source (only "HETOR" itself has tracking, 2.2px); the nav Lockup gap
     should be 13px not 12px; the nav bar should be a fixed 88px with no
     vertical padding rather than padding that only approximately summed to
     88px; the "Start Your Case" button label should be 15px, one size up
     from the shared Button component's 14px default; and an extra
     `pb-16` on the hero container that wasn't in the source and skewed
     vertical centering off from true middle.
- Markdown→PDF export still calls `window.print()` — see "Known gaps in the
  wiring" below; the backend returns 501 for `format=pdf`.

(The other gaps listed here previously — inert Account Settings buttons, and
regex parsing of the position out of the first message — are resolved. Key
entry is a real form now, and the position and motion text come back from the
model as structured output rather than being parsed client-side.)

## Now wired to the backend

Every screen calls the Flask API in `../backend`; there is no local mock state
left.

- **Auth** — real signup/login/logout against `/api/auth/*`. `App.tsx` gates
  `/app` and `/app/settings` behind a session check, and waits for that check
  before deciding, so a reload doesn't flash the login page at a signed-in
  user. Server errors (duplicate email, bad password) render inline.
- **API keys** — real encrypted storage via `/api/account/keys`. Each row has
  an inline key form with Save / Cancel / Remove. The masked value shown is
  the server's, not a local guess.
- **Motions** — list, create, rename, delete, and per-stage chat all hit the
  API. The sidebar holds summaries; the open motion is fetched in full.
- **Provider and model choice** — a motion is pinned to one provider and the
  backend rejects any the user has no key for, so "New Motion" opens a menu
  grouped by connected provider, listing each of that provider's models with a
  one-line blurb (and pointing at settings when no keys are connected). The
  top bar has a switcher for changing model on an open motion; the provider
  stays fixed. Models a free API key cannot reach carry a `PAID KEY` badge
  rather than being hidden — the user may have a paid one. The catalogue comes
  from `GET /api/account/models`.
- **Stage navigation** — the stepper is clickable for stages that already have
  a document, which is how "return to an earlier stage" from the design doc is
  reached. Advancing is still the explicit button.
- **Export** — Markdown downloads from `/api/motions/<id>/export`, so the
  filename and content come from the stored document.

## Known gaps in the wiring

- **Streaming**: built. The chat reply and then the stage document fill in as
  they are written, via SSE. Searching stages (Stage 2) still arrive in one
  piece — neither Gemini nor Anthropic can stream a grounded turn — and fall
  back to the buffered endpoint with the "Rhetor is working…" placeholder.
- **PDF export** still calls `window.print()` — the backend returns 501 for
  `format=pdf`.
- **Change password** has no endpoint, so that row was replaced with Log Out
  rather than left as an inert button.
- **No optimistic assistant reply**: the user's own message appears instantly
  and is rolled back if the call fails (matching the backend, which discards
  the turn), but there's no partial-response affordance.

## Not built yet

- Deployment (Heroku/Render/DigitalOcean — still open in the design doc)
- Frontend tests — there are none; the backend suite covers the API side
- Rate limiting / abuse guardrails

## Running it

From the repo root:

```
make setup         # .env, backend venv, frontend deps
make secrets       # paste the generated keys into .env
make db-up         # Postgres in Docker
make api-migrate   # create the tables
make dev           # API on :5001, frontend on :5173
```

`make dev` runs both servers; Vite proxies `/api` to Flask so the browser sees
one origin. `make web-dev` alone still works but the app will fail every call
without the API running.

## Next steps (suggested order)

1. Run the pipeline once with a real provider key — the provider adapters have
   never made a *successful* live call. The error path is proven (a real
   OpenAI key rejection flowed all the way to the UI banner and rolled back
   the optimistic message), but no generation has ever come back.
2. Eyeball the two model dropdowns. They were verified through the API and
   type-check clean, but the browser session dropped before they could be
   seen rendered.
3. Server-side Markdown→PDF export.
4. Frontend tests around `AppContext` (stage invalidation, optimistic
   rollback, model switching, streaming fallback) — the logic most likely to
   regress.
5. Deployment.
