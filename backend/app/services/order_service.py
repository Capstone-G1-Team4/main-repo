"""Order business logic: transactional creation with stock handling, lifecycle, admin queries."""

import uuid
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import AppError, ConflictError, NotFoundError
from app.models.location import DeliveryLocation
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.common import PageParams
from app.schemas.order import AdminOrderQuery, OrderCreate

CANCELLABLE = {OrderStatus.pending, OrderStatus.confirmed}
FINAL_STATES = {OrderStatus.delivered, OrderStatus.cancelled}


def _merge_quantities(data: OrderCreate) -> dict[uuid.UUID, int]:
    quantities: dict[uuid.UUID, int] = {}
    for item in data.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity
    return quantities


async def _restock(db: AsyncSession, order: Order) -> None:
    for item in order.items:
        product = await db.get(Product, item.product_id)
        if product is not None:
            product.stock_quantity += item.quantity


async def create_order(
    db: AsyncSession,
    data: OrderCreate,
    user: User | None,
    conversation_id: uuid.UUID | None = None,
) -> Order:
    """Validate stock, snapshot prices, and decrement stock atomically in one transaction."""
    customer_name = data.customer_name or (user.full_name if user else None)
    customer_phone = data.customer_phone or (user.phone if user else None)
    if not customer_name or not customer_phone:
        raise AppError(
            "customer_name and customer_phone are required for guest orders",
            code="missing_customer_info",
        )

    quantities = _merge_quantities(data)
    stmt = (
        select(Product)
        .where(Product.id.in_(quantities.keys()))
        .with_for_update()  # row locks on Postgres; no-op on SQLite
    )
    products = {p.id: p for p in (await db.scalars(stmt)).all()}

    for product_id, quantity in quantities.items():
        product = products.get(product_id)
        if product is None:
            raise NotFoundError(f"Product {product_id} not found")
        if not product.is_available or product.stock_quantity < quantity:
            raise ConflictError(
                f"Insufficient stock for '{product.name}' "
                f"(requested {quantity}, available {product.stock_quantity})",
                code="out_of_stock",
            )

    if data.delivery_location_id is not None:
        location = await db.get(DeliveryLocation, data.delivery_location_id)
        if location is None:
            raise NotFoundError("Delivery location not found")
        if not location.is_within_delivery_area:
            raise ConflictError(
                "Delivery location is outside the delivery area", code="outside_delivery_area"
            )

    subtotal = Decimal("0")
    order_items: list[OrderItem] = []
    for product_id, quantity in quantities.items():
        product = products[product_id]
        line_total = product.price * quantity
        subtotal += line_total
        product.stock_quantity -= quantity
        order_items.append(
            OrderItem(
                product_id=product_id,
                quantity=quantity,
                unit_price=product.price,
                line_total=line_total,
            )
        )

    delivery_fee = Decimal(str(get_settings().default_delivery_fee))
    order = Order(
        user_id=user.id if user else None,
        customer_name=customer_name,
        customer_phone=customer_phone,
        payment_method=data.payment_method,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=subtotal + delivery_fee,
        delivery_location_id=data.delivery_location_id,
        conversation_id=conversation_id,
        notes=data.notes,
        items=order_items,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


async def list_user_orders(
    db: AsyncSession, user: User, params: PageParams
) -> tuple[list[Order], int]:
    base = select(Order).where(Order.user_id == user.id)
    total = await db.scalar(select(func.count()).select_from(base.subquery())) or 0
    stmt = base.order_by(Order.created_at.desc()).offset(params.offset).limit(params.size)
    return list((await db.scalars(stmt)).all()), total


async def get_order(db: AsyncSession, order_id: uuid.UUID, user: User) -> Order:
    order = await db.get(Order, order_id)
    if order is None or (user.role != UserRole.admin and order.user_id != user.id):
        raise NotFoundError("Order not found")
    return order


async def cancel_order(db: AsyncSession, order_id: uuid.UUID, user: User) -> Order:
    order = await get_order(db, order_id, user)
    if order.status not in CANCELLABLE:
        raise ConflictError(
            f"Order in status '{order.status}' cannot be cancelled", code="not_cancellable"
        )
    await _restock(db, order)
    order.status = OrderStatus.cancelled
    await db.commit()
    await db.refresh(order)
    return order


async def admin_list_orders(
    db: AsyncSession, query: AdminOrderQuery
) -> tuple[list[Order], int]:
    base = select(Order)
    if query.status is not None:
        base = base.where(Order.status == query.status)
    if query.customer_phone:
        base = base.where(Order.customer_phone.ilike(f"%{query.customer_phone}%"))
    total = await db.scalar(select(func.count()).select_from(base.subquery())) or 0
    stmt = base.order_by(Order.created_at.desc()).offset(query.offset).limit(query.size)
    return list((await db.scalars(stmt)).all()), total


async def admin_update_status(
    db: AsyncSession, order_id: uuid.UUID, new_status: OrderStatus
) -> Order:
    order = await db.get(Order, order_id)
    if order is None:
        raise NotFoundError("Order not found")
    if order.status in FINAL_STATES:
        raise ConflictError(
            f"Order in final status '{order.status}' cannot change", code="status_final"
        )
    if new_status == OrderStatus.cancelled:
        await _restock(db, order)
    order.status = new_status
    await db.commit()
    await db.refresh(order)
    return order
