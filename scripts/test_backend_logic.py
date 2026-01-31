import asyncio
import os
import sys

# 1. Import supabase library FIRST (before adding root to path) to avoid collision with 'supabase' folder
try:
    import supabase
    from supabase import create_client
    print(f"Supabase library imported from: {supabase.__file__ if hasattr(supabase, '__file__') else 'unknown'}")
except ImportError as e:
    print(f"Failed to import supabase library: {e}")
    sys.exit(1)

# 2. Add root to sys.path to allow importing 'api'
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root_dir)

# 3. Import app (will use the already loaded 'supabase' module)
try:
    from api.graphs.report_generator import report_generator_app
except ImportError as e:
    print(f"Failed to import api: {e}")
    sys.exit(1)

async def test_report_generation():
    print("--- Starting Test (Logic Only) ---")
    
    initial_state = {
        "client_slug": "adega-anitas",
        "organization_id": None,
        "organization_name": None,
        "week_start": "2024-09-01", 
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
            print(f"Report Preview:\n{result.get('report_output')[:100]}...")
            
    except Exception as e:
        print(f"Test Failed exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_report_generation())
