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

REM 1. Start Backend on port 5000
echo [1/5] Starting Backend (port 5000)...
start "SkillRoute Backend" /D "!PROJECT_ROOT!app\backend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM 2. Start Frontend on port 3000 (Main App with Course Generator, Roadmap, Evaluator)
echo [2/5] Starting Frontend (port 3000)...
start "SkillRoute Frontend" /D "!PROJECT_ROOT!app\frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM 3. Start Course Generation Module on port 3001
echo [3/5] Starting Course Generation Module (port 3001)...
start "Course Generation" /D "!PROJECT_ROOT!course generation" cmd /k "npm run dev -- -p 3001"
timeout /t 3 /nobreak >nul

REM 4. Start Roadmap Module on port 5173 (Vite)
echo [4/5] Starting Roadmap Module (port 5173)...
start "Roadmap Module" /D "!PROJECT_ROOT!roadmap_module" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM 5. Start Test Generation on port 3002
echo [5/5] Starting Test Generation (port 3002)...
start "Test Generation" /D "!PROJECT_ROOT!test generation" cmd /k "PORT=3002 npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo ✅ ALL SERVICES STARTED!
echo ========================================
echo.
echo Access your project:
echo.
echo 🏠 Frontend Home:        http://localhost:3000 (Course Gen, Roadmap, Evaluator)
echo � Backend API:          http://localhost:5000
echo 📚 Course Gen Module:    http://localhost:3001
echo 🗺️  Roadmap Module:       http://localhost:5173  
echo 📝 Test/Skill Eval Mod:  http://localhost:3002
echo.
echo Start with http://localhost:3000 and use the integrated modules!
echo.
echo Services are starting... wait 30 seconds for all to load.
echo If any service fails to start, check the console window.
echo.
pause
