"""Health endpoints: liveness and readiness (DB + AI service reachability)."""

import httpx
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@router.get("/health/ready")
async def readiness(db: AsyncSession = Depends(get_db)) -> dict:
    settings = get_settings()
    checks: dict[str, str] = {}

    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "unreachable"

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.ai_service_url}/health")
            checks["ai_service"] = "ok" if resp.status_code == 200 else "degraded"
    except httpx.HTTPError:
        checks["ai_service"] = "unreachable"

    status = "ok" if checks["database"] == "ok" else "degraded"
    return {"status": status, "checks": checks}
