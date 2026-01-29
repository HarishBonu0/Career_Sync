# CareerOS - Automated Deployment Script (PowerShell)
Write-Host "
╔════════════════════════════════════════════════════════════════╗
║            CareerOS - Automated Deployment Script             ║
╠════════════════════════════════════════════════════════════════╣
║  Starting all backend and frontend services...                ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

$services = @(
    @{
        Name = "Backend API"
        Path = "backend\main-app\backend"
        Command = "npm"
        Args = "start"
        Port = 5000
        Color = "Cyan"
    },
    @{
        Name = "Landing Page"
        Path = "frontend\landing-page"
        Command = "npm"
        Args = "run dev"
        Port = 4173
        Color = "Green"
    },
    @{
        Name = "Course Generator"
        Path = "frontend\course-generation"
        Command = "npm"
        Args = "run dev"
        Port = 3002
        Color = "Yellow"
    },
    @{
        Name = "Roadmap"
        Path = "frontend\roadmap"
        Command = "npm"
        Args = "run dev"
        Port = 5173
        Color = "Magenta"
    },
    @{
        Name = "Evaluator"
        Path = "frontend\test-generation"
        Command = "npm"
        Args = "run dev"
        Port = 3001
        Color = "Blue"
    }
)

$jobs = @()

foreach ($service in $services) {
    Write-Host "[" -NoNewline
    Write-Host $service.Name -ForegroundColor $service.Color -NoNewline
    Write-Host "] Starting on port $($service.Port)..."
    
    $scriptBlock = {
        param($Path, $Command, $Args)
        Set-Location $Path
        & $Command $Args.Split(' ')
    }
    
    $job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $service.Path, $service.Command, $service.Args
    $jobs += @{
        Name = $service.Name
        Job = $job
        Color = $service.Color
    }
    
    Start-Sleep -Milliseconds 1000
}

# Start reverse proxy after a delay
Start-Sleep -Seconds 3
Write-Host "[" -NoNewline
Write-Host "Reverse Proxy" -ForegroundColor Red -NoNewline
Write-Host "] Starting on port 8080..."

$proxyJob = Start-Job -ScriptBlock {
    node proxy-server.js
}

$jobs += @{
    Name = "Reverse Proxy"
    Job = $proxyJob
    Color = "Red"
}

Start-Sleep -Seconds 2

Write-Host "
╔════════════════════════════════════════════════════════════════╗
║                   All Services Started!                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🌐 Production-like Access (Reverse Proxy):                   ║
║     http://localhost:8080                                      ║
║                                                                ║
║  📍 Direct Access (Development):                              ║
║     Backend API:        http://localhost:5000/api             ║
║     Landing Page:       http://localhost:4173                 ║
║     Course Generator:   http://localhost:3002                 ║
║     Roadmap:            http://localhost:5173                 ║
║     Evaluator:          http://localhost:3001                 ║
║                                                                ║
║  Monitoring output... Press Ctrl+C to stop all services       ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Monitor jobs and display output
try {
    while ($true) {
        foreach ($jobInfo in $jobs) {
            $output = Receive-Job -Job $jobInfo.Job
            if ($output) {
                Write-Host "[" -NoNewline
                Write-Host $jobInfo.Name -ForegroundColor $jobInfo.Color -NoNewline
                Write-Host "] $output"
            }
        }
        Start-Sleep -Milliseconds 500
        
        # Check if any job failed
        $failed = $jobs | Where-Object { $_.Job.State -eq 'Failed' }
        if ($failed) {
            Write-Host "`nSome services failed:" -ForegroundColor Red
            foreach ($f in $failed) {
                Write-Host "  - $($f.Name)" -ForegroundColor Red
            }
        }
    }
} finally {
    Write-Host "`n`nStopping all services..." -ForegroundColor Yellow
    foreach ($jobInfo in $jobs) {
        Write-Host "Stopping $($jobInfo.Name)..." -ForegroundColor $jobInfo.Color
        Stop-Job -Job $jobInfo.Job
        Remove-Job -Job $jobInfo.Job
    }
    Write-Host "All services stopped." -ForegroundColor Green
}
