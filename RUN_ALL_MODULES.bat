@echo off
setlocal enabledelayedexpansion

echo ========================================
echo SkillRoute AI - Complete Project Launcher
echo ========================================
echo.

REM Kill any existing processes on our ports
echo Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Starting All Services...
echo ========================================
echo.

REM Store current directory
set PROJECT_ROOT=%~dp0

REM 1. Start Landing Page on port 4173
echo [1/4] Starting Landing Page (port 4173)...
start "SkillRoute Landing Page" /D "!PROJECT_ROOT!SkillRoute_AI_LandingPage" cmd /k "npm run dev -- --port 4173"
timeout /t 3 /nobreak >nul

REM 2. Start Course Generation on port 3000 (Next.js default)
echo [2/4] Starting Course Generation (port 3000)...
start "Course Generation" /D "!PROJECT_ROOT!course generation" cmd /k "npm run dev -- -p 3000"
timeout /t 3 /nobreak >nul

REM 3. Start Roadmap Module on port 5173 (Vite)
echo [3/4] Starting Roadmap Module (port 5173)...
start "Roadmap Module" /D "!PROJECT_ROOT!roadmap_module" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM 4. Start Test Generation on port 3001
echo [4/4] Starting Test Generation (port 3001)...
start "Test Generation" /D "!PROJECT_ROOT!test generation" cmd /k "PORT=3001 npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo ✅ ALL SERVICES STARTED!
echo ========================================
echo.
echo Access your project:
echo.
echo 🏠 Landing Page:    http://localhost:4173
echo 📚 Course Gen:      http://localhost:3000
echo 🗺️  Roadmap:         http://localhost:5173  
echo 📝 Test/Skill Eval: http://localhost:3001
echo.
echo Start with the Landing Page and click module links to navigate!
echo.
echo Services are starting... wait 30 seconds for all to load.
echo If any service fails to start, check the console window.
echo.
pause
