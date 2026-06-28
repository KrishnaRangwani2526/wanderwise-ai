# WanderCompanion Startup Script
# Runs both Frontend (Vite) and Backend (FastAPI)

Write-Host "Starting WanderCompanion AI Travel Copilot..." -ForegroundColor Cyan

# Start Backend
Write-Host "Starting FastAPI Backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; uvicorn main:app --reload --port 8000"

# Start Frontend
Write-Host "Starting Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
