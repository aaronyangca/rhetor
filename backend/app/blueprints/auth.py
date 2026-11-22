"""Email/password auth. Self-serve signup, no invite gating (v1 scope)."""

from __future__ import annotations

import hashlib
import uuid

from email_validator import EmailNotValidError, validate_email
from flask import Blueprint, current_app, jsonify
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy import select
from werkzeug.security import check_password_hash, generate_password_hash

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from .. import mailer
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


def _check_password(password: str) -> None:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ApiError(
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters", 422
        )


@bp.post("/signup")
def signup():
    data = body()
    email = _clean_email(required_str(data, "email", max_length=254))
    password = required_str(data, "password", max_length=1024)

    _check_password(password)

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


# --- password reset ---------------------------------------------------------
#
# Tokens are signed (with SECRET_KEY) rather than stored. Each one embeds a
# fingerprint of the user's current password hash, so it stops working the
# moment the password changes: a token is single-use, and an older unused one
# dies when a newer one is redeemed. It also expires after
# PASSWORD_RESET_MAX_AGE seconds.

_RESET_SALT = "password-reset"


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt=_RESET_SALT)


def _fingerprint(user: User) -> str:
    return hashlib.sha256(user.password_hash.encode()).hexdigest()[:16]


def _reset_token(user: User) -> str:
    return _serializer().dumps({"u": str(user.id), "p": _fingerprint(user)})


def _user_for_token(token: str) -> User:
    invalid = ApiError(
        "This reset link is invalid or has already been used. Request a new one.",
        400,
        code="invalid_token",
    )
    try:
        data = _serializer().loads(
            token, max_age=current_app.config["PASSWORD_RESET_MAX_AGE"]
        )
        user_id = uuid.UUID(data["u"])
    except SignatureExpired as exc:
        raise ApiError(
            "This reset link has expired. Request a new one.", 400, code="expired_token"
        ) from exc
    except (BadSignature, KeyError, TypeError, ValueError) as exc:
        raise invalid from exc

    user = db.session.get(User, user_id)
    if user is None or data.get("p") != _fingerprint(user):
        raise invalid
    return user


@bp.post("/password/forgot")
def forgot_password():
    """Email a reset link. Answers the same whether or not the account exists,
    so it can't be used to discover who has one."""
    email = _clean_email(required_str(body(), "email", max_length=254))
    user = db.session.scalar(select(User).where(User.email == email))

    if user is not None:
        link = f"{current_app.config['FRONTEND_URL']}/reset-password?token={_reset_token(user)}"
        minutes = current_app.config["PASSWORD_RESET_MAX_AGE"] // 60
        try:
            mailer.send(
                user.email,
                "Reset your Rhetor password",
                "Someone asked to reset the password for your Rhetor account.\n\n"
                f"To choose a new password, open this link within {minutes} minutes:\n\n"
                f"{link}\n\n"
                "If that wasn't you, ignore this email — your password won't change.",
            )
        except mailer.MailError:
            current_app.logger.exception("Could not send password reset email")
            raise ApiError(
                "We couldn't send the reset email just now. Try again in a few minutes.",
                503,
                code="mail_failed",
            )

    return jsonify({"ok": True})


@bp.post("/password/reset")
def reset_password():
    data = body()
    token = required_str(data, "token", max_length=2048)
    password = required_str(data, "password", max_length=1024)
    _check_password(password)

    user = _user_for_token(token)
    user.password_hash = generate_password_hash(password)
    db.session.commit()

    login_user(user)
    return jsonify(user_json(user))
