import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
models_to_test = [
    "models/gemini-2.0-flash-native",
    "gemini-2.0-flash-native",
    "models/gemini-1.5-flash-native",
    "gemini-1.5-flash-native",
    "gemini-1.5-flash"
]

for model_name in models_to_test:
    print(f"Testing model: {model_name}")
    try:
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=0.3
        )
        response = llm.invoke("Hello")
        print(f"SUCCESS with {model_name}: {response.content}")
        break
    except Exception as e:
        print(f"FAILED {model_name}: {e}")
        print("-" * 20)
