# SkillRoute AI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get API Keys (2 min)

1. **Google Gemini API Key** (Free)
   - Go to https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

2. **Supabase** (Free plan available)
   - Go to https://supabase.com
   - Sign up/login
   - Create new project
   - Copy Project URL and Anon Key from settings

### Step 2: Setup Environment (1 min)

```bash
cd app/backend
cp .env.example .env
```

Edit `.env` and add your keys:
```
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_key_here
JWT_SECRET=your_random_secret_here
```

### Step 3: Setup Database (1 min)

1. Go to your Supabase project
2. Open SQL Editor
3. Copy entire content from `app/database/schema.sql`
4. Paste it into Supabase SQL Editor
5. Click "Run"
6. ✅ All tables created!

### Step 4: Install & Run (1 min)

```bash
cd app

# Install all dependencies
npm run install:all

# Start development (runs both backend and frontend)
npm run dev
```

🎉 **Done!** Access at http://localhost:3000

---

## 📝 First Steps

1. **Sign Up** - Create account at http://localhost:3000/auth
2. **Generate Course** - Try "Python Basics"
3. **Create Roadmap** - Junior Dev → Senior Dev
4. **Take Evaluation** - Test JavaScript skills

---

## 🛠️ Troubleshooting

**"Cannot find module" error?**
```bash
cd app/backend && npm install
cd app/frontend && npm install
```

**Database not working?**
- Check Supabase URL and keys in .env
- Verify schema.sql was fully executed
- Check browser console for errors

**API 404 errors?**
- Make sure backend is running on port 5000
- Check http://localhost:5000/api/health

---

## 🚢 Ready to Deploy?

See main README.md for deployment instructions to:
- Render (Backend)
- Vercel (Frontend)
- Docker

---

## 📚 Key Files

- **Backend**: `app/backend/server.js`
- **Frontend**: `app/frontend/pages/index.html`
- **Database**: `app/database/schema.sql`
- **Config**: `app/.env.example`

---

**Questions? Check the main README.md file!**
