"""
Agent tools: hybrid product search (keyword + semantic), comparison,
and order creation.

Why hybrid search?
Pure vector search often misses exact model names ("iPhone 12 mini")
because embeddings favor overall meaning over exact tokens. The hybrid
retriever combines:
  1. keyword matching on product names/brands (exact models always found),
  2. semantic vector search (natural-language queries still work),
  3. price constraints ("under 40000") and category detection ("phone"),
then merges and dedupes the results.

The embedding model and ChromaDB collection are loaded lazily so that
importing this module never crashes — a clear error is raised only when
a tool is actually used and the vector store is missing.
"""

import re
import uuid
from datetime import datetime, timezone

VECTOR_DB_PATH = "vector_store"
COLLECTION_NAME = "products"

_model = None
_collection = None
_catalog = None  # cached list of all products (metadata + description)


# ---------------------------------------------------------------------------
# Lazy loading
# ---------------------------------------------------------------------------

def _get_collection():
    """Lazily load the embedding model and Chroma collection."""
    global _model, _collection

    if _collection is not None:
        return _model, _collection

    import chromadb
    from sentence_transformers import SentenceTransformer

    _model = SentenceTransformer("all-MiniLM-L6-v2")

    client = chromadb.PersistentClient(path=VECTOR_DB_PATH)
    try:
        _collection = client.get_collection(name=COLLECTION_NAME)
    except Exception as e:
        raise RuntimeError(
            "Product vector store not found. Build it first:\n"
            "  1) python app/rag/data_loader.py\n"
            "  2) python app/rag/embeddings.py"
        ) from e

    return _model, _collection


def _get_catalog():
    """All products (metadata + description) from the collection, cached."""
    global _catalog
    if _catalog is None:
        _, collection = _get_collection()
        data = collection.get(include=["metadatas", "documents"])
        _catalog = [
            {
                "name": (m or {}).get("name", "Unknown"),
                "brand": (m or {}).get("brand", "Unknown"),
                "category": (m or {}).get("category", "Unknown"),
                "price": (m or {}).get("price"),
                "rating": (m or {}).get("rating"),
                "description": doc,
            }
            for m, doc in zip(data["metadatas"], data["documents"])
        ]
    return _catalog


# ---------------------------------------------------------------------------
# Query understanding (price constraints, category, keywords)
# ---------------------------------------------------------------------------

CATEGORY_MAP = {
    "phone": "mobile", "phones": "mobile", "mobile": "mobile",
    "mobiles": "mobile", "smartphone": "mobile", "smartphones": "mobile",
    "laptop": "laptop", "laptops": "laptop", "notebook": "laptop",
    "tv": "tv", "tvs": "tv", "television": "tv", "televisions": "tv",
    "fridge": "refrigerator", "fridges": "refrigerator",
    "refrigerator": "refrigerator", "refrigerators": "refrigerator",
    "smartwatch": "smart_watch", "smartwatches": "smart_watch",
    "watch": "smart_watch", "watches": "smart_watch",
    "washer": "washing_machine",
}

STOPWORDS = {
    "i", "a", "an", "the", "need", "want", "wanna", "find", "looking", "for",
    "show", "me", "buy", "purchase", "order", "get", "give", "with", "good",
    "great", "best", "nice", "and", "or", "to", "of", "in", "on", "is", "it",
    "under", "below", "over", "above", "than", "less", "more", "least",
    "price", "priced", "cheap", "cheapest", "budget", "affordable",
    "rs", "inr", "rupees", "dollars", "usd", "please", "can", "you", "do",
    "compare", "vs", "versus", "difference", "between", "recommend",
    "suggest", "suggestion", "some", "any", "one", "that", "this", "there",
    "have", "has", "my", "machine", "washing",  # 'washing machine' handled below
}

_PRICE_MAX_RE = re.compile(
    r"(?:under|below|less than|cheaper than|max(?:imum)?|up ?to|within)\s*(?:rs\.?|₹|\$)?\s*([\d,]+)\s*(k)?",
    re.IGNORECASE,
)
_PRICE_MIN_RE = re.compile(
    r"(?:over|above|more than|at least|min(?:imum)?|starting(?: from)?)\s*(?:rs\.?|₹|\$)?\s*([\d,]+)\s*(k)?",
    re.IGNORECASE,
)


def _parse_price(match):
    value = float(match.group(1).replace(",", ""))
    if match.group(2):  # "40k"
        value *= 1000
    return value


