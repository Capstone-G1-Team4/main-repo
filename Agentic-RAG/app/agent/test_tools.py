from tools import search_products



results = search_products(
    "Samsung phone under 400 dollars with good battery"
)


for product in results:

    print("\n--- PRODUCT ---")

    print(
        product["information"][:400]
    )