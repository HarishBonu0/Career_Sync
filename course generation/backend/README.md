# Unfold Backend API

Express.js + TypeScript + PostgreSQL backend for the Unfold course platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

3. Make sure PostgreSQL is running (use Docker Compose from root)

4. Run migrations (if using migration files):
```bash
npm run migrate
```

5. Seed the database:
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Learning Journeys
- `GET /api/learning-journeys` - List all journeys
- `GET /api/learning-journeys/:slug` - Get journey by slug
- `POST /api/learning-journeys` - Create journey (educator/admin)
- `PUT /api/learning-journeys/:id` - Update journey (educator/admin)
- `DELETE /api/learning-journeys/:id` - Delete journey (educator/admin)

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:slug` - Get course by slug
- `POST /api/courses` - Create course (educator/admin)
- `PUT /api/courses/:id` - Update course (educator/admin)
- `DELETE /api/courses/:id` - Delete course (educator/admin)

### Topics
- `GET /api/topics` - Get all topics

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: pg (node-postgres)
- **Auth**: JWT + bcryptjs
- **Validation**: Zod
