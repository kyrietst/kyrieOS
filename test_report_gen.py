import asyncio
import os
import sys
from pprint import pprint

# Add root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.graphs.report_generator import report_generator_app

async def test_report_generation():
    print("--- Starting Test ---")
    
    # Test Payload using the seed data slug "adega-anitas"
    initial_state = {
        "client_slug": "adega-anitas",
        "organization_id": None,
        "organization_name": None,
        "week_start": "2024-09-01", # Seed data period (approx)
        "week_end": "2024-09-30",
        "time_data": [],
        "metrics_data": {},
        "tasks_data": [],
        "report_output": "",
        "report_id": None,
        "errors": []
    }
    
    try:
        print(f"Invoking graph for {initial_state['client_slug']}...")
        result = await report_generator_app.ainvoke(initial_state)
        
        print("\n--- Result ---")
        if result.get("errors"):
            print("Errors:", result["errors"])
        else:
            print("Success!")
            print(f"Report ID: {result.get('report_id')}")
            print(f"Org Name: {result.get('organization_name')}")
            print(f"Time Entries: {len(result.get('time_data', []))}")
            print(f"Metrics: {result.get('metrics_data')}")
            print(f"Tasks: {len(result.get('tasks_data', []))}")
            print("\nReport Preview:")
            print(result.get("report_output")[:200] + "...")
            
    except Exception as e:
        print(f"Test Failed exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_report_generation())
