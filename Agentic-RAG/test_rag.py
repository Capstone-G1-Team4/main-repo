from app.rag.pipeline import rag_answer


question = """
I need a Samsung phone under 40000
with good battery.
"""


answer = rag_answer(question)


print(answer)