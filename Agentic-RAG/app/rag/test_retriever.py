import chromadb
from sentence_transformers import SentenceTransformer


VECTOR_DB_PATH = "vector_store"


model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


client = chromadb.PersistentClient(
    path=VECTOR_DB_PATH
)


collection = client.get_collection(
    name="products"
)


def search_products(query):

    query_embedding = model.encode(
        query
    )


    results = collection.query(
        query_embeddings=[
            query_embedding.tolist()
        ],
        n_results=5
    )


    return results



if __name__ == "__main__":

    query = "laptop with good performance and 8GB RAM"


    results = search_products(query)


    for i, product in enumerate(results["documents"][0]):

        print("\nRESULT", i+1)
        print(product[:500])
        print("----------------")