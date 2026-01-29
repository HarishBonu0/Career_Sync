# 🔧 Complete Course Profile Sync Fix - Testing Guide

## ✅ What Was Fixed

### Root Cause Found
The course was being saved with `userId: "guest"` and `userEmail: null` because:
1. **Token not stored** - Course-generation app couldn't authenticate
2. **User data not stored** - localStorage was empty in course-generation app
3. **Cross-app isolation** - localhost:3002 and localhost:4173 have separate localStorage

### Complete Solution
```
Landing Page (4173)              Course Generation (3002)
    ↓ Login                           ↓ Login
    ↓ Store in localStorage    ←→    ↓ Check if user in localStorage
    ↓ careersync_token              ↓ If not, fetch from backend
    ↓ careersync_user               ↓ Using token to authenticate
    └─────────────────────────────────┘
                     ↓
            Save Course with:
            - userEmail ✅
            - userId ✅
            - Not "guest" ✅
```

---

## 📋 Step-by-Step Testing

### Phase 1: Reset Database (Optional but Recommended)
Delete existing courses from MongoDB to start fresh:
```bash
# Connect to MongoDB
# Go to: CareerOs database > Courses collection
# Delete all documents (or just your test courses)
```

### Phase 2: Start Services
Open 3 terminals:

**Terminal 1 - Backend Server:**
```bash
cd "c:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\backend\main-app\backend"
node server.js
```
Expected: ✅ `Server running on port 5000` or similar

**Terminal 2 - Landing Page:**
```bash
cd "c:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\frontend\landing-page"
npm run dev
```
Expected: ✅ `Listening on 4173` or similar

**Terminal 3 - Course Generation:**
```bash
cd "c:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\frontend\course-generation"
npm run dev
```
Expected: ✅ `Ready` on port 3002

### Phase 3: Login & Create Course

#### Step 1: Open Profile
```
http://localhost:4173/profile.html
```
- You may see "Please Login" message
- That's OK - go to next step

#### Step 2: Login
```
http://localhost:4173/auth.html
```
- Email: `harishbonu3@gmail.com` (or your test account)
- Password: `password123` (or your password)
- Click Login

**Expected Result:**
- Redirected to profile page
- See your name and email in header
- Should see "My Courses" section (empty)

#### Step 3: Open Browser DevTools (F12)
Go to: **Storage** → **Local Storage** → `http://localhost:4173`

**Verify these exist:**
- ✅ `careersync_user` - Contains your user object with `id` and `email`
- ✅ `careersync_token` - Contains JWT token
- ✅ `careersync_enrolled_courses` - Array (may be empty)

**Screenshot Example:**
```
careersync_user: {"id":"697b1c7040c28433dfd2f9ba","email":"hari11@gmail.com","name":"Hari",...}
careersync_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
careersync_enrolled_courses: "[]"
```

#### Step 4: Open Course Generation
```
http://localhost:3002
```

**Important:** Stay logged in! Don't logout or close profile page.

- Click "Generate Course" or "Create Course"
- Enter course details:
  - **Topic:** "JavaScript Fundamentals" (or any topic)
  - **Name:** "John Doe" (or your name)
  - **Goal:** "Learn JavaScript" (or any goal)
  - **Experience Level:** "Beginner"
  - **Time Commitment:** "1-2 hours"
  - **Learning Style:** "Visual Learning"
  - **Timeline:** "1 month"
  - Complete other questions...
- Click "Generate Course"
- Wait for generation (~30-60 seconds)
- Click "Save to My Courses"

#### Step 5: Check Browser Console
During save, open **DevTools** → **Console** and look for:

**Good signs:**
```
✅ Token stored: eyJhbGciOiJIUzI1NiIs...
✅ User stored: {id: '697b1c7040c28433dfd2f9ba', email: 'hari11@gmail.com', ...}
📧 User email for course: hari11@gmail.com  
👤 User ID for course: 697b1c7040c28433dfd2f9ba
✅ Course synced to backend
✅ Course saved successfully!
```

**Bad signs (means something failed):**
```
❌ No token found in localStorage
❌ User info incomplete
❌ userEmail for course: null
👤 User ID for course: guest
```

#### Step 6: Check Database
```bash
cd "c:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\backend\main-app\backend"
node check-user-email.js
```

**Look for output like:**
```
📚 COURSES IN DATABASE:
Found 1 course:
  1. Title: JavaScript Fundamentals
     - user (ObjectId): 697b1c7040c28433dfd2f9ba
     - userId (String): 697b1c7040c28433dfd2f9ba
     - userEmail: hari11@gmail.com  ✅ THIS IS NOW POPULATED!
     - Created: 2026-01-29T...

🔍 CHECKING COURSES FOR USER: hari11@gmail.com
Found 1 course linked to this user  ✅ SHOULD INCREASE BY 1!
```

