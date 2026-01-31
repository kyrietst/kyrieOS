import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
models_to_test = [
    "gemini-1.5-flash",
    "models/gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-1.0-pro",
    "gemini-pro",
    "models/gemini-pro",
    "gemini-2.0-flash-native",
    "models/gemini-2.0-flash-native"
]

print("--- START TESTS ---")
for model_name in models_to_test:
    try:
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=0.3
        )
        llm.invoke("Hi")
        print(f"SUCCESS: {model_name}")
    except Exception as e:
        error_msg = str(e)
        if "NOT_FOUND" in error_msg:
            print(f"FAIL: {model_name} (NOT_FOUND)")
        else:
            print(f"FAIL: {model_name} (Other Error)")
print("--- END TESTS ---")
