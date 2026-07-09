import chromadb
from pathlib import Path
from sentence_transformers import SentenceTransformer



VECTOR_DB_PATH = Path("vector_store")



# Same model used during embedding creation

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)



client = chromadb.PersistentClient(
    path=str(VECTOR_DB_PATH)
)



collection = client.get_collection(
    name="products"
)




def retrieve_products(query: str, k: int = 5):


    # Convert user query to vector

    query_embedding = model.encode(
        query
    )


    results = collection.query(
        query_embeddings=[
            query_embedding.tolist()
        ],
        n_results=k
    )



    products = []



    for i in range(
        len(results["documents"][0])
    ):


        products.append(

            {
                "content": results["documents"][0][i],

                "metadata": results["metadatas"][0][i],

                "distance": results["distances"][0][i]
            }

        )


    return products