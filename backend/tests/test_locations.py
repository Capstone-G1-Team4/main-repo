"""Location tests: URL parsing, mock/real resolution, zone check, saved addresses."""

import pytest
from httpx import AsyncClient

from app.services import maps_service
from app.utils.maps_urls import extract_coordinates, extract_place_id, is_maps_url

RESOLVE = "/api/v1/locations/resolve"
ADDRESSES = "/api/v1/locations/addresses"


def test_maps_url_detection() -> None:
    assert is_maps_url("https://www.google.com/maps/@31.95,35.91,15z")
    assert is_maps_url("https://maps.app.goo.gl/AbCdEf123")
    assert not is_maps_url("Amman, Jordan")
    assert not is_maps_url("google.com/maps without scheme")


def test_coordinate_extraction_patterns() -> None:
    assert extract_coordinates("https://google.com/maps/@31.9539,35.9106,15z") == (31.9539, 35.9106)
    assert extract_coordinates("https://maps.google.com/?q=31.95,35.91") == (31.95, 35.91)
    assert extract_coordinates("https://google.com/maps/place/x/!3d31.9!4d35.9") == (31.9, 35.9)
    assert extract_coordinates("https://google.com/maps/place/Amman") is None
    # out-of-range coordinates are rejected
    assert extract_coordinates("https://google.com/maps/@131.9,35.9,15z") is None


def test_place_id_extraction() -> None:
    url = "https://www.google.com/maps/search/?api=1&query_place_id=ChIJmzrzi9GcHBUR8ny1U0rGkw4"
    assert extract_place_id(url) == "ChIJmzrzi9GcHBUR8ny1U0rGkw4"


async def test_resolve_with_mock_resolver(client: AsyncClient) -> None:
    """Without GOOGLE_MAPS_API_KEY the mock resolver answers offline, inside the zone."""
    resp = await client.post(
        RESOLVE, json={"input": "https://www.google.com/maps/@31.9539,35.9106,15z"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["location"]["latitude"] == 31.9539
    assert body["location"]["city"] == "Amman"
    assert body["location"]["is_within_delivery_area"] is True
    assert body["delivery_fee"] is not None


async def test_resolve_plain_address_mock(client: AsyncClient) -> None:
    resp = await client.post(RESOLVE, json={"input": "Rainbow Street, Amman"})
    assert resp.status_code == 200
    assert resp.json()["location"]["formatted_address"].startswith("[mock]")


async def test_resolve_real_mode_outside_zone(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """With an API key, the geocoding response drives the zone check."""
    from app.core.config import get_settings

    monkeypatch.setattr(get_settings(), "google_maps_api_key", "fake-key")

    async def fake_fetch_json(url: str, params: dict) -> dict:
        return {
            "status": "OK",
            "results": [
                {
                    "formatted_address": "Irbid, Jordan",
                    "place_id": "ChIJfake",
                    "geometry": {"location": {"lat": 32.55, "lng": 35.85}},
                    "address_components": [
                        {"long_name": "Irbid", "types": ["locality", "political"]}
                    ],
                }
            ],
        }

    monkeypatch.setattr(maps_service, "_fetch_json", fake_fetch_json)

    resp = await client.post(RESOLVE, json={"input": "Irbid city centre"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["location"]["city"] == "Irbid"
    assert body["location"]["is_within_delivery_area"] is False
    assert body["delivery_fee"] is None


async def test_resolve_short_link_expansion(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    from app.core.config import get_settings

    monkeypatch.setattr(get_settings(), "google_maps_api_key", "fake-key")

    async def fake_expand(url: str) -> str:
        return "https://www.google.com/maps/@31.9000,35.9000,15z"

    async def fake_fetch_json(url: str, params: dict) -> dict:
        assert params.get("latlng") == "31.9,35.9"
        return {
            "status": "OK",
            "results": [
                {
                    "formatted_address": "Somewhere, Amman, Jordan",
                    "place_id": "ChIJx",
                    "geometry": {"location": {"lat": 31.9, "lng": 35.9}},
                    "address_components": [{"long_name": "Amman", "types": ["locality"]}],
                }
            ],
        }

    monkeypatch.setattr(maps_service, "_expand_short_url", fake_expand)
    monkeypatch.setattr(maps_service, "_fetch_json", fake_fetch_json)

    resp = await client.post(RESOLVE, json={"input": "https://maps.app.goo.gl/xYz123"})
    assert resp.status_code == 200
    assert resp.json()["location"]["is_within_delivery_area"] is True


async def test_saved_addresses_crud(client: AsyncClient, customer: dict) -> None:
    resolved = await client.post(
        RESOLVE, json={"input": "Home sweet home, Amman"}, headers=customer["headers"]
    )
    location_id = resolved.json()["location"]["id"]

    resp = await client.post(
        ADDRESSES,
        json={"label": "Home", "delivery_location_id": location_id, "is_default": True},
        headers=customer["headers"],
    )
    assert resp.status_code == 201
    first = resp.json()
    assert first["is_default"] is True

    resp = await client.post(
        ADDRESSES,
        json={"label": "Work", "delivery_location_id": location_id, "is_default": True},
        headers=customer["headers"],
    )
    second = resp.json()

    listing = (await client.get(ADDRESSES, headers=customer["headers"])).json()
    assert len(listing) == 2
    defaults = [a for a in listing if a["is_default"]]
    assert len(defaults) == 1 and defaults[0]["id"] == second["id"]

    resp = await client.patch(
        f"{ADDRESSES}/{first['id']}/default", headers=customer["headers"]
    )
    assert resp.json()["is_default"] is True

    resp = await client.delete(f"{ADDRESSES}/{second['id']}", headers=customer["headers"])
    assert resp.status_code == 204
    listing = (await client.get(ADDRESSES, headers=customer["headers"])).json()
    assert len(listing) == 1


async def test_saved_addresses_require_auth(client: AsyncClient) -> None:
    assert (await client.get(ADDRESSES)).status_code == 401
