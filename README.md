# Project Expo - AI-Powered Learning Platform

A comprehensive, modular platform for AI-driven career development with course generation, learning roadmaps, and skill assessments.

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ 
- npm or yarn
- Supabase account (free tier available)

### Installation

```bash
# 1. Install dependencies for all modules
npm run install:all

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start all services
npm run dev
```

**Services will be available at:**
- 🏠 Landing Page: http://localhost:4173
- 📚 Course Generation: http://localhost:3005
- 🗺️ Roadmap Module: http://localhost:5173
- ✏️ Test Generation: http://localhost:3000
- ⚙️ Backend API: http://localhost:5000

---

## 📁 Project Structure

```
Project Expo/
├── frontend/
│   ├── landing-page/          # Main home page (Vite)
│   ├── course-generation/     # Course generator (Next.js)
│   ├── roadmap/               # Learning roadmaps (Vite + React)
│   └── test-generation/       # Skill assessments (React)
├── backend/
│   └── main-app/              # Express API server
├── db/                        # Database utilities & queries
├── scripts/                   # Orchestration scripts
└── package.json               # Root configuration
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in root with:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production

# OpenAI (for course generation)
VITE_OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key

# EmailJS
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

---

## 📚 Available Services

### Backend API (http://localhost:5000)

#### Health Check
```
GET /api/health
```
Returns: `{"status":"OK","message":"SkillRoute Backend is running","timestamp":"..."}`

#### Authentication
```
POST /api/auth/register        - Register new user
POST /api/auth/login           - Login user
POST /api/auth/verify          - Verify JWT token
POST /api/auth/logout          - Logout
```

#### Courses
```
GET /api/courses               - List all courses
POST /api/courses              - Create new course
GET /api/courses/:id           - Get course details
```

#### Roadmaps
```
GET /api/roadmaps              - List all roadmaps
POST /api/roadmaps             - Create new roadmap
GET /api/roadmaps/:id          - Get roadmap details
```

#### Skills
```
GET /api/skills                - List all skills
POST /api/skills               - Create skill assessment
POST /api/skills/evaluate      - Evaluate skill level
```

### Frontend Modules

**Landing Page** (http://localhost:4173)
- Home page with navigation
- Module links and overview
- Course/roadmap discovery

**Course Generation** (http://localhost:3005)
- AI-powered course creation
- Curriculum generation
- Learning structure design

**Roadmap Module** (http://localhost:5173)
- Learning path visualization
- Progress tracking
- Skill mapping

**Test Generation** (http://localhost:3000)
- Assessment creation
- Skill evaluation
- Knowledge testing

---

## 🗄️ Database Setup

### Initialize Supabase

1. Create a Supabase project at https://supabase.com
2. Run the database setup script:

```bash
node create-all-tables.js
```

This creates tables for:
- Users
- Courses
- Roadmaps
- Skills
- Assessments
- User Progress

---

## 🛠️ Development

### Run Individual Services

```bash
npm run dev:landing          # Landing page only
npm run dev:course           # Course generation
npm run dev:roadmap          # Roadmap module
npm run dev:tests            # Test generation
npm run dev:backend          # Backend API
```

### Build for Production

```bash
npm run build:all            # Build all services
```

---

## 📝 API Testing

### Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Using Postman

1. Import API collection or create requests
2. Set base URL: `http://localhost:5000`
3. Add Bearer token from login response to Authorization header for protected routes

---

## 🚀 Deployment

### Deploy Frontend

**Vercel** (Recommended)
```bash
npm install -g vercel
vercel deploy
```

**Netlify**
```bash
npm run build:all
# Then drag & drop build folders to Netlify
```

### Deploy Backend

**Render**
1. Connect GitHub repository
2. Create new Web Service
3. Build command: `npm install`
4. Start command: `node backend/main-app/backend/server.js`
5. Set environment variables

**Railway**
```bash
railway link
railway up
```

---

## 🔐 Security

- JWT authentication for protected routes
- CORS enabled for frontend domains
- Row-Level Security (RLS) in Supabase
- Password hashing with bcryptjs
- Environment variables for sensitive data

---

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Clear node_modules and reinstall
rm -r node_modules
npm install

# Restart
npm run dev
```

### Port Already in Use
Services auto-adjust to available ports. Check console output for actual ports being used.

### Database Connection Errors
- Verify Supabase URL and keys in `.env`
- Check network connectivity
- Ensure RLS policies allow your operations

### API 404 Errors
- Verify endpoint URL format
- Check HTTP method (GET vs POST)
- Ensure request body format for POST requests

---

## 📦 Key Dependencies

**Frontend:**
- Vite 5.x - Build tool
- React 18.x - UI framework
- Next.js 14.x - Full-stack framework
- Supabase.js - Database client

**Backend:**
- Express.js - HTTP server
- JWT - Authentication
- CORS - Cross-origin support
- bcryptjs - Password hashing

**Database:**
- Supabase - PostgreSQL + realtime

---

## 📄 License

MIT License

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation above
3. Check browser console for errors
4. Review backend logs at http://localhost:5000/api/health

---

## ✅ System Status

**Services:** ✅ All running
**Database:** Configure in setup
**API:** ✅ Operational
**Frontend:** ✅ Ready

Last Updated: January 2026
