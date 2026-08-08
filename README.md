# Rhetor

Rhetor is a design project for generating British Parliamentary (BP) debate arguments with an AI pipeline. It works in three sequential stages — ideation, development + intrinsic scoring, and holistic contextual ranking — and evaluates every argument against an "Ordinary Intelligent Voter" standard: no jargon, no unexplained special knowledge, just claims a reasonably informed person would find plausible and compelling.

## Contents

- [`idea.md`](idea.md) — the main design document: architecture, evaluation standard, argument format, and stage-by-stage rules.
- [`rhetor-run/`](rhetor-run) — full sample runs of the pipeline on real motions (e.g. AI breakthroughs, GLP-1 drugs, neurodivergence), showing generated arguments end to end.
- [`rhetor-run-notes/`](rhetor-run-notes) — working notes and observations from specific generation runs.
- [`webapp-design.md`](webapp-design.md) — design document for the Rhetor web application.
- [`backend/`](backend) — the Flask API, admin panel, and AI agent core ([notes](backend/README.md)).
- [`webapp/`](webapp) — the React frontend (still on mock data; see `webapp/progress.md`).

## Local development

Requires Docker Desktop (`brew install --cask docker`) or another
Docker-compatible runtime, plus Node and Python 3.12+.

```bash
make setup         # .env, backend venv, frontend dependencies
make secrets       # paste the generated keys into .env
make db-up         # start Postgres
make api-migrate   # create the tables
make dev           # API on :5001, frontend on :5173
```

`make` on its own lists every target. The most-used ones:

| Command | Purpose |
| --- | --- |
| `make dev` | Database + API + frontend, all at once |
| `make api-dev` / `make web-dev` | Run one side on its own |
| `make api-test` | Backend test suite (against `rhetor_test`) |
| `make api-migrate` | Apply migrations |
| `make api-revision m="..."` | Autogenerate a migration after a model change |
| `make api-admin email=you@x.com` | Create an admin account for `/admin` |
| `make db-up` / `make db-stop` | Start / stop Postgres (data preserved) |
| `make db-shell` | psql shell on the development database |
| `make db-reset` | **Delete all data** and re-run the init script (prompts first) |
| `make db-dump` | Dump the development database into `backups/` |
| `make adminer` | Browser DB client at http://localhost:8080 |

In development the two servers run separately and Vite proxies `/api` and
`/admin` to Flask, so the browser sees a single origin and session cookies work
without CORS. In production Flask serves the built React app itself.

### Database details

Postgres 17 runs in Docker via [`docker-compose.yml`](docker-compose.yml), with
two databases — `rhetor` for development and `rhetor_test` for the test suite —
both with the `citext` and `pgcrypto` extensions enabled. Connection strings for
each are in `.env`.

Data lives in the `rhetor_pgdata` named volume, so it survives `stop`, `down`,
and container upgrades — only `make db-reset` clears it. The init script in
[`docker/postgres/init/`](docker/postgres/init) runs only against an empty
volume, so edits to it take effect after a reset.

If port 5432 is already taken (e.g. by a Homebrew Postgres), set `POSTGRES_PORT`
in `.env` to something free and update `DATABASE_URL`/`TEST_DATABASE_URL` to match.

## Status

This is an active work-in-progress design and prompting project — expect the documents to change as the argument format and scoring criteria are refined.
