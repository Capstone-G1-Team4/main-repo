"""Pydantic schemas for conversations, messages, and the AI-service JSON contract."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.conversation import ConversationStatus, MessageRole


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID | None
    session_token: str
    status: ConversationStatus
    created_at: datetime
    updated_at: datetime


class MessageIn(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    role: MessageRole
    content: str
    metadata: dict | None = Field(default=None, validation_alias="message_metadata")
    created_at: datetime


class ChatTurnOut(BaseModel):
    """Everything persisted during one send-message turn, in order."""

    conversation_id: UUID
    messages: list[MessageOut]


# --- AI service contract (see docs/ai-service-contract.md) ---


class AIChatMessage(BaseModel):
    role: MessageRole
    content: str
    metadata: dict | None = None


class AIUserContext(BaseModel):
    user_id: str | None = None
    full_name: str | None = None
    phone: str | None = None
    authenticated: bool = False


class AIChatRequest(BaseModel):
    conversation_id: UUID
    messages: list[AIChatMessage]
    user_context: AIUserContext


class AIToolAction(BaseModel):
    action: Literal["create_order", "resolve_location"]
    payload: dict


class AIChatResponse(BaseModel):
    reply: str | None = None
    actions: list[AIToolAction] = []
    metadata: dict = {}


# --- Real AI service contract (Agentic-RAG /chat endpoint) ---


class AIServiceRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)


class AIServiceResponse(BaseModel):
    session_id: str
    response: str
    intent: str = ""
    order: dict | None = None
