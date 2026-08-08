import pytest

from app.crypto import decrypt


def test_keys_start_disconnected(auth_client):
    assert auth_client.get("/api/account/keys").get_json() == {
        "openai": {"connected": False, "masked": None},
        "anthropic": {"connected": False, "masked": None},
        "gemini": {"connected": False, "masked": None},
    }


def test_storing_a_key_returns_only_the_masked_form(auth_client):
    key = "sk-" + "x" * 40 + "a8f2"
    response = auth_client.put("/api/account/keys/openai", json={"key": key})

    assert response.status_code == 200
    assert response.get_json()["openai"] == {"connected": True, "masked": "sk-...a8f2"}
    # The plaintext key never appears in a response body.
    assert key not in response.get_data(as_text=True)


def test_stored_key_is_encrypted_at_rest_and_recoverable(app, auth_client, stored_user):
    key = "sk-" + "y" * 40
    auth_client.put("/api/account/keys/openai", json={"key": key})

    ciphertext = stored_user()["encrypted_openai_key"]
    assert ciphertext and key not in ciphertext
    with app.app_context():
        assert decrypt(ciphertext) == key


def test_replacing_a_key_overwrites_the_previous_one(auth_client, stored_user):
    auth_client.put("/api/account/keys/openai", json={"key": "sk-" + "1" * 40})
    first = stored_user()["encrypted_openai_key"]

    auth_client.put("/api/account/keys/openai", json={"key": "sk-" + "2" * 40 + "beef"})
    after = stored_user()

    assert after["encrypted_openai_key"] != first
    assert after["openai_key_masked"] == "sk-...beef"


def test_deleting_a_key_clears_both_ciphertext_and_mask(auth_client, stored_user):
    auth_client.put("/api/account/keys/openai", json={"key": "sk-" + "z" * 40})
    auth_client.delete("/api/account/keys/openai")

    after = stored_user()
    assert after["encrypted_openai_key"] is None
    assert after["openai_key_masked"] is None


@pytest.mark.parametrize(
    ("key", "expected_mask"),
    [
        # Google's older format, and the newer AQ one — both are live.
        ("AIza" + "s" * 31 + "WxYz", "AIza...WxYz"),
        ("AQ.Ab8" + "s" * 28 + "WxYz", "AQ...WxYz"),
    ],
)
def test_gemini_accepts_both_key_formats(auth_client, stored_user, key, expected_mask):
    response = auth_client.put("/api/account/keys/gemini", json={"key": key})

    assert response.status_code == 200
    assert response.get_json()["gemini"] == {"connected": True, "masked": expected_mask}
    assert stored_user()["encrypted_gemini_key"]
    assert key not in response.get_data(as_text=True)


def test_anthropic_mask_keeps_its_full_prefix(auth_client):
    """sk- alone would be ambiguous with OpenAI in the settings list."""
    response = auth_client.put(
        "/api/account/keys/anthropic", json={"key": "sk-ant-" + "b" * 36 + "c1d2"}
    )
    assert response.get_json()["anthropic"]["masked"] == "sk-ant-...c1d2"


@pytest.mark.parametrize(
    ("provider", "key"),
    [
        # An OpenAI key in the Anthropic slot, and vice versa — sk- is a
        # prefix of sk-ant-, so this pair is the easy one to get wrong.
        ("anthropic", "sk-" + "a" * 40),
        ("openai", "sk-ant-" + "b" * 40),
        # A Gemini key anywhere else, in both of its formats.
        ("openai", "AIza" + "c" * 35),
        ("anthropic", "AQ.Ab8" + "c" * 35),
        # And an sk- key in the Gemini slot.
        ("gemini", "sk-" + "a" * 40),
    ],
)
def test_key_must_match_the_provider(auth_client, provider, key):
    response = auth_client.put(f"/api/account/keys/{provider}", json={"key": key})
    assert response.status_code == 422


def test_unknown_provider_is_404(auth_client):
    assert auth_client.put("/api/account/keys/grok", json={"key": "sk-x"}).status_code == 404


def test_keys_require_authentication(client):
    assert client.get("/api/account/keys").status_code == 401
