"""Flask-Admin panel, generated from the SQLAlchemy models.

Admins have full read access to every user's motions, including document
content and chat history — acceptable for a small closed beta, and disclosed
in webapp-design.md § Admin Backend.
"""

from __future__ import annotations

from flask import Flask, redirect, url_for
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user

from .extensions import db
from .models import ChatMessage, Motion, User


class AdminAccessMixin:
    def is_accessible(self) -> bool:
        return current_user.is_authenticated and current_user.is_admin

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for("admin_login"))


class RhetorIndexView(AdminAccessMixin, AdminIndexView):
    pass


class UserView(AdminAccessMixin, ModelView):
    column_list = ("email", "is_admin", "motion_count", "created_at")
    column_searchable_list = ("email",)
    column_filters = ("is_admin", "created_at")
    column_default_sort = ("created_at", True)
    # Never expose key material through the admin panel, in either direction.
    column_exclude_list = ("password_hash", "encrypted_openai_key", "encrypted_anthropic_key")
    form_excluded_columns = ("password_hash", "encrypted_openai_key", "encrypted_anthropic_key", "motions")
    can_create = False

    column_labels = {"motion_count": "Motions"}

    def _motion_count(self, context, model, name):
        return len(model.motions)

    column_formatters = {"motion_count": _motion_count}


class MotionView(AdminAccessMixin, ModelView):
    column_list = ("title", "user", "position", "provider", "current_stage", "updated_at")
    column_searchable_list = ("title", "motion_text")
    # Makes user_id a filterable link, which is how "this user's motions" is
    # reached — no embedded list on the user detail page.
    column_filters = ("user.email", "position", "provider", "current_stage")
    column_default_sort = ("updated_at", True)
    can_create = False
    can_edit = False
    details_template = "admin/motion_detail.html"
    can_view_details = True
    column_details_list = (
        "title", "user", "motion_text", "position", "provider",
        "current_stage", "created_at", "updated_at",
    )


class ChatMessageView(AdminAccessMixin, ModelView):
    column_list = ("motion", "stage", "role", "content", "created_at")
    column_filters = ("stage", "role")
    column_default_sort = ("created_at", True)
    can_create = False
    can_edit = False


def register_admin(app: Flask) -> None:
    # Flask-Admin 2.x dropped `template_mode` — it ships Bootstrap 4 only.
    admin = Admin(app, name="Rhetor", index_view=RhetorIndexView(url="/admin"))
    # Flask-Admin 2.x wants the SQLAlchemy extension object, not the session.
    admin.add_view(UserView(User, db, name="Users"))
    admin.add_view(MotionView(Motion, db, name="Motions"))
    admin.add_view(ChatMessageView(ChatMessage, db, name="Messages"))
