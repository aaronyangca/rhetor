# Rhetor backend

Flask API + Flask-Admin, built against [`../webapp-design.md`](../webapp-design.md).
One process serves three namespaces, split because they authorize differently:

| Namespace | What | Auth |
| --- | --- | --- |
| `/api/*` | JSON API for the React app | logged-in user |
| `/admin/*` | Flask-Admin, server-rendered | `is_admin` |
| `/*` | the built React app (`webapp/dist`) | none, to load the shell |

Run everything with `make dev` from the repo root. See the root README for setup.

## Layout

```
app/
  __init__.py      app factory, login wiring, SPA fallback, CLI commands
  config.py        Config / TestConfig, read from the repo-root .env
  models.py        User, Motion, ChatMessage
  crypto.py        Fernet encrypt/decrypt/mask for BYOK provider keys
  security.py      JSON content-type guard, body parsing helpers
  errors.py        ApiError + JSON error handlers for /api
  serializers.py   model -> camelCase JSON, matching webapp/src/lib/types.ts
  admin.py         Flask-Admin views
  blueprints/      auth, account, motions
  llm/             the AI Agent Core (see below)
  prompts/         generated stage prompts — do not edit by hand
  templates/       admin/motion_detail.html
migrations/        Alembic, via Flask-Migrate
scripts/           split_prompts.py
tests/
```

## The AI Agent Core

No orchestration framework: `llm/__init__.py` exposes one adapter,
`generate(provider, model, system, history, schema) -> Generation`, over the
three provider SDKs, plus `stream_generation(...)` yielding the same result
incrementally. Conversation history lives in the `chat_messages` table and is
converted to provider format immediately before the call.

Two entry points sit above it:

- `run_turn(motion, stage)` — a normal chat turn. Uses `FIRST_TURN_SCHEMA` on a
  motion's first exchange, so the same call that produces the opening Stage 1
  document also returns the title, motion text, and position.
- `run_advance(motion, to_stage)` — generates the next stage's opening document
  from the finalized previous one, including any chat history that already
  exists for the target stage.

### Models

`llm/catalogue.py` owns the models a user can pick from — three or four per
provider, spanning a frontier tier, a balanced default, and a cheap/fast tier.
Choice is per motion, switchable mid-motion, and validated against the
provider's own list (`unknown_model` on a mismatch). `Motion.model` is nullable
so a retired id falls back to the default rather than stranding the motion.

Every default is reachable on a **free** API key — there's a test pinning that.
Gemini's Pro models are not, which is why the Gemini default is Flash. OpenRouter
bills every named route against credit, but its `openrouter/free` option routes
among no-cost `:free` models; the picker tags whichever tier is the minority in a
provider's list — the lone free route on OpenRouter, the lone paid one on Gemini.
`OPENAI_MODEL` / `ANTHROPIC_MODEL` / `GEMINI_MODEL` / `OPENROUTER_MODEL` can
override a default, but are ignored unless they name a model in the catalogue.

### Providers

Three are supported, one key per provider per account, chosen per motion.
Structured output and web search work differently in each:

| Provider | Structured output | Web search |
| --- | --- | --- |
| OpenAI | Responses API, strict `json_schema` | hosted `web_search` tool |
| Anthropic | a `submit_turn` tool whose input schema *is* the contract | hosted `web_search_20250305` |
| Gemini | `response_json_schema` + JSON mime type | Google Search grounding, **separate call** |

Gemini is the awkward one: its JSON-schema mode and the Google Search tool are
mutually exclusive, so a request cannot ask for both. `gemini_provider.py`
therefore splits searching stages into two calls — one grounded and free-form to
research, then one schema-constrained to write the document from those notes.
Stages without search stay a single call. Its schema also needs
`additionalProperties` stripped, which Gemini's schema subset rejects.

Web search is enabled for Stage 2 only, where the Evidence field needs real
facts. Stage 1 is ideation and Stage 3 ranks what already exists.

