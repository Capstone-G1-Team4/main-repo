"""Products router: public browsing/filtering plus admin CRUD and stock management."""

from typing import Annotated

from fastapi import APIRouter, Query, status

from app.core.deps import AdminUser, DbSession
from app.schemas.common import Page
from app.schemas.product import (
    ProductCreate,
    ProductListQuery,
    ProductOut,
    ProductUpdate,
    StockAdjust,
)
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=Page[ProductOut])
async def list_products(
    db: DbSession, query: Annotated[ProductListQuery, Query()]
) -> Page[ProductOut]:
    items, total = await product_service.list_products(db, query, query)
    return Page.build([ProductOut.model_validate(p) for p in items], total, query)


@router.get("/{id_or_slug}", response_model=ProductOut)
async def get_product(id_or_slug: str, db: DbSession) -> ProductOut:
    product = await product_service.get_by_id_or_slug(db, id_or_slug)
    return ProductOut.model_validate(product)


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductCreate, db: DbSession, _admin: AdminUser) -> ProductOut:
    product = await product_service.create(db, data)
    return ProductOut.model_validate(product)


@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str, data: ProductUpdate, db: DbSession, _admin: AdminUser
) -> ProductOut:
    product = await product_service.update(db, product_id, data)
    return ProductOut.model_validate(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, db: DbSession, _admin: AdminUser) -> None:
    await product_service.delete(db, product_id)


@router.patch("/{product_id}/stock", response_model=ProductOut)
async def adjust_stock(
    product_id: str, data: StockAdjust, db: DbSession, _admin: AdminUser
) -> ProductOut:
    product = await product_service.adjust_stock(db, product_id, data.adjustment)
    return ProductOut.model_validate(product)
