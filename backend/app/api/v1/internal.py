"""Internal router: catalog export for the AI service indexer, guarded by X-Internal-API-Key."""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends

from app.core.deps import DbSession, require_internal_key
from app.schemas.product import ProductExportItem
from app.services import product_service

router = APIRouter(
    prefix="/internal", tags=["internal"], dependencies=[Depends(require_internal_key)]
)


@router.get("/products/export")
async def export_products(db: DbSession) -> dict:
    rows = await product_service.export_catalog(db)
    items = [
        ProductExportItem.model_validate(row["product"], from_attributes=True).model_copy(
            update={"category": row["category"]}
        )
        for row in rows
    ]
    return {
        "generated_at": datetime.now(UTC).isoformat(),
        "count": len(items),
        "products": items,
    }
