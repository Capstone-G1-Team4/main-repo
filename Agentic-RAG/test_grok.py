from dotenv import load_dotenv
import os

from openai import OpenAI


load_dotenv()


client = OpenAI(
    api_key=os.getenv("XAI_API_KEY"),
    base_url="https://api.x.ai/v1"
)


response = client.chat.completions.create(
    model="grok-3-mini",
    messages=[
        {
            "role": "user",
            "content": "Say hello in one sentence"
        }
    ]
)


print(
    response.choices[0].message.content
)