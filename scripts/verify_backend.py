import requests
import json
import sys

API_URL = "http://127.0.0.1:8000"

def test_health():
    try:
        print(f"Checking {API_URL}/health...")
        # Assuming there is a health root or we check docs
        # Using a generic check since we didn't explicitly implement /health in the prompt
        # but FastAPIs usually have /docs
        resp = requests.get(f"{API_URL}/docs")
        if resp.status_code == 200:
            print("✅ Backend is UP and serving docs.")
            return True
        else:
            print(f"❌ Backend returned status {resp.status_code}")
            return False
    except Exception as e:
        print(f"❌ Could not connect to backend: {e}")
        return False

def test_report_generation():
    print("\nTesting Report Generation (POST /api/ai/generate-report)...")
    payload = {
        "client_id": "test-client",
        # Add other fields if required by the pydantic model in main.py
        # Based on PRD logic, we might need date range
        "week_start": "2024-01-01T00:00:00Z",
        "week_end": "2024-01-07T23:59:59Z"
    }
    
    try:
        # Note: We need to verify the exact endpoint in main.py. 
        # Assuming /api/ai/generate-report based on Architecture doc
        resp = requests.post(f"{API_URL}/api/ai/generate-report", json=payload)
        
        if resp.status_code == 200:
            print("✅ Report generation trigger successful!")
            data = resp.json()
            print("Response Sample:")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Report generation failed: {resp.status_code}")
            print(resp.text)
            
    except Exception as e:
        print(f"❌ Error call report generation: {e}")

if __name__ == "__main__":
    if test_health():
        test_report_generation()
    else:
        print("\n⚠️ Please restart the backend server to apply new dependencies.")
        print("Run: pip install -r api/requirements.txt && python api/main.py")
