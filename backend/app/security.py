"""Request-level guards and body parsing helpers."""

from __future__ import annotations

from functools import wraps

from flask import request
from flask_login import current_user

from .errors import ApiError

MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def require_json_content_type() -> None:
    """Reject mutating /api requests that aren't application/json.

    This is the second half of the CSRF defence, alongside SameSite=Lax
    cookies: a cross-origin HTML form can only send urlencoded, multipart, or
    plain-text bodies, so requiring JSON means an attacker's page has to make a
    preflighted request the browser will block.
    """
    if not request.path.startswith("/api"):
        return
    if request.method not in MUTATING_METHODS:
        return
    # Bodyless mutations (logout, DELETE) have nothing to declare a type for.
    # They're still safe: an HTML form can only issue GET and POST, and a
    # bodyless cross-origin POST can't carry forged content.
    if not request.content_length:
        return
    if not request.is_json:
        raise ApiError("Expected Content-Type: application/json", 415)


def body() -> dict:
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError("Request body must be a JSON object", 400)
    return data


def required_str(data: dict, field: str, *, max_length: int | None = None) -> str:
    value = data.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ApiError(f"'{field}' is required", 422)
    value = value.strip()
    if max_length and len(value) > max_length:
        raise ApiError(f"'{field}' must be at most {max_length} characters", 422)
    return value


def one_of(data: dict, field: str, allowed: tuple[str, ...]) -> str:
    value = data.get(field)
    if value not in allowed:
        raise ApiError(f"'{field}' must be one of: {', '.join(allowed)}", 422)
    return value


def admin_required(view):
    """Flask-Admin's own access check delegates here."""

    @wraps(view)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            raise ApiError("Authentication required", 401)
        if not current_user.is_admin:
            raise ApiError("Admin access required", 403)
        return view(*args, **kwargs)

    return wrapper
