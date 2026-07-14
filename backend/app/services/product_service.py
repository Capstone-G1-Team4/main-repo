"""Product business logic: browsing/filtering, admin CRUD, stock, and catalog export."""

import uuid

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.category import Category
from app.models.product import Product
from app.schemas.common import PageParams
from app.schemas.product import ProductCreate, ProductFilters, ProductUpdate
from app.utils.slug import slugify, unique_suffix

_SORTS = {
    "newest": Product.created_at.desc(),
    "price_asc": Product.price.asc(),
    "price_desc": Product.price.desc(),
    "name": Product.name.asc(),
}


def _apply_filters(stmt: Select, f: ProductFilters) -> Select:
    if f.category:
        stmt = stmt.join(Category, Product.category_id == Category.id).where(
            Category.slug == f.category
        )
    if f.brand:
        stmt = stmt.where(Product.brand.ilike(f.brand))
    if f.min_price is not None:
        stmt = stmt.where(Product.price >= f.min_price)
    if f.max_price is not None:
        stmt = stmt.where(Product.price <= f.max_price)
    if f.in_stock is not None:
        stmt = stmt.where(Product.stock_quantity > 0 if f.in_stock else Product.stock_quantity == 0)
    if f.q:
        pattern = f"%{f.q}%"
        stmt = stmt.where(
            or_(Product.name.ilike(pattern), Product.description.ilike(pattern))
        )
    return stmt


async def list_products(
    db: AsyncSession, filters: ProductFilters, params: PageParams
) -> tuple[list[Product], int]:
    stmt = _apply_filters(select(Product), filters)
    total = await db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    stmt = stmt.order_by(_SORTS[filters.sort]).offset(params.offset).limit(params.size)
    items = (await db.scalars(stmt)).all()
    return list(items), total


async def get_by_id_or_slug(db: AsyncSession, id_or_slug: str) -> Product:
    product: Product | None = None
    try:
        product = await db.get(Product, uuid.UUID(id_or_slug))
    except ValueError:
        product = await db.scalar(select(Product).where(Product.slug == id_or_slug))
    if product is None:
        raise NotFoundError("Product not found")
    return product


async def _ensure_unique_slug(db: AsyncSession, slug: str) -> str:
    exists = await db.scalar(select(Product.id).where(Product.slug == slug))
    return f"{slug}-{unique_suffix()}" if exists else slug


async def create(db: AsyncSession, data: ProductCreate) -> Product:
    if data.sku is not None:
        taken = await db.scalar(select(Product.id).where(Product.sku == data.sku))
        if taken:
            raise ConflictError("SKU already exists", code="sku_taken")
    slug = await _ensure_unique_slug(db, data.slug or slugify(data.name))
    product = Product(**data.model_dump(exclude={"slug"}), slug=slug)
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def update(db: AsyncSession, product_id: str, data: ProductUpdate) -> Product:
    product = await get_by_id_or_slug(db, product_id)
    fields = data.model_dump(exclude_unset=True)
    if "slug" in fields and fields["slug"] != product.slug:
        fields["slug"] = await _ensure_unique_slug(db, fields["slug"])
    if "sku" in fields and fields["sku"] is not None and fields["sku"] != product.sku:
        taken = await db.scalar(select(Product.id).where(Product.sku == fields["sku"]))
        if taken:
            raise ConflictError("SKU already exists", code="sku_taken")
    for key, value in fields.items():
        setattr(product, key, value)
    await db.commit()
    await db.refresh(product)
    return product


async def delete(db: AsyncSession, product_id: str) -> None:
    product = await get_by_id_or_slug(db, product_id)
    await db.delete(product)
    await db.commit()


async def adjust_stock(db: AsyncSession, product_id: str, adjustment: int) -> Product:
    product = await get_by_id_or_slug(db, product_id)
    new_quantity = product.stock_quantity + adjustment
    if new_quantity < 0:
        raise ConflictError(
            f"Stock cannot go below zero (current: {product.stock_quantity})",
            code="stock_conflict",
        )
    product.stock_quantity = new_quantity
    await db.commit()
    await db.refresh(product)
    return product


async def export_catalog(db: AsyncSession) -> list[dict]:
    """Full catalog dump for the AI service indexer."""
    stmt = select(Product, Category.name).outerjoin(
        Category, Product.category_id == Category.id
    )
    rows = (await db.execute(stmt)).all()
    return [{"product": product, "category": category_name} for product, category_name in rows]
