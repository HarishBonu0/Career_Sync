# 🚨 CRITICAL: DATABASE SETUP REQUIRED 🚨

## Your app is ready, but the database tables don't exist yet!

### ⚡ Quick Setup (2 minutes)

**Option 1: Run Automated Script (Recommended)**
```bash
cd "c:\Users\vamsi\Desktop\Project Expo\course generation"
node setup-database.js
```

**Option 2: Manual Setup in Supabase**
1. Open: https://supabase.com/dashboard/project/ynyjhfldcjwsgfmhrbqy/sql/new
2. Copy ALL contents of `database/SETUP_DATABASE.sql`
3. Paste into SQL Editor
4. Click "RUN" button
5. Wait for "Success" message

---

## ✅ Verify Setup

Run this command to test the database:
```bash
node test-supabase.js
```

Expected output:
```
✅ courses table exists
✅ course_sections table exists  
✅ course_lessons table exists
🎉 All tests passed! Database is ready.
```

---

## 🎯 After Setup, Start Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:3002

3. **Test course generation:**
   - Go to: http://localhost:3002/generate/Python
   - Fill out the 10-question wizard
   - Click "Generate my course"
   - Wait 30-60 seconds
   - Course should save to Supabase!

---

## 🐛 Current Issues Fixed

✅ Syntax errors in `db/queries/courses.ts` - FIXED
✅ Environment variables configured in `.env.local`
✅ Supabase client/admin setup complete
✅ API routes functional
✅ Missing database tables - **NEED TO RUN SETUP**

---

## 📋 What The Setup Script Does

The `SETUP_DATABASE.sql` script will:

1. ✅ Create all 7 tables:
   - `users` (optional, for future auth)
   - `courses` (main course data)
   - `course_sections` (modules)
   - `course_lessons` (lesson content)
   - `lesson_materials` (additional resources)
   - `course_resources` (external links)
   - `user_progress` (tracking)

2. ✅ Add indexes for performance
3. ✅ Enable Row Level Security (RLS)
4. ✅ Create permissive policies (allow all for development)
5. ✅ Insert sample test user

---

## ⚠️ If Setup Fails

If automated setup doesn't work, use **Manual Setup** (Option 2 above).

The SQL file is located at:
```
course generation/database/SETUP_DATABASE.sql
```

---

## 🔍 Troubleshooting

### Error: "Table 'courses' does not exist"
→ You haven't run the database setup yet. Run Option 1 or 2 above.

### Error: "Permission denied"
→ Make sure you're using the service role key (not anon key) in setup.

### Error: "Port 3000/3001/3002 in use"
→ Normal, Next.js will try the next available port.

---

## ✨ After Database Setup

Your app will be FULLY FUNCTIONAL:

✅ Course generation with AI (Mixtral)
✅ Save courses to Supabase
✅ Retrieve courses from database
✅ Display generated courses
✅ Progress tracking ready
✅ Resource management ready

---

**Run the setup NOW, then start testing!** 🚀
