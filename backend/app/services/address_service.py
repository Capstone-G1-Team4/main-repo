"""Saved address business logic for logged-in users."""

import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.location import DeliveryLocation, SavedAddress
from app.schemas.location import SavedAddressCreate


async def list_addresses(db: AsyncSession, user_id: uuid.UUID) -> list[SavedAddress]:
    stmt = (
        select(SavedAddress)
        .where(SavedAddress.user_id == user_id)
        .order_by(SavedAddress.is_default.desc(), SavedAddress.id)
    )
    return list((await db.scalars(stmt)).all())


async def create_address(
    db: AsyncSession, user_id: uuid.UUID, data: SavedAddressCreate
) -> SavedAddress:
    location = await db.get(DeliveryLocation, data.delivery_location_id)
    if location is None:
        raise NotFoundError("Delivery location not found")
    if data.is_default:
        await db.execute(
            update(SavedAddress)
            .where(SavedAddress.user_id == user_id)
            .values(is_default=False)
        )
    address = SavedAddress(
        user_id=user_id,
        label=data.label,
        delivery_location_id=data.delivery_location_id,
        is_default=data.is_default,
    )
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address


async def delete_address(db: AsyncSession, user_id: uuid.UUID, address_id: int) -> None:
    address = await db.get(SavedAddress, address_id)
    if address is None or address.user_id != user_id:
        raise NotFoundError("Saved address not found")
    await db.delete(address)
    await db.commit()


async def set_default(db: AsyncSession, user_id: uuid.UUID, address_id: int) -> SavedAddress:
    address = await db.get(SavedAddress, address_id)
    if address is None or address.user_id != user_id:
        raise NotFoundError("Saved address not found")
    await db.execute(
        update(SavedAddress).where(SavedAddress.user_id == user_id).values(is_default=False)
    )
    address.is_default = True
    await db.commit()
    await db.refresh(address)
    return address
