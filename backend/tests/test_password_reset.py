"""Forgot-password flow: request a link, redeem it once."""

import re

import pytest

from app import mailer


@pytest.fixture
def outbox(monkeypatch):
    sent = []
    monkeypatch.setattr(
        mailer, "send", lambda to, subject, text: sent.append({"to": to, "text": text})
    )
    return sent


def token_from(mail) -> str:
    return re.search(r"reset-password\?token=(\S+)", mail["text"]).group(1)


@pytest.fixture
def account(client, credentials):
    assert client.post("/api/auth/signup", json=credentials).status_code == 201
    client.post("/api/auth/logout")
    return credentials


def test_forgot_sends_a_link_to_the_frontend(client, account, outbox):
    response = client.post("/api/auth/password/forgot", json={"email": account["email"]})

    assert response.status_code == 200
    assert len(outbox) == 1
    assert outbox[0]["to"] == account["email"]
    assert "http://localhost:5173/reset-password?token=" in outbox[0]["text"]


def test_forgot_does_not_reveal_whether_an_account_exists(client, outbox):
    response = client.post("/api/auth/password/forgot", json={"email": "nobody@example.com"})

    assert response.status_code == 200
    assert response.get_json() == {"ok": True}
    assert outbox == []


def test_reset_changes_the_password_and_signs_in(client, account, outbox):
    client.post("/api/auth/password/forgot", json={"email": account["email"]})
    token = token_from(outbox[0])

    response = client.post(
        "/api/auth/password/reset", json={"token": token, "password": "a brand new password"}
    )
    assert response.status_code == 200
    assert client.get("/api/auth/me").status_code == 200

    client.post("/api/auth/logout")
    old = client.post("/api/auth/login", json=account)
    new = client.post(
        "/api/auth/login", json={"email": account["email"], "password": "a brand new password"}
    )
    assert old.status_code == 401
    assert new.status_code == 200


def test_a_link_works_only_once(client, account, outbox):
    client.post("/api/auth/password/forgot", json={"email": account["email"]})
    token = token_from(outbox[0])
    client.post("/api/auth/password/reset", json={"token": token, "password": "first new password"})

    again = client.post(
        "/api/auth/password/reset", json={"token": token, "password": "second new password"}
    )
    assert again.status_code == 400
    assert again.get_json()["error"]["code"] == "invalid_token"


def test_a_tampered_token_is_rejected(client, account, outbox):
    client.post("/api/auth/password/forgot", json={"email": account["email"]})
    token = token_from(outbox[0])

    response = client.post(
        "/api/auth/password/reset", json={"token": token[:-2] + "xx", "password": "whatever123"}
    )
    assert response.status_code == 400


def test_an_expired_token_is_rejected(app, client, account, outbox, monkeypatch):
    client.post("/api/auth/password/forgot", json={"email": account["email"]})
    token = token_from(outbox[0])
    monkeypatch.setitem(app.config, "PASSWORD_RESET_MAX_AGE", -1)

    response = client.post(
        "/api/auth/password/reset", json={"token": token, "password": "whatever123"}
    )
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "expired_token"


def test_the_new_password_must_meet_the_minimum(client, account, outbox):
    client.post("/api/auth/password/forgot", json={"email": account["email"]})
    token = token_from(outbox[0])

    response = client.post("/api/auth/password/reset", json={"token": token, "password": "short"})
    assert response.status_code == 422


def test_without_smtp_the_link_is_logged_not_sent(app, caplog):
    with app.app_context(), caplog.at_level("WARNING"):
        mailer.send("someone@example.com", "Subject", "the link: http://x/reset")
    assert "NOT sent" in caplog.text
    assert "http://x/reset" in caplog.text
