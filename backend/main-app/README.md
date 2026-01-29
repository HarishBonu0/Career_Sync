# SkillRoute AI - Career Intelligence Platform

A comprehensive AI-powered platform for generating courses, creating career roadmaps, and evaluating skills.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)

## ✨ Features

- **🎓 AI Course Generator** - Generate personalized learning curricula instantly
- **🗺️ Career Roadmap Engine** - Create data-driven career progression plans
- **✅ Skill Evaluator** - AI-powered skill assessment with dynamic questioning
- **🔐 User Authentication** - Secure login/signup with JWT tokens
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

**Frontend:**
- Vite (modern bundler)
- Vanilla JavaScript (no framework overhead)
- Professional CSS with design system
- Responsive & accessible UI

**Backend:**
- Node.js + Express
- Google Gemini API (AI-powered features)
- JWT Authentication
- CORS enabled

**Database:**
- Supabase (PostgreSQL)
- Row-Level Security (RLS)
- Automated timestamps

## 📁 Project Structure

```
app/
├── frontend/
│   ├── pages/              # HTML pages
│   │   ├── index.html      # Home page
│   │   ├── auth.html       # Login/signup
│   │   ├── course.html     # Course generator
│   │   ├── roadmap.html    # Roadmap generator
│   │   └── skill-eval.html # Skill evaluator
│   ├── styles/             # CSS files
│   │   ├── global.css
│   │   ├── home.css
│   │   ├── auth.css
│   │   └── modules.css
│   ├── js/                 # JavaScript files
│   │   ├── home.js
│   │   ├── auth.js
│   │   ├── course.js
│   │   ├── roadmap.js
│   │   └── skill-eval.js
│   ├── utils/
│   │   └── api.js          # API client
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── roadmaps.js
│   │   └── skillEval.js
│   ├── middleware/         # Express middleware
│   ├── controllers/        # Business logic
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env.example
└── database/
    └── schema.sql          # Complete database schema

```

## 🚀 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account (for database)
- Google Gemini API key

### Step 1: Clone or Extract Project

```bash
cd app
```

### Step 2: Install Dependencies

#### Backend
```bash
cd backend
npm install
cp .env.example .env
```

#### Frontend
```bash
cd ../frontend
npm install
```

## 🔧 Environment Setup

### Backend (.env)

Create `app/backend/.env` with the following:

```env
PORT=5000
NODE_ENV=development

# Google Gemini API - Get free key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Optional - for production database)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Security - CHANGE THIS IN PRODUCTION!
JWT_SECRET=your-secret-key-change-in-production
```

## 📊 Database Setup

### Option 1: Supabase (Recommended for Production)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Save your Project URL and Anon Key

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Paste the entire contents of `app/database/schema.sql`
   - Click "Run"
   - Wait for all tables and policies to be created

3. **Update .env**
   - Add your Supabase URL and Key to `app/backend/.env`

4. **Enable Extensions** (in Supabase)
   - SQL Editor → `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Option 2: Local Development (SQLite - if using local DB)

The current implementation uses in-memory storage for auth during development. For full database integration:

1. Install sqlite3: `npm install sqlite3`
2. Update routes in `backend/routes/` to use sqlite3
3. Run migrations on startup

### Complete SQL Schema Explanation

The database includes:

- **users** - User accounts and profiles
- **courses** - Generated course curriculums
- **roadmaps** - Career progression paths
- **skills** - User skill inventory
- **skill_evaluations** - Assessment results
- **course_enrollments** - Course tracking
- **RLS Policies** - Secure user data isolation

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd app/backend
npm install  # First time only
npm start
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd app/frontend
npm install  # First time only
npm run dev
```
Frontend runs on `http://localhost:3000`

The frontend automatically proxies API requests to the backend.

### Production Build

```bash
# Frontend
cd app/frontend
npm run build
# Outputs to dist/

# Backend
cd app/backend
NODE_ENV=production npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Sign out

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses/generate` - Generate curriculum

### Roadmaps
- `GET /api/roadmaps` - List roadmaps
- `POST /api/roadmaps/generate` - Create roadmap

### Skills
- `GET /api/skills` - List available skills
- `POST /api/skills/evaluate` - Generate evaluation
- `POST /api/skills/submit` - Submit answers

## 🚢 Deployment

### Render (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create on Render**
   - Dashboard → New → Web Service
   - Connect GitHub repo
   - Build Command: `cd app/backend && npm install`
   - Start Command: `cd app/backend && npm start`
   - Add environment variables from `.env`

3. **Deploy Frontend** (CDN)
   ```bash
   cd app/frontend
   npm run build
   ```
   Upload `dist/` folder to Netlify or Vercel

### Vercel (Frontend)

1. Push code to GitHub
2. Import project on Vercel
3. Set build command: `cd app/frontend && npm run build`
4. Set output directory: `app/frontend/dist`
5. Add API proxy in `vercel.json`

### Environment Variables on Render

```
PORT=5000
NODE_ENV=production
GEMINI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
JWT_SECRET=strong_random_secret
```

## 📖 Usage

### 1. Sign Up / Sign In
- Visit home page
- Click "Sign In"
- Create account or login
- Token saved in localStorage

### 2. Course Generator
- Enter course name (e.g., "Advanced React")
- Select duration and level
- Click "Generate Curriculum"
- Review generated content

### 3. Roadmap Generator
- Enter current and target roles
- Select timeline
- Click "Generate Roadmap"
- Follow personalized progression

### 4. Skill Evaluator
- Enter skill name
- Select difficulty
- Answer questions
- View detailed results

## 🔐 Security Notes

- **JWT Tokens** - Used for stateless authentication
- **RLS Policies** - Database automatically enforces user data isolation
- **CORS** - Configured for production domains
- **Environment Variables** - Sensitive keys never committed
- **Password Hashing** - bcryptjs used for secure storage

### Before Production:

1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Enable HTTPS
4. Update CORS origins to your domain
5. Set up HTTPS on Supabase
6. Review RLS policies

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Backend
cd app/backend && npm install

# Frontend  
cd app/frontend && npm install
```

### API 404 errors
- Ensure backend is running on port 5000
- Check vite.config.js proxy settings
- Verify API routes in `backend/routes/`

### CORS errors
- Ensure backend has CORS enabled
- Check frontend API base URL
- Add origin to CORS allowlist in production

### Database errors
- Verify Supabase credentials in .env
- Check RLS policies are enabled
- Ensure tables were created from schema.sql

## 📞 Support

For issues:
1. Check error messages in browser console (F12)
2. Check backend logs
3. Verify .env variables are set
4. Review database schema in Supabase

## 📝 License

MIT License - Feel free to use this project for commercial or personal use.

---

**Made with ❤️ by SkillRoute AI**
