@echo off
REM SkillRoute AI - Windows Startup Script

color 0B
title SkillRoute AI - Startup

echo.
echo   ███████╗██╗  ██╗██╗██╗     ██╗     ██╗███╗   ██╗ █████╗ ██╗     ███████╗
echo   ██╔════╝██║  ██║██║██║     ██║     ██║████╗  ██║██╔══██╗██║     ██╔════╝
echo   ███████╗███████║██║██║     ██║     ██║██╔██╗ ██║███████║██║     █████╗  
echo   ╚════██║██╔══██║██║██║     ██║     ██║██║╚██╗██║██╔══██║██║     ██╔══╝  
echo   ███████║██║  ██║██║███████╗███████╗██║██║ ╚████║██║  ██║███████╗███████╗
echo   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚══════╝
echo.
echo   Career Intelligence Platform
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "backend\node_modules" (
    echo [1/4] Installing backend dependencies...
    cd backend
    call npm install --no-audit
    cd ..
)

if not exist "frontend\node_modules" (
    echo [2/4] Installing frontend dependencies...
    cd frontend
    call npm install --no-audit
    cd ..
)

echo [3/4] Checking .env file...
if not exist "backend\.env" (
    echo [!] Warning: backend\.env not found
    echo [!] Please create backend\.env with your API keys
    echo [!] Copy from backend\.env.example
    pause
)

echo [4/4] Starting SkillRoute AI...
echo.
echo Starting backend on port 5000...
echo Starting frontend on port 3000...
echo.
echo ✓ Navigate to: http://localhost:3000
echo.
echo Press CTRL+C to stop all services
echo.

start cmd /k "cd backend && npm start"
timeout /t 2 /nobreak
start cmd /k "cd frontend && npm run dev"

echo.
echo All services started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
pause
