"""Application settings loaded from environment variables via pydantic-settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_name: str = "AI Shopping Assistant API"
    environment: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/shopdb"

    # Auth / JWT
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # External services
    ai_service_url: str = "http://localhost:8001"
    ai_service_timeout_seconds: float = 30.0
    internal_api_key: str = "change-me-internal-key"
    google_maps_api_key: str = ""

    # Delivery zones: comma-separated city names allowed for delivery
    delivery_zone_cities: str = "Amman"
    default_delivery_fee: float = 3.0
    default_currency: str = "JOD"

    # CORS: comma-separated origins for the frontend
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def delivery_zone_cities_list(self) -> list[str]:
        return [c.strip().lower() for c in self.delivery_zone_cities.split(",") if c.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
