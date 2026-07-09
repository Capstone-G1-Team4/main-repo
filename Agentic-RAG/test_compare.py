from app.agent.tools import search_products, compare_products

# نبحث أولًا عن المنتجات
products = search_products("Samsung phone under 40000 with good battery")

# ثم نقارن أول 2
print(compare_products(products))