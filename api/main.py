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
    Payload: { "client_id": "...", "week_start": "...", "week_end": "..." }
    """
    initial_state = {
        "client_id": payload.get("client_id", "default_client"),
        "week_start": payload.get("week_start", "2026-01-01"),
        "week_end": payload.get("week_end", "2026-01-07"),
        "time_data": {},
        "metrics_data": {},
        "report_output": "",
        "errors": []
    }
    
    # Run the graph
    result = report_generator_app.invoke(initial_state)
    
    return {
        "success": True,
        "report": result["report_output"],
        "data_used": {
            "time": result["time_data"],
            "metrics": result["metrics_data"]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
