# 🚨 DEPLOY IN 3 STEPS 🚨

## BEFORE YOU DEPLOY - DO THIS FIRST!

### ⚠️ STEP 1: Run Database Migration (MANDATORY!)

1. Open: https://supabase.com/dashboard/project/ynyjhfldcjwsgfmhrbqy/sql/new

2. Copy ALL contents of: `database/migration_fix_schema.sql`

3. Paste in SQL Editor and click "RUN"

4. Verify tables created in Table Editor:
   - courses ✓
   - course_sections ✓
   - course_lessons ✓

**⚠️ Without this, your app WILL NOT WORK!**

---

### ⚡ STEP 2: Verify OpenRouter API Key

Current key:
```
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
```

1. Go to: https://openrouter.ai/keys
2. Check this key exists and has credits
3. If not, create new key and update `.env.local`

**⚠️ Without credits, course generation WILL FAIL!**

---

### 🚀 STEP 3: Deploy

#### Option A: Vercel (Recommended)
```bash
cd "c:\Users\vamsi\Desktop\Project Expo\course generation"
vercel
```

Add these environment variables in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=https://ynyjhfldcjwsgfmhrbqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTcyODMsImV4cCI6MjA4MjgzMzI4M30.8BUyRvhyg636yeUcOXK6RpZIlden7oRMB7vjJj-WNkM
SUPABASE_URL=https://ynyjhfldcjwsgfmhrbqy.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI1NzI4MywiZXhwIjoyMDgyODMzMjgzfQ.K_37Gd07tS-9DgoTlpen4f1Y15NFLHZP3aFHJPsKnAk
OPENROUTER_API_KEY=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
```

#### Option B: Netlify
1. Connect GitHub repo
2. Build command: `npm run build`
3. Add same environment variables above
4. Deploy

---

## 🧪 Test Before Going Live

Local test:
```bash
npm run dev
```
Then visit: http://localhost:3001/generate/Python

Expected:
- ✅ Fill wizard → Generate course
- ✅ Course saves to Supabase
- ✅ Redirects to course page
- ✅ No errors in console (F12)

---

## ⚠️ If Something Breaks

### "Missing Supabase URL"
→ Did you add `NEXT_PUBLIC_SUPABASE_URL` env var?

### "User not found" (OpenRouter)
→ API key invalid or no credits. Check https://openrouter.ai/

### "relation 'courses' does not exist"
→ You forgot to run database migration (STEP 1)!

### Build fails
→ Run `npm install` in course generation folder

---

## 📚 Full Documentation

- `READY_FOR_DEPLOYMENT.md` - Complete guide
- `DEPLOYMENT_CHECKLIST.md` - Detailed checklist
- `database/migration_fix_schema.sql` - Database setup

---

**Current Status**: ✅ Code is ready. Just run migration and deploy!

**Dev Server**: http://localhost:3001 (currently running)

**Last Updated**: January 1, 2026
