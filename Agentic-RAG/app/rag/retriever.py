"""
RAG retriever: semantic search over the product vector store.
Model and collection are loaded lazily (no crash on import).
"""

from pathlib import Path

_BASE_DIR = Path(__file__).resolve().parents[2]
_CANDIDATES = [
    _BASE_DIR / "vector_store",
    _BASE_DIR / "Agentic-RAG" / "vector_store",
    Path("vector_store"),
]
VECTOR_DB_PATH = str(next((p for p in _CANDIDATES if p.exists()), _CANDIDATES[0]))
COLLECTION_NAME = "products"

_model = None
_collection = None


def _get_collection():
    global _model, _collection

    if _collection is not None:
        return _model, _collection

    import chromadb
    from sentence_transformers import SentenceTransformer

    # Same model used during embedding creation
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


def retrieve_products(query: str, k: int = 5):
    """Return the k most relevant products for the query."""
    model, collection = _get_collection()

    query_embedding = model.encode(query)

    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=k,
    )

    products = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for i in range(len(documents)):
        products.append(
            {
                "content": documents[i],
                "metadata": metadatas[i],
                "distance": distances[i] if i < len(distances) else None,
            }
        )

    return products
