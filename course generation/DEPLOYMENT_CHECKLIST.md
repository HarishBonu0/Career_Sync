# Pre-Deployment Checklist - Course Generation Module

## ✅ CRITICAL: Run This Database Migration FIRST

**Before deploying, you MUST run this SQL in your Supabase SQL Editor:**

1. Go to https://supabase.com/dashboard/project/ynyjhfldcjwsgfmhrbqy/sql/new
2. Copy and paste the entire contents of `database/migration_fix_schema.sql`
3. Click "Run" to execute the migration
4. Verify tables were created successfully

This creates the correct database schema (`courses`, `course_sections`, `course_lessons`, etc.) that the application expects.

---

## 📋 Environment Variables Checklist

### Required for Production (.env.local or deployment platform):

```env
# Supabase - VERIFIED WORKING
NEXT_PUBLIC_SUPABASE_URL=https://ynyjhfldcjwsgfmhrbqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTcyODMsImV4cCI6MjA4MjgzMzI4M30.8BUyRvhyg636yeUcOXK6RpZIlden7oRMB7vjJj-WNkM

# Server-side Supabase (IMPORTANT: Keep secret!)
SUPABASE_URL=https://ynyjhfldcjwsgfmhrbqy.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI1NzI4MywiZXhwIjoyMDgyODMzMjgzfQ.K_37Gd07tS-9DgoTlpen4f1Y15NFLHZP3aFHJPsKnAk

# OpenRouter AI API - VERIFY THIS KEY IS VALID
OPENROUTER_API_KEY=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

# YouTube API (optional, for video integration)
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyC_H3ejidnG-10kN3FSx_9Lb5DfonyQbN8

# Database URLs (optional, for direct PostgreSQL access)
DATABASE_URL="postgresql://postgres.ynyjhfldcjwsgfmhrbqy:Harish@123Supabase@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:Harish@123Supabase@db.ynyjhfldcjwsgfmhrbqy.supabase.co:5432/postgres"
```

---

## 🔍 Pre-Deployment Verification

### 1. Test OpenRouter API Key
**IMPORTANT**: The current API key may be invalid. Test it first:

```bash
# Open terminal and run:
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer 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"
```

If you get an error, you need to:
- Go to https://openrouter.ai/
- Sign up / Log in
- Create a new API key
- Update `OPENROUTER_API_KEY` in `.env.local`
- Add credits to your OpenRouter account (required for AI generation)

### 2. Verify Supabase Connection
```bash
# The tables should exist after running migration:
- courses
- course_sections
- course_lessons
- lesson_materials
- course_resources
```

### 3. Test Course Generation Flow

1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:3001/generate/JavaScript
3. Fill out the wizard (all 10 questions)
4. Click "Generate my course"
5. **Expected behavior**:
   - Loading screen appears
   - Course generates (may take 30-60 seconds with Mixtral)
   - Course saves to Supabase
   - Redirects to `/course-generated/[id]`
   - Course displays correctly

### 4. Check Console for Errors
Open browser DevTools (F12) and check for:
- ✅ No "Missing Supabase URL" errors
- ✅ No "Module not found: @supabase/supabase-js" errors
- ✅ API calls to `/api/generate-course` succeed
- ✅ API calls to `/api/courses/save` succeed

---

## 🚀 Deployment Steps

### For Vercel Deployment:

1. **Install Vercel CLI** (if not already):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to project**:
   ```bash
   cd "c:\Users\vamsi\Desktop\Project Expo\course generation"
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings
   - Add all environment variables from `.env.local`
   - **CRITICAL**: Make sure to add the `SUPABASE_SERVICE_KEY` as a secret

5. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### For Other Platforms (Netlify, Railway, etc.):

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add all environment variables from the checklist above
5. Deploy

---

## ⚠️ Common Issues & Fixes

### Issue: "Missing Supabase URL" error in browser
**Fix**: Make sure `NEXT_PUBLIC_SUPABASE_URL` is set (with `NEXT_PUBLIC_` prefix)

### Issue: "Module not found: @supabase/supabase-js"
**Fix**: Run in project root: `npm install @supabase/supabase-js`

### Issue: "User not found" from OpenRouter
**Fix**: 
1. Verify OpenRouter API key is valid
2. Check you have credits on your OpenRouter account
3. Get a new API key from https://openrouter.ai/keys

### Issue: Course saves to localStorage but not Supabase
**Fix**: 
1. Check browser console for errors
2. Verify database migration was run
3. Check Supabase RLS policies allow INSERT

### Issue: Database insert errors
**Fix**:
1. Verify the migration SQL was executed
2. Check table names match: `courses`, `course_sections`, `course_lessons`
3. Ensure RLS policies allow public insert (or adjust for your auth)

---

## 📦 Dependencies Installed

### In "Project Expo" (parent folder):
```bash
@supabase/supabase-js
```

### In "course generation" folder:
```bash
@supabase/supabase-js
next
react
react-dom
# ... (other existing dependencies)
```

---

## 🔧 Configuration Files

### next.config.js
Includes `experimental.externalDir: true` to allow importing from `../db` folder.

### Package Structure
```
Project Expo/
├── db/                          # Shared database layer
│   ├── supabaseClient.ts       # Browser-safe client
│   ├── supabaseAdmin.ts        # Server-side admin client
│   └── queries/
│       └── courses.ts          # Course CRUD operations
├── course generation/          # Next.js app
│   ├── .env.local             # Environment variables
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-course/route.ts
│   │   │   └── courses/save/route.ts
│   │   └── (main)/
│   │       ├── generate/[topic]/page.tsx
│   │       └── course-generated/[id]/page.tsx
│   └── database/
│       └── migration_fix_schema.sql  # RUN THIS FIRST!
└── roadmap_module/             # Vite app
```

---

## ✨ Features Working

1. ✅ Course generation with AI (Mixtral 8x7B)
2. ✅ 10-question personalization wizard
3. ✅ Course saves to Supabase
4. ✅ Course retrieval from Supabase
5. ✅ Fallback to localStorage if Supabase fails
6. ✅ Proper error handling and user feedback
7. ✅ Progress tracking UI
8. ✅ Responsive design

---

## 🎯 Final Pre-Deployment Test

Run this checklist RIGHT BEFORE deploying:

- [ ] Database migration executed successfully
- [ ] OpenRouter API key verified and has credits
- [ ] All environment variables set in `.env.local`
- [ ] `npm run build` completes without errors
- [ ] Test course generation end-to-end in production build
- [ ] Browser console shows no errors
- [ ] Course saves to Supabase successfully
- [ ] Can view saved course at `/course-generated/[id]`

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Check terminal/server logs for API errors
3. Verify all environment variables are set correctly
4. Ensure database migration was run successfully
5. Test Supabase connection in SQL Editor

---

**Last Updated**: January 1, 2026
**Status**: ✅ Ready for deployment after running database migration
