"""
Agent tools: product search (vector DB), comparison, and order creation.

The embedding model and ChromaDB collection are loaded lazily so that
importing this module never crashes — a clear error is raised only when
a tool is actually used and the vector store is missing.
"""

import uuid
from datetime import datetime, timezone

VECTOR_DB_PATH = "vector_store"
COLLECTION_NAME = "products"

_model = None
_collection = None


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


def search_products(query: str, limit: int = 5):
    """
    Semantic product search over the vector store.
    Works for all categories in the dataset.
    Returns a list of dicts with metadata + description.
    """
    model, collection = _get_collection()

    query_embedding = model.encode(query)
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=limit,
    )

    products = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    for doc, meta in zip(documents, metadatas):
        meta = meta or {}
        products.append(
            {
                "name": meta.get("name", "Unknown"),
                "brand": meta.get("brand", "Unknown"),
                "category": meta.get("category", "Unknown"),
                "price": meta.get("price"),
                "rating": meta.get("rating"),
                "description": doc,
            }
        )
    return products


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
