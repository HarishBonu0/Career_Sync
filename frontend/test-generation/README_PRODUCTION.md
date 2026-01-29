# 📚 Knowledge Assessment Platform - Production Ready

A professional AI-powered knowledge assessment platform with secure architecture and beautiful UI.

## 🔒 Security Features

- ✅ **API keys stored server-side only** (never exposed to frontend)
- ✅ Environment variable configuration
- ✅ CORS protection
- ✅ `.gitignore` for sensitive files
- ✅ Production-ready deployment configuration

## 🎨 Design

- **Professional purple gradient theme**: `#667eea` → `#764ba2`
- Responsive design for all devices
- Smooth animations and transitions
- Modern, clean interface

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone and install dependencies:**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

2. **Configure backend environment:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your actual API key and MongoDB URI
```

3. **Configure frontend environment:**
```bash
# In project root, .env is already created
# For production, update .env.production with your backend URL
```

4. **Start the servers:**
```bash
# From project root:
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

5. **Access the application:**
```
Frontend: http://localhost:3000
Backend API: http://localhost:5000/api
```

## 📂 Project Structure

```
project/
├── src/                      # React frontend
│   ├── components/          # React components
│   │   ├── SetupPage.js    # Course selection (NO API key input!)
│   │   ├── TestPage.js     # Question display
│   │   └── ResultPage.js   # Results display
│   └── utils/
│       └── geminiApi.js    # API calls (secure)
├── backend/                 # Express backend
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── utils/
│   │   └── geminiService.js  # Gemini AI integration
│   ├── .env               # ⚠️ SECRET - Never commit!
│   └── server.js          # Server entry point
├── .env                    # Frontend config
├── .env.production        # Production frontend config
├── DEPLOYMENT.md          # Deployment guide
└── SECURITY.md            # Security documentation
```

## 🔐 Security Architecture

### Before (Insecure):
```
Frontend → [API Key Exposed] → Backend → Gemini AI
```

### After (Secure):
```
Frontend → Backend → [API Key Hidden] → Gemini AI
```

**Key Changes:**
- API key removed from frontend completely
- All AI requests go through backend
- Environment variables for configuration
- CORS protection enabled

## 🎯 Features

- **AI-Generated Questions**: 60 questions generated using Gemini AI
- **Adaptive Testing**: 20 random questions per test attempt
- **Multiple Difficulty Levels**: Beginner, Intermediate, Advanced
- **Real-time Timer**: 30-minute countdown
- **Progress Tracking**: Visual progress bar
- **Topic Analysis**: Results breakdown by topic and subtopic
- **MongoDB Storage**: Persistent question bank
- **Professional UI**: Purple gradient theme throughout

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:
- Vercel + Heroku
- Netlify + Render
- VPS deployment
- Docker deployment
- Security best practices

### Quick Deploy Options:

**Frontend (Vercel/Netlify):**
- Connect GitHub repository
- Set `REACT_APP_API_URL` environment variable
- Deploy automatically

**Backend (Heroku/Render):**
- Connect GitHub repository
- Set environment variables:
  - `MONGODB_URI`
  - `GEMINI_API_KEY`
  - `FRONTEND_URL`
  - `NODE_ENV=production`
- Deploy automatically

## 📋 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/knowledge-assessment
GEMINI_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Testing

### Local Testing:
```bash
# Backend
cd backend
npm start

# Frontend
npm start
```

### Production Build Testing:
```bash
# Build frontend
npm run build

# Serve production build
npx serve -s build
```

## 🔧 API Endpoints

### Skills
- `POST /api/skills` - Create skill
- `GET /api/skills/search/:name` - Search skills

### Questions
- `POST /api/questions/generate` - Generate 60 questions (uses server API key)
- `POST /api/questions/test` - Get 20 random test questions

### Tests
- `POST /api/tests/submit` - Submit test attempt
- `GET /api/tests/:attemptId` - Get test results

## 🎨 Color Scheme

```css
Primary Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Primary Color: #667eea
Secondary Color: #764ba2
Success: #10b981
Warning: #f59e0b
Error: #ef4444
```

## 📊 Tech Stack

**Frontend:**
- React 18
- React Router 6
- CSS3 (Custom styling)
- Fetch API

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- Google Generative AI (Gemini)
- CORS

## 🐛 Troubleshooting

### "API Key not configured" error
- Ensure `GEMINI_API_KEY` is set in `backend/.env`
- Restart backend server after updating .env

### CORS errors
- Update `FRONTEND_URL` in backend .env
- Restart backend server

### MongoDB connection errors
- Ensure MongoDB is running
- Check `MONGODB_URI` format
- For Atlas: Check IP whitelist

## 📝 Development Notes

### Adding New Features:
1. Never add API keys to frontend
2. Use environment variables for configuration
3. Keep security best practices
4. Maintain purple gradient theme
5. Test in production build mode

### Code Quality:
- ES6+ syntax
- Async/await for promises
- Error handling on all API calls
- React hooks best practices
- Clean, commented code

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

**Important**: Never commit `.env` files or API keys!

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- **Security Issues**: See [SECURITY.md](./SECURITY.md)
- **Deployment Help**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Bug Reports**: Create an issue on GitHub

---

## ✨ What's New (Latest Update)

### Security Improvements:
- ✅ Removed API key from frontend completely
- ✅ Implemented server-side API key handling
- ✅ Added CORS configuration
- ✅ Created .env.example template
- ✅ Updated .gitignore for security

### Code Quality:
- ✅ Fixed React hook warnings
- ✅ Removed deprecated MongoDB options
- ✅ Cleaned up unused variables
- ✅ Added comprehensive documentation

### Documentation:
- ✅ Created DEPLOYMENT.md guide
- ✅ Created SECURITY.md documentation
- ✅ Updated README with security info
- ✅ Added troubleshooting section

---

**Version**: 2.0.0 (Production Ready)  
**Last Updated**: January 1, 2026  
**Status**: ✅ Secure & Ready for Deployment
