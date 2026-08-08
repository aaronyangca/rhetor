# Rhetor — developer commands. Run `make` or `make help` for the list.

DC      := docker compose
WEB     := webapp
API     := backend
VENV    := $(API)/.venv
PY      := $(VENV)/bin/python
FLASK   := $(VENV)/bin/flask --app wsgi
API_PORT ?= 5001
DB_USER := $(shell grep -E '^POSTGRES_USER=' .env 2>/dev/null | cut -d= -f2)
DB_USER := $(if $(DB_USER),$(DB_USER),rhetor)
DB_NAME := $(shell grep -E '^POSTGRES_DB=' .env 2>/dev/null | cut -d= -f2)
DB_NAME := $(if $(DB_NAME),$(DB_NAME),rhetor)
DB_TEST := $(shell grep -E '^POSTGRES_TEST_DB=' .env 2>/dev/null | cut -d= -f2)
DB_TEST := $(if $(DB_TEST),$(DB_TEST),rhetor_test)

.DEFAULT_GOAL := help

# ---------------------------------------------------------------- help ------

.PHONY: help
help: ## Show this help
	@echo ""
	@echo "  Rhetor — make targets"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} \
		/^# -+ .* -+$$/ { gsub(/^# -+ | -+$$/, "", $$0); printf "\n  \033[1m%s\033[0m\n", $$0; next } \
		/^[a-zA-Z0-9_-]+:.*?## / { printf "    \033[36m%-16s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)
	@echo ""

# --------------------------------------------------------------- setup ------

.PHONY: setup
setup: .env api-install web-install ## First-time setup: .env, backend venv, frontend deps
	@echo ""
	@echo "Setup complete. Next:"
	@echo "  make secrets     # paste the values into .env"
	@echo "  make db-up       # start Postgres"
	@echo "  make api-migrate # create the tables"
	@echo "  make dev         # run it"

.env: .env.example
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env from .env.example — fill in ENCRYPTION_KEY and SECRET_KEY."; \
	else \
		touch .env; \
	fi

.PHONY: secrets
secrets: ## Print freshly generated ENCRYPTION_KEY and SECRET_KEY values
	@python3 -c "from cryptography.fernet import Fernet; print('ENCRYPTION_KEY=' + Fernet.generate_key().decode())" \
		2>/dev/null || echo "ENCRYPTION_KEY=  (needs: pip install cryptography)"
	@python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"

# ----------------------------------------------------------------- dev ------

.PHONY: dev
dev: db-up ## Run everything: database, API, and frontend dev server
	@echo "API      http://localhost:$(API_PORT)"
	@echo "Frontend http://localhost:5173   (proxies /api to the API)"
	@echo "Ctrl-C stops both servers."
	@echo ""
	@trap 'kill 0' EXIT INT TERM; \
		( cd $(API) && ../$(VENV)/bin/flask --app wsgi run --debug --port $(API_PORT) ) & \
		( cd $(WEB) && npm run dev ) & \
		wait

.PHONY: stop
stop: db-stop ## Stop the database (the dev servers stop with Ctrl-C)

# -------------------------------------------------------------- database ----

.PHONY: db-up
db-up: .env ## Start Postgres in the background and wait until it is ready
	@$(DC) up -d postgres
	@$(MAKE) --no-print-directory db-wait

.PHONY: db-wait
db-wait: ## Block until Postgres accepts connections
	@printf "Waiting for Postgres"
	@for i in $$(seq 1 30); do \
		if $(DC) exec -T postgres pg_isready -U $(DB_USER) -d $(DB_NAME) >/dev/null 2>&1; then \
			echo " ready."; exit 0; \
		fi; \
		printf "."; sleep 1; \
	done; \
	echo " timed out after 30s."; \
	echo "Check the log with: make db-logs"; \
	exit 1

.PHONY: db-stop
db-stop: ## Stop Postgres, keeping all data
	@$(DC) stop

.PHONY: db-down
db-down: ## Stop and remove the containers, keeping the data volume
	@$(DC) down

.PHONY: db-reset
db-reset: ## DESTRUCTIVE — delete all data and re-run the init script
	@printf "This deletes the rhetor_pgdata volume and ALL local data. Type 'yes' to confirm: "; \
	read confirm; \
	if [ "$$confirm" = "yes" ]; then \
		$(DC) down -v && $(MAKE) --no-print-directory db-up; \
	else \
		echo "Aborted."; \
	fi

.PHONY: db-status
db-status: ## Show container status and health
	@$(DC) ps

