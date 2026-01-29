# 🚀 Unfold Platform - Setup Guide

## Quick Start (Docker - Recommended)

### Prerequisites
- Docker Desktop installed and running
- Git (optional)

### Steps

1. **Navigate to the project directory:**
```bash
cd "c:\Users\LUCKY\OneDrive\Desktop\project\course generation"
```

2. **Start all services with Docker Compose:**
```bash
docker-compose up -d
```

This single command will:
- ✅ Start PostgreSQL database on port 5432
- ✅ Automatically create database schema
- ✅ Load sample data (users, courses, journeys)
- ✅ Start backend API on port 5000
- ✅ Start frontend on port 3000

3. **Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432

4. **View logs (optional):**
```bash
docker-compose logs -f
```

5. **Stop services:**
```bash
docker-compose down
```

---

## Manual Setup (Without Docker)

### 1. Database Setup

#### Install PostgreSQL 16
- Windows: Download from https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql@16`
- Linux: `sudo apt install postgresql-16`

#### Create Database
```bash
# Create database
createdb unfold_db

# Run schema
psql unfold_db < database/schema.sql

# Load sample data
psql unfold_db < database/seeds.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=unfold_db
# JWT_SECRET=your-secret-key

# Start development server
npm run dev
```

Backend API will be running on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

Frontend will be running on http://localhost:3000

---

## 🔑 Demo Accounts

All accounts use password: **password123**

| Email | Role | Access |
|-------|------|--------|
| learner@example.com | Learner | Homepage, courses, journeys |
| educator@example.com | Educator | + Studio dashboard |
| admin@example.com | Admin | Full access |

---

## 📡 API Testing

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "educator@example.com",
    "password": "password123"
  }'
```

**Get all journeys:**
```bash
curl http://localhost:5000/api/learning-journeys
```

**Get all courses:**
```bash
curl http://localhost:5000/api/courses
```

**Get topics:**
```bash
curl http://localhost:5000/api/topics
```

### Using Postman

1. Import the following endpoints:
   - Base URL: `http://localhost:5000/api`
   - Auth endpoints: `/auth/register`, `/auth/login`, `/auth/profile`
   - Journey endpoints: `/learning-journeys`, `/learning-journeys/:slug`
   - Course endpoints: `/courses`, `/courses/:slug`
   - Topic endpoint: `/topics`

2. For protected routes, add Authorization header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

---

## 🗄 Database Structure

### Tables Created

1. **users** - User accounts and authentication
2. **learning_journeys** - Learning paths with multiple courses
3. **courses** - Individual courses
4. **topics** - Course categories (30+ predefined)
5. **course_topics** - Many-to-many relationship
6. **enrollments** - Track user enrollments and progress
7. **educator_applications** - Educator onboarding requests

### Sample Data Loaded

- 4 users (learner, educator, admin, + 1 educator)
- 3 learning journeys
- 6 courses
- 32 topics
- Sample enrollments

---

## 🔧 Troubleshooting

### Docker Issues

**Containers won't start:**
```bash
# Check Docker Desktop is running
# Check no other services on ports 3000, 5000, 5432
docker-compose down
docker-compose up -d
```

**Database connection failed:**
```bash
# Check PostgreSQL container is healthy
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

**Frontend can't reach backend:**
```bash
# Check backend is running
curl http://localhost:5000/health

# Check NEXT_PUBLIC_API_URL in frontend/.env.local
```

### Manual Setup Issues

**Backend won't connect to database:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `backend/.env`
- Ensure database exists: `psql -l | grep unfold_db`

**"Module not found" errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
# Find and kill process
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

---

## 🛠 Development Commands

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Restart a service
docker-compose restart frontend

# Rebuild images
docker-compose build

# Remove everything (including volumes)
docker-compose down -v
```

### Backend Commands

```bash
cd backend

# Development
npm run dev

# Build for production
npm run build

# Run production
npm start

# Run migrations (if using migration files)
npm run migrate

# Seed database
npm run seed
```

### Frontend Commands

```bash
cd frontend

# Development
npm run dev

# Build for production
npm run build

# Run production
npm start

# Lint code
npm run lint
```

---

## 📦 Installing Additional Dependencies

### Backend
```bash
cd backend
npm install <package-name>
```

### Frontend
```bash
cd frontend
npm install <package-name>
```

---

## 🎯 Next Steps

1. ✅ All services are running
2. ✅ Database is initialized with sample data
3. ✅ You can access the frontend at http://localhost:3000
4. ✅ API is accessible at http://localhost:5000

### Try These:

1. **Login** with educator@example.com / password123
2. **Access Studio** dashboard to manage courses
3. **Browse** learning journeys and courses
4. **Test API** endpoints with Postman or cURL
5. **Create** new courses or journeys via Studio

---

## 📚 Additional Resources

- **Frontend Docs:** `frontend/README.md`
- **Backend Docs:** `backend/README.md`
- **Project Structure:** `PROJECT_STRUCTURE.md`
- **Database Schema:** `database/schema.sql`

---

## 🆘 Need Help?

If you encounter any issues:

1. Check logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check database connection: `docker-compose exec postgres psql -U postgres -d unfold_db -c '\dt'`
4. Restart services: `docker-compose restart`

Happy coding! 🚀
