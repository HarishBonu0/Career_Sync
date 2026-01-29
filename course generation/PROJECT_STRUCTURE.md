# Unfold Platform - Complete Project Structure

## 📁 Root Level

```
course generation/
├── frontend/                      # Next.js frontend application
├── backend/                       # Express.js backend API
├── database/                      # Database schema and seeds
├── docker-compose.yml             # Docker orchestration
├── .gitignore                     # Git ignore rules
└── README.md                      # Main documentation
```

## 🎨 Frontend Structure (`/frontend`)

```
frontend/
├── app/
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Redirect to /home
│   ├── globals.css               # Global styles
│   │
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Signup page
│   │
│   ├── (main)/                   # Main public routes
│   │   ├── layout.tsx            # Layout with navbar
│   │   ├── home/page.tsx         # Homepage
│   │   ├── learning-journeys/
│   │   │   ├── page.tsx          # Journeys list
│   │   │   └── [slug]/page.tsx   # Journey detail
│   │   ├── courses/page.tsx      # Courses list
│   │   ├── course/[slug]/page.tsx # Course detail
│   │   ├── educators/page.tsx    # Educator onboarding
│   │   └── search/page.tsx       # Search results
│   │
│   ├── studio/                   # Protected educator routes
│   │   ├── layout.tsx            # Studio layout with auth
│   │   ├── page.tsx              # Dashboard
│   │   ├── courses/page.tsx      # Course manager
│   │   ├── journeys/page.tsx     # Journey manager
│   │   └── analytics/page.tsx    # Analytics
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth (deprecated, use backend API)
│       └── search/route.ts              # Search API (migrated to backend)
│
├── components/
│   ├── layout/
│   │   └── Navbar.tsx            # Main navigation
│   ├── home/
│   │   ├── HeroSection.tsx       # Hero with search
│   │   └── TopicPills.tsx        # Scrollable topics
│   ├── journeys/
│   │   └── JourneyCard.tsx       # Journey card component
│   ├── courses/
│   │   └── CourseCard.tsx        # Course card component
│   ├── studio/
│   │   └── StudioNav.tsx         # Studio navigation
│   ├── search/
│   │   └── SearchBar.tsx         # Search component
│   └── providers/
│       └── AuthProvider.tsx      # Auth context (deprecated)
│
├── lib/
│   ├── api.ts                    # Axios API client ✨ NEW
│   ├── auth.ts                   # Auth config (deprecated)
│   ├── session.ts                # Session helpers (deprecated)
│   ├── data.ts                   # Mock data (for frontend-only testing)
│   └── constants.ts              # Constants and config
│
├── types/
│   └── index.ts                  # TypeScript interfaces
│
├── hooks/                        # Custom React hooks ✨ NEW
│   ├── useAuth.ts                # Auth hook
│   ├── useJourneys.ts            # SWR for journeys
│   └── useCourses.ts             # SWR for courses
│
├── public/                       # Static assets
│   ├── logo.svg
│   └── images/
│
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── postcss.config.js             # PostCSS config
├── Dockerfile                    # Docker image for frontend
└── .env.local                    # Environment variables
```

## ⚙️ Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── controllers/              # Request handlers
│   │   ├── authController.ts     # Auth logic
│   │   ├── journeyController.ts  # Journey CRUD
│   │   ├── courseController.ts   # Course CRUD
│   │   └── topicController.ts    # Topics
│   │
│   ├── routes/                   # API endpoints
│   │   ├── auth.ts               # /api/auth/*
│   │   ├── journeys.ts           # /api/learning-journeys/*
│   │   ├── courses.ts            # /api/courses/*
│   │   └── topics.ts             # /api/topics/*
│   │
│   ├── middleware/
│   │   ├── auth.ts               # JWT verification
│   │   ├── errorHandler.ts       # Error handling
│   │   └── validation.ts         # Zod validation
│   │
│   ├── models/                   # Database models (optional)
│   │   ├── User.ts
│   │   ├── LearningJourney.ts
│   │   └── Course.ts
│   │
│   ├── db/
│   │   ├── connection.ts         # PostgreSQL pool
│   │   ├── migrate.ts            # Migration runner
│   │   └── seed.ts               # Seed data loader
│   │
│   ├── utils/
│   │   ├── slugify.ts            # Slug generation
│   │   └── passwordHash.ts       # Password hashing
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   │
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
│
├── migrations/                   # SQL migrations (optional)
│   └── 001_init.sql
│
├── package.json                  # Backend dependencies
├── tsconfig.json                 # TypeScript config
├── Dockerfile                    # Docker image for backend
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore
└── README.md                     # Backend docs
```

## 🗄 Database Structure (`/database`)

```
database/
├── schema.sql                    # Complete database schema
│   ├── users table
│   ├── learning_journeys table
│   ├── courses table
│   ├── topics table
│   ├── course_topics (many-to-many)
│   ├── enrollments table
│   └── educator_applications table
│
└── seeds.sql                     # Sample data
    ├── 30+ topics
    ├── 4 sample users
    ├── 3 learning journeys
    └── 6 courses