#### Step 7: Verify in Profile Page
Go back to profile (refresh if needed):
```
http://localhost:4173/profile.html
```

**Expected:**
- ✅ Under "My Courses" section
- ✅ Shows "JavaScript Fundamentals" card
- ✅ Shows progress bar
- ✅ Shows "Start" or "Continue" button
- ✅ Shows meta tags: modules, duration, level

**If course appears → 🎉 SUCCESS!**

---

## 🐛 Troubleshooting

### Issue: Course Not Appearing in Profile

**Check 1: Database**
```bash
node check-user-email.js
```
- Does it show your course?
- Is `userEmail` populated (not null)?
- If NO → Problem is in save flow

**Check 2: Browser Console**
```
F12 → Console → Filter: "User email for course"
```
- Should show your email, not "null"
- Should NOT show "guest"
- If shows "guest" → Problem is token/user storage

**Check 3: localStorage in course-generation**
```
http://localhost:3002 → F12 → Storage
```
- Is `careersync_user` present?
- Is `careersync_token` present?
- If NO → Login issue in course-generation app

**Check 4: Profile Query**
Run diagnostic again after course creation:
```bash
node check-user-email.js | grep -A 5 "COURSES FOR USER"
```
Should show: `Found 1 course linked to this user`

### Issue: "userEmail: null" in Database

**This means:**
- Course was saved but without email linking
- Profile query can't find it (queries by email)

**Fix:**
1. Delete the course from database
2. Check browser console during save for: `❌ No token found`
3. Make sure AuthContext stores token (it now does)
4. Create course again

### Issue: Token Not Stored

**Step 1:** Check login response
```
F12 → Network → Filter: "login"
- Click the login request
- Response tab → Should show "token" field
```

**Step 2:** Check AuthContext
- The fixed code stores token in checkAuth and login
- If still not working, verify AuthContext.tsx has the updates

### Issue: "User info incomplete, fetching from backend"

**This is actually OK** - It means:
- localStorage was empty
- But backend fetch should have filled it
- Check console for: `✅ Fetched from backend`

---

## 📊 Expected Behavior Before & After

### Before Fix (BROKEN)
```javascript
// Saved to database:
{
  _id: "...",
  user: null,
  userId: "guest",
  userEmail: null,  ❌
  title: "My Course",
  ...
}

// Profile query:
db.courses.find({
  $or: [
    { user: "userid" },
    { userId: "userid" },
    { userEmail: "myemail@test.com" }  // Doesn't match!
  ]
})
// Returns: 0 courses ❌
```

### After Fix (WORKING)
```javascript
// Saved to database:
{
  _id: "...",
  user: ObjectId("69..."),
  userId: "697b1c7040c28433dfd2f9ba",
  userEmail: "harishbonu3@gmail.com",  ✅
  title: "My Course",
  ...
}

// Profile query:
db.courses.find({
  $or: [
    { user: ObjectId("69...") },  // Matches!
    { userId: "697b1c7040c28433dfd2f9ba" },  // Matches!
    { userEmail: "harishbonu3@gmail.com" }  // Matches!
  ]
})
// Returns: 1 course ✅
```

---

## ✨ Summary of Changes

| File | Change |
|------|--------|
| `lib/db-queries.ts` | ✅ Added token fetching, checks multiple token keys |
| `contexts/AuthContext.tsx` | ✅ Now stores token AND user in localStorage |
| `course-generated/[id]/page.tsx` | ✅ Extracts user email properly |
| `routes/courses.js` | ✅ Added mongoose import |
| `app/api/courses/save/route.ts` | ✅ Logs userEmail |

---

## 📞 Quick Debug Commands

```bash
# Check database state
cd backend/main-app/backend && node check-user-email.js

# Check if services are running
curl http://localhost:5000/api/health || echo "❌ Backend not running"
curl http://localhost:4173 || echo "❌ Landing page not running"
curl http://localhost:3002 || echo "❌ Course generation not running"

# Clear course database (DANGEROUS - use carefully)
# Use MongoDB Compass or CLI to delete all courses
```

---

## 🎯 Success Criteria

✅ **Test passes if:**
1. Create course in localhost:3002
2. Database shows course with userEmail populated
3. Profile page (4173) shows course in "My Courses"
4. Course persists after page refresh
5. Console shows no "guest" references

**Target result:** Courses sync automatically between creation and profile display!

---

**Status:** ✅ Ready for full testing
**Last Updated:** 2026-01-29
**Changes Committed:** 1fb30fe
