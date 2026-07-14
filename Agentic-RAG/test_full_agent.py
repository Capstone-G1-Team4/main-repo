"""
Full agent smoke test: every intent through the new conversational API.
(The old input()-based order_flow was replaced by a step-by-step chat flow —
see test_agent.py for the full order conversation demo.)
"""

from app.agent.agent import shopping_agent

user_id = "test_full"

print("----- SEARCH -----")
print(shopping_agent("I need a Samsung phone under 40000 with good battery", user_id)["response"])

print("\n----- PRODUCT QUESTION -----")
print(shopping_agent("Does the first one have a good camera?", user_id)["response"])

print("\n----- COMPARE -----")
print(shopping_agent("Compare Samsung A13 and Samsung F42", user_id)["response"])

print("\n----- SUPPORT -----")
print(shopping_agent("How do I place an order?", user_id)["response"])
