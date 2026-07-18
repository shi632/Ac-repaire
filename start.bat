@echo off
title AC Repair Business - All-in-One Runner
echo ==============================================
echo   Starting AC Repair Business App Services...
echo ==============================================

set ADMIN_USERNAME=Shivam
set ADMIN_PASSWORD=Shivam5001

:: Start Backend in a new window
echo [1/2] Starting FastAPI Backend on port 8000...
start "FastAPI Backend" cmd /k "cd backend && ..\.venv\Scripts\activate && uvicorn main:app --port 8000 --reload"

:: Wait a brief moment
timeout /t 2 /nobreak >nul

:: Start Frontend in a new window
echo [2/2] Starting Next.js Frontend on port 3000...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo ==============================================
echo   All services have been started!
echo   - Website: http://localhost:3000
echo   - Backend Docs: http://localhost:8000/docs
echo   - Admin Panel: http://localhost:3000/admin (User: Shivam, Pass: Shivam5001)
echo ==============================================
pause
