# 🔐 Get Your Database Connection URLs

## Step 1: Go to Supabase Dashboard
Visit: https://app.supabase.com/projects

## Step 2: Select Your Project
Click: **"ynyjhfldcjwsgfmhrbqy"** (your project)

## Step 3: Get Connection Strings
1. Left sidebar → Click **⚙️ Settings**
2. Click **Database**
3. Scroll down to **"Connection string"**
4. Change dropdown from "URI" to **"Connection Pooling"**
5. You'll see:
   ```
   postgresql://postgres.[project]:[password]@aws-0-[region].pooling.supabase.com:6543/postgres
   ```
6. **Click "Copy"** button

## Step 4: Get Second URL
1. Change dropdown to **"Session mode"**
2. You'll see:
   ```
   postgresql://postgres.[project]:[password]@aws-0-[region].supabase.co:5432/postgres
   ```
3. **Click "Copy"** button

## What You Need to Send Me
Send these two complete URLs:
1. **DATABASE_URL** (Connection Pooling)
2. **DIRECT_URL** (Session mode)

Example format (don't use this, use your actual URL):
```
DATABASE_URL=postgresql://postgres.ynyjhfldcjwsgfmhrbqy:abc123xyz@aws-0-us-east-1.pooling.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.ynyjhfldcjwsgfmhrbqy:abc123xyz@aws-0-us-east-1.supabase.co:5432/postgres
```

Once you provide these, I will:
✅ Add them to your `.env.local`
✅ Deploy your complete database schema (15 tables)
✅ Test the connection
✅ Verify everything works
