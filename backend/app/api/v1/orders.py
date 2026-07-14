"""Orders router: checkout, own-order queries, cancellation, and admin order management."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.deps import AdminUser, CurrentUser, DbSession, OptionalUser
from app.schemas.common import Page, PageParams
from app.schemas.order import AdminOrderQuery, OrderCreate, OrderOut, OrderStatusUpdate
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["orders"])
admin_router = APIRouter(prefix="/admin/orders", tags=["admin"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(data: OrderCreate, db: DbSession, user: OptionalUser) -> OrderOut:
    order = await order_service.create_order(db, data, user)
    return OrderOut.model_validate(order)


@router.get("", response_model=Page[OrderOut])
async def list_my_orders(
    db: DbSession, user: CurrentUser, params: Annotated[PageParams, Query()]
) -> Page[OrderOut]:
    items, total = await order_service.list_user_orders(db, user, params)
    return Page.build([OrderOut.model_validate(o) for o in items], total, params)


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: UUID, db: DbSession, user: CurrentUser) -> OrderOut:
    order = await order_service.get_order(db, order_id, user)
    return OrderOut.model_validate(order)


@router.post("/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(order_id: UUID, db: DbSession, user: CurrentUser) -> OrderOut:
    order = await order_service.cancel_order(db, order_id, user)
    return OrderOut.model_validate(order)


@admin_router.get("", response_model=Page[OrderOut])
async def admin_list_orders(
    db: DbSession, _admin: AdminUser, query: Annotated[AdminOrderQuery, Query()]
) -> Page[OrderOut]:
    items, total = await order_service.admin_list_orders(db, query)
    return Page.build([OrderOut.model_validate(o) for o in items], total, query)


@admin_router.patch("/{order_id}/status", response_model=OrderOut)
async def admin_update_status(
    order_id: UUID, data: OrderStatusUpdate, db: DbSession, _admin: AdminUser
) -> OrderOut:
    order = await order_service.admin_update_status(db, order_id, data.status)
    return OrderOut.model_validate(order)
