"""Categories router: public tree/browsing plus admin CRUD."""

from typing import Annotated

from fastapi import APIRouter, Query, status

from app.core.deps import AdminUser, DbSession
from app.schemas.category import CategoryCreate, CategoryOut, CategoryTreeOut, CategoryUpdate
from app.schemas.common import Page, PageParams
from app.schemas.product import ProductFilters, ProductOut
from app.services import category_service, product_service

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryTreeOut])
async def list_categories(db: DbSession) -> list[CategoryTreeOut]:
    return await category_service.list_tree(db)


@router.get("/{slug}/products", response_model=Page[ProductOut])
async def products_in_category(
    slug: str, db: DbSession, params: Annotated[PageParams, Query()]
) -> Page[ProductOut]:
    await category_service.get_by_slug(db, slug)  # 404 if missing
    filters = ProductFilters(category=slug)
    items, total = await product_service.list_products(db, filters, params)
    return Page.build([ProductOut.model_validate(p) for p in items], total, params)


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(data: CategoryCreate, db: DbSession, _admin: AdminUser) -> CategoryOut:
    category = await category_service.create(db, data)
    return CategoryOut.model_validate(category)


@router.patch("/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: int, data: CategoryUpdate, db: DbSession, _admin: AdminUser
) -> CategoryOut:
    category = await category_service.update(db, category_id, data)
    return CategoryOut.model_validate(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: DbSession, _admin: AdminUser) -> None:
    await category_service.delete(db, category_id)
