# FIXED: Profile Page Not Showing Courses

## Root Causes Identified and Fixed

### Problem 1: Wrong Endpoint Being Called ✅ FIXED
**Issue:** `handleSaveCourse()` was calling `/api/profile/enroll/course` instead of `/api/courses/save`
- **Impact:** This created enrollments, not courses
- **Fix:** Updated to call `/api/courses/save` with proper user data

### Problem 2: Automatic Course Save Using Wrong Keys ✅ FIXED  
**Issue:** `trackCourseEnrollment()` was:
- Looking for `careeros_user` instead of `careersync_user`
- Calling `/api/profile/enroll/course` instead of `/api/courses/save`
- Running automatically on page load (wrong behavior)

**Fix:** Disabled this function completely. Users must click "Save to My Courses" button.

### Problem 3: Old Test Data in Database ✅ FIXED
**Issue:** Database had 2 courses saved as `userId: "guest"` and `userEmail: null`
**Fix:** Ran `reset-courses.js` script to delete all guest courses

---

## How It Works Now

### 1. User Authentication
```javascript
// Token stored as: careersync_token
// User data stored as: careersync_user
localStorage.setItem('careersync_token', token)
localStorage.setItem('careersync_user', JSON.stringify(user))
```

### 2. Course Save Flow
When user clicks "Save to My Courses" button:
1. Extract `userId` and `userEmail` from `localStorage.getItem('careersync_user')`
2. If not found, fetch from `/api/auth/me` using token
3. Call `POST /api/courses/save` with:
   ```json
   {
     "userId": "696b7c8aa96737ae48c95f50",
     "userEmail": "harishbonu3@gmail.com",
     "title": "Course Title",
     "description": "...",
     "modules": [...],
     "level": "Intermediate",
     "duration": "4 weeks"
   }
   ```

### 3. Profile Page Display
Profile page fetches courses using:
```javascript
GET /api/profile/696b7c8aa96737ae48c95f50
// Returns courses matching any of:
// - user: ObjectId("696b7c8aa96737ae48c95f50")
// - userId: "696b7c8aa96737ae48c95f50"  
// - userEmail: "harishbonu3@gmail.com"
```

---

## Testing Instructions

### Step 1: Verify Database is Clean
```bash
cd "C:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\backend\main-app\backend"
node check-user-email.js
```
**Expected Output:**
- ✅ Found 11 users
- ✅ Found 0 courses (clean slate)
- ✅ Found 0 enrollments

### Step 2: Ensure Backend is Running
```bash
cd "C:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\backend\main-app"
npm start
# Should see: Server running on port 5000
```

### Step 3: Ensure Frontend is Running
```bash
# Terminal 1 - Course Generation App
cd "C:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\frontend\course-generation"
npm run dev
# Should see: http://localhost:3002

# Terminal 2 - Landing Page
cd "C:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\frontend\landing-page"
npm run dev -- --port 4173
# Should see: http://localhost:4173
```

### Step 4: Test Course Creation
1. **Login:**
   - Go to http://localhost:4173
   - Login with: `harishbonu3@gmail.com` / password

2. **Generate a Course:**
   - Click "Generate Course" or go to http://localhost:3002
   - Enter course details (e.g., "Python Basics" for "beginner")
   - Wait for course generation
   - You should see the generated course page

3. **Watch Console Logs:**
   - Open browser DevTools (F12)
   - Look for these logs:
   ```
   ✅ Got user from localStorage: { userId: "696b...", userEmail: "harishbonu3@gmail.com" }
   📤 SAVING COURSE WITH:
      userId: 696b7c8aa96737ae48c95f50
      userEmail: harishbonu3@gmail.com
      title: Python Basics Course
   ✅ Course saved successfully!
   ```

4. **Click "Save to My Courses":**
   - Click the save button
   - Should see: "✅ Course saved successfully!"
   - Will redirect to profile page in 2 seconds

### Step 5: Verify Database
```bash
node check-user-email.js
```
**Expected Output:**
```
📚 COURSES IN DATABASE:
Found 1 courses:
  1. Title: Python Basics Course
     - userId (String): 696b7c8aa96737ae48c95f50
     - userEmail: harishbonu3@gmail.com ✅ NOT NULL!
     
🔍 CHECKING COURSES FOR USER: harishbonu3@gmail.com
Found 1 courses linked to this user ✅
```

### Step 6: Check Profile Page
1. Go to http://localhost:4173/profile.html
2. Should see your course under "My Courses"
3. Auto-refreshes every 5 seconds

---

## Debugging Tips

### If userEmail is Still null:
1. Check browser console for errors
2. Verify localStorage has correct keys:
   ```javascript
   console.log(localStorage.getItem('careersync_user'))
   console.log(localStorage.getItem('careersync_token'))
   ```
3. If missing, re-login at http://localhost:4173

### If Profile Doesn't Show Courses:
1. Check backend logs for `/api/profile/:userId` call
2. Run `node check-user-email.js` to verify course exists
3. Check profile.html console for API errors
4. Verify profile query matches course userEmail

### If Save Button Doesn't Work:
1. Check browser console for error messages
2. Verify backend is running on port 5000
3. Check backend logs for `/api/courses/save` endpoint
4. Ensure CORS is enabled in backend

---

## Files Modified

### Frontend - Course Generation App
- `app/(main)/course-generated/[id]/page.tsx`
  - ✅ Fixed `handleSaveCourse()` to call `/api/courses/save`
  - ✅ Disabled `trackCourseEnrollment()` auto-save
  - ✅ Added proper user extraction with fallback
  - ✅ Added detailed logging

- `contexts/AuthContext.tsx`
  - ✅ Store token as `careersync_token`
  - ✅ Store user as `careersync_user`
  - ✅ Persist on page reload

- `lib/db-queries.ts`
  - ✅ Added backend fallback via `/api/auth/me`
  - ✅ Added comprehensive logging

### Backend
- `routes/courses.js`
  - ✅ Added detailed logging to `/save` endpoint
  - ✅ Shows received userId and userEmail

### Utility Scripts
- `backend/reset-courses.js` (NEW)
  - Script to delete courses created as 'guest'

---

## What Was Wrong

### Before:
```mermaid
Course Generated Page
  ↓
trackCourseEnrollment() (runs automatically)
  ↓
POST /api/profile/enroll/course (WRONG ENDPOINT!)
  ↓
Creates UserEnrollment record
  ↓
Does NOT create Course record
  ↓
Profile page queries for Course records
  ↓
Finds nothing ❌
```

### Now:
```mermaid
Course Generated Page
  ↓
User clicks "Save to My Courses"
  ↓
handleSaveCourse() (user action)
  ↓
Extract userId & userEmail from localStorage
  ↓
POST /api/courses/save (CORRECT ENDPOINT!)
  ↓
Creates Course record with userEmail
  ↓
Profile page queries for Course records
  ↓
Finds course by userEmail match ✅
```

---

## Expected Result

✅ Database shows courses with actual user email (NOT null)
✅ Profile page displays saved courses
✅ Courses persist across page reloads
✅ No more "guest" courses in database

## Next Steps

Follow the testing instructions above to verify everything works!
