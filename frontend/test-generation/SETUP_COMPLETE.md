# Test Generation Module - Complete Setup

## ✅ System Status

### Servers Running
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Architecture
- **Frontend**: HTML5 + Vanilla JavaScript (No React/Node dependencies)
- **Backend**: Express.js (Lightweight CORS-enabled API)
- **AI Integration**: Direct Gemini API calls from frontend

---

## 🔧 Key Features

### 1. **Question Generation**
- Calls Google Gemini Pro API directly
- Generates 15-20 multiple-choice questions per test
- Questions include:
  - Question text
  - 4 options (A, B, C, D)
  - Correct answer
  - Topic category

### 2. **Test Interface**
- Enter course name
- Select difficulty level (Easy/Medium/Hard)
- Dynamic question display
- Progress tracking
- Radio button answers

### 3. **Results & Analysis**
- Score calculation
- Percentage display
- Topic-wise breakdown
- Weak areas identification
- Performance suggestions

---

## 📁 File Structure

```
test generation/
├── index.html           # Main HTML file
├── styles.css           # Styling (inspired by course generator)
├── script.js            # Frontend JavaScript with Gemini API integration
├── serve.js             # Simple HTTP server for frontend
├── package.json         # Frontend dependencies
└── backend/
    ├── server-simple.js # Express API server (lightweight)
    ├── package.json     # Backend dependencies
    └── .env             # Configuration (includes GEMINI_API_KEY)
```

---

## 🚀 How to Run

### Start Backend
```bash
cd "c:\Users\vamsi\Desktop\Project Expo\test generation\backend"
npm start
```

### Start Frontend
```bash
cd "c:\Users\vamsi\Desktop\Project Expo\test generation"
node serve.js
```

### Access Website
Open browser and go to: **http://localhost:3000**

---

## 🔑 API Key Configuration

**Gemini API Key** (in script.js):
```javascript
const GEMINI_API_KEY = 'AIzaSyC7JCSYvc-DZFOhG-1s438JEl5Otmj8wwo';
```

The API key is embedded in the frontend code for direct API calls (no backend relay needed).

---

## 🎨 Styling

- Modern dark gradient background
- Clean white container with rounded corners
- Professional typography
- Responsive button design
- Smooth transitions and animations
- Color-coded difficulty levels (🟢 Easy, 🟡 Medium, 🔴 Hard)

---

## 🧪 Testing

### Test a Course
1. Go to http://localhost:3000
2. Enter course name (e.g., "Python", "JavaScript", "Machine Learning")
3. Select difficulty level
4. Click "Attempt Test"
5. Wait for questions to generate
6. Answer all questions
7. Submit and view results

---

## ✨ Key Improvements

✅ Direct Gemini API integration (no backend relay delays)
✅ Proper error handling with detailed console logs
✅ Dynamic question count support
✅ No database dependencies (tests are not saved)
✅ Lightweight backend (Express only)
✅ Full CORS support
✅ Clean, professional UI
✅ Fast question generation
✅ Comprehensive results analysis

---

## 🐛 Troubleshooting

### "Failed to fetch" error
- Ensure both servers are running
- Check that Gemini API key is valid
- Open browser console (F12) to see detailed error logs

### Gemini API Errors
- Check API key validity
- Verify internet connection
- Check API rate limits (Max ~60 requests/min)

### Questions not loading
- Check browser console for errors
- Verify Gemini API response format
- Ensure API key has generateContent permission

---

## 📊 API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Get Skills (Mock)
```
GET http://localhost:5000/api/skills
```

### Submit Test (Mock)
```
POST http://localhost:5000/api/tests/submit
```

---

## 🎯 Next Steps

1. **Deployment**: Use production Gemini API key for deployment
2. **Database**: Add optional database to save test results
3. **Authentication**: Add user login if needed
4. **Dashboard**: Create user dashboard for test history
5. **Analytics**: Track question difficulty and success rates

---

Generated: January 2, 2026
