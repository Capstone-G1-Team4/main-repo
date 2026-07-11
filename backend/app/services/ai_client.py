"""HTTP client for the external AI microservice with timeout, retry, and graceful degradation."""

from functools import lru_cache

import httpx
from pydantic import ValidationError

from app.core.config import get_settings
from app.core.exceptions import AIServiceUnavailableError
from app.schemas.chat import AIChatRequest, AIChatResponse

_ATTEMPTS = 2


class AIServiceClient:
    def __init__(self, base_url: str, timeout: float) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

    async def chat(self, request: AIChatRequest) -> AIChatResponse:
        payload = request.model_dump(mode="json")
        last_error: Exception | None = None
        for _ in range(_ATTEMPTS):
            try:
                async with httpx.AsyncClient(timeout=self._timeout) as client:
                    resp = await client.post(f"{self._base_url}/agent/chat", json=payload)
                break
            except httpx.TransportError as exc:
                last_error = exc
        else:
            raise AIServiceUnavailableError(
                "AI service is unreachable, please try again later"
            ) from last_error

        if resp.status_code != 200:
            raise AIServiceUnavailableError(
                f"AI service returned status {resp.status_code}"
            )
        try:
            return AIChatResponse.model_validate(resp.json())
        except (ValidationError, ValueError) as exc:
            raise AIServiceUnavailableError("AI service returned an invalid response") from exc


@lru_cache
def get_ai_client() -> AIServiceClient:
    settings = get_settings()
    return AIServiceClient(settings.ai_service_url, settings.ai_service_timeout_seconds)
