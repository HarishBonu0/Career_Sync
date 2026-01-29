@echo off
echo ========================================
echo Starting SkillRoute AI - Complete Platform
echo ========================================
echo.

echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d "%~dp0app\backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Application (Port 3000)...
start "Frontend Application" cmd /k "cd /d "%~dp0app\frontend" && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Services started!
echo ========================================
echo.
echo 🏠 Main App:        http://localhost:3000
echo 🔧 Backend API:     http://localhost:5000
echo.
echo Access the app at http://localhost:3000
echo All modules are integrated into the main app!
echo.
echo Press any key to close this window...
pause >nul
