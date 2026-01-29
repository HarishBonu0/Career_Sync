@echo off
echo ========================================
echo Starting SkillRoute AI (Your Original Pages)
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0app\backend" && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Modules...
start "Frontend Modules" cmd /k "cd /d "%~dp0app\frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Your Landing Page...
start "Landing Page" cmd /k "cd /d "%~dp0SkillRoute_AI_LandingPage" && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:        http://localhost:5000
echo Modules:        http://localhost:3000
echo Landing Page:   http://localhost:4173
echo.
echo Press any key to close this window...
pause >nul
