@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   SkillRoute AI - Complete Platform
echo ========================================
echo.

REM Kill any existing processes on the ports we'll use
echo Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1

timeout /t 2 /nobreak >nul

echo.
echo Starting all modules...
echo.

REM 1. Backend (Express) - Port 5000
echo [1/5] Starting Backend (Port 5000)...
start "Backend - Port 5000" cmd /k "title Backend - Port 5000 && cd /d "%~dp0app\backend" && npm run dev"
timeout /t 3 /nobreak >nul

REM 2. Frontend (Vite) - Port 3000
echo [2/5] Starting Frontend (Port 3000)...
start "Frontend - Port 3000" cmd /k "title Frontend - Port 3000 && cd /d "%~dp0app\frontend" && npm run dev"
timeout /t 4 /nobreak >nul

REM 3. Course Generation Module (Next.js) - Port 3001
echo [3/5] Starting Course Generation Module (Port 3001)...
start "Course Generation - Port 3001" cmd /k "title Course Generation - Port 3001 && cd /d "%~dp0course generation" && npm run dev -- -p 3001"
timeout /t 4 /nobreak >nul

REM 4. Roadmap Module (Vite) - Port 5173
echo [4/5] Starting Roadmap Module (Port 5173)...
start "Roadmap Module - Port 5173" cmd /k "title Roadmap Module - Port 5173 && cd /d "%~dp0roadmap_module" && npm run dev"
timeout /t 4 /nobreak >nul

REM 5. Test Generation / Evaluator (Node) - Port 3002
echo [5/5] Starting Skill Evaluator (Port 3002)...
start "Skill Evaluator - Port 3002" cmd /k "title Skill Evaluator - Port 3002 && cd /d "%~dp0test generation" && PORT=3002 npm start"
timeout /t 2 /nobreak >nul

cls
echo.
echo ========================================
echo   ✅ ALL MODULES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 🏠 FRONTEND (Main App):       http://localhost:3000
echo 🔧 BACKEND API:               http://localhost:5000
echo.
echo Module Servers (for advanced users):
echo   📚 Course Generation:        http://localhost:3001
echo   🗺️  Roadmap Module:           http://localhost:5173
echo   📝 Skill Evaluator:          http://localhost:3002
echo.
echo ========================================
echo IMPORTANT INSTRUCTIONS:
echo ========================================
echo.
echo 1. START HERE:
echo    - Open http://localhost:3000 in your browser
echo    - This is your main application with all integrated modules
echo.
echo 2. NAVIGATION:
echo    - Use the navigation in the app to access:
echo      • Course Generator
echo      • Roadmap Engine
echo      • Skill Evaluator
echo    - Each module opens in a NEW TAB
echo.
echo 3. AUTHENTICATION:
echo    - Sign up/Login on the app
echo    - API calls go to Backend (port 5000)
echo.
echo 4. IF MODULES DON'T LOAD:
echo    - Check the terminal windows for errors
echo    - Make sure all npm packages are installed
echo    - Run: npm install in each folder if needed
echo.
echo 5. TO CLOSE:
echo    - Close the individual terminal windows, OR
echo    - Press Ctrl+C in each window to stop that module
echo.
echo ========================================
echo Ready to showcase! 🚀
echo ========================================
echo.
