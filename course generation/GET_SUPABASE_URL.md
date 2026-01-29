# 🚀 Get Your Supabase URL in 5 Minutes

## Step 1: Go to Supabase
👉 Visit: https://supabase.com/

## Step 2: Click "Start Your Project"
- Top right corner, green button
- Or go directly: https://app.supabase.com/

## Step 3: Sign Up
Choose one (recommended: **GitHub** - fastest):
- Google
- GitHub ⭐ (fastest)
- Email

**If using GitHub:**
```
1. Click "GitHub"
2. Authorize Supabase
3. Done! Auto-logged in
```

## Step 4: Create Your First Project
```
Name: "unfold-course-platform"
Password: Create strong password (save it!)
Region: Choose closest to you
  - US: us-east-1
  - EU: eu-central-1
  - Asia: ap-southeast-1
```

**Click "Create new project"** → Wait 2-3 minutes ⏳

## Step 5: Copy Your Database URL
Once project loads, you'll see this screen:

```
┌─────────────────────────────────────────┐
│  Project Settings                       │
│  ┌───────────────────────────────────┐  │
│  │ Database URL                      │  │
│  │ postgres://[user]:[password]@     │  │
│  │ [project].supabase.co:5432/       │  │
│  │ postgres                          │  │
│  │                                   │  │
│  │ [Copy]                            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### How to Find It
1. Left menu → **Settings** ⚙️
2. Click **Database**
3. Scroll to "Connection Pooling"
4. Look for "Connection string"
5. Click blue **Copy** button

### What to Copy
There are 3 connection strings, copy **Connection Pooling** one:
```
postgresql://postgres.[project-id]:[password]@aws-0-[region].pooling.supabase.com:6543/postgres
```

## Step 6: Add to Your Project
Create file: `.env.local` in root folder
```env
# Supabase Database
DATABASE_URL="postgresql://postgres.XXXXX:YOUR-PASSWORD@aws-0-XXXXX.pooling.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.XXXXX:YOUR-PASSWORD@aws-0-XXXXX.supabase.co:5432/postgres"

# OpenRouter (you already have this)
OPENROUTER_API_KEY="sk-or-v1-..."

# NextAuth (for authentication)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 7: Verify Connection
Run this command:
```bash
npx prisma db push
```

You should see:
```
✓ Database synced, created 15 new tables
```

**That's it! Your database is ready! 🎉**

---

## 📋 Checklist

- [ ] Visited supabase.com
- [ ] Signed up (GitHub recommended)
- [ ] Created project
- [ ] Waited for project to load (2-3 min)
- [ ] Copied database URL
- [ ] Updated `.env.local`
- [ ] Ran `npx prisma db push`
- [ ] Saw "Database synced" message

---

## ⚠️ Common Issues

### "Project is still initializing"
**Solution**: Wait 2-3 minutes and refresh. Supabase needs time to create the database.

### "Connection refused"
**Solution**: Your internet might be slow. Check:
1. Can you ping supabase.com?
2. Try from different browser
3. Check your firewall

### "Wrong password"
**Solution**: Get new password:
1. Project → Settings → Database
2. Reset password button
3. Copy new connection string

### "Can't find Connection Pooling"
**Solution**: 
1. Go to Settings (⚙️)
2. Click "Database" 
3. Scroll down to "Connection Pooling"
4. It's below "Connection string"

---

## 🎯 What's Happening Behind the Scenes

When you copy the connection string, you're getting:
```
postgresql://
  ↓
  [Database type]

postgres.abc123:[password]@
  ↓
  [Your username and password]

aws-0-us-east-1.pooling.supabase.com:6543
  ↓
  [Supabase's PostgreSQL server location]

/postgres
  ↓
  [Your database name]
```

This tells your app: **"Connect to THIS database with THESE credentials"**

---

## 📚 Next Steps

1. **Setup Complete** ✅
   - You now have a production-ready PostgreSQL database
   - All your schemas are ready
   - Connection is secure (encrypted)

2. **Next**: Follow [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md)
   - Install Prisma packages
   - Update API routes
   - Test everything

3. **Then**: You'll have full database integration in 2 hours!

---

## 💡 Pro Tips

### Tip 1: Save Your Password
The password you created is important. Save it somewhere safe (password manager).

### Tip 2: Use Production Mode When Ready
For production deployment, use the `DIRECT_URL` instead of pooling URL.

### Tip 3: Monitor Your Usage
In Supabase dashboard → Home, you'll see:
- Database size
- API calls
- Storage used
- All free tier limits

### Tip 4: Backups Are Automatic
Supabase automatically backs up your data daily. No action needed!

---

## 🚀 You Did It!

You now have:
✅ Production PostgreSQL database
✅ Automatic backups
✅ Security & encryption
✅ Scalable to millions of users

**All for FREE while you develop!**

Next: Integrate with your Next.js app (2 hours) → Production ready 🎉
