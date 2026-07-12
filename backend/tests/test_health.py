"""Health endpoint tests."""

from httpx import AsyncClient


async def test_health_liveness(client: AsyncClient) -> None:
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


async def test_health_readiness_reports_db(client: AsyncClient) -> None:
    resp = await client.get("/health/ready")
    assert resp.status_code == 200
    body = resp.json()
    assert body["checks"]["database"] == "ok"
    # AI service is not running during tests; it must degrade, not fail.
    assert body["checks"]["ai_service"] in {"ok", "degraded", "unreachable"}
