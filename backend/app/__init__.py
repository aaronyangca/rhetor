"""Application factory.

One Flask process serves three route namespaces, split because they authorize
differently (webapp-design.md § Architecture):

    /api/*    JSON API for the React app        — requires a logged-in user
    /admin/*  Flask-Admin, server-rendered      — requires is_admin
    /*        the built React app, static       — no auth to load the shell
"""

from __future__ import annotations

import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.exceptions import NotFound

from .config import REPO_ROOT, Config
from .errors import register_error_handlers
from .extensions import db, login_manager, migrate
from .security import require_json_content_type

FRONTEND_DIST = REPO_ROOT / "webapp" / "dist"


def create_app(config_object: type[Config] | None = None) -> Flask:
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_object or Config)

    _check_required_config(app)

    db.init_app(app)
    migrate.init_app(app, db, directory=str(Path(__file__).resolve().parent.parent / "migrations"))
    _init_login(app)

    app.before_request(require_json_content_type)

    from .blueprints import account, auth, motions

    app.register_blueprint(auth.bp)
    app.register_blueprint(account.bp)
    app.register_blueprint(motions.bp)

    from .admin import register_admin

    register_admin(app)

    register_error_handlers(app)
    _register_template_filters(app)
    _register_health(app)
    _register_admin_login(app)
    _register_frontend(app)
    _register_cli(app)

    return app


def _check_required_config(app: Flask) -> None:
    if not app.config.get("SECRET_KEY"):
        raise RuntimeError(
            "SECRET_KEY is not set. Run `make secrets` and put the values in .env — "
            "without it sessions cannot be signed."
        )


def _init_login(app: Flask) -> None:
    login_manager.init_app(app)
    login_manager.session_protection = "strong"

    from .models import User

    @login_manager.user_loader
    def load_user(user_id: str):
        import uuid

        try:
            return db.session.get(User, uuid.UUID(user_id))
        except (ValueError, AttributeError):
            return None

    @login_manager.unauthorized_handler
    def unauthorized():
        # The API answers in JSON; the admin panel gets its login form.
        if request.path.startswith("/api"):
            return (
                jsonify({"error": {"code": "unauthorized", "message": "Authentication required"}}),
                401,
            )
        from flask import redirect, url_for

        return redirect(url_for("admin_login", next=request.path))


def _register_template_filters(app: Flask) -> None:
    """`| markdown` for the admin motion-detail view."""
    import markdown as md
    from markupsafe import Markup

    @app.template_filter("markdown")
    def render_markdown(text: str | None) -> Markup:
        # Admin-only, rendering content the admin already has full read access
        # to — but the output still goes through Markdown's own escaping rather
        # than being trusted wholesale.
        return Markup(md.markdown(text or "", extensions=["tables", "fenced_code"]))


def _register_health(app: Flask) -> None:
    @app.get("/api/health")
    def health():
        from sqlalchemy import text

        try:
            db.session.execute(text("SELECT 1"))
            database = "up"
        except Exception:  # noqa: BLE001 - health check reports, never raises
            database = "down"
        return jsonify({"status": "ok", "database": database})


def _register_admin_login(app: Flask) -> None:
    """A minimal server-rendered login for the admin panel.

    Flask-Admin's pages aren't part of the React app, so they need their own
    way in rather than borrowing the SPA's login screen.
    """
    from flask import redirect, render_template_string, url_for
    from flask_login import current_user, login_user
    from sqlalchemy import select
    from werkzeug.security import check_password_hash

    from .models import User

    @app.route("/admin-login", methods=["GET", "POST"])
    def admin_login():
        error = None
        if request.method == "POST":
            email = (request.form.get("email") or "").strip()
            password = request.form.get("password") or ""
            user = db.session.scalar(select(User).where(User.email == email))
            if user and check_password_hash(user.password_hash, password) and user.is_admin:
                login_user(user)
                return redirect(request.args.get("next") or url_for("admin.index"))
            error = "Incorrect email or password, or the account is not an admin."

        if current_user.is_authenticated and current_user.is_admin:
            return redirect(url_for("admin.index"))

        return render_template_string(_ADMIN_LOGIN_TEMPLATE, error=error), (401 if error else 200)


