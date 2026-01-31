import os
import google.generativeai as genai
from dotenv import load_dotenv
import time

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("NO_API_KEY")
    exit(1)

genai.configure(api_key=api_key)

print("--- START MODEL LIST ---")
try:
    for m in genai.list_models():
        print(f"Model: {m.name}")
        print(f"Supported methods: {m.supported_generation_methods}")
        print("-" * 20)
except Exception as e:
    print(f"ERROR: {e}")
print("--- END MODEL LIST ---")
