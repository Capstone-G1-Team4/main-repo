"""Admin analytics: store-wide summary numbers computed from orders, users, and chats."""

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User

_TOP_PRODUCTS_LIMIT = 5


async def summary(db: AsyncSession) -> dict:
    orders_total = await db.scalar(select(func.count()).select_from(Order)) or 0
    users_total = await db.scalar(select(func.count()).select_from(User)) or 0
    conversations_total = await db.scalar(select(func.count()).select_from(Conversation)) or 0

    revenue = await db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.status != OrderStatus.cancelled
        )
    )

    status_rows = (
        await db.execute(select(Order.status, func.count()).group_by(Order.status))
    ).all()
    orders_by_status = {status.value: count for status, count in status_rows}

    top_rows = (
        await db.execute(
            select(
                OrderItem.product_id,
                Product.name,
                func.sum(OrderItem.quantity).label("quantity_sold"),
            )
            .join(Product, OrderItem.product_id == Product.id)
            .join(Order, OrderItem.order_id == Order.id)
            .where(Order.status != OrderStatus.cancelled)
            .group_by(OrderItem.product_id, Product.name)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(_TOP_PRODUCTS_LIMIT)
        )
    ).all()

    return {
        "orders_total": orders_total,
        "revenue": str(Decimal(revenue or 0)),
        "users_total": users_total,
        "conversations_total": conversations_total,
        "orders_by_status": orders_by_status,
        "top_products": [
            {"product_id": str(product_id), "name": name, "quantity_sold": int(quantity)}
            for product_id, name, quantity in top_rows
        ],
    }
