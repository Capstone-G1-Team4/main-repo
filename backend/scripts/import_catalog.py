"""Import the processed catalog dataset (Agentic-RAG/data/processed/products.json)
into the products and categories tables.

Usage:
    python scripts/import_catalog.py [--file PATH] [--stock N] [--append]

Notes:
- Prices in the dataset are INR (Flipkart source), imported as-is with currency "INR".
- The dataset has no stock information; every product gets a default stock (--stock, default 10).
- Exact duplicate rows are skipped; same-name listings with different specs are kept.
- Refuses to run on a non-empty products table unless --append is passed.
"""

import argparse
import asyncio
import json
import os
import sys
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import func, select  # noqa: E402

from app.db.session import async_session_factory  # noqa: E402
from app.models.category import Category  # noqa: E402
from app.models.product import Product  # noqa: E402
from app.utils.slug import slugify  # noqa: E402

DEFAULT_FILE = (
    Path(__file__).resolve().parents[2] / "Agentic-RAG" / "data" / "processed" / "products.json"
)
COMMIT_CHUNK = 500


def load_unique_rows(path: Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        rows = json.load(f)
    seen: set[str] = set()
    unique: list[dict] = []
    for row in rows:
        key = json.dumps(row, sort_keys=True)
        if key not in seen:
            seen.add(key)
            unique.append(row)
    return unique


def to_product(row: dict, category_id: int, slug: str, stock: int) -> Product:
    details = row.get("details") or []
    return Product(
        name=row["name"][:255],
        slug=slug,
        description=", ".join(details),
        specifications={"rating": row.get("rating"), "details": details},
        price=Decimal(str(row["price"])),
        currency="INR",
        stock_quantity=stock,
        is_available=True,
        image_urls=[],
        category_id=category_id,
        brand=(row.get("brand") or None),
    )


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", type=Path, default=DEFAULT_FILE)
    parser.add_argument("--stock", type=int, default=10)
    parser.add_argument("--append", action="store_true", help="allow import into non-empty table")
    args = parser.parse_args()

    rows = load_unique_rows(args.file)
    print(f"Loaded {len(rows)} unique rows from {args.file}")

    async with async_session_factory() as db:
        existing = await db.scalar(select(func.count()).select_from(Product)) or 0
        if existing and not args.append:
            print(f"Aborting: products table already has {existing} rows (use --append).")
            return

        # get-or-create categories from the dataset's category values
        category_ids: dict[str, int] = {}
        for raw_name in sorted({row["category"] for row in rows}):
            slug = slugify(raw_name)
            category = await db.scalar(select(Category).where(Category.slug == slug))
            if category is None:
                category = Category(name=raw_name.replace("_", " ").title(), slug=slug)
                db.add(category)
                await db.flush()
            category_ids[raw_name] = category.id
        await db.commit()
        print(f"Categories ready: {list(category_ids)}")

        # in-memory slug de-duplication (dataset has same-name listings)
        taken_slugs = set(
            (await db.scalars(select(Product.slug))).all()
        )
        imported = 0
        for row in rows:
            base = slugify(row["name"])[:270]
            slug, n = base, 2
            while slug in taken_slugs:
                slug = f"{base}-{n}"
                n += 1
            taken_slugs.add(slug)
            db.add(to_product(row, category_ids[row["category"]], slug, args.stock))
            imported += 1
            if imported % COMMIT_CHUNK == 0:
                await db.commit()
                print(f"  ... {imported}/{len(rows)}")
        await db.commit()

        total = await db.scalar(select(func.count()).select_from(Product)) or 0
        print(f"Done. Imported {imported} products (table now has {total}).")


if __name__ == "__main__":
    asyncio.run(main())
