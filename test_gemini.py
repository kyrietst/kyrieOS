import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env")
else:
    print(f"API Key found: {api_key[:5]}...")

try:
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.3
    )
    print("Invoking Gemini...")
    response = llm.invoke("Hello, are you working?")
    print("Response:", response.content)
except Exception as e:
    print(f"Error: {e}")
