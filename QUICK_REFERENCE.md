# ⚡ QUICK REFERENCE - Why Course Wasn't Showing

## The Problem
```
Created course → Saved as "guest" → Profile couldn't find it → User doesn't see course
```

## The Root Cause (3 levels deep)

### ❌ Level 1: Database Problem
```
Course saved with: userId: "guest", userEmail: null
Profile looks for: userId: "actual_id", userEmail: "actual@email.com"
Result: No match → Course not found
```

### ❌ Level 2: App Isolation
```
Landing Page (4173)              Course Generation (3002)
✅ User logged in          ←→     ❌ No user info
✅ Token stored           ←→     ❌ No token
✅ User in localStorage   ←→     ❌ Empty localStorage
```

### ❌ Level 3: Token Not Persisted
```
Before Fix:
login() { setUser(data.user) }  // Token thrown away!

After Fix:
login() { 
  localStorage.setItem('careersync_token', data.token)  ✅
  localStorage.setItem('careersync_user', data.user)    ✅
}
```

---

## The Fixes (3 changes)

### ✅ Fix 1: Store Token
File: `contexts/AuthContext.tsx`
```typescript
// When user logs in, save token to localStorage
localStorage.setItem('careersync_token', data.token)
```

### ✅ Fix 2: Fetch from Backend if Needed  
File: `lib/db-queries.ts`
```typescript
// If user not in localStorage, use token to fetch from backend
const meResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${tokenStr}` }
})
```

### ✅ Fix 3: Save with Real User Data
Result:
```javascript
// Course now saves with:
{
  userId: "697b1c7040c28433dfd2f9ba",  ✅ Real ID
  userEmail: "harishbonu3@gmail.com",  ✅ Real email
  title: "UI/UX Design Mastery"
}
```

---

## Verification Checklist

- [ ] Backend running: `node server.js` (port 5000)
- [ ] Landing page running: `npm run dev` (port 4173)
- [ ] Course generation running: `npm run dev` (port 3002)
- [ ] Logged in to landing page
- [ ] Created course in course-generation app
- [ ] Console shows: `✅ Token stored: eyJ...`
- [ ] Console shows: `📧 User email: harishbonu3@gmail.com`
- [ ] Run: `node check-user-email.js`
- [ ] Shows: `Found 1 course with userEmail populated`
- [ ] Profile page shows course in "My Courses"

---

## What Changed

| Layer | Before | After |
|-------|--------|-------|
| **Token** | Not stored | ✅ Stored in localStorage |
| **User Data** | Only in one app | ✅ Shared between apps |
| **Course Save** | `userId: "guest"` | ✅ `userId: "actual_id"` |
| **Course Save** | `userEmail: null` | ✅ `userEmail: "actual@email"` |
| **Profile Query** | Returns 0 courses | ✅ Returns actual courses |

---

## Three Files Fixed

1. **`contexts/AuthContext.tsx`** - Store token + user
2. **`lib/db-queries.ts`** - Fetch user from backend if needed
3. **`course-generated/[id]/page.tsx`** - Use correct email field

---

## Success = Course appears in profile! 🎉
