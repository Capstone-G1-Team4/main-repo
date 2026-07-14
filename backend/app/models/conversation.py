"""Conversation and chat message models for the AI shopping assistant."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, JSONVariant, TimestampMixin


class ConversationStatus(enum.StrEnum):
    active = "active"
    closed = "closed"


class MessageRole(enum.StrEnum):
    user = "user"
    assistant = "assistant"
    system = "system"
    tool = "tool"


def _new_session_token() -> str:
    return uuid.uuid4().hex


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), index=True)
    session_token: Mapped[str] = mapped_column(
        String(64), unique=True, default=_new_session_token
    )
    status: Mapped[ConversationStatus] = mapped_column(
        Enum(ConversationStatus, name="conversation_status"), default=ConversationStatus.active
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id"), index=True
    )
    role: Mapped[MessageRole] = mapped_column(Enum(MessageRole, name="message_role"))
    content: Mapped[str] = mapped_column(Text)
    # attribute renamed because "metadata" is reserved on declarative models
    message_metadata: Mapped[dict | None] = mapped_column("metadata", JSONVariant)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
