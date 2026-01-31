from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Kyrie OS AI API", version="1.0.0")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "system": "Kyrie OS Intelligence Layer"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Import routers later
# from api.routers import ai_router
# app.include_router(ai_router)

from api.graphs.report_generator import report_generator_app

@app.post("/api/ai/generate-report")
async def generate_report(payload: dict):
    """
    Trigger the Report Generator LangGraph Agent
    Payload: { "client_slug": "...", "week_start": "...", "week_end": "..." }
    """
    # Map input to ReportState
    initial_state = {
        "client_slug": payload.get("client_slug") or payload.get("client_id", "adega-anitas"), # Support both for backward compat, default to seed
        "organization_id": None,
        "organization_name": None,
        "week_start": payload.get("week_start", "2026-01-01"),
        "week_end": payload.get("week_end", "2026-01-07"),
        "time_data": [],
        "metrics_data": {},
        "tasks_data": [],
        "report_output": "",
        "report_id": None,
        "errors": []
    }
    
    print(f"INFO: Starting report generation for {initial_state['client_slug']}")
    
    # Run the graph
    result = report_generator_app.invoke(initial_state)
    
    if result.get("errors"):
        return {
            "success": False,
            "errors": result["errors"],
            "report": result.get("report_output", "")
        }
    
    return {
        "success": True,
        "report_id": result.get("report_id"),
        "report": result["report_output"],
        "data_used": {
            "time_entries_count": len(result.get("time_data", [])),
            "metrics": result.get("metrics_data"),
            "tasks_completed": len(result.get("tasks_data", []))
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
