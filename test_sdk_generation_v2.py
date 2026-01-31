import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model_name = "models/gemini-2.0-flash-native"
print(f"Testing generation with {model_name}...")
try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello")
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAIL: {e}")
