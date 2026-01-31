import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

try:
    for m in genai.list_models():
        if 'gemini' in m.name:
            print(f"Model: {m.name}")
            print(f"Methods: {m.supported_generation_methods}")
            print("-" * 20)
except Exception as e:
    print(f"Error: {e}")
