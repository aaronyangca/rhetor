"""Email/password auth. Self-serve signup, no invite gating (v1 scope)."""

from __future__ import annotations

from email_validator import EmailNotValidError, validate_email
from flask import Blueprint, jsonify
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy import select
from werkzeug.security import check_password_hash, generate_password_hash

from ..errors import ApiError
from ..extensions import db
from ..models import User
from ..security import body, required_str
from ..serializers import user_json

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

MIN_PASSWORD_LENGTH = 8


def _clean_email(raw: str) -> str:
    try:
        # check_deliverability=False keeps signup working offline and avoids a
        # DNS lookup on the request path.
        return validate_email(raw, check_deliverability=False).normalized
    except EmailNotValidError as exc:
        raise ApiError(str(exc), 422) from exc


@bp.post("/signup")
def signup():
    data = body()
    email = _clean_email(required_str(data, "email", max_length=254))
    password = required_str(data, "password", max_length=1024)

    if len(password) < MIN_PASSWORD_LENGTH:
        raise ApiError(
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters", 422
        )

    if db.session.scalar(select(User).where(User.email == email)):
        raise ApiError("An account with that email already exists", 409)

    user = User(email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()

    login_user(user)
    return jsonify(user_json(user)), 201


@bp.post("/login")
def login():
    data = body()
    email = required_str(data, "email", max_length=254)
    password = required_str(data, "password", max_length=1024)

    user = db.session.scalar(select(User).where(User.email == email))
    # Same message either way, so the response can't be used to enumerate
    # which emails have accounts.
    if user is None or not check_password_hash(user.password_hash, password):
        raise ApiError("Incorrect email or password", 401)

    login_user(user, remember=bool(data.get("remember")))
    return jsonify(user_json(user))


@bp.post("/logout")
@login_required
def logout():
    logout_user()
    return "", 204


@bp.get("/me")
def me():
    if not current_user.is_authenticated:
        raise ApiError("Not signed in", 401)
    return jsonify(user_json(current_user))
