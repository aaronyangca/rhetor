"""SQLAlchemy models — the data model from webapp-design.md.

Stage documents are stored as single Markdown blobs on Motion rather than
decomposed into per-argument tables, so the AI's output format and the storage
format stay identical.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from flask_login import UserMixin
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .extensions import db

POSITIONS = ("OG", "OO", "CG", "CO")
PROVIDERS = ("openai", "anthropic", "gemini")
ROLES = ("user", "assistant")
STAGES = (1, 2, 3)


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    # CITEXT so `Aaron@x.com` and `aaron@x.com` collide on the unique index.
    email: Mapped[str] = mapped_column(CITEXT, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    encrypted_openai_key: Mapped[str | None] = mapped_column(Text)
    encrypted_anthropic_key: Mapped[str | None] = mapped_column(Text)
    encrypted_gemini_key: Mapped[str | None] = mapped_column(Text)

    # The display form (`sk-...a8f2`), stored at write time so the settings
    # page never has to decrypt a key just to render it.
    openai_key_masked: Mapped[str | None] = mapped_column(String(32))
    anthropic_key_masked: Mapped[str | None] = mapped_column(String(32))
    gemini_key_masked: Mapped[str | None] = mapped_column(String(32))

    is_admin: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), nullable=False
    )

    motions: Mapped[list["Motion"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="Motion.updated_at.desc()",
    )

    def encrypted_key_for(self, provider: str) -> str | None:
        return getattr(self, f"encrypted_{provider}_key")

    def masked_key_for(self, provider: str) -> str | None:
        return getattr(self, f"{provider}_key_masked")

    def set_encrypted_key(self, provider: str, ciphertext: str | None, masked: str | None) -> None:
        setattr(self, f"encrypted_{provider}_key", ciphertext)
        setattr(self, f"{provider}_key_masked", masked)

    def __repr__(self) -> str:
        return f"<User {self.email}>"


class Motion(db.Model):
    __tablename__ = "motions"
    __table_args__ = (
        CheckConstraint("position IN ('OG','OO','CG','CO')", name="ck_motions_position"),
        CheckConstraint(
            "provider IN ('openai','anthropic','gemini')", name="ck_motions_provider"
        ),
        CheckConstraint("current_stage BETWEEN 1 AND 3", name="ck_motions_stage"),
        Index("ix_motions_user_updated", "user_id", "updated_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False, default="New motion")
    # Both null until the user's first reply names the motion and position.
    motion_text: Mapped[str | None] = mapped_column(Text)
    position: Mapped[str | None] = mapped_column(String(2))

    provider: Mapped[str] = mapped_column(String(16), nullable=False)
    # Null means "whatever the provider's default is" — kept nullable so a
    # retired model id doesn't strand a motion.
    model: Mapped[str | None] = mapped_column(String(64))
    current_stage: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    stage_1_document: Mapped[str | None] = mapped_column(Text)
    stage_2_document: Mapped[str | None] = mapped_column(Text)
    stage_3_document: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        server_default=func.now(),
        onupdate=utcnow,
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="motions")
    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="motion",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )

    def document(self, stage: int) -> str | None:
        return getattr(self, f"stage_{stage}_document")

    def set_document(self, stage: int, value: str | None) -> None:
        setattr(self, f"stage_{stage}_document", value)

    def messages_for_stage(self, stage: int) -> list["ChatMessage"]:
        """Chat history scoped to one stage — each stage has its own thread."""
        return [m for m in self.messages if m.stage == stage]

    @property
    def is_started(self) -> bool:
        """True once the user has supplied the motion text and position."""
        return bool(self.motion_text and self.position)

    def __repr__(self) -> str:
        return f"<Motion {self.title!r} stage={self.current_stage}>"


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"
    __table_args__ = (
        CheckConstraint("stage BETWEEN 1 AND 3", name="ck_messages_stage"),
        CheckConstraint("role IN ('user','assistant')", name="ck_messages_role"),
        Index("ix_messages_motion_stage", "motion_id", "stage", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    motion_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("motions.id", ondelete="CASCADE"), nullable=False
    )
    stage: Mapped[int] = mapped_column(Integer, nullable=False)
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), nullable=False
    )

    motion: Mapped[Motion] = relationship(back_populates="messages")

    def __repr__(self) -> str:
        return f"<ChatMessage {self.role} stage={self.stage}>"
