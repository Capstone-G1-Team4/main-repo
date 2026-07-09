import chromadb
from sentence_transformers import SentenceTransformer

VECTOR_DB_PATH = "vector_store"

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Connect to ChromaDB
client = chromadb.PersistentClient(path=VECTOR_DB_PATH)
collection = client.get_collection(name="products")


def search_products(query: str, limit: int = 5):
    """
    Search products using RAG retrieval.
    Works for all categories in the dataset.
    Returns a list of dicts with metadata + description.
    """
    query_embedding = model.encode(query)
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=limit
    )

    products = []
    for i in range(len(results["documents"][0])):
        products.append(
            {
                "name": results["metadatas"][0][i]["name"],
                "brand": results["metadatas"][0][i]["brand"],
                "category": results["metadatas"][0][i]["category"],
                "price": results["metadatas"][0][i]["price"],
                "rating": results["metadatas"][0][i]["rating"],
                "description": results["documents"][0][i]
            }
        )
    return products


def compare_products(product_list: list):
    """
    Compare top 2 products in the list for any category.
    Returns a clean comparison table with main properties.
    """
    if len(product_list) < 2:
        return "Not enough products to compare."

    p1 = product_list[0]
    p2 = product_list[1]

    # الخصائص الأساسية لكل جهاز
    main_keys = ["Battery", "RAM", "ROM", "Storage", "Display", "Camera",
                 "Processor", "OS", "Operating", "Warranty"]

    comparison = f"""Comparison:

Feature       | {p1['name']} | {p2['name']}
Price         | {p1['price']} | {p2['price']}
Rating        | {p1['rating']} | {p2['rating']}
Brand         | {p1['brand']} | {p2['brand']}
Category      | {p1['category']} | {p2['category']}
"""

    # استخراج الخصائص من description
    def extract_features(description: str):
        features = {}
        other_features = []
        for line in description.split(','):
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

    # إضافة الخصائص الأساسية
    for key in main_keys:
        comparison += f"{key:13} | {p1_features.get(key,'-')} | {p2_features.get(key,'-')}\n"

    # إضافة باقي الخصائص تحت Other
    comparison += "Other         | " + ", ".join(p1_other) + " | " + ", ".join(p2_other) + "\n"

    return comparison


def create_order(selected_product: dict, customer_info: dict):
    """
    Create order dictionary from selected product and customer info.
    """
    order = {
        "product": selected_product["name"],
        "price": selected_product["price"],
        "customer_name": customer_info.get("name"),
        "customer_phone": customer_info.get("phone"),
        "customer_address": customer_info.get("customer_address"),
        "lat": customer_info.get("lat"),
        "lng": customer_info.get("lng")
    }
    return order