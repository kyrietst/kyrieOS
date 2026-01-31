import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
try:
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro",
        google_api_key=api_key,
        temperature=0.3
    )
    print("Invoking Gemini Pro...")
    response = llm.invoke("Hello, are you working?")
    print("Response:", response.content)
except Exception as e:
    print(f"Error: {e}")
