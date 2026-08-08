def test_signup_creates_account_and_signs_in(client, credentials):
    response = client.post("/api/auth/signup", json=credentials)
    assert response.status_code == 201
    assert response.get_json()["email"] == credentials["email"]

    assert client.get("/api/auth/me").status_code == 200


def test_signup_rejects_duplicate_email_case_insensitively(client, credentials):
    client.post("/api/auth/signup", json=credentials)
    response = client.post(
        "/api/auth/signup",
        json={**credentials, "email": credentials["email"].upper()},
    )
    assert response.status_code == 409


def test_signup_rejects_short_password(client):
    response = client.post(
        "/api/auth/signup", json={"email": "a@example.com", "password": "short"}
    )
    assert response.status_code == 422


def test_signup_rejects_malformed_email(client):
    response = client.post(
        "/api/auth/signup", json={"email": "not-an-email", "password": "long enough here"}
    )
    assert response.status_code == 422


def test_login_and_logout(client, credentials):
    client.post("/api/auth/signup", json=credentials)
    client.post("/api/auth/logout")
    assert client.get("/api/auth/me").status_code == 401

    assert client.post("/api/auth/login", json=credentials).status_code == 200
    assert client.get("/api/auth/me").status_code == 200


def test_login_gives_the_same_error_for_unknown_email_and_wrong_password(client, credentials):
    client.post("/api/auth/signup", json=credentials)

    unknown = client.post(
        "/api/auth/login", json={"email": "nobody@example.com", "password": "whatever!!"}
    )
    wrong = client.post("/api/auth/login", json={**credentials, "password": "wrong password"})

    assert unknown.status_code == wrong.status_code == 401
    assert unknown.get_json() == wrong.get_json()


def test_mutating_api_calls_require_json_content_type(client, credentials):
    """The CSRF guard: a cross-origin form post can't set application/json."""
    response = client.post(
        "/api/auth/login",
        data={"email": credentials["email"], "password": credentials["password"]},
        content_type="application/x-www-form-urlencoded",
    )
    assert response.status_code == 415
