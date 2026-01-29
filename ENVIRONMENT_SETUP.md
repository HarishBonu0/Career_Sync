# 📁 Environment Variables Setup Guide

## 📍 Location of Environment Files

Your project needs environment variables in **5 locations**:

### 1️⃣ Backend Server
**Location:** `backend/main-app/backend/.env`

```bash
# Copy the example file
cd backend/main-app/backend
cp .env.example .env
```

**Required Variables:**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production

# MongoDB Atlas
MONGODB_URI=mongodb+srv://harishbonu3_db_user:CareerOS%40HaRISH@careeros.n1t9tw0.mongodb.net/CareerOs?retryWrites=true&w=majority&appName=CareerOs

# Google Gemini API
GEMINI_API_KEY=AIzaSyDJuWsgnWTfUDaUO-egwjHvtyrxbzoFBt4

# EmailJS (OTP delivery)
EMAILJS_SERVICE_ID=service_itdedgy
EMAILJS_TEMPLATE_ID=template_d5n3dqm
EMAILJS_PUBLIC_KEY=FZSavRhxo_ozMjVFW
EMAILJS_PRIVATE_KEY=KqZ2k9RApQQDDIqLXbAZj
EMAILJS_GMAIL=vijayabonu0@gmail.com

# YouTube API (future use)
YOUTUBE_API_KEY=AIzaSyC_H3ejidnG-10kN3FSx_9Lb5DfonyQbN8

# OpenRouter API (future use)
OPENROUTER_API_KEY=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
```

---

### 2️⃣ Course Generation (Next.js)
**Location:** `frontend/course-generation/.env.local`

```bash
cd frontend/course-generation
cp .env.example .env.local
```

**Required Variables:**
```env
# OpenRouter API
OPENROUTER_API_KEY=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

# YouTube API
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyDUjD-ZWNuSL2kQ8HJq6JkVjSvojDj5JKU

# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# MongoDB (for direct access if needed)
MONGODB_URI=mongodb+srv://careeros:CareerOs123@careeros.n1t9tw0.mongodb.net/CareerOs?retryWrites=true&w=majority
```

---

### 3️⃣ Test Generation
**Location:** `frontend/test-generation/.env`

```bash
cd frontend/test-generation
cp .env.example .env
```

**Required Variables:**
```env
# Gemini API for skill evaluation
VITE_GEMINI_API_KEY=AIzaSyDJuWsgnWTfUDaUO-egwjHvtyrxbzoFBt4
```

---

### 4️⃣ Roadmap
**Location:** `frontend/roadmap/.env`

```bash
cd frontend/roadmap
cp .env.example .env
```

**Required Variables:**
```env
# Gemini API for roadmap generation
VITE_GEMINI_API_KEY=AIzaSyDJuWsgnWTfUDaUO-egwjHvtyrxbzoFBt4

# Backend API URL
VITE_API_URL=http://localhost:5000
```

---

### 5️⃣ Landing Page
**Location:** Uses hardcoded config in `frontend/landing-page/auth.js`

**No .env needed** - API URL is configured directly in the code pointing to `http://localhost:5000`

---

## 🚀 Quick Setup (PowerShell)

Run this script to create all .env files at once:

```powershell
# Navigate to project root
cd "c:\Users\vamsi\Desktop\Career OS"

# Backend
Copy-Item "backend\main-app\backend\.env.example" "backend\main-app\backend\.env"

# Course Generation (already exists)
# .env.local already present

# Test Generation
Copy-Item "frontend\test-generation\.env.example" "frontend\test-generation\.env"

# Roadmap
Copy-Item "frontend\roadmap\.env.example" "frontend\roadmap\.env"

Write-Host "✅ All .env files created! Now edit them with your actual values."
```

---

## 🔑 How to Get API Keys

### 1. **Google Gemini API** (FREE)
- Visit: https://aistudio.google.com/app/apikey
- Click "Get API Key"
- Copy and paste in:
  - `backend/main-app/backend/.env` → `GEMINI_API_KEY`
  - `frontend/test-generation/.env` → `VITE_GEMINI_API_KEY`
  - `frontend/roadmap/.env` → `VITE_GEMINI_API_KEY`

### 2. **YouTube Data API v3** (FREE)
- Visit: https://console.cloud.google.com/apis/credentials
- Create project → Enable "YouTube Data API v3"
- Create API Key
- Copy to: `frontend/course-generation/.env.local` → `NEXT_PUBLIC_YOUTUBE_API_KEY`

### 3. **OpenRouter API** (PAID)
- Visit: https://openrouter.ai/keys
- Sign up and get API key
- Copy to: `frontend/course-generation/.env.local` → `OPENROUTER_API_KEY`

### 4. **EmailJS** (FREE tier available)
- Visit: https://www.emailjs.com/
- Create account
- Get Service ID, Template ID, Public Key, Private Key
- Copy to: `backend/main-app/backend/.env`

### 5. **MongoDB Atlas** (FREE tier available)
- Already configured with your credentials
- URI: `mongodb+srv://harishbonu3_db_user:...@careeros.n1t9tw0.mongodb.net/`

---

## ✅ Verify Setup

After creating .env files, verify they exist:

```powershell
# Check if all .env files exist
Get-ChildItem -Recurse -Filter ".env*" | Where-Object { $_.Name -notlike "*.example" } | Select-Object FullName
```

---

## ⚠️ Important Notes

1. **Never commit .env files** - They're already in `.gitignore`
2. **Use different API keys** for development vs production
3. **Keep .env.example files** - They help other developers set up the project
4. **Restart servers** after changing .env files

---

## 🔄 After Setup

Restart all services:
```powershell
# Stop all running terminals (Ctrl+C in each)
# Then restart using your start script
npm run start-all
```

---

Need help with any specific API key? Let me know! 🚀
