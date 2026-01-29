# Career-OS Module Navigation Guide

## Overview
Career-OS is a multi-module application where each module runs independently on its own port. The main application provides navigation that opens each module in a new browser tab.

## Module URLs

### Main Application
- **URL**: http://localhost:3000
- **Description**: Main landing page with authentication and navigation to all modules
- **Features**: 
  - User authentication
  - Module navigation dashboard
  - User profile management

### Course Generation Module
- **URL**: http://localhost:3005
- **Technology**: Next.js
- **Description**: AI-powered course curriculum generator
- **Features**:
  - Generate custom course syllabi
  - Curated video resources
  - Personalized learning paths

### Roadmap Module
- **URL**: http://localhost:5173
- **Technology**: Vite + React + TypeScript
- **Description**: Career roadmap generator with gap analysis
- **Features**:
  - Role-based skill gap analysis
  - Salary-optimized career paths
  - Timeline estimation

### Test Generation/Evaluator Module
- **URL**: http://localhost:3001
- **Technology**: React + Express
- **Description**: AI-powered skill evaluation and testing
- **Features**:
  - Dynamic AI questioning
  - Weakness identification
  - Detailed skill reports

### Landing Page
- **URL**: http://localhost:4173
- **Technology**: Vite
- **Description**: Marketing/promotional landing page

## Navigation Behavior

### From Main Application (localhost:3000)
When users click on module buttons in the main app:
- **"Launch Course Generator"** → Opens http://localhost:3005 in new tab
- **"Launch Roadmap Generator"** → Opens http://localhost:5173 in new tab
- **"Evaluate Skill"** → Opens http://localhost:3001 in new tab

### Authentication
- Users must sign in on the main application (localhost:3000) first
- Each module may require its own authentication (check module-specific documentation)

## Starting All Modules

### Option 1: Individual Commands
```powershell
# Main App Frontend (Port 3000)
cd "app/frontend"
npm run dev

# Main App Backend (Port 3001)
cd "app/backend"
npm start

# Course Generation (Port 3005)
cd "course generation"
npm run dev

# Roadmap Module (Port 5173)
cd "roadmap_module"
npm run dev

# Test Generation Backend (Port 5000)
cd "test generation/backend"
npm start

# Test Generation Frontend (Port 3001)
cd "test generation"
npm start

# Landing Page (Port 4173)
cd "SkillRoute_AI_LandingPage"
npm run dev
```

### Option 2: Background Jobs
```powershell
# Start all modules as PowerShell background jobs
Start-Job -ScriptBlock { Set-Location "path\to\app\frontend"; npm run dev } -Name "AppFrontend"
Start-Job -ScriptBlock { Set-Location "path\to\app\backend"; npm start } -Name "AppBackend"
Start-Job -ScriptBlock { Set-Location "path\to\course generation"; npm run dev } -Name "CourseGen"
Start-Job -ScriptBlock { Set-Location "path\to\roadmap_module"; npm run dev } -Name "RoadmapModule"
Start-Job -ScriptBlock { Set-Location "path\to\test generation\backend"; npm start } -Name "TestGenBackend"

# Check job status
Get-Job

# View job output
Receive-Job -Name "CourseGen" -Keep
```

## Port Configuration

| Module | Port | Configuration File |
|--------|------|-------------------|
| Main App Frontend | 3000 | `app/frontend/vite.config.js` |
| Main App Backend | 3001 | `app/backend/.env` |
| Course Generation | 3005 | `course generation/package.json` |
| Roadmap Module | 5173 | `roadmap_module/vite.config.ts` |
| Test Gen Backend | 5000 | `test generation/backend/.env` |
| Test Gen Frontend | 3001 | `test generation/serve.js` |
| Landing Page | 4173 | `SkillRoute_AI_LandingPage/package.json` |

## Troubleshooting

### Port Conflicts
If you get a port conflict error:
```powershell
# Check what's using a port
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 3005 }

# Kill process on a port (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

### Module Not Loading
1. Ensure all dependencies are installed: `npm install`
2. Check the terminal/job output for errors: `Receive-Job -Name "ModuleName" -Keep`
3. Verify environment variables are set in `.env` files
4. Check if the module's backend service is running

### Navigation Not Working
1. Ensure you're signed in on the main application
2. Check browser console for errors (F12)
3. Verify all module URLs are accessible directly
4. Clear browser cache and cookies

## Development Tips

### Working with Multiple Modules
- Use browser tab groups to organize modules
- Each module can be developed independently
- Changes to one module don't require restarting others
- Use browser dev tools to debug each module separately

### Hot Reload
- Vite modules (3000, 5173, 4173): Hot reload enabled by default
- Next.js (3005): Hot reload enabled by default
- Express backends: May need nodemon for hot reload

### Database
- All modules share the same Supabase database
- Connection details in respective `.env` files
- Database URL: https://ynyjhfldcjwsgfmhrbqy.supabase.co

## API Keys Required

Ensure these are configured in respective `.env` files:
- `SUPABASE_URL` and `SUPABASE_KEY`
- `GEMINI_API_KEY` (for AI features)
- `YOUTUBE_API_KEY` (for course resources)
- `OPENROUTER_API_KEY` (for additional AI features)
- `NEXTAUTH_SECRET` (for authentication)

## Architecture Notes

This multi-port architecture allows:
- **Independent Development**: Each module can be developed/deployed separately
- **Technology Flexibility**: Different modules use different frameworks
- **Scalability**: Modules can be scaled independently
- **Fault Isolation**: Issues in one module don't crash others

## Future Improvements

Consider implementing:
- Reverse proxy (nginx) to route all modules through single port
- Docker compose for easier multi-module management
- Service mesh for inter-module communication
- Single sign-on (SSO) across all modules
