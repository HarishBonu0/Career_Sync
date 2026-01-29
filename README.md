# CareerOS - AI-Powered Career Development Platform

An intelligent, comprehensive platform for career growth and skill development powered by AI and modern web technologies.

## 🎯 Features

- **AI-Powered Course Generation** - Automatically create personalized learning courses
- **Career Roadmap Visualization** - Interactive path planning for career progression
- **Skill Assessment System** - AI-generated evaluations and progress tracking
- **Unified Authentication** - Secure user management and login persistence
- **Multi-Module Architecture** - Modular frontend and centralized backend

## 🏗️ Architecture

### Backend
- **Node.js + Express** - RESTful API server (Port 5000)
- **MongoDB Atlas** - Cloud database for user data and courses
- **JWT Authentication** - Secure token-based sessions
- **Email Service** - OTP verification via EmailJS

### Frontend
Four integrated applications:

| App | Framework | Port | Purpose |
|-----|-----------|------|---------|
| Landing Page | Vite + Vanilla JS | 4173 | Entry point & authentication |
| Course Generation | Next.js | 3002 | AI course builder interface |
| Roadmap Generator | React + Vite | 5173 | Career path visualization |
| Skill Evaluator | Vanilla JS | 3001 | Assessment & testing |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB Atlas account
- EmailJS account (for OTP)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "Project Expo"

# Install all dependencies
npm run install:all
```

### Environment Setup

Create `.env` in `backend/main-app/backend/`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
MONGODB_URI=your-mongodb-atlas-connection-string

# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

### Running Locally

**Option 1: Start All Services**
```bash
npm run start:all
```

**Option 2: Start Individually**
```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - All Frontends
cd frontend
npm run dev
```

**Access Points:**
- Landing Page: http://localhost:4173
- Course Generation: http://localhost:3002
- Roadmap: http://localhost:5173
- Skill Evaluator: http://localhost:3001

## 📁 Project Structure

```
Project Expo/
├── backend/
│   └── main-app/
│       ├── backend/              # Express server
│       │   ├── server.js
│       │   ├── controllers/      # Request handlers
│       │   ├── models/           # MongoDB schemas
│       │   ├── routes/           # API endpoints
│       │   ├── middleware/       # Auth & validation
│       │   ├── services/         # Business logic
│       │   └── package.json
│       └── database/
│           └── schema.sql        # Database setup
│
├── frontend/
│   ├── landing-page/             # Main entry (Vite)
│   ├── course-generation/        # AI courses (Next.js)
│   ├── roadmap/                  # Career paths (React)
│   ├── test-generation/          # Skill tests (Vanilla JS)
│   ├── shared/                   # Shared components
│   └── package.json
│
├── db/                           # Database utilities
│   ├── supabaseClient.ts
│   └── queries/
│
├── scripts/                      # Setup & deployment
├── nginx.conf                    # Web server config
└── README.md
```

## 🔐 Authentication Flow

1. User registers/logs in on Landing Page
2. Backend validates credentials and issues JWT
3. JWT stored in localStorage with expiration
4. All API requests include token in headers
5. Middleware verifies token on protected routes
6. OTP sent via EmailJS for verification

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/register         - User registration
POST   /api/auth/login            - User login
POST   /api/auth/verify-otp       - OTP verification
POST   /api/auth/refresh          - Token refresh
```

### Courses
```
GET    /api/courses               - List all courses
POST   /api/courses               - Create course
GET    /api/courses/:id           - Get course details
PUT    /api/courses/:id           - Update course
```

### Users
```
GET    /api/users/profile         - Get user profile
PUT    /api/users/profile         - Update profile
GET    /api/users/progress        - Get learning progress
```

## 🛠️ Development

### Available Scripts

```bash
npm run install:all               # Install all dependencies
npm run start:all                 # Start backend + all frontends
npm run start:backend             # Backend only
npm run start:landing             # Landing page only
npm run start:course              # Course generation only
npm run start:roadmap             # Roadmap only
npm run start:evaluator           # Skill evaluator only
```

### Tech Stack
- **Runtime:** Node.js
- **Backend:** Express.js
- **Database:** MongoDB
- **Frontend Frameworks:** Next.js, React, Vite
- **Authentication:** JWT
- **Email Service:** EmailJS
- **Styling:** Tailwind CSS, CSS Modules

## 📦 Deployment

### Render.yaml Configuration
```bash
# Automatic deployment via render.yaml
# Push to main branch to trigger deployment
```

### Docker
```bash
# Build and run with Docker
docker-compose up --build
```

## 🐛 Troubleshooting

**MongoDB Connection Issues:**
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

**Port Conflicts:**
- Change ports in respective `vite.config.js` or `package.json`
- Update API endpoints if ports change

**JWT Issues:**
- Clear localStorage and re-login
- Verify JWT_SECRET matches between requests
- Check token expiration time

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push and create a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📧 Support

For issues or questions, contact the development team.

---

**Last Updated:** January 2026 | **Version:** 1.0.0
