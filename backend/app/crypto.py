"""Symmetric encryption for users' BYOK provider keys.

Keys are encrypted at rest with Fernet and decrypted only in memory, at the
moment of making a provider call. See webapp-design.md § Security.
"""

from __future__ import annotations

from flask import current_app
from cryptography.fernet import Fernet, InvalidToken


class EncryptionNotConfigured(RuntimeError):
    """ENCRYPTION_KEY is missing or malformed."""


def _fernet() -> Fernet:
    key = current_app.config.get("ENCRYPTION_KEY") or ""
    if not key:
        raise EncryptionNotConfigured(
            "ENCRYPTION_KEY is not set. Generate one with `make secrets` and put "
            "it in .env — without it, provider API keys cannot be stored."
        )
    try:
        return Fernet(key.encode() if isinstance(key, str) else key)
    except (ValueError, TypeError) as exc:
        raise EncryptionNotConfigured(
            "ENCRYPTION_KEY is not a valid Fernet key. Regenerate it with "
            "`make secrets`."
        ) from exc


def encrypt(plaintext: str) -> str:
    """Encrypt a provider API key for storage."""
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt(ciphertext: str) -> str:
    """Decrypt a stored provider API key.

    Raises InvalidToken if ENCRYPTION_KEY has changed since the value was
    written — the stored keys are unrecoverable at that point and users must
    re-enter them.
    """
    return _fernet().decrypt(ciphertext.encode()).decode()


def mask(plaintext: str, *, prefix: str | None = None) -> str:
    """Render a key for display: `sk-...a8f2`, `AIza...WxYz`, `AQ...WxYz`.

    A key is never shown in full again after entry, only replaced.

    `prefix` is the provider's own marker, passed by the caller that just
    validated the key against it. Without one, fall back to everything before
    the first hyphen, or the leading four characters for separator-less keys.
    """
    tail = plaintext[-4:] if len(plaintext) >= 4 else "?" * 4
    if prefix is None:
        head, sep, _ = plaintext[:8].partition("-")
        prefix = f"{head}{sep}" if sep else plaintext[:4]
    return f"{prefix}...{tail}"


__all__ = ["encrypt", "decrypt", "mask", "EncryptionNotConfigured", "InvalidToken"]
