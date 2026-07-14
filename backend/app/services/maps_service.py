"""Location resolution: Google Maps links/addresses → geocoded, zone-checked delivery locations.

Falls back to a deterministic offline mock resolver when GOOGLE_MAPS_API_KEY is unset,
so the team can develop without a key.
"""

import uuid
from decimal import Decimal

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import AppError
from app.models.location import DeliveryLocation
from app.utils.maps_urls import (
    extract_coordinates,
    extract_place_id,
    is_maps_url,
    is_short_maps_url,
)

_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

# Amman city centre — used by the mock resolver when the input has no coordinates.
_MOCK_LAT, _MOCK_LNG = 31.9539, 35.9106


async def _fetch_json(url: str, params: dict) -> dict:
    """Thin HTTP wrapper (monkeypatched in tests)."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()


async def _expand_short_url(url: str) -> str:
    """Follow redirects of maps.app.goo.gl short links (monkeypatched in tests)."""
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        resp = await client.get(url)
        return str(resp.url)


def _extract_city(components: list[dict]) -> str | None:
    for wanted in ("locality", "administrative_area_level_1"):
        for comp in components:
            if wanted in comp.get("types", []):
                return comp.get("long_name")
    return None


async def _geocode(
    coords: tuple[float, float] | None, place_id: str | None, address: str | None
) -> dict:
    settings = get_settings()
    params: dict = {"key": settings.google_maps_api_key}
    if coords:
        params["latlng"] = f"{coords[0]},{coords[1]}"
    elif place_id:
        params["place_id"] = place_id
    else:
        params["address"] = address
    try:
        data = await _fetch_json(_GEOCODE_URL, params)
    except httpx.HTTPError as exc:
        raise AppError("Geocoding service unavailable", code="geocoding_unavailable") from exc
    results = data.get("results") or []
    if data.get("status") != "OK" or not results:
        raise AppError("Could not resolve the given location", code="location_not_resolved")
    top = results[0]
    geometry = top.get("geometry", {}).get("location", {})
    return {
        "latitude": geometry.get("lat"),
        "longitude": geometry.get("lng"),
        "formatted_address": top.get("formatted_address"),
        "place_id": top.get("place_id"),
        "city": _extract_city(top.get("address_components", [])),
    }


def _mock_resolve(text: str, coords: tuple[float, float] | None) -> dict:
    """Offline resolver used when no API key is configured: always inside the first zone."""
    zones = get_settings().delivery_zone_cities_list
    city = zones[0].title() if zones else None
    lat, lng = coords if coords else (_MOCK_LAT, _MOCK_LNG)
    return {
        "latitude": lat,
        "longitude": lng,
        "formatted_address": f"[mock] {text[:180]}",
        "place_id": None,
        "city": city,
    }


def is_within_delivery_area(city: str | None) -> bool:
    if not city:
        return False
    return city.strip().lower() in get_settings().delivery_zone_cities_list


async def resolve_location(
    db: AsyncSession, raw_input: str, user_id: uuid.UUID | None
) -> tuple[DeliveryLocation, Decimal | None]:
    """Resolve a maps link or address into a persisted DeliveryLocation + estimated fee."""
    settings = get_settings()
    text = raw_input.strip()
    coords: tuple[float, float] | None = None
    place_id: str | None = None

    if is_maps_url(text):
        url = text
        if is_short_maps_url(url) and settings.google_maps_api_key:
            url = await _expand_short_url(url)
        coords = extract_coordinates(url)
        place_id = extract_place_id(url)

    if settings.google_maps_api_key:
        resolved = await _geocode(coords, place_id, text)
    else:
        resolved = _mock_resolve(text, coords)

    within = is_within_delivery_area(resolved["city"])
    location = DeliveryLocation(
        user_id=user_id,
        raw_input=text,
        latitude=resolved["latitude"],
        longitude=resolved["longitude"],
        formatted_address=resolved["formatted_address"],
        place_id=resolved["place_id"],
        city=resolved["city"],
        zone=resolved["city"],
        is_within_delivery_area=within,
    )
    db.add(location)
    await db.commit()
    await db.refresh(location)

    fee = Decimal(str(settings.default_delivery_fee)) if within else None
    return location, fee
