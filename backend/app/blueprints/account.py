"""Account settings — BYOK provider keys.

Keys are write-only from the client's perspective: they can be set and
replaced, never read back. See webapp-design.md § Security.
"""

from __future__ import annotations

from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from .. import crypto
from ..errors import ApiError
from ..llm import catalogue
from ..extensions import db
from ..models import PROVIDERS
from ..security import body, required_str
from ..serializers import api_keys_json, user_json

bp = Blueprint("account", __name__, url_prefix="/api/account")

# Loose sanity checks only — the provider is the real authority on whether a
# key works, and formats change. Just enough to catch an obvious paste error,
# most usefully a key dropped into the wrong provider's slot.
#
# A provider may have more than one live format: Google issues both the older
# `AIza...` keys and the newer `AQ...` ones, and both remain valid.
KEY_PREFIXES: dict[str, tuple[str, ...]] = {
    "openai": ("sk-",),
    "anthropic": ("sk-ant-",),
    "gemini": ("AIza", "AQ"),
}
PROVIDER_LABELS = {"openai": "OpenAI", "anthropic": "Anthropic", "gemini": "Gemini"}
MIN_KEY_LENGTH = 20


def _check_provider(provider: str) -> str:
    if provider not in PROVIDERS:
        raise ApiError(f"Unknown provider '{provider}'", 404)
    return provider


@bp.get("")
@login_required
def get_account():
    return jsonify({"user": user_json(current_user), "apiKeys": api_keys_json(current_user)})


@bp.get("/keys")
@login_required
def get_keys():
    return jsonify(api_keys_json(current_user))


@bp.get("/models")
@login_required
def get_models():
    """The model catalogue, for the picker. Static, but kept behind auth so the
    app has exactly one place to fetch its startup state from."""
    return jsonify(catalogue.catalogue_json())


@bp.put("/keys/<provider>")
@login_required
def set_key(provider: str):
    _check_provider(provider)
    key = required_str(body(), "key", max_length=512)

    prefixes = KEY_PREFIXES[provider]
    matched = next((p for p in prefixes if key.startswith(p)), None)
    # OpenAI's prefix is a prefix of Anthropic's, so an sk-ant- key pasted into
    # the OpenAI slot matches but is still a real mistake.
    wrong_slot = provider == "openai" and key.startswith("sk-ant-")

    if wrong_slot or matched is None or len(key) < MIN_KEY_LENGTH:
        expected = " or ".join(f"'{p}'" for p in prefixes)
        raise ApiError(
            f"That doesn't look like an API key for {PROVIDER_LABELS[provider]} — "
            f"expected it to start with {expected}.",
            422,
        )

    # Mask against the prefix that actually matched, so the display form keeps
    # the marker the user recognises rather than a guessed leading slice.
    current_user.set_encrypted_key(
        provider, crypto.encrypt(key), crypto.mask(key, prefix=matched)
    )
    db.session.commit()
    return jsonify(api_keys_json(current_user))


@bp.delete("/keys/<provider>")
@login_required
def delete_key(provider: str):
    _check_provider(provider)
    current_user.set_encrypted_key(provider, None, None)
    db.session.commit()
    return jsonify(api_keys_json(current_user))