**Live coverage is partial.** Gemini's buffered path has produced real Stage 1
documents. Everything else is stubbed: no OpenAI or Anthropic call has
succeeded live (only their key-rejection paths, which do work end to end), and
no *streaming* call has run against any provider. The pure parts — the stream
parser, Gemini schema cleaning, role mapping — have real tests.

## Streaming

`/messages/stream` and `/advance/stream` return Server-Sent Events: `delta`
frames carrying `{field, text}`, then one `done` frame with the saved motion,
or an `error` frame. The buffered endpoints remain and share all persistence
logic through `_apply_turn`, so the two cannot drift.

`llm/streaming.py` is what makes this work with structured output. The provider
streams a JSON object, and `StructuredStreamParser` walks that text as it
arrives, emitting the decoded contents of `reply` and `document` without
waiting for the object to close — a real JSON parser cannot emit anything until
its input is complete, which is the one thing this needs to avoid.

Two constraints worth knowing:

- **Searching stages do not stream** (`409 no_streaming`, client falls back).
  Gemini runs research as a separate ungrounded pass, and Anthropic cannot
  force the submit tool while search is available; both would sit silent
  through the research leg anyway.
- **The stream body re-fetches everything.** It runs after the view returns, by
  which point Flask-SQLAlchemy has torn the session down — an ORM object
  carried across that boundary is detached and raises on first attribute
  access. The user's message is *committed* before the stream opens for the
  same reason, and deleted again if the turn fails.

## Prompts

`idea.md` is split into `app/prompts/{shared,stage1,stage2,stage3}.md` by
`scripts/split_prompts.py`, keyed off its `##` headings. A turn sends `shared`
plus its own stage: ~40k characters at Stage 1, ~17k at Stage 3.

**The split is lossless, and that is the only rule it has.** Only the three
stage sections are named in the script; everything else in `idea.md` goes to
`shared.md` in document order, so a new section added to `idea.md` is carried
without touching this code. The script fails if any heading reaches no file,
and `tests/test_prompts.py` re-checks it line by line.

An earlier version listed the shared sections explicitly and dropped the rest
as "human-facing". That withheld the architecture summary — the one place
`idea.md` says *"No filtering or in-depth development... Prioritize numbers
over quality"* — so Stage 1 was being asked to follow a document it had never
been shown in full, and it over-developed a small pool of seeds instead of
generating a wide rough one. Do not reintroduce an allowlist here.

Regenerate after editing `idea.md`:

```bash
make api-prompts
```

The generated files are committed so deploys don't depend on the script.

## Conventions

- **Errors**: raise `ApiError(message, status)`; handlers render it as
  `{"error": {"code", "message"}}`. Anything under `/api` always answers JSON.
- **Auth**: session cookies via Flask-Login. CSRF defence is `SameSite=Lax`
  plus a required `application/json` content type on mutations with a body.
- **Ownership**: someone else's motion returns 404, not 403, so ids aren't
  probeable.
- **Keys**: encrypted with Fernet, decrypted only in-memory at call time. The
  display form (`sk-...a8f2`) is stored separately so the settings page never
  decrypts just to render. Format validation is a prefix check only — a
  provider may have several live formats (Google issues both `AIza...` and the
  newer `AQ...`), so `KEY_PREFIXES` maps each provider to a tuple.

## Tests

```bash
make api-test
```

Runs against the `rhetor_test` database from `docker-compose.yml`. The provider
call is stubbed, so the suite covers Rhetor's own logic — stage progression,
invalidation, ownership, key handling — not model output.

Note the `app` fixture deliberately does not hold an app context open for the
session: Flask reuses an already-pushed context for same-app requests, which
lets `g` (and Flask-Login's cached `current_user`) leak between tests.

## Not built yet

- **PDF export**. `/api/motions/<id>/export?format=pdf` returns 501; Markdown
  export works.
- **Rate limiting**, per the open question in the design doc.
- **Streaming for searching stages**. Stage 2 returns `409 no_streaming` and
  the client falls back; making it stream would mean surfacing research
  progress as its own event type.
