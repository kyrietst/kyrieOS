# Startup script for Kyrie OS Python Backend
# Fixes ModuleNotFoundError by running as a module from the root

Write-Host "Iniciando Kyrie OS Backend..." -ForegroundColor Cyan

# Check if venv exists and activate
if (Test-Path "venv") {
    Write-Host "Ativando ambiente virtual..." -ForegroundColor Gray
    .\venv\Scripts\activate
}

# Install dependencies if flag is passed
if ($args[0] -eq "--install") {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    pip install -r api/requirements.txt
}

# Run the server
Write-Host "Rodando servidor em http://localhost:8002" -ForegroundColor Green
$env:PYTHONPATH = $PWD
python -m api.main
