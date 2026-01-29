from fastapi.testclient import TestClient
from api.main import app
import sys
import os

# Add api folder to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

client = TestClient(app)

def test_generate_report():
    print("Testing /api/ai/generate-report...")
    payload = {
        "client_id": "test-client-001",
        "week_start": "2026-02-01",
        "week_end": "2026-02-07"
    }
    
    response = client.post("/api/ai/generate-report", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Success!")
        print(f"Report Preview: {data['report'][:50]}...")
        assert data["success"] == True
        assert "Relatório Semanal" in data["report"]
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_generate_report()
