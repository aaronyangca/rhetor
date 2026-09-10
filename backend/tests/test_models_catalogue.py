"""Model catalogue and per-motion model selection."""

import pytest

from app.llm import catalogue
from app.models import PROVIDERS


def test_every_provider_offers_models_and_a_valid_default(app):
    with app.app_context():
        for provider in PROVIDERS:
            models = catalogue.models_for(provider)
            assert models, f"{provider} has no models"
            assert catalogue.is_valid(provider, catalogue.default_model(provider))


def test_every_default_is_reachable_on_a_free_api_key(app):
    """The whole point of the change: a default nobody can run is useless.

    OpenRouter is the exception — it has no free tier at all (a credit balance
    is required regardless of model), so "free-tier reachable" doesn't apply.
    """
    with app.app_context():
        for provider in PROVIDERS:
            if provider == "openrouter":
                continue
            default = catalogue.default_model(provider)
            model = next(m for m in catalogue.models_for(provider) if m.id == default)
            assert model.free_tier, f"{provider} defaults to a paid-only model"


def test_gemini_offers_both_the_flash_and_pro_options():
    ids = [m.id for m in catalogue.models_for("gemini")]
    assert "gemini-3.5-flash" in ids
    assert "gemini-2.5-pro" in ids


def test_openrouter_offers_a_free_router_alongside_its_paid_routes():
    models = catalogue.models_for("openrouter")
    free = [m for m in models if m.free_tier]
    assert [m.id for m in free] == ["openrouter/free"]
    # The paid routes stay the majority, so the picker marks the free one.
    assert sum(not m.free_tier for m in models) > len(free)


def test_resolve_falls_back_when_the_model_is_unknown_or_missing(app):
    with app.app_context():
        assert catalogue.resolve("openai", None) == catalogue.default_model("openai")
        # A retired id must not strand the motion.
        assert catalogue.resolve("openai", "gpt-3") == catalogue.default_model("openai")
        assert catalogue.resolve("openai", "gpt-5.6-luna") == "gpt-5.6-luna"


def test_config_can_override_a_default_but_only_with_a_real_model(app):
    with app.app_context():
        app.config["OPENAI_MODEL"] = "gpt-5.6-sol"
        assert catalogue.default_model("openai") == "gpt-5.6-sol"

        app.config["OPENAI_MODEL"] = "not-a-model"
        assert catalogue.default_model("openai") == catalogue.DEFAULT_MODELS["openai"]

        app.config["OPENAI_MODEL"] = None


def test_catalogue_endpoint_lists_every_provider(auth_client):
    payload = auth_client.get("/api/account/models").get_json()

    assert set(payload) == set(PROVIDERS)
    gemini = payload["gemini"]
    assert gemini["default"] == "gemini-3.5-flash"
    assert any(m["freeTier"] is False for m in gemini["models"])
    assert all({"id", "label", "blurb", "freeTier"} <= set(m) for m in gemini["models"])


def test_a_new_motion_has_no_model_pinned_but_shows_the_effective_default(keyed_client):
    motion = keyed_client.post("/api/motions", json={"provider": "gemini"}).get_json()

    assert motion["model"] is None  # nothing chosen at creation
    assert motion["modelLabel"] == "Gemini 3.5 Flash"  # the default is what would run


def test_a_motion_can_be_created_with_a_chosen_model(keyed_client):
    motion = keyed_client.post(
        "/api/motions", json={"provider": "gemini", "model": "gemini-2.5-pro"}
    ).get_json()

    assert motion["model"] == "gemini-2.5-pro"


def test_the_model_must_belong_to_the_motions_provider(keyed_client):
    response = keyed_client.post(
        "/api/motions", json={"provider": "openai", "model": "gemini-2.5-pro"}
    )
    assert response.status_code == 422
    assert response.get_json()["error"]["code"] == "unknown_model"


def test_the_model_can_be_switched_mid_motion(keyed_client, motion):
    response = keyed_client.patch(
        f"/api/motions/{motion['id']}", json={"model": "gpt-5.6-sol"}
    )

    assert response.status_code == 200
    assert response.get_json()["model"] == "gpt-5.6-sol"


def test_switching_to_another_providers_model_is_rejected(keyed_client, motion):
    response = keyed_client.patch(
        f"/api/motions/{motion['id']}", json={"model": "claude-opus-5"}
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    ("provider", "model"),
    [("openai", "gpt-5.6-luna"), ("anthropic", "claude-opus-5"), ("gemini", "gemini-2.5-pro")],
)
def test_the_chosen_model_is_what_gets_called(keyed_client, provider, model, monkeypatch):
    from app import llm
    from app.llm.base import Generation

    seen = {}

    def fake_generate(*, model, **kwargs):
        seen["model"] = model
        return Generation.from_payload(
            {
                "reply": "ok",
                "document": "# doc",
                "title": "T",
                "motionText": "THW x",
                "position": "OG",
            }
        )

    monkeypatch.setattr(llm, "generate", fake_generate)

    created = keyed_client.post(
        "/api/motions", json={"provider": provider, "model": model}
    ).get_json()
    keyed_client.post(f"/api/motions/{created['id']}/messages", json={"content": "THW x, OG"})

    assert seen["model"] == model
