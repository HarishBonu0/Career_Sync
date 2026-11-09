# ⚡ Career Sync

> **Next-Generation AI Career Acceleration Platform**  
> Generate personalized career roadmaps, discover real-world skill gaps from your resume, take adaptive skill assessments, and generate tailor-made learning courses on demand.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Backend-Express%20ESM-blue?style=flat&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-8E75B2?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat&logo=render)](https://render.com/)

---

## 🏗️ Architecture & Technology Stack

Career Sync is structured as an enterprise-grade monorepo optimized for decoupled production deployments:

- **Frontend App (`apps/web`)**: Next.js 15 App Router, React 18, Tailwind CSS, Lucide icons, Radix UI primitives. Designed for **[Vercel](https://vercel.com)** edge hosting.
- **Backend API (`apps/api`)**: Node.js & Express ESM, MongoDB Atlas (Mongoose ODM), Helmet security headers, rate limiting, and Google Gemini AI integrations. Designed for **[Render](https://render.com)** web services.
- **AI Engine**: Google Gemini 2.5 Flash for high-speed parallel question generation, intelligent resume parsing, and role-skill roadmap synthesis.
- **Authentication**: Dual-layer cross-domain auth supporting secure HttpOnly `SameSite=None` cookies with seamless `Authorization: Bearer` token fallback for maximum cross-browser reliability.

---

## 📁 Repository Structure

```
Career Sync/
├── apps/
│   ├── api/                          # Express.js REST API & AI Pipelines
│   │   ├── config/                   # Target roles, CORS allowlists, URL helpers
│   │   ├── db/                       # MongoDB Atlas connection & schema lifecycle
│   │   ├── middleware/               # JWT authentication, MongoDB guard, rate limits
│   │   ├── models/                   # Mongoose models (User, Course, Roadmap, etc.)
│   │   ├── routes/                   # REST API routes (auth, roadmaps, courses, skills, resume)
│   │   ├── scripts/                  # Data inspection & service verification utilities
│   │   ├── services/                 # AI roadmap synthesis, resume parsing, email service
│   │   ├── utils/                    # Device detectors, token extractors, logger
│   │   ├── package.json              # Backend dependencies & scripts
│   │   └── server.js                 # Express server bootstrap
│   │
│   └── web/                          # Next.js 15 Full-Stack Web Application
│       ├── app/                      # Next.js App Router (pages, layouts, API handlers)
│       │   ├── (app)/                # Authenticated workspace routes (home, roadmaps, courses)
│       │   ├── (marketing)/          # Public landing, authentication, and login flows
│       │   └── api/                  # Serverless route handlers (course generator proxy)
│       ├── components/               # Modular UI components & design system primitives
│       ├── contexts/                 # React Contexts (AuthContext with token sync)
│       ├── lib/                      # ApiClient, utility functions, type validators
│       ├── middleware.ts             # Route protection middleware
│       ├── package.json              # Frontend dependencies & scripts
│       └── tailwind.config.ts        # Design tokens & responsive styling config
│
├── scripts/                          # Operational tools (mock-api, check-credits)
├── deploy.js                         # Unified local development runner
├── DEPLOYMENT_GUIDE.md               # Step-by-step production deployment guide
├── render.yaml                       # Render Infrastructure-as-Code Blueprint
├── package.json                      # Monorepo root workspace scripts
└── .gitignore                        # Production-ready git ignore rules
```

---

## 🚀 Key Features

1. **Intelligent Resume Parser & Profiler**
   - Upload PDF or Word documents to extract verified skills, domain experience, and profile attributes.
   - Automatically maps extracted talents to industry standard target roles.

2. **Ultra-Fast Adaptive Skill Assessments**
   - AI generates calibrated technical challenges tailored to target roles and extracted skill gaps.
   - Questions generate in **5–8 seconds** through parallelized Gemini Flash evaluation pipelines.

3. **Interactive Personalized Roadmaps**
   - Clean, high-contrast, actionable milestone tracker (Milestones, Domain Units, and Step checklists).
   - Dynamic stage filtering (Early Stage, Intermediate, Mastery) with toggleable checklist view.
   - Built-in PDF export, progress persistence, and 1-click "Generate Course" integration per topic.

4. **On-Demand Modular Course Generator**
   - Real-time generation of complete multi-module courses with learning objectives and verified educational resources.
   - Interactive chapter navigation, video lessons, and quiz checkpoints.

---

## 💻 Local Development

### Prerequisites
- **Node.js**: v20 or newer
- **npm**: v10 or newer
- **MongoDB Atlas** database connection string (or local MongoDB on port 27017)
- **Google Gemini API Key**

### 1. Installation

Install all workspace dependencies across root, API, and web:
```bash
npm run install:all
```

### 2. Environment Configuration

#### Backend: `apps/api/.env`
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-random-32-character-secret-key
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/CareerOs?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

#### Frontend: `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
OPENROUTER_API_KEY=your_openrouter_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Start Development Servers

Run both the API and Web applications concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend API (port 5000)
npm run start:api

# Terminal 2: Frontend App (port 3000)
npm run start:web
```

Access the application in your browser:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🚢 Production Deployment

CareerSync is production-configured for decoupled hosting:
- **Backend API ➔ Render** (`apps/api`)
- **Frontend App ➔ Vercel** (`apps/web`)

👉 **For the complete step-by-step walkthrough, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).**

### Quick Deployment Summary:
1. **MongoDB Atlas**: Whitelist `0.0.0.0/0` under Network Access so cloud instances can connect.
2. **Render (Backend)**: Create a Web Service pointing to `apps/api`. Set build command `npm install` and start command `npm start`. Add environment variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).
3. **Vercel (Frontend)**: Import repo, set Root Directory to `apps/web`. Configure `NEXT_PUBLIC_API_URL` to point to your live Render backend URL.
4. **Link CORS**: Add your live Vercel domain to `CORS_ORIGINS` and `FRONTEND_URL` on Render.

---

## 📡 Core API Reference

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `/api/health` | `GET` | Health check & service connectivity status | No |
| `/api/auth/register` | `POST` | Create a new user account | No |
| `/api/auth/login` | `POST` | Authenticate with email & password | No |
| `/api/auth/me` | `GET` | Retrieve authenticated user profile | Yes |
| `/api/auth/logout` | `POST` | Clear session cookies | Yes |
| `/api/resume/analyze` | `POST` | Parse resume document & extract skills | Yes |
| `/api/skills/questions` | `POST` | Generate adaptive skill assessment questions | Yes |
| `/api/skills/evaluate` | `POST` | Evaluate submitted assessment answers | Yes |
| `/api/roadmaps/generate` | `POST` | Generate personalized career roadmap | Yes |
| `/api/roadmaps` | `GET` | Retrieve saved roadmaps for user | Yes |
| `/api/roadmaps/:id` | `GET` | Retrieve specific roadmap by ID | Yes |
| `/api/courses` | `GET` | List user courses & enrolled tracks | Yes |
| `/api/generate-course-v2` | `POST` | Synthesize complete modular course track | Yes |

---

## 🛡️ License

This project is licensed under the ISC License. Built with ❤️ for empowering tech career journeys.
