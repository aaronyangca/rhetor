"""Application configuration, read from the repo-root .env file."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# backend/app/config.py -> backend/app -> backend -> repo root
REPO_ROOT = Path(__file__).resolve().parents[2]

load_dotenv(REPO_ROOT / ".env")


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "")
    ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY", "")

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "postgresql+psycopg://rhetor:rhetor@localhost:5432/rhetor"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    # Session cookies. Lax blocks the cross-site POSTs that make session auth
    # forgeable; see require_json_content_type() in app/security.py for the
    # second half of the CSRF defence.
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "0") == "1"

    JSON_SORT_KEYS = False

    # Model choice is per motion and user-facing; see app/llm/catalogue.py.
    # These only override which catalogue entry is offered as the default, and
    # are ignored unless they name a model that provider actually offers.
    OPENAI_MODEL = os.environ.get("OPENAI_MODEL")
    ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL")
    GEMINI_MODEL = os.environ.get("GEMINI_MODEL")
    LLM_MAX_TOKENS = int(os.environ.get("LLM_MAX_TOKENS", "16000"))


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql+psycopg://rhetor:rhetor@localhost:5432/rhetor_test",
    )
    SECRET_KEY = "test-secret-key"
    # A valid Fernet key, fixed so tests are deterministic. Test-only — the
    # real one lives in .env and is never committed.
    ENCRYPTION_KEY = "yQddOv_PFYyg45z2fj70lP5a5jDmd_HP6E3BaS0C9CI="
