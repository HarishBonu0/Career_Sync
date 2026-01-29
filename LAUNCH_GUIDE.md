# 🚀 SkillRoute AI - Complete Setup & Launch Guide

## Quick Start
```bash
cd "c:\Users\vamsi\Desktop\Project Expo"
.\START_ALL_ORIGINAL.bat
```

This will start all 4 modules simultaneously:
- 🏠 Landing Page (Port 4173)
- 📚 Course Generation (Port 3000) 
- 🗺️ Roadmap Module (Port 5173)
- 📝 Skill Evaluator (Port 3001)

---

## 📋 Modules Overview

### 1. Landing Page (SkillRoute_AI_LandingPage)
- **Port**: 4173
- **Type**: Vite SPA
- **Purpose**: Main entry point & navigation hub
- **URL**: http://localhost:4173

### 2. Course Generation Module
- **Port**: 3000
- **Type**: Next.js Application
- **Features**: 
  - AI-powered course generation
  - Learning journeys
  - User authentication
- **URL**: http://localhost:3000
- **Test Users**:
  - `learner@example.com` / `password123`
  - `educator@example.com` / `password123`

### 3. Roadmap Module
- **Port**: 5173
- **Type**: Vite + React + TypeScript
- **Features**: Career roadmap creation
- **URL**: http://localhost:5173

### 4. Skill Evaluator
- **Port**: 3001
- **Type**: React App (Node Serve.js)
- **Features**: Knowledge assessment platform
- **URL**: http://localhost:3001

---

## 🔧 Environment Configuration

All modules are configured with:
- **Supabase Project**: ynyjhfldcjwsgfmhrbqy
- **Gemini API**: AIzaSyAnfq4O_20uxzj2MFA1myLCAHWewf-sfMQ
- **Database Password**: Harish@123Supabase

Files already have these configured:
- `course generation/.env`
- `roadmap_module/.env`
- `test generation/.env`
- `SkillRoute_AI_LandingPage/.env` (if needed)

---

## 🌐 Navigation Flow

**Landing Page (4173)**
```
Click "Course Gen" → Opens Course Generation (3000)
Click "Roadmaps" → Opens Roadmap Module (5173)
Click "Evaluator" → Opens Skill Evaluator (3001)
```

Each module has a way back to the landing page.

---

## ✅ Verification Checklist

Before showcasing:

- [ ] All 4 terminal windows show "ready" status
- [ ] Landing page loads at http://localhost:4173
- [ ] Can navigate to each module
- [ ] Course Gen loads with authentication UI
- [ ] Roadmap module displays
- [ ] Skill Evaluator module displays
- [ ] Can log in with test credentials

---

## 🐛 Troubleshooting

### Modules Won't Start
**Solution**: Stop all processes and run again
```bash
taskkill /F /IM node.exe
.\START_ALL_ORIGINAL.bat
```

### Port Already in Use
**Solution**: Change port in module's package.json
- Course Gen: Change `3000` to another port
- Roadmap: Change `5173` to another port
- Evaluator: Modify PORT in `serve.js`
- Landing: Change `4173` to another port

### Supabase Errors
All modules use the same Supabase project. If you see connection errors:
1. Verify internet connection
2. Check Supabase project is active
3. Ensure credentials are correct in `.env` files

### Course Generation Specific Issues
See: `course generation/COURSE_GEN_GUIDE.md`

---

## 📝 Next Steps After Launch

Once everything is working:

1. **Test Features**
   - Sign up / Login
   - Generate courses
   - Create roadmaps
   - Take skill evaluations

2. **Customize Branding**
   - Update titles and names across all modules
   - Update colors and styling
   - Update company logos

3. **Data Testing**
   - Create test users
   - Generate sample data
   - Test database integration

4. **Performance**
   - Monitor load times
   - Check API response times
   - Optimize images/assets

---

## 🚀 Ready to Showcase!

Your complete SkillRoute AI platform is ready!

**Start with:**
```bash
.\START_ALL_ORIGINAL.bat
```

Then open: **http://localhost:4173**

Enjoy! 🎉
