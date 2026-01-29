# 🔌 MongoDB Atlas Connection Setup Guide

## ✅ Current Status

Your MongoDB connection string has been successfully configured:
```
Database: careeros-db
Cluster: careeros.n1t9tw0.mongodb.net
User: harishbonu3_db_user
```

## ⚠️ Action Required: Whitelist Your IP Address

The connection is failing because your current IP address is not whitelisted in MongoDB Atlas.

### 🔧 How to Fix (Step-by-Step)

#### Option 1: Whitelist Your Current IP (Recommended for Development)

1. **Go to MongoDB Atlas**
   - Visit: https://cloud.mongodb.com
   - Sign in with your account

2. **Navigate to Network Access**
   - Click on your project
   - In the left sidebar, click **"Network Access"**

3. **Add Your IP Address**
   - Click **"Add IP Address"** button
   - Click **"Add Current IP Address"**
   - Or manually enter your IP (check below to find your IP)
   - Click **"Confirm"**

4. **Wait for Changes to Apply**
   - It may take 1-2 minutes for the whitelist to activate

#### Option 2: Allow Access from Anywhere (Quick Testing Only)

⚠️ **Warning:** Only use this for development/testing, NOT for production!

1. Go to **Network Access** in MongoDB Atlas
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. This adds `0.0.0.0/0` to the whitelist
5. Click **"Confirm"**

### 🌐 Find Your Current IP Address

Run this command in PowerShell:
```powershell
cd d:\downloads\hello\backend\main-app\backend
node check-ip.js
```

Or manually check at: https://whatismyipaddress.com/

### 🧪 Test the Connection

After whitelisting your IP, run:
```powershell
cd d:\downloads\hello\backend\main-app\backend
node test-mongodb.js
```

You should see:
```
✅ CONNECTION SUCCESSFUL!
📊 Connection Details:
   Database Name: careeros-db
   Host: careeros.n1t9tw0.mongodb.net
```

### 🚀 Start the Backend Server

Once the test is successful, start your backend:
```powershell
cd d:\downloads\hello\backend\main-app\backend
npm start
```

Or use the all-in-one starter:
```powershell
cd d:\downloads\hello
.\start-all.ps1
```

## 🔐 Verify Database User Credentials

If IP whitelisting doesn't fix the issue, verify your database user:

1. Go to **Database Access** in MongoDB Atlas
2. Check if user `harishbonu3_db_user` exists
3. Verify the password is: `CareerOS@HaRISH`
4. Ensure the user has **"Read and write to any database"** privileges

## 📝 Connection String Details

Your connection string has been configured with:
- **Username:** `harishbonu3_db_user`
- **Password:** `CareerOS@HaRISH` (URL-encoded as `CareerOS%40HaRISH`)
- **Database:** `careeros-db`
- **Options:** `retryWrites=true&w=majority&appName=CareerOs`

## 🐛 Troubleshooting

### Error: "Authentication failed"
- Check username and password in Database Access
- Verify special characters are URL-encoded
- `@` → `%40`, `#` → `%23`, etc.

### Error: "Could not connect to any servers"
- Your IP is not whitelisted
- Follow the IP whitelisting steps above

### Error: "Connection timeout"
- Check your internet connection
- Verify the cluster is running (not paused)
- Try adding `0.0.0.0/0` temporarily

## 📊 Database Collections

Once connected, your app will automatically create these collections:
- `users` - User accounts
- `courses` - Generated courses
- `roadmaps` - Career roadmaps
- `evaluations` - Skill test results
- `otps` - One-time passwords for verification

## ✅ Success Checklist

- [x] MongoDB connection string configured in `.env`
- [x] Enhanced connection error handling added
- [x] Test script created (`test-mongodb.js`)
- [ ] IP address whitelisted in MongoDB Atlas
- [ ] Connection test passes
- [ ] Backend server starts successfully

## 🎯 Next Steps

1. **Whitelist your IP** in MongoDB Atlas (most important!)
2. **Run test:** `node test-mongodb.js`
3. **Start backend:** `npm start` or `.\start-all.ps1`
4. **Test authentication:** Sign up/login at http://localhost:4173/auth.html
5. **Verify data:** Check MongoDB Atlas → Browse Collections

---

**Status:** ⚠️ Waiting for IP whitelist  
**Last Updated:** January 23, 2026
