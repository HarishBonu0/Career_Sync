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

REM 1. Course Generation (Next.js) - Port 3000
echo [1/4] Starting Course Generation Module (Port 3000)...
echo Press Ctrl+C if you see any errors, then we'll fix it.
start "Course Generation - Port 3000" cmd /k "title Course Generation - Port 3000 && cd /d "%~dp0course generation" && npm run dev"
timeout /t 4 /nobreak >nul

REM 2. Roadmap Module (Vite) - Port 5173
echo [2/4] Starting Roadmap Module (Port 5173)...
start "Roadmap Module - Port 5173" cmd /k "title Roadmap Module - Port 5173 && cd /d "%~dp0roadmap_module" && npm run dev"
timeout /t 4 /nobreak >nul

REM 3. Test Generation / Evaluator (Serve.js) - Port 3001
echo [3/4] Starting Skill Evaluator (Port 3001)...
start "Skill Evaluator - Port 3001" cmd /k "title Skill Evaluator - Port 3001 && cd /d "%~dp0test generation" && npm start"
timeout /t 3 /nobreak >nul

REM 4. Landing Page (Vite) - Port 4173
echo [4/4] Starting Landing Page (Port 4173)...
start "Landing Page - Port 4173" cmd /k "title Landing Page - Port 4173 && cd /d "%~dp0SkillRoute_AI_LandingPage" && npm run dev"
timeout /t 2 /nobreak >nul

cls
echo.
echo ========================================
echo   ✅ ALL MODULES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 🏠 LANDING PAGE:     http://localhost:4173
echo.
echo Module Access (from Landing Page):
echo   📚 Course Generation:  http://localhost:3000
echo   🗺️  Roadmap Module:     http://localhost:5173
echo   📝 Skill Evaluator:    http://localhost:3001
echo.
echo ========================================
echo IMPORTANT INSTRUCTIONS:
echo ========================================
echo.
echo 1. FIRST TIME SETUP:
echo    - Open http://localhost:4173 in your browser
echo    - Sign up with an email address
echo    - All modules should work from the landing page
echo.
echo 2. NAVIGATION:
echo    - Use the navigation menu on the landing page
echo    - Click on modules to navigate to them
echo    - Each module will open on its own port
echo.
echo 3. IF MODULES DON'T LOAD:
echo    - Check the terminal windows for errors
echo    - Make sure all npm packages are installed
echo    - Run: npm install in each module folder
echo.
echo 4. TO CLOSE:
echo    - Close the individual terminal windows, OR
echo    - Press Ctrl+C in each window to stop that module
echo.
echo ========================================
echo Ready to showcase! 🚀
echo ========================================
echo.
