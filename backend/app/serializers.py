"""Model -> JSON. camelCase keys, matching webapp/src/lib/types.ts."""

from __future__ import annotations

from .llm import catalogue
from .models import PROVIDERS, ChatMessage, Motion, User


def message_json(message: ChatMessage) -> dict:
    return {
        "id": str(message.id),
        "stage": message.stage,
        "role": message.role,
        "content": message.content,
        "createdAt": message.created_at.isoformat(),
    }


def motion_summary_json(motion: Motion) -> dict:
    """The shape the sidebar needs — no documents or messages."""
    return {
        "id": str(motion.id),
        "title": motion.title,
        "position": motion.position,
        "provider": motion.provider,
        # `model` is the user's explicit choice (null until they make one);
        # `modelLabel` always names the model that will actually run.
        "model": motion.model,
        "modelLabel": catalogue.label_for(
            motion.provider, catalogue.resolve(motion.provider, motion.model)
        ),
        "currentStage": motion.current_stage,
        "createdAt": motion.created_at.isoformat(),
        "updatedAt": motion.updated_at.isoformat(),
    }


def motion_json(motion: Motion) -> dict:
    """The full motion, for the open workspace."""
    return {
        **motion_summary_json(motion),
        "motionText": motion.motion_text,
        "stageDocs": {
            "1": motion.stage_1_document,
            "2": motion.stage_2_document,
            "3": motion.stage_3_document,
        },
        "messages": [message_json(m) for m in motion.messages],
    }


def api_key_state_json(user: User, provider: str) -> dict:
    """Masked key state for the settings page.

    Reads the stored masked form rather than decrypting — a key is never
    revealed again after entry, only replaced.
    """
    if not user.encrypted_key_for(provider):
        return {"connected": False, "masked": None}
    return {"connected": True, "masked": user.masked_key_for(provider)}


def api_keys_json(user: User) -> dict:
    return {provider: api_key_state_json(user, provider) for provider in PROVIDERS}


def user_json(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "isAdmin": user.is_admin,
        "createdAt": user.created_at.isoformat(),
    }
