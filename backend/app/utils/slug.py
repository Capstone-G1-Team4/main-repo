"""Tiny slug helper used by catalog services."""

import re
import uuid


def slugify(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower().strip()).strip("-")
    return value or "item"


def unique_suffix() -> str:
    return uuid.uuid4().hex[:6]
