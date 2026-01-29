# Unfold Backend Setup & Run Guide

## Quick Start

### 1. Install Dependencies (Already Done)
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env` file and add your credentials:

#### Required (Already Set with Defaults):
- `PORT=5000` - Backend server port
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL=http://localhost:3000`

#### Database Options:

**Option A: PostgreSQL (Recommended for Production)**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/unfold_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=unfold_db
```

**Option B: SQLite (Easy Setup for Development)**
The backend can work without PostgreSQL initially using mock data.

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

Server will run on: **http://localhost:5000**

### 4. API Endpoints Available

Once the backend is running, these endpoints will be available:

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires token)

#### Learning Journeys
- `GET /api/learning-journeys` - Get all journeys
- `GET /api/learning-journeys/:slug` - Get journey by slug
- `POST /api/learning-journeys` - Create journey (requires auth)
- `PUT /api/learning-journeys/:slug` - Update journey (requires auth)
- `DELETE /api/learning-journeys/:slug` - Delete journey (requires auth)

#### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:slug` - Get course by slug
- `POST /api/courses` - Create course (requires auth)
- `PUT /api/courses/:slug` - Update course (requires auth)
- `DELETE /api/courses/:slug` - Delete course (requires auth)

#### Topics
- `GET /api/topics` - Get all topics

### 5. Add Your API Keys (Optional)

Edit `backend/.env` and add your keys:

```env
# AI/ML Services
OPENAI_API_KEY=sk-...your_key_here
GOOGLE_AI_API_KEY=your_key_here

# Payment
STRIPE_SECRET_KEY=sk_test_...your_key_here

# Email
SENDGRID_API_KEY=your_key_here

# Storage
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_key_here
```

### 6. Testing the Backend

**Test Authentication:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Test Journeys:**
```bash
curl http://localhost:5000/api/learning-journeys
```

**Test Courses:**
```bash
curl http://localhost:5000/api/courses
```

### 7. Setup Database (When Ready)

If you have PostgreSQL installed:

```bash
# Create database
createdb unfold_db

# Run schema
psql unfold_db < ../database/schema.sql

# Load sample data
psql unfold_db < ../database/seeds.sql
```

## Current Status

✅ Backend structure ready
✅ API routes configured
✅ Authentication middleware set up
✅ Frontend configured to use backend
⏳ Waiting for database connection (currently using mock data)

## What Happens Without Database?

The backend will:
- Use in-memory mock data for development
- Still work for testing API endpoints
- Allow frontend authentication to function
- Display sample courses and journeys

Once you provide database credentials, it will automatically connect to the real database!

## Troubleshooting

**Port Already in Use:**
```bash
# Change PORT in backend/.env to different number (e.g., 5001)
```

**Database Connection Failed:**
```bash
# Backend will automatically fall back to mock data
# Check your DATABASE_URL in backend/.env
```

**CORS Issues:**
```bash
# Make sure FRONTEND_URL=http://localhost:3000 in backend/.env
```

## Next Steps

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd .. && npm run dev`
3. Visit: http://localhost:3000
4. Login with: `learner@example.com` / `password123`