_ADMIN_LOGIN_TEMPLATE = """
<!doctype html>
<title>Rhetor admin</title>
<style>
  body { font: 15px/1.5 -apple-system, system-ui, sans-serif; background: #FAF7F2;
         color: #2B2620; display: grid; place-items: center; height: 100vh; margin: 0; }
  form { background: #fff; padding: 32px; border: 1px solid #E6DED2; border-radius: 10px;
         width: 320px; }
  h1 { font-size: 18px; margin: 0 0 20px; }
  label { display: block; font-size: 13px; color: #7A7266; margin-bottom: 4px; }
  input { width: 100%; padding: 9px 10px; margin-bottom: 16px; border: 1px solid #E6DED2;
          border-radius: 6px; font-size: 14px; box-sizing: border-box; }
  button { width: 100%; padding: 10px; background: #2C3968; color: #fff; border: 0;
           border-radius: 6px; font-size: 14px; cursor: pointer; }
  .error { color: #B23B3B; font-size: 13px; margin-bottom: 16px; }
</style>
<form method="post">
  <h1>Rhetor admin</h1>
  {% if error %}<p class="error">{{ error }}</p>{% endif %}
  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="username" required autofocus>
  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required>
  <button type="submit">Sign in</button>
</form>
"""


def _register_frontend(app: Flask) -> None:
    """Serve the built React app, with SPA fallback to index.html."""

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def frontend(path: str):
        if path.startswith(("api/", "admin/")):
            raise NotFound()

        if not FRONTEND_DIST.exists():
            return (
                jsonify(
                    {
                        "error": {
                            "code": "frontend_not_built",
                            "message": "The frontend has not been built. Run `make web-build`, "
                            "or use `make web-dev` and open the Vite dev server instead.",
                        }
                    }
                ),
                503,
            )

        candidate = FRONTEND_DIST / path
        if path and candidate.is_file():
            return send_from_directory(FRONTEND_DIST, path)
        # Unknown path: let React Router decide.
        return send_from_directory(FRONTEND_DIST, "index.html")


def _register_cli(app: Flask) -> None:
    import click

    @app.cli.command("create-admin")
    @click.argument("email")
    @click.password_option()
    def create_admin(email: str, password: str) -> None:
        """Create an admin account, or promote an existing one."""
        from sqlalchemy import select
        from werkzeug.security import generate_password_hash

        from .models import User

        user = db.session.scalar(select(User).where(User.email == email))
        if user:
            user.is_admin = True
            user.password_hash = generate_password_hash(password)
            click.echo(f"Promoted {email} to admin and reset the password.")
        else:
            user = User(
                email=email, password_hash=generate_password_hash(password), is_admin=True
            )
            db.session.add(user)
            click.echo(f"Created admin {email}.")
        db.session.commit()

    @app.cli.command("repair-escapes")
    @click.option("--dry-run", is_flag=True, help="Report what would change, write nothing.")
    def repair_escapes(dry_run: bool) -> None:
        """Fix stored prose whose newlines were double-escaped by the model.

        Generations produced before the parser learned to repair this are still
        one unbroken line in the database; this rewrites them in place.
        """
        from .llm.base import unescape_literal_escapes
        from .models import ChatMessage, Motion

        documents = 0
        messages = 0

        for motion in db.session.query(Motion).all():
            for stage in (1, 2, 3):
                original = motion.document(stage)
                if not original:
                    continue
                repaired = unescape_literal_escapes(original)
                if repaired != original:
                    documents += 1
                    if not dry_run:
                        motion.set_document(stage, repaired)

        for message in db.session.query(ChatMessage).all():
            repaired = unescape_literal_escapes(message.content)
            if repaired != message.content:
                messages += 1
                if not dry_run:
                    message.content = repaired

        if dry_run:
            db.session.rollback()
            click.echo(f"Would repair {documents} stage document(s) and {messages} message(s).")
            return

        db.session.commit()
        click.echo(f"Repaired {documents} stage document(s) and {messages} message(s).")

    @app.cli.command("routes-json")
    def routes_json() -> None:
        """List the API routes, for checking against the frontend client."""
        for rule in sorted(app.url_map.iter_rules(), key=lambda r: str(r)):
            if str(rule).startswith("/api"):
                methods = ",".join(sorted(rule.methods - {"HEAD", "OPTIONS"}))
                click.echo(f"{methods:22} {rule}")


__all__ = ["create_app"]
