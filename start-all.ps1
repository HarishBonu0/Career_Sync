# CareerOS - Master Start Script
# Starts all services with one command

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting CareerOS - All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to start a service in a new PowerShell window
function Start-Service {
    param (
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color = "Green"
    )
    
    Write-Host "[START] $Name..." -ForegroundColor $Color
    $scriptBlock = "cd '$Path'; $Command; Read-Host 'Press Enter to close'"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock
    Start-Sleep -Seconds 2
}

# Get the project root directory
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[INFO] Project Root: $ProjectRoot" -ForegroundColor Gray
Write-Host ""

# Start Backend (MongoDB)
Start-Service -Name "Backend API (MongoDB)" `
              -Path "$ProjectRoot\backend\main-app\backend" `
              -Command "npm start" `
              -Color "Magenta"

# Wait for backend to initialize
Write-Host "[WAIT] Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start all Frontends
Start-Service -Name "Landing Page" `
              -Path "$ProjectRoot\frontend\landing-page" `
              -Command "npm run dev" `
              -Color "Blue"

Start-Service -Name "Course Generation" `
              -Path "$ProjectRoot\frontend\course-generation" `
              -Command "npm run dev" `
              -Color "Green"

Start-Service -Name "Roadmap" `
              -Path "$ProjectRoot\frontend\roadmap" `
              -Command "npm run dev" `
              -Color "Yellow"

Start-Service -Name "Skill Evaluator" `
              -Path "$ProjectRoot\frontend\test-generation" `
              -Command "npm run dev" `
              -Color "Cyan"

Write-Host ""
Write-Host "[SUCCESS] All Services Started!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Access Points" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend API:       http://localhost:5000/api/health" -ForegroundColor White
Write-Host "  Landing Page:      http://localhost:4173/" -ForegroundColor White
Write-Host "  Course Generation: http://localhost:3002/" -ForegroundColor White
Write-Host "  Roadmap:           http://localhost:5173/" -ForegroundColor White
Write-Host "  Skill Evaluator:   http://localhost:3001/" -ForegroundColor White
Write-Host ""
Write-Host "[TIP] Each service is running in a separate window" -ForegroundColor Gray
Write-Host "[STOP] To stop all: Close each PowerShell window or press Ctrl+C" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
