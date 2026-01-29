# Backend API for Knowledge Assessment Platform

Node.js/Express backend with MongoDB integration and Gemini API.

## Setup Instructions

1. **Install MongoDB** (if not already installed):
   - Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud)

2. **Install dependencies:**
```bash
cd backend
npm install
```

3. **Configure environment variables:**
   - Update `.env` file with your MongoDB URI and Gemini API key

4. **Start MongoDB** (if using local):
```bash
mongod
```

5. **Start the backend server:**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Skills
- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get skill by ID
- `POST /api/skills` - Create new skill
- `GET /api/skills/search/:name` - Search skills

### Questions
- `GET /api/questions/:skillId/:level` - Get questions by skill and level
- `POST /api/questions/generate` - Generate questions with Gemini API
- `POST /api/questions/bulk` - Bulk create questions

### Tests
- `POST /api/tests/start` - Start a new test
- `POST /api/tests/submit` - Submit test answers
- `GET /api/tests/:attemptId` - Get test attempt details
- `GET /api/tests/user/:userId` - Get user test history

## Database Models

### Skill
- skillName (String, required, unique)
- description (String)
- category (String)

### Question
- skill (ObjectId, ref: Skill)
- level (String: beginner/intermediate/advanced)
- mainTopic (String)
- subTopic (String)
- topic (String)
- question (String)
- options (Array of Strings)
- correctAnswer (String)

### TestAttempt
- userId (String)
- skill (ObjectId, ref: Skill)
- skillName (String)
- level (String)
- questions (Array of ObjectId)
- answers (Map)
- score (Number)
- totalQuestions (Number)
- percentage (Number)
- status (String: in-progress/completed)
- timestamps