```

## 🐳 Docker Configuration

```yaml
docker-compose.yml                # Multi-container setup
├── postgres service              # Database (port 5432)
│   └── Auto-runs schema.sql & seeds.sql
├── backend service               # API (port 5000)
│   └── Depends on postgres
└── frontend service              # UI (port 3000)
    └── Depends on backend
```

## 📋 Key Features by Directory

### Frontend
- ✅ Server-side rendering with Next.js 14
- ✅ App Router for modern routing
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Axios for API calls to backend
- ✅ Real-time search functionality
- ✅ Infinite scroll implementation
- ✅ Responsive design (mobile/tablet/desktop)

### Backend
- ✅ RESTful API with Express.js
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ PostgreSQL database integration
- ✅ Input validation with Zod
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Slug generation for SEO-friendly URLs

### Database
- ✅ Normalized schema design
- ✅ Foreign key constraints
- ✅ Indexes for performance
- ✅ Triggers for updated_at timestamps
- ✅ Many-to-many relationships
- ✅ Sample data for testing

## 🔄 Data Flow

```
User Request → Frontend (Next.js)
                  ↓
            lib/api.ts (Axios)
                  ↓
            Backend API (Express)
                  ↓
            Controllers (Business Logic)
                  ↓
            Database (PostgreSQL)
                  ↓
            Response → Frontend → User
```

## 🔐 Authentication Flow

```
1. User submits login → Frontend
2. Frontend calls POST /api/auth/login → Backend
3. Backend verifies credentials → Database
4. Backend generates JWT token
5. Frontend stores token in localStorage
6. Frontend sends token in Authorization header for protected routes
7. Backend middleware verifies token
8. Access granted/denied
```

## 📦 Package Management

### Frontend Dependencies
- next, react, react-dom (Core)
- axios (API client)
- swr (Data fetching)
- tailwindcss (Styling)
- lucide-react (Icons)
- date-fns (Date formatting)
- zod (Validation)

### Backend Dependencies
- express (Web framework)
- pg (PostgreSQL client)
- jsonwebtoken (JWT auth)
- bcryptjs (Password hashing)
- zod (Validation)
- cors (CORS middleware)
- nanoid (ID generation)

## 🚀 Deployment Options

### Docker (Recommended for Development)
```bash
docker-compose up -d
```

### Manual Deployment
1. Deploy PostgreSQL database
2. Run schema and seeds
3. Deploy backend to Node.js host (Heroku, Railway, Render)
4. Deploy frontend to Vercel or Netlify
5. Configure environment variables

### Environment Variables
- Frontend: `NEXT_PUBLIC_API_URL`
- Backend: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`

## 📊 Database Schema Highlights

- **Users**: Authentication and profiles
- **Learning Journeys**: Curated learning paths
- **Courses**: Individual courses (can belong to journeys)
- **Topics**: Categories (30+ predefined)
- **Course Topics**: Many-to-many relationship
- **Enrollments**: Track user progress
- **Educator Applications**: Onboarding workflow

## 🎯 Next Steps

1. ✅ Backend API fully implemented
2. ✅ Database schema created
3. ✅ Docker setup complete
4. ⏳ Migrate frontend to use backend API (in progress)
5. ⏳ Add SWR hooks for data fetching
6. ⏳ Implement proper error handling
7. ⏳ Add loading states
8. ⏳ Create educator application workflow

## 📝 Notes

- Old NextAuth implementation in frontend is deprecated
- Use backend `/api/auth` endpoints instead
- Mock data in `lib/data.ts` is for frontend-only testing
- Production should use real database via backend API
