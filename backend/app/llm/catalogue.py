"""The models a user can pick from, per provider.

webapp-design.md originally fixed one model per provider and kept the choice
out of the UI. That didn't survive contact with real keys: Gemini's Pro models
are effectively unusable on a free API key, so a user with one had no working
option at all. Model choice is now per motion and user-facing.

Each provider offers a frontier tier, a balanced default, and a cheap/fast
tier, so the same pipeline can be run at whatever cost the user is willing to
carry.
"""

from __future__ import annotations

from dataclasses import dataclass

from flask import current_app


@dataclass(frozen=True)
class Model:
    id: str
    label: str
    #: One line, shown next to the option in the picker.
    blurb: str
    #: False for models a free API key cannot reach, so the UI can say so.
    free_tier: bool = True

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "label": self.label,
            "blurb": self.blurb,
            "freeTier": self.free_tier,
        }


# Ordered most to least capable. The default is marked in DEFAULT_MODELS below.
MODELS: dict[str, tuple[Model, ...]] = {
    "openai": (
        Model("gpt-5.6-sol", "GPT-5.6 Sol", "Frontier reasoning. Slowest and priciest."),
        Model("gpt-5.6-terra", "GPT-5.6 Terra", "Balanced. A good default for full runs."),
        Model("gpt-5.6-luna", "GPT-5.6 Luna", "Fast and cheap. Good for iterating on a stage."),
    ),
    "anthropic": (
        Model("claude-fable-5", "Claude Fable 5", "Most capable. Best at dense instructions."),
        Model("claude-opus-5", "Claude Opus 5", "Frontier reasoning at lower cost than Fable."),
        Model("claude-sonnet-5", "Claude Sonnet 5", "Balanced. A good default for full runs."),
        Model("claude-haiku-4-5-20251001", "Claude Haiku 4.5", "Fast and cheap."),
    ),
    "gemini": (
        Model(
            "gemini-3.1-pro-preview",
            "Gemini 3.1 Pro",
            "Most capable Gemini. Paid API keys only.",
            free_tier=False,
        ),
        Model("gemini-3.6-flash", "Gemini 3.6 Flash", "Latest Flash. Fast and capable."),
        Model(
            "gemini-3.5-flash",
            "Gemini 3.5 Flash",
            "Balanced Flash. Works on a free API key.",
        ),
        Model(
            "gemini-2.5-pro",
            "Gemini 2.5 Pro",
            "Previous-generation Pro. Tightly rate-limited on free keys.",
        ),
    ),
}

# Deliberately Flash for Gemini: Pro is the option a free key cannot run, and a
# default nobody can use is worse than a slightly weaker one everybody can.
DEFAULT_MODELS: dict[str, str] = {
    "openai": "gpt-5.6-terra",
    "anthropic": "claude-sonnet-5",
    "gemini": "gemini-3.5-flash",
}

#: Env var per provider, to override the default without a code change.
_CONFIG_KEYS = {
    "openai": "OPENAI_MODEL",
    "anthropic": "ANTHROPIC_MODEL",
    "gemini": "GEMINI_MODEL",
}


def models_for(provider: str) -> tuple[Model, ...]:
    return MODELS.get(provider, ())


def is_valid(provider: str, model_id: str) -> bool:
    return any(m.id == model_id for m in models_for(provider))


def default_model(provider: str) -> str:
    """The default for a provider, honouring a config override if it names a
    model this provider actually offers."""
    override = current_app.config.get(_CONFIG_KEYS[provider]) if _CONFIG_KEYS.get(provider) else None
    if override and is_valid(provider, override):
        return override
    return DEFAULT_MODELS[provider]


def resolve(provider: str, model_id: str | None) -> str:
    """The model to actually call with — the motion's choice, or the default."""
    if model_id and is_valid(provider, model_id):
        return model_id
    return default_model(provider)


def label_for(provider: str, model_id: str | None) -> str:
    for model in models_for(provider):
        if model.id == model_id:
            return model.label
    return model_id or ""


def catalogue_json() -> dict:
    """Everything the picker needs, in one payload."""
    return {
        provider: {
            "default": DEFAULT_MODELS[provider],
            "models": [m.to_json() for m in models],
        }
        for provider, models in MODELS.items()
    }
