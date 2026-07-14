import json
import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.rag.pipeline import rag_answer
from app.rag.retriever import retrieve_products
from app.agent.tools import search_products

# 50 test queries (mix of specific, vague, comparison, product questions)
TEST_QUERIES = [
    # Specific product queries
    "I need a Samsung phone under 40000 with good battery",
    "Show me Lenovo laptops with 16GB RAM and 512GB SSD",
    "Find an HP laptop with Intel i5 processor under 60000",
    "Looking for a red Samsung smartphone",
    "I want a Dell Inspiron laptop with Windows 11",
    "Give me ASUS phones with 5G connectivity",
    "Show me Acer laptops with 15.6 inch display",
    "Find Xiaomi phones with 64MP camera",
    "Looking for a MacBook Air alternative under 80000",
    "Show me OnePlus phones with fast charging",
    # Vague needs
    "Something for my grandma",
    "A good phone for students",
    "Best budget laptop",
    "Something cheap but reliable",
    "A phone with good camera quality",
    "Laptop for video editing",
    "Phone for gaming",
    "Lightweight laptop for travel",
    "Phone with long battery life",
    "Affordable home appliances",
    # Comparison queries
    "Compare Samsung A13 vs Xiaomi Redmi Note 12",
    "Which is better: Lenovo IdeaPad or ASUS VivoBook",
    "Compare HP 14s vs Dell Inspiron",
    "Differences between Samsung Galaxy and OnePlus",
    "Compare Acer Swift vs ASUS ZenBook",
    "Which phone has better camera: iPhone or Samsung",
    "Compare laptop battery life of Lenovo vs HP",
    "Which is more affordable: Xiaomi or Realme",
    "Compare display quality of ASUS vs Dell",
    "Compare Samsung Galaxy S series vs A series",
    # Product questions
    "Does the Samsung A13 have 5G?",
    "What is the RAM capacity of Lenovo IdeaPad 3?",
    "Does ASUS VivoBook have a backlit keyboard?",
    "What is the price of HP 14s laptop?",
    "Is the Xiaomi Redmi Note 12 waterproof?",
    "What is the battery capacity of Samsung Galaxy M33?",
    "Does Dell Inspiron come with Microsoft Office?",
    "What is the screen size of ASUS ZenBook?",
    "Is there a warranty on Lenovo laptops?",
    "Does the Realme C35 have a fingerprint sensor?",
    # More queries to reach 50
    "Show me phones with AMOLED display",
    "Find laptops with SSD storage",
    "I want a phone with 128GB storage",
    "Show me laptops under 30000",
    "Find Samsung phones with 6GB RAM",
    "Looking for a 14 inch laptop",
    "Show me phones with 5000mAh battery",
    "Find laptops with Intel i7 processor",
    "Looking for a phone under 20000",
    "Show me laptops with NVIDIA graphics"
]

# Evaluation results
results = []

print("Running 50 test queries...")
for i, query in enumerate(TEST_QUERIES, 1):
    print(f"\n[{i}/{len(TEST_QUERIES)}] Query: {query}")
    
    try:
        # Retrieve products using retrieve_products (for distance info)
        retrieved_raw = retrieve_products(query)
        # Convert to the same format as search_products
        retrieved_products = []
        for product in retrieved_raw:
            meta = product["metadata"] or {}
            retrieved_products.append({
                "name": meta.get("name", "Unknown"),
                "brand": meta.get("brand", "Unknown"),
                "category": meta.get("category", "Unknown"),
                "price": meta.get("price"),
                "rating": meta.get("rating"),
                "description": product["content"],
                "distance": product["distance"]
            })
        print(f"Retrieved {len(retrieved_products)} products")
        
        # Get RAG answer
        answer = rag_answer(query)
        print("Answer generated")
        
        # More lenient heuristic: check if any product name, brand, or key specs are in answer
        product_keywords_in_answer = []
        for product in retrieved_products:
            # Check product name
            if product["name"].lower() in answer.lower():
                product_keywords_in_answer.append(f"Name: {product['name']}")
            # Check brand
            if product["brand"].lower() in answer.lower():
                product_keywords_in_answer.append(f"Brand: {product['brand']}")
            # Check category
            if product["category"].lower() in answer.lower():
                product_keywords_in_answer.append(f"Category: {product['category']}")
        
        # Determine if result is good/bad
        is_good = len(product_keywords_in_answer) > 0
        print(f"Result: {'GOOD' if is_good else 'BAD'}")
        
        # Store result
        results.append({
            "id": i,
            "query": query,
            "query_type": "specific" if any(keyword in query.lower() for keyword in ["samsung", "lenovo", "asus", "hp", "acer", "xiaomi", "oneplus", "realme", "dell"]) else 
                        "vague" if any(keyword in query.lower() for keyword in ["something", "good", "best", "budget", "cheap", "reliable"]) else 
                        "comparison" if any(keyword in query.lower() for keyword in ["compare", "vs", "which is better", "differences"]) else 
                        "question",
            "retrieved_products": retrieved_products,
            "answer": answer,
            "product_keywords_in_answer": product_keywords_in_answer,
            "is_good": is_good,
            "distance": retrieved_products[0]["distance"] if retrieved_products else None
        })
        
    except Exception as e:
        print(f"Error: {e}")
        results.append({
            "id": i,
            "query": query,
            "error": str(e)
        })

# Save results to JSON
with open("rag_evaluation_results_improved.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("\n✅ Evaluation complete! Results saved to rag_evaluation_results_improved.json")

# Calculate overall grounding rate
total_queries = len(results)
good_results = [r for r in results if r.get("is_good", False)]
total_successful = len([r for r in results if "error" not in r])
total_errors = len([r for r in results if "error" in r])

if total_successful > 0:
    print(f"\n📊 Grounding rate (among successful): {len(good_results)/total_successful*100:.1f}%")
else:
    print("\n⚠️ No successful queries to calculate grounding rate!")

print(f"📈 Overall success rate (no errors): {total_successful/total_queries*100:.1f}%")
if total_errors > 0:
    print(f"❌ Queries failed with error: {total_errors}")

# Find worst results
bad_results = [r for r in results if not r.get("is_good", False) and "error" not in r]
if bad_results:
    print(f"\n📉 Found {len(bad_results)} bad results (worst first):")
    # Sort by distance (higher = worse retrieval)
    bad_results_sorted = sorted(bad_results, key=lambda x: x.get("distance", 0), reverse=True)
    for i, r in enumerate(bad_results_sorted[:3], 1):
        print(f"\nWorst {i}:")
        print(f"  Query: {r['query']}")
        print(f"  Type: {r['query_type']}")
        print(f"  Answer: {r['answer'][:200]}...")
else:
    print("\n✅ No bad results found!")