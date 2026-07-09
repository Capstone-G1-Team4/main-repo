import os
import json

import chromadb

from sentence_transformers import SentenceTransformer



# Paths

DATA_PATH = "data/processed/products.json"

VECTOR_DB_PATH = "vector_store"



# Load embedding model

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)



def load_products():

    with open(
        DATA_PATH,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)



def create_vector_database():

    products = load_products()


    print(
        f"Loaded {len(products)} products"
    )


    # Initialize Chroma

    client = chromadb.PersistentClient(
        path=VECTOR_DB_PATH
    )


    collection = client.get_or_create_collection(
        name="products"
    )


    documents = []
    metadatas = []
    ids = []


    for index, product in enumerate(products):


        documents.append(
            product["text"]
        )


        metadatas.append(
            {
                "name": product["name"],
                "brand": product["brand"],
                "category": product["category"],
                "price": product["price"],
                "rating": product["rating"]
            }
        )


        ids.append(
            str(index)
        )


    print(
        "Creating embeddings..."
    )


    embeddings = model.encode(
        documents,
        show_progress_bar=True
    )


    collection.add(
        documents=documents,
        embeddings=embeddings.tolist(),
        metadatas=metadatas,
        ids=ids
    )


    print(
        "Vector database created successfully!"
    )



if __name__ == "__main__":

    create_vector_database()