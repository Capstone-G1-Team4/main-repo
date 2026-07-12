"""Locations router: maps-link/address resolution and saved-address CRUD."""

from fastapi import APIRouter, status

from app.core.config import get_settings
from app.core.deps import CurrentUser, DbSession, OptionalUser
from app.schemas.location import (
    LocationOut,
    LocationResolveOut,
    LocationResolveRequest,
    SavedAddressCreate,
    SavedAddressOut,
)
from app.services import address_service, maps_service

router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("/resolve", response_model=LocationResolveOut)
async def resolve_location(
    data: LocationResolveRequest, db: DbSession, user: OptionalUser
) -> LocationResolveOut:
    location, fee = await maps_service.resolve_location(
        db, data.input, user.id if user else None
    )
    return LocationResolveOut(
        location=LocationOut.model_validate(location),
        delivery_fee=fee,
        currency=get_settings().default_currency,
    )


@router.get("/addresses", response_model=list[SavedAddressOut])
async def list_addresses(db: DbSession, user: CurrentUser) -> list[SavedAddressOut]:
    addresses = await address_service.list_addresses(db, user.id)
    return [SavedAddressOut.model_validate(a) for a in addresses]


@router.post("/addresses", response_model=SavedAddressOut, status_code=status.HTTP_201_CREATED)
async def create_address(
    data: SavedAddressCreate, db: DbSession, user: CurrentUser
) -> SavedAddressOut:
    address = await address_service.create_address(db, user.id, data)
    return SavedAddressOut.model_validate(address)


@router.patch("/addresses/{address_id}/default", response_model=SavedAddressOut)
async def set_default_address(
    address_id: int, db: DbSession, user: CurrentUser
) -> SavedAddressOut:
    address = await address_service.set_default(db, user.id, address_id)
    return SavedAddressOut.model_validate(address)


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(address_id: int, db: DbSession, user: CurrentUser) -> None:
    await address_service.delete_address(db, user.id, address_id)
