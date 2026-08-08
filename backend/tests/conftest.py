"""Test fixtures. Runs against the rhetor_test database from docker-compose."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
from sqlalchemy import select

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app  # noqa: E402
from app.config import TestConfig  # noqa: E402
from app.extensions import db as _db  # noqa: E402
from app.models import PROVIDERS, User  # noqa: E402


@pytest.fixture(scope="session")
def app():
    """The application under test.

    Deliberately does *not* hold an app context open for the session: Flask
    reuses an already-pushed context for same-app requests, which would let
    `g` — and with it Flask-Login's cached current_user — leak between
    requests and between tests.
    """
    application = create_app(TestConfig)

    with application.app_context():
        _db.drop_all()
        _db.create_all()

    yield application

    with application.app_context():
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(autouse=True)
def clean_tables(app):
    """Each test starts from an empty database."""
    yield
    with app.app_context():
        _db.session.rollback()
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()
        _db.session.remove()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def credentials():
    return {"email": "debater@example.com", "password": "correct horse battery"}


@pytest.fixture
def auth_client(client, credentials):
    """A client with a signed-in user."""
    response = client.post("/api/auth/signup", json=credentials)
    assert response.status_code == 201, response.get_json()
    return client


@pytest.fixture
def stored_user(app, credentials):
    """Read the signed-in user's row straight from the database.

    Returns a snapshot dict rather than an ORM object, so tests never touch a
    detached instance outside an app context.
    """

    def _load() -> dict:
        with app.app_context():
            user = _db.session.scalar(
                select(User).where(User.email == credentials["email"])
            )
            assert user is not None, "expected the signed-in user to exist"
            snapshot = {"id": str(user.id), "is_admin": user.is_admin}
            for provider in PROVIDERS:
                snapshot[f"encrypted_{provider}_key"] = user.encrypted_key_for(provider)
                snapshot[f"{provider}_key_masked"] = user.masked_key_for(provider)
            return snapshot

    return _load


SAMPLE_KEYS = {
    "openai": "sk-" + "a" * 40,
    "anthropic": "sk-ant-" + "b" * 40,
    "gemini": "AIza" + "c" * 35,
}


@pytest.fixture
def keyed_client(auth_client):
    """A signed-in user with a key stored for every provider."""
    for provider, key in SAMPLE_KEYS.items():
        response = auth_client.put(f"/api/account/keys/{provider}", json={"key": key})
        assert response.status_code == 200, response.get_json()
    return auth_client


@pytest.fixture
def motion(keyed_client):
    response = keyed_client.post("/api/motions", json={"provider": "openai"})
    assert response.status_code == 201, response.get_json()
    return response.get_json()
