"""Product catalog model."""

import uuid
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, JSONVariant, TimestampMixin


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), index=True)
    slug: Mapped[str] = mapped_column(String(280), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    specifications: Mapped[dict] = mapped_column(JSONVariant, default=dict)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(3), default="JOD")
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    image_urls: Mapped[list] = mapped_column(JSONVariant, default=list)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), index=True)
    brand: Mapped[str | None] = mapped_column(String(120), index=True)
    sku: Mapped[str | None] = mapped_column(String(64), unique=True)