.PHONY: db-logs
db-logs: ## Tail the Postgres log
	@$(DC) logs -f postgres

.PHONY: db-shell
db-shell: ## Open a psql shell on the development database
	@$(DC) exec postgres psql -U $(DB_USER) -d $(DB_NAME)

.PHONY: db-shell-test
db-shell-test: ## Open a psql shell on the test database
	@$(DC) exec postgres psql -U $(DB_USER) -d $(DB_TEST)

.PHONY: db-dump
db-dump: ## Dump the development database to backups/<timestamp>.sql
	@mkdir -p backups
	@f=backups/rhetor-$$(date +%Y%m%d-%H%M%S).sql; \
	$(DC) exec -T postgres pg_dump -U $(DB_USER) -d $(DB_NAME) > $$f && echo "Wrote $$f"

.PHONY: adminer
adminer: .env ## Start Adminer (browser DB client) at http://localhost:8080
	@$(DC) --profile tools up -d
	@echo "Adminer: http://localhost:8080  (server: postgres, user: $(DB_USER), db: $(DB_NAME))"

# --------------------------------------------------------------- backend ----

.PHONY: api-install
api-install: ## Create the backend virtualenv and install dependencies
	@test -d $(VENV) || python3 -m venv $(VENV)
	@$(VENV)/bin/pip -q install --upgrade pip
	@$(VENV)/bin/pip -q install -r $(API)/requirements.txt
	@echo "Backend dependencies installed in $(VENV)"

.PHONY: api-dev
api-dev: db-up ## Run the Flask API alone, with the reloader
	@cd $(API) && ../$(VENV)/bin/flask --app wsgi run --debug --port $(API_PORT)

.PHONY: api-migrate
api-migrate: db-up ## Apply database migrations
	@cd $(API) && ../$(VENV)/bin/flask --app wsgi db upgrade

.PHONY: api-revision
api-revision: db-up ## Autogenerate a migration — make api-revision m="add x"
	@test -n "$(m)" || (echo 'Usage: make api-revision m="what changed"'; exit 1)
	@cd $(API) && ../$(VENV)/bin/flask --app wsgi db migrate -m "$(m)"
	@echo "Review the generated file in $(API)/migrations/versions/ before applying."

.PHONY: api-downgrade
api-downgrade: ## Roll back the most recent migration
	@cd $(API) && ../$(VENV)/bin/flask --app wsgi db downgrade

.PHONY: api-shell
api-shell: ## Python shell with the app context loaded
	@cd $(API) && ../$(VENV)/bin/flask --app wsgi shell

.PHONY: api-routes
api-routes: ## List the API routes
	@cd $(API) && ../$(VENV)/bin/flask --app wsgi routes-json

.PHONY: api-admin
api-admin: ## Create or promote an admin account — make api-admin email=you@x.com
	@test -n "$(email)" || (echo 'Usage: make api-admin email=you@example.com'; exit 1)
	@cd $(API) && ../$(VENV)/bin/flask --app wsgi create-admin "$(email)"

.PHONY: api-repair
api-repair: db-up ## Repair stored documents whose newlines were double-escaped
	@cd $(API) && ../$(VENV)/bin/flask --app wsgi repair-escapes

.PHONY: api-prompts
api-prompts: ## Regenerate the stage prompt files from idea.md
	@$(PY) $(API)/scripts/split_prompts.py

.PHONY: api-test
api-test: db-up ## Run the backend test suite against rhetor_test
	@cd $(API) && ../$(VENV)/bin/python -m pytest

# -------------------------------------------------------------- frontend ----

.PHONY: web-install
web-install: ## Install frontend dependencies
	@cd $(WEB) && npm install

.PHONY: web-dev
web-dev: ## Run the Vite dev server
	@cd $(WEB) && npm run dev

.PHONY: web-build
web-build: ## Type-check and build the frontend for production
	@cd $(WEB) && npm run build

.PHONY: web-preview
web-preview: ## Serve the production build locally
	@cd $(WEB) && npm run preview

.PHONY: web-lint
web-lint: ## Lint the frontend
	@cd $(WEB) && npm run lint

# --------------------------------------------------------------- checks -----

.PHONY: lint
lint: web-lint ## Run all linters

.PHONY: test
test: api-test ## Run all test suites (the frontend has none yet)

.PHONY: clean
clean: ## Remove build output, node_modules, and the backend venv
	@rm -rf $(WEB)/dist $(WEB)/node_modules $(VENV)
	@find $(API) -name __pycache__ -type d -prune -exec rm -rf {} +
	@echo "Cleaned build output, dependencies, and the virtualenv."
