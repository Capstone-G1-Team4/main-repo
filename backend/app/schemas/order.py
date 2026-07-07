"""Pydantic schemas for orders: checkout payload, outputs, and admin filters."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus, PaymentMethod
from app.schemas.common import PageParams


class OrderItemIn(BaseModel):
    product_id: UUID
    quantity: int = Field(ge=1, le=100)


class OrderCreate(BaseModel):
    """Checkout payload — the cart is sent at checkout time (no server-side cart)."""

    items: list[OrderItemIn] = Field(min_length=1, max_length=50)
    customer_name: str | None = Field(default=None, max_length=255)
    customer_phone: str | None = Field(default=None, max_length=32)
    payment_method: PaymentMethod = PaymentMethod.cash_on_delivery
    delivery_location_id: UUID | None = None
    notes: str | None = Field(default=None, max_length=2000)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: UUID
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID | None
    status: OrderStatus
    customer_name: str
    customer_phone: str
    payment_method: PaymentMethod
    subtotal: Decimal
    delivery_fee: Decimal
    total: Decimal
    delivery_location_id: UUID | None
    conversation_id: UUID | None
    notes: str | None
    created_at: datetime
    items: list[OrderItemOut]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class AdminOrderQuery(PageParams):
    status: OrderStatus | None = None
    customer_phone: str | None = None
