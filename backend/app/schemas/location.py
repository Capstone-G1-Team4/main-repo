"""Pydantic schemas for location resolution and saved addresses."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LocationResolveRequest(BaseModel):
    input: str = Field(min_length=3, max_length=2000, description="Maps link or address text")


class LocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    raw_input: str
    latitude: float | None
    longitude: float | None
    formatted_address: str | None
    place_id: str | None
    city: str | None
    zone: str | None
    is_within_delivery_area: bool
    created_at: datetime


class LocationResolveOut(BaseModel):
    location: LocationOut
    delivery_fee: Decimal | None = Field(
        description="Estimated fee; null when outside the delivery area"
    )
    currency: str


class SavedAddressCreate(BaseModel):
    label: str = Field(min_length=1, max_length=64)
    delivery_location_id: UUID
    is_default: bool = False


class SavedAddressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    is_default: bool
    location: LocationOut
