"""Category business logic: tree building and admin CRUD."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryTreeOut, CategoryUpdate
from app.utils.slug import slugify, unique_suffix


async def get_by_slug(db: AsyncSession, slug: str) -> Category:
    category = await db.scalar(select(Category).where(Category.slug == slug))
    if category is None:
        raise NotFoundError("Category not found")
    return category


async def get_by_id(db: AsyncSession, category_id: int) -> Category:
    category = await db.get(Category, category_id)
    if category is None:
        raise NotFoundError("Category not found")
    return category


async def list_tree(db: AsyncSession) -> list[CategoryTreeOut]:
    categories = (await db.scalars(select(Category).order_by(Category.name))).all()
    nodes = {c.id: CategoryTreeOut.model_validate(c) for c in categories}
    roots: list[CategoryTreeOut] = []
    for node in nodes.values():
        if node.parent_id is not None and node.parent_id in nodes:
            nodes[node.parent_id].children.append(node)
        else:
            roots.append(node)
    return roots


async def _ensure_unique_slug(db: AsyncSession, slug: str) -> str:
    exists = await db.scalar(select(Category.id).where(Category.slug == slug))
    return f"{slug}-{unique_suffix()}" if exists else slug


async def create(db: AsyncSession, data: CategoryCreate) -> Category:
    if data.parent_id is not None:
        await get_by_id(db, data.parent_id)
    slug = await _ensure_unique_slug(db, data.slug or slugify(data.name))
    category = Category(
        name=data.name, slug=slug, description=data.description, parent_id=data.parent_id
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def update(db: AsyncSession, category_id: int, data: CategoryUpdate) -> Category:
    category = await get_by_id(db, category_id)
    fields = data.model_dump(exclude_unset=True)
    if "slug" in fields and fields["slug"] != category.slug:
        fields["slug"] = await _ensure_unique_slug(db, fields["slug"])
    if fields.get("parent_id") is not None:
        await get_by_id(db, fields["parent_id"])
    for key, value in fields.items():
        setattr(category, key, value)
    await db.commit()
    await db.refresh(category)
    return category


async def delete(db: AsyncSession, category_id: int) -> None:
    category = await get_by_id(db, category_id)
    products = await db.scalar(
        select(func.count()).select_from(Product).where(Product.category_id == category_id)
    )
    children = await db.scalar(
        select(func.count()).select_from(Category).where(Category.parent_id == category_id)
    )
    if products or children:
        raise ConflictError(
            "Category has products or subcategories and cannot be deleted",
            code="category_in_use",
        )
    await db.delete(category)
    await db.commit()
