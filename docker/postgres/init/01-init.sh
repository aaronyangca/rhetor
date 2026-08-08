#!/bin/bash
# Runs once, on first initialization of an empty data volume.
# To re-run after editing this file: docker compose down -v && docker compose up -d
#
# A shell script rather than plain .sql because the entrypoint runs .sql files
# through psql with no variables bound — this way the test database name can
# come from the environment.
set -euo pipefail

TEST_DB="${POSTGRES_TEST_DB:-rhetor_test}"

# Extensions on the development database.
#   citext   — case-insensitive email uniqueness without lower() indexes
#   pgcrypto — gen_random_uuid(), in case ids move to UUIDs later
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-'SQL'
	CREATE EXTENSION IF NOT EXISTS citext;
	CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL

# A separate database for the test suite, so tests can drop and recreate the
# schema without touching development data.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
	-c "CREATE DATABASE \"$TEST_DB\" OWNER \"$POSTGRES_USER\""

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$TEST_DB" <<-'SQL'
	CREATE EXTENSION IF NOT EXISTS citext;
	CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL

echo "init: created database '$TEST_DB' and enabled citext/pgcrypto on both databases"
