"""Pydantic schemas for products: browsing filters, admin CRUD, and internal export."""

from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import PageParams


class ProductFilters(BaseModel):
    category: str | None = Field(default=None, description="Category slug")
    brand: str | None = None
    min_price: Decimal | None = Field(default=None, ge=0)
    max_price: Decimal | None = Field(default=None, ge=0)
    in_stock: bool | None = None
    q: str | None = Field(default=None, max_length=120, description="Keyword search")
    sort: Literal["newest", "price_asc", "price_desc", "name"] = "newest"


class ProductListQuery(ProductFilters, PageParams):
    """Combined filter + pagination query (FastAPI allows one query model per endpoint)."""


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str | None = Field(default=None, max_length=280)
    description: str = ""
    specifications: dict = {}
    price: Decimal = Field(ge=0)
    currency: str = Field(default="JOD", min_length=3, max_length=3)
    stock_quantity: int = Field(default=0, ge=0)
    is_available: bool = True
    image_urls: list[str] = []
    category_id: int | None = None
    brand: str | None = Field(default=None, max_length=120)
    sku: str | None = Field(default=None, max_length=64)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(default=None, max_length=280)
    description: str | None = None
    specifications: dict | None = None
    price: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    is_available: bool | None = None
    image_urls: list[str] | None = None
    category_id: int | None = None
    brand: str | None = Field(default=None, max_length=120)
    sku: str | None = Field(default=None, max_length=64)


class StockAdjust(BaseModel):
    adjustment: int = Field(description="Positive to add stock, negative to remove")


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    description: str
    specifications: dict
    price: Decimal
    currency: str
    stock_quantity: int
    is_available: bool
    image_urls: list[str]
    category_id: int | None
    brand: str | None
    sku: str | None
    created_at: datetime
    updated_at: datetime


class ProductExportItem(BaseModel):
    """Catalog row shape consumed by the AI service indexer (Member 4)."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    description: str
    specifications: dict
    price: Decimal
    currency: str
    stock_quantity: int
    is_available: bool
    brand: str | None
    category: str | None = None
