from app.agent.tools import search_products
from app.agent.agent import order_flow
from app.agent.memory import memory_store, get_session

# ابحث عن أي جهاز
products = search_products("Samsung phone under 40000 with good battery")

# اختر أول منتج
selected_product = products[0]

# نفترض user_id للمستخدم الحالي
user_id = "test_user"

# شغل Order Flow مع Memory
order_flow(selected_product, user_id=user_id)

# تحقق من أن كل البيانات خزنت في memory_store
session_data = get_session(user_id)
print("\nMemory Store for user:", user_id)
print(session_data)