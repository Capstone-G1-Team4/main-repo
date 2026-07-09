from app.agent.agent import shopping_agent

# مثال 1: بحث
print("----- SEARCH -----")
search_result = shopping_agent("I need a Samsung phone under 40000 with good battery")
print(search_result)

# مثال 2: مقارنة
print("\n----- COMPARE -----")
compare_result = shopping_agent("Compare Samsung A13 and Samsung F42")
print(compare_result)

# مثال 3: شراء
print("\n----- ORDER -----")
customer_info = {
    "name": "Shahd",
    "phone": "079xxxxxxx",
    "address": "Amman, Jordan"
}
order_result = shopping_agent("I want to buy Samsung A13", customer_info)
print(order_result)

from app.agent.tools import search_products, compare_products

products = search_products("high capacity battery")
print(compare_products(products))

from app.agent.tools import search_products
from app.agent.agent import order_flow

products = search_products("Samsung phone under 40000 with good battery")
selected_product = products[0]
order_flow(selected_product)