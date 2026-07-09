from app.llm import generate_answer


answer = generate_answer(
    """
Product:
Samsung Galaxy S21 FE

Price:
39999

Battery:
4500 mAh


Customer:
I need a Samsung phone with good battery.
"""
)


print(answer)