# Run the FastAPI Backend
Write-Host "Starting Kyrie OS Intelligence Layer..." -ForegroundColor Cyan
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