def parse_query(query: str) -> dict:
    """Extract price constraints, category, and search keywords from a query."""
    q = query.lower()

    price_max = price_min = None
    m = _PRICE_MAX_RE.search(q)
    if m:
        price_max = _parse_price(m)
    m = _PRICE_MIN_RE.search(q)
    if m:
        price_min = _parse_price(m)

    category = None
    tokens = re.findall(r"[a-z0-9+]+", q)
    if "washing" in tokens and "machine" in " ".join(tokens):
        category = "washing_machine"
    else:
        for t in tokens:
            if t in CATEGORY_MAP:
                category = CATEGORY_MAP[t]
                break

    # price numbers should not be used as name keywords
    price_digits = set()
    if price_max is not None:
        price_digits.add(str(int(price_max)))
        price_digits.add(str(int(price_max // 1000)))
    if price_min is not None:
        price_digits.add(str(int(price_min)))
        price_digits.add(str(int(price_min // 1000)))

    keywords = [
        t for t in tokens
        if t not in STOPWORDS and t not in CATEGORY_MAP and t not in price_digits
    ]

    return {
        "keywords": keywords,
        "category": category,
        "price_max": price_max,
        "price_min": price_min,
    }


def _passes_filters(product: dict, parsed: dict) -> bool:
    if parsed["category"] and product.get("category") != parsed["category"]:
        return False
    price = product.get("price")
    if parsed["price_max"] is not None and price is not None and price > parsed["price_max"]:
        return False
    if parsed["price_min"] is not None and price is not None and price < parsed["price_min"]:
        return False
    return True


# ---------------------------------------------------------------------------
# Hybrid retrieval
# ---------------------------------------------------------------------------

def _keyword_search(parsed: dict):
    """Score every product by how many query keywords appear in its name/brand."""
    keywords = parsed["keywords"]
    if not keywords:
        return []

    scored = []
    for product in _get_catalog():
        if not _passes_filters(product, parsed):
            continue
        haystack = f"{product['name']} {product['brand']}".lower()
        hits = sum(1 for k in keywords if k in haystack)
        if hits == 0:
            continue
        score = hits / len(keywords)
        scored.append((score, product.get("rating") or 0, product))

    scored.sort(key=lambda x: (-x[0], -x[1]))
    return [(s, p) for s, _, p in scored]


def _vector_search(query: str, parsed: dict, n_results: int = 20):
    """Semantic search, post-filtered by price/category."""
    model, collection = _get_collection()

    query_embedding = model.encode(query)
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=n_results,
    )

    products = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    for doc, meta in zip(documents, metadatas):
        meta = meta or {}
        product = {
            "name": meta.get("name", "Unknown"),
            "brand": meta.get("brand", "Unknown"),
            "category": meta.get("category", "Unknown"),
            "price": meta.get("price"),
            "rating": meta.get("rating"),
            "description": doc,
        }
        if _passes_filters(product, parsed):
            products.append(product)
    return products


def _base_name(name: str) -> str:
    """'APPLE iPhone 12 Mini 5G (Black 64 GB)' -> 'apple iphone 12 mini 5g'"""
    return name.split("(")[0].strip().lower()


def search_products(query: str, limit: int = 5, dedupe_variants: bool = True):
    """
    Hybrid product search: exact keyword matches ranked first, then
    semantic results; price/category constraints applied to both.
    Returns a list of dicts with metadata + description.
    """
    parsed = parse_query(query)

    keyword_results = _keyword_search(parsed)
    # strong keyword matches (most query words found in the product name)
    strong = [p for score, p in keyword_results if score >= 0.6]
    weak = [p for score, p in keyword_results if 0.3 <= score < 0.6]

    try:
        semantic = _vector_search(query, parsed, n_results=max(20, limit * 4))
    except RuntimeError:
        # vector store missing: keyword search over the catalog still works
        # only if the catalog is loadable; otherwise re-raise
        if not keyword_results:
            raise
        semantic = []

    merged, seen = [], set()
    for product in strong + semantic + weak:
        key = _base_name(product["name"]) if dedupe_variants else product["name"]
        if key in seen:
            continue
        seen.add(key)
        merged.append(product)
        if len(merged) >= limit:
            break

    return merged


# ---------------------------------------------------------------------------
# Compare + order tools
# ---------------------------------------------------------------------------

def compare_products(product_list: list):
    """
    Compare the top 2 products in the list for any category.
    Returns a clean comparison table with the main properties.
    """
    if not product_list or len(product_list) < 2:
        return "Not enough products to compare. Try searching first."

    p1, p2 = product_list[0], product_list[1]

    main_keys = [
        "Battery", "RAM", "ROM", "Storage", "Display", "Camera",
        "Processor", "OS", "Operating", "Warranty",
    ]

    comparison = f"""Comparison:

Feature       | {p1['name']} | {p2['name']}
Price         | {p1.get('price', '-')} | {p2.get('price', '-')}
Rating        | {p1.get('rating', '-')} | {p2.get('rating', '-')}
Brand         | {p1.get('brand', '-')} | {p2.get('brand', '-')}
Category      | {p1.get('category', '-')} | {p2.get('category', '-')}
"""

    def extract_features(description: str):
        features = {}
        other_features = []
        for line in (description or "").split(","):
            line = line.strip()
            if not line:
                continue
            matched = False
            for key in main_keys:
                if key.lower() in line.lower():
                    features[key] = line
                    matched = True
                    break
            if not matched:
                other_features.append(line)
        return features, other_features

    p1_features, p1_other = extract_features(p1.get("description", ""))
    p2_features, p2_other = extract_features(p2.get("description", ""))

    for key in main_keys:
        comparison += (
            f"{key:13} | {p1_features.get(key, '-')} | {p2_features.get(key, '-')}\n"
        )

    comparison += (
        "Other         | " + ", ".join(p1_other) + " | " + ", ".join(p2_other) + "\n"
    )

    return comparison


def create_order(selected_product: dict, customer_info: dict):
    """
    Create an order dict from the selected product and customer info.
    The backend team can consume this structure directly.
    """
    return {
        "order_id": str(uuid.uuid4())[:8],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
        "product": selected_product.get("name"),
        "price": selected_product.get("price"),
        "customer_name": customer_info.get("name"),
        "customer_phone": customer_info.get("phone"),
        "customer_address": customer_info.get("customer_address"),
        "lat": customer_info.get("lat"),
        "lng": customer_info.get("lng"),
    }
