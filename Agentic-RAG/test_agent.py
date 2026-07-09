from app.agent.agent import shopping_agent

# Example search
print(shopping_agent("I need a Samsung phone under 40000 with good battery"))

# Example compare
print(shopping_agent("Compare Samsung A13 and Samsung F42"))

# Example order
customer = {"name":"Shahd","phone":"123456789","address":"Amman, Jordan"}
print(shopping_agent("I want to buy Samsung A13", customer))