# Course Creation & Profile Update - Testing Guide

## Problem Identified
Courses were not showing up in the profile page because:
1. **Missing userEmail**: When courses were saved, the `userEmail` field was NOT being passed to the backend
2. **Profile query failure**: The profile endpoint queries for courses using `userEmail`, but without it, no courses were found
3. **localStorage key mismatch**: Code was looking for `careeros_user` but profile.html stores `careersync_user`

## Fixes Applied

### 1. `lib/db-queries.ts` - Fixed saveGeneratedCourse function
✅ Now extracts `userEmail` from user object
✅ Checks both `careersync_user` and `careeros_user` keys for compatibility
✅ Passes `userEmail` to backend in the request

### 2. `course-generated/[id]/page.tsx` - Fixed course save flow  
✅ Extracts `userEmail` from `careersync_user` object
✅ Passes both `userId` and `userEmail` to backend enrollment endpoint
✅ Added logging to verify email extraction

### 3. `api/courses/save/route.ts` - Added logging
✅ Now logs received `userEmail` for debugging

## Database Schema Understanding

### Course Model Fields
```javascript
{
  user: ObjectId,           // MongoDB user reference
  userId: String,           // String ID (guest or other)
  userEmail: String,        // USER EMAIL - THIS IS CRITICAL!
  title: String,            // Course title
  modules: Array,           // Course modules
  ...other fields...
}
```

### Profile Query Logic
The profile endpoint queries courses using:
```javascript
{
  $or: [
    { user: userId },
    { userId: userId }, 
    { userEmail: userEmail }  // ← This MUST match!
  ]
}
```

## Step-by-Step Testing

### Step 1: Login to Profile Page
1. Open: http://localhost:4173/profile.html
2. Verify you're logged in (see user name and email)
3. Note your email address from the profile header

### Step 2: Create a Course
1. Open: http://localhost:3002 (Course Generation)
2. Click "Generate Course" or "Create Course"
3. Follow the prompts to create a new course
4. Save the course with the "Save to My Courses" button
5. Should be redirected to profile page

### Step 3: Verify Database
Run this command to check if course was saved with userEmail:
```bash
cd "c:\Users\yaswa\OneDrive\Desktop\karukrit\Career-Sync\backend\main-app\backend"
node check-user-email.js
```

Expected output should show:
```
📚 COURSES IN DATABASE:
Found 1 course:
  1. Title: [Your Course Name]
     - userEmail: your_email@example.com    ← ✅ THIS SHOULD NOT BE EMPTY!
     - Created: [timestamp]

🔍 CHECKING COURSES FOR USER: your_email@example.com
Found 1 course linked to this user   ← ✅ This count should increase!
```

### Step 4: Refresh Profile Page
1. Go back to: http://localhost:4173/profile.html
2. Course should now appear in "My Courses" section
3. Should see course title, progress bar, and action buttons

## Debugging Commands

### Check all users in database
```bash
cd backend/main-app/backend && node check-user-email.js
```

### Check MongoDB directly (if mongosh installed)
```bash
mongosh
use CareerOs
db.courses.find({}).pretty()
db.users.find({}).pretty()
```

### Check browser localStorage
Open browser DevTools (F12) → Application → Local Storage
- `careersync_user` should contain your user object with `email`
- `careersync_enrolled_courses` should contain course data

## Key Fields to Verify

### In localStorage (Browser):
✅ `careersync_user` has: `{ email, name, _id, ...}`
✅ `careersync_enrolled_courses` has course objects

### In Database:
✅ `users` collection has your user with email
✅ `courses` collection has courses with matching `userEmail`

## Troubleshooting

### Courses still not showing in profile?
1. **Check the logs**: Browser console (F12) while saving course
   - Look for: "📧 User email for course: xxx@xxx.com"
   - Should NOT say: "null" or "undefined"

2. **Check backend logs**: 
   - Terminal running backend should show course save requests

3. **Verify database**:
   - Run diagnostic script: `node check-user-email.js`
   - Courses should have matching `userEmail` field

### Course appears in browser but disappears on refresh?
- That means it's in localStorage but not database
- Check if backend is running: http://localhost:5000
- Check backend logs for errors during save

### Wrong user email?
- In profile.html, look at the email displayed
- Make sure it matches the email in database
- Check `localStorage.getItem('careersync_user')` in console

## Expected Final Result

After following these steps:
1. ✅ You can create a course
2. ✅ Course is saved to MongoDB with your userEmail
3. ✅ Profile page shows the course immediately
4. ✅ Course persists after page refresh
5. ✅ Profile page auto-syncs every 5 seconds

---
**Created by: AI Assistant**
**Date: January 29, 2026**
