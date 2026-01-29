# Supabase URL - Visual Step-by-Step Guide

## 🎯 Goal
Get your database URL from Supabase and add it to your project.

---

## STEP 1: Create Supabase Account
**URL**: https://supabase.com/

![Visit Supabase](https://img.shields.io/badge/Step_1-Visit_Supabase.com-green)

Click: **"Start Your Project"** button (top right)

```
Homepage of Supabase
┌────────────────────────────────────────────────┐
│  Supabase        [Sign Up] [Start Your Project]│ ← Click here
│                                                │
│  The Open Source Firebase Alternative         │
│  PostgreSQL, Auth, Storage, Realtime...       │
└────────────────────────────────────────────────┘
```

---

## STEP 2: Sign Up
**URL**: https://app.supabase.com/

You'll see this screen:

```
┌────────────────────────────────────────┐
│  Sign up to Supabase                   │
│                                        │
│  [ Sign up with GitHub ] ← BEST       │
│  [ Sign up with Google ]               │
│  [ Sign up with Email  ]               │
│                                        │
│  Already have an account?              │
│  [Sign in]                             │
└────────────────────────────────────────┘
```

**Recommended**: Click **"Sign up with GitHub"**
- Fastest (no password to remember)
- Automatic authorization
- Syncs with your GitHub account

### If using GitHub:
1. Click "Sign up with GitHub"
2. You'll see: "Authorize supabase?"
3. Click "Authorize supabase"
4. You're in! ✅

---

## STEP 3: Create Your Project

After login, you'll see:

```
┌────────────────────────────────────────────────┐
│  Welcome to Supabase!                          │
│                                                │
│  Create your first project                     │
│  ┌──────────────────────────────────────────┐ │
│  │ Project name:                            │ │
│  │ [unfold-course-platform                 ] │ │
│  │                                          │ │
│  │ Database password:                       │ │
│  │ [••••••••••••••••••]                     │ │
│  │ 🔄 Generate strong password              │ │
│  │                                          │ │
│  │ Region:                                  │ │
│  │ [US East (N. Virginia)        ▼]        │ │
│  │                                          │ │
│  │ [Create new project]                    │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### What to Fill In:

**Field 1: Project name**
```
Type: unfold-course-platform
```

**Field 2: Database password**
```
Click: 🔄 Generate strong password
Save it somewhere! (You'll need it)

Example: 
supabase_admin_password_abc123xyz
```

**Field 3: Region**
```
Choose closest to you:
- US East: us-east-1 (Virginia)
- US West: us-west-1 (California)  
- EU: eu-central-1 (Frankfurt)
- Asia: ap-southeast-1 (Singapore)
```

### Then Click: **"Create new project"**

⏳ **Wait 2-3 minutes** while it initializes...

---

## STEP 4: Your Project Dashboard

After creation, you'll see:

```
┌──────────────────────────────────────────────────┐
│ 🎉 Your Project is Ready!                        │
│                                                  │
│ Project: unfold-course-platform                 │
│ Region: us-east-1                               │
│ Status: Active ✅                               │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ Left Sidebar:                              │  │
│ │                                            │  │
│ │ 📊 Home                                    │  │
│ │ 📋 Projects                                │  │
│ │ 🔐 Authentication                         │  │
│ │ 📦 Storage                                 │  │
│ │ ⚙️ Settings                                │  │
│ │                                            │  │
│ └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## STEP 5: Get Your Database URL ⭐

### Method 1: Via Settings Menu

```
1. Click left sidebar: ⚙️ Settings
   ↓
2. Look for submenu, click: Database
   ↓
3. Find "Connection Pooling" section
   ↓
4. Look for "Connection string"
   ↓
5. Copy the string that starts with:
   postgresql://postgres.xxxxx...
```

**Visual**:
```
Settings Page
┌──────────────────────────────────────────┐
│ Left Menu:                               │
│ ├─ Project Settings                     │
│ │  ├─ General           ← Click here    │
│ │  ├─ Database          ← Or here      │
│ │  ├─ Auth              
│ │  ├─ API               
│ │  └─ Billing
│                                          │
├─ Database                                │
├─ API                                     │
├─ Vector                                  │
└─────────────────────────────────────────┘

Database Page:
┌──────────────────────────────────────────┐
│ Connection string                        │
│ [Select] [Copy] ← Click Copy            │
│                                          │
│ postgresql://postgres.abc:[pass]@       │
│ aws-0-us-east-1.pooling.supabase.co:... │
│                                          │
│ Connection Pooling                       │
│ Same as above but for Node.js            │
│ [Select] [Copy] ← Click Copy            │
│                                          │
│ Session Mode                             │
│ (use this for PostgreSQL directly)      │
│ [Select] [Copy]                         │
└──────────────────────────────────────────┘
```

### You need to copy 2 URLs:

**1️⃣ CONNECTION POOLING** (for application)
```
postgresql://postgres.[project-id]:[password]@aws-0-[region].pooling.supabase.com:6543/postgres
```
👉 Use this for `DATABASE_URL`

**2️⃣ SESSION MODE** (for Prisma migrations)
```
postgresql://postgres.[project-id]:[password]@aws-0-[region].supabase.co:5432/postgres
```
👉 Use this for `DIRECT_URL`

---

## STEP 6: Add to Your Project

### File Location
```
Your Project Root:
course generation/
├── .env.local          ← Edit this file
├── app/
├── backend/
└── ...
```

### Edit `.env.local`

Add these lines (if they don't exist):

```env
# Supabase Database - Copy from Step 5
DATABASE_URL="postgresql://postgres.abc123:[password]@aws-0-us-east-1.pooling.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.abc123:[password]@aws-0-us-east-1.supabase.co:5432/postgres"

# Keep your existing keys:
OPENROUTER_API_KEY="sk-or-v1-..."
NEXTAUTH_SECRET="your-existing-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### ⚠️ IMPORTANT: Replace These Parts

In the URLs you copied, replace:
- `[password]` = Password you created in Step 3
- `abc123` = Your actual project ID (from the URL)
- `us-east-1` = Your region (from Step 3)

**Example of filled in URL**:
```
postgresql://postgres.kxyzabcd123:[YOUR_PASSWORD_HERE]@aws-0-us-east-1.pooling.supabase.com:6543/postgres
```

---

## STEP 7: Test the Connection

Open terminal in your project and run:

```bash
npx prisma db push
```

### Success! 🎉
You'll see:
```
✓ Database synced
✓ Created 15 new tables
✓ All schemas deployed
```

### If Error: "Connection failed"
Check:
1. Is password correct? (copy again from Supabase)
2. Is `.env.local` in the right folder? (project root)
3. Did you save the file?
4. Is your internet working?

---

## 📸 Summary Screenshots

### What You're Looking For:

```
WRONG ❌
┌────────────────────────────┐
│ Connection string:         │
│ postgresql://[USER]...     │ ← Too short
└────────────────────────────┘

RIGHT ✅
┌────────────────────────────────────────┐
│ Connection Pooling:                    │
│ postgresql://postgres.xxx:[pass]@      │ ← Full URL
│ aws-0-xxx.pooling.supabase.com:6543... │
└────────────────────────────────────────┘
```

---

## 🎯 Final Checklist

- [ ] Visited https://supabase.com/
- [ ] Signed up with GitHub
- [ ] Created project "unfold-course-platform"
- [ ] Waited for project initialization (2-3 min)
- [ ] Went to Settings → Database
- [ ] Copied "Connection Pooling" URL
- [ ] Copied "Session Mode" URL (for DIRECT_URL)
- [ ] Created `.env.local` with both URLs
- [ ] Saved `.env.local` file
- [ ] Ran `npx prisma db push`
- [ ] Saw "Database synced" message ✅

---

## 🎊 You're Done!

Your database is now:
✅ Created
✅ Secure (PostgreSQL, encrypted)
✅ Backed up (daily automatic)
✅ Scalable (millions of users)
✅ Connected to your project

**Next**: Follow [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md) to integrate with your API routes.

Time to build your startup! 🚀
