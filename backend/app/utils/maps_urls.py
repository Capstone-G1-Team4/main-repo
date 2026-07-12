"""Pure parsing helpers for Google Maps URLs: coordinates, place ids, short links."""

import re

_MAPS_HOST_MARKERS = (
    "google.com/maps",
    "maps.google.",
    "maps.app.goo.gl",
    "goo.gl/maps",
)
_SHORT_HOST_MARKERS = ("maps.app.goo.gl", "goo.gl/maps")

_COORD_PATTERNS = [
    re.compile(r"@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)"),
    re.compile(r"[?&]q=(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)"),
    re.compile(r"[?&]query=(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)"),
    re.compile(r"!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)"),
]
_PLACE_ID_PATTERN = re.compile(r"(?:place_id[=:]|query_place_id=)([A-Za-z0-9_-]{10,})")


def is_maps_url(text: str) -> bool:
    lowered = text.lower()
    return lowered.startswith(("http://", "https://")) and any(
        marker in lowered for marker in _MAPS_HOST_MARKERS
    )


def is_short_maps_url(url: str) -> bool:
    lowered = url.lower()
    return any(marker in lowered for marker in _SHORT_HOST_MARKERS)


def extract_coordinates(url: str) -> tuple[float, float] | None:
    for pattern in _COORD_PATTERNS:
        match = pattern.search(url)
        if match:
            lat, lng = float(match.group(1)), float(match.group(2))
            if -90 <= lat <= 90 and -180 <= lng <= 180:
                return lat, lng
    return None


def extract_place_id(url: str) -> str | None:
    match = _PLACE_ID_PATTERN.search(url)
    return match.group(1) if match else None
