# Knowledge Assessment Platform - Full Stack

Complete MERN stack application with MongoDB, Express, React, Node.js, and Gemini AI integration.

## 🏗️ Project Structure

```
test generation/
├── backend/                 # Node.js/Express backend
│   ├── models/             # MongoDB schemas
│   │   ├── Question.js
│   │   ├── Skill.js
│   │   └── TestAttempt.js
│   ├── routes/             # API routes
│   │   ├── skillRoutes.js
│   │   ├── questionRoutes.js
│   │   └── testRoutes.js
│   ├── utils/              # Utility functions
│   │   └── geminiService.js
│   ├── server.js           # Express server
│   ├── package.json
│   └── .env
│
├── src/                    # React frontend
│   ├── components/
│   │   ├── SetupPage.js
│   │   ├── TestPage.js
│   │   └── ResultPage.js
│   ├── utils/
│   │   └── geminiApi.js
│   ├── App.js
│   └── index.js
│
├── public/
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Gemini API key

### Installation

1. **Install MongoDB:**
   - Local: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud)

2. **Clone and setup:**
```bash
cd "c:\Users\LUCKY\OneDrive\Desktop\project\test generation"

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Configure environment:**
   - Update `backend/.env` with your MongoDB URI
   - API key is already configured

4. **Start MongoDB** (if using local):
```bash
mongod
```

5. **Run the application:**

**Option A - Run both (recommended):**
```bash
npm run dev
```

**Option B - Run separately:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm start
```

The app will open at `http://localhost:3000`
Backend API runs at `http://localhost:5000`

## 📋 Features

### ✨ Core Features
- **Dynamic Question Generation** via Gemini AI
- **MongoDB Storage** - Questions saved for reuse
- **30-Minute Timer** with auto-submit
- **Real-time Progress Tracking**
- **Detailed Results Analysis**
- **Topic-wise Performance Breakdown**
- **Weak Area Identification**
- **Test History Tracking**

### 🎯 API Features
- Skill management (create, search, retrieve)
- Question generation and storage
- Test attempt tracking
- Score calculation and analysis
- User test history

### 🎨 UI Features
- Clean, modern interface
- Responsive design (mobile/desktop)
- Loading indicators
- Floating countdown timer
- Progress visualization
- Bootstrap 5 styling

## 📡 API Endpoints

### Skills
- `GET /api/skills` - List all skills
- `POST /api/skills` - Create skill
- `GET /api/skills/search/:name` - Search

### Questions
- `POST /api/questions/generate` - Generate with Gemini
- `GET /api/questions/:skillId/:level` - Get by skill/level

### Tests
- `POST /api/tests/start` - Start new test
- `POST /api/tests/submit` - Submit answers
- `GET /api/tests/user/:userId` - Get history

## 🗃️ Database Schema

### Question Model
```javascript
{
  skill: ObjectId (ref: Skill),
  level: 'beginner' | 'intermediate' | 'advanced',
  mainTopic: String,
  subTopic: String,
  topic: String,
  question: String,
  options: [String],
  correctAnswer: String
}
```

### TestAttempt Model
```javascript
{
  userId: String,
  skill: ObjectId,
  level: String,
  questions: [ObjectId],
  answers: Map,
  score: Number,
  percentage: Number,
  status: 'in-progress' | 'completed'
}
```

## 🔧 Configuration

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/knowledge-assessment
GEMINI_API_KEY=your_api_key_here
```

### Frontend (proxy)
Configured in `package.json` to proxy API calls to backend.

## 🎓 How It Works

1. **User Setup:**
   - Enter course name
   - Select difficulty level
   - Enter API key (pre-filled)

2. **Question Generation:**
   - Backend checks database for existing questions
   - If not found, calls Gemini API
   - Saves generated questions to MongoDB
   - Returns 20 random questions

3. **Test Taking:**
   - 30-minute timer starts
   - User answers questions
   - Progress tracked in real-time
   - Answers stored in session

4. **Results:**
   - Backend calculates score
   - Analyzes performance by topic
   - Identifies weak areas
   - Stores test attempt in database

## 📦 Technologies

**Frontend:**
- React 18
- React Router v6
- Bootstrap 5
- Fetch API

**Backend:**
- Node.js
- Express
- MongoDB & Mongoose
- Gemini API
- CORS

## 🔐 Security Notes

- API keys in `.env` (not committed)
- CORS configured for localhost
- Input validation on all endpoints
- Error handling middleware

## 📝 Development

**Frontend:**
- Components in `src/components/`
- API utilities in `src/utils/`
- Routing in `App.js`

**Backend:**
- Models in `backend/models/`
- Routes in `backend/routes/`
- Services in `backend/utils/`

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`

**CORS Error:**
- Verify backend is running on port 5000
- Check proxy in frontend package.json

**API Key Error:**
- Verify Gemini API key is valid
- Check `.env` file configuration

## 📄 License

MIT
