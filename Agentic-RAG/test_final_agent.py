from app.agent.agent import shopping_agent, order_flow
from app.agent.tools import search_products, compare_products
from app.agent.memory import memory_store, get_session

# User ID افتراضي
user_id = "test_final"

# مثال 1: SEARCH
print("----- SEARCH -----")
search_result = shopping_agent("I need a Samsung phone under 40000 with good battery")
print(search_result)

# مثال 2: COMPARE
print("\n----- COMPARE -----")
compare_result = shopping_agent("Compare Samsung A13 and Samsung F42")
print(compare_result)

# مثال 3: Order Flow تفاعلي
print("\n----- ORDER FLOW -----")
products = search_products("Samsung phone under 40000 with good battery")
selected_product = products[0]

order_result = order_flow(selected_product, user_id=user_id)

# Memory تحقق
print("\n----- MEMORY CHECK -----")
session_data = get_session(user_id)
print(session_data)