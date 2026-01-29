# 📁 File Locations - Complete Database Integration

## Backend Files

### API Routes
```
backend/
└── routes/
    └── profile.js                          [UPDATED]
        ├─ POST /enroll/course
        ├─ POST /enroll/roadmap
        ├─ PUT /progress/course/:enrollmentId
        ├─ PUT /progress/roadmap/:enrollmentId
        ├─ POST /evaluation/submit
        └─ GET /:userId
```

**What it does**: Handles all API requests for enrolling users, updating progress, submitting evaluations, and fetching profile data from MongoDB.

**Key functions**:
- `POST /enroll/course` - Creates UserEnrollment for course
- `PUT /progress/course/:id` - Updates courseProgress field
- `PUT /progress/roadmap/:id` - Updates roadmapProgress field
- `POST /evaluation/submit` - Creates evaluation record

### Database Models
```
backend/
└── models/
    ├─ User.js                              [EXISTING]
    ├─ UserEnrollment.js                    [EXISTING - fully supports integration]
    ├─ Course.js                            [EXISTING]
    ├─ Roadmap.js                           [EXISTING]
    ├─ CourseGeneration.js                  [EXISTING]
    ├─ SkillEvaluation.js                   [EXISTING]
    └─ index.js
```

**UserEnrollment Schema Fields**:
```
- userId / userEmail
- courseId, courseTitle, courseModules, courseProgress, courseCompleted, courseLastAccessed
- roadmapId, roadmapTitle, roadmapStages, roadmapProgress
- evaluationTitle, evaluationScore, evaluationCompletedAt
- type: "course" | "roadmap" | "evaluation"
- metadata: flexible object
- timestamps
```

---

## Frontend - Core Library

### Main Utility Functions
```
frontend/
└── landing-page/
    ├─ profile-utils.js                     [UPDATED - Core Integration]
    │  ├─ saveCourse()
    │  ├─ updateCourseProgress()
    │  ├─ saveRoadmap()
    │  ├─ updateRoadmapProgress()
    │  ├─ saveEvaluation()
    │  ├─ getProfileData()
    │  └─ Helper functions (getUserId, getUserEmail)
    │
    ├─ profile.html                         [UPDATED - Auto-refresh added]
    │  ├─ 5-second auto-refresh interval
    │  ├─ Fetches from backend every 5 sec
    │  ├─ Updates localStorage
    │  └─ Displays progress bars
    │
    ├─ auth.html                           [EXISTING]
    ├─ profile-utils.js                    [CORE]
    └─ index.html                          [EXISTING]
```

**profile-utils.js** - This is the heart of the system!
- All functions use `fetch()` to call backend APIs
- Data stored in localStorage for offline access
- Enrollment IDs stored for progress updates
- Auto-fallback to localStorage if backend unavailable
- Returns promises, can be awaited

---

## Frontend - Integration Modules

### Course Generation Integration
```
frontend/
└── course-generation/
    └─ course-integration.js                [NEW - Ready to use]
       ├─ handleCourseEnrollment()
       │  └─ Calls: Career SyncProfile.saveCourse()
       │
       ├─ handleModuleCompletion()
       │  └─ Calls: Career SyncProfile.updateCourseProgress()
       │
       ├─ handleCourseCompletion()
       │  └─ Marks course as 100% complete
       │
       └─ UI Integration helpers
          ├─ setupCourseEnrollmentButton()
          ├─ setupModuleTracker()
          ├─ setupCompleteCourseButton()
          └─ showToast() notifications
```

**How to use**:
1. Add to your course page HTML
2. Call `handleCourseEnrollment()` when user starts course
3. Call `handleModuleCompletion()` when module done
4. Data automatically syncs to backend

### Roadmap Integration
```
frontend/
└── roadmap/
    └─ roadmap-integration.js               [NEW - Ready to use]
       ├─ handleRoadmapEnrollment()
       │  └─ Calls: Career SyncProfile.saveRoadmap()
       │
       ├─ handleStageCompletion()
       │  └─ Calls: Career SyncProfile.updateRoadmapProgress()
       │
       ├─ handleRoadmapProgressUpdate()
       │  └─ Manual progress tracking
       │
       ├─ handleRoadmapCompletion()
       │  └─ Marks roadmap as 100% complete
       │
       └─ UI Integration helpers
```

**How to use**:
1. Add to your roadmap page HTML
2. Call `handleRoadmapEnrollment()` when user starts
3. Call `handleStageCompletion()` when stage done
4. Data automatically syncs to backend

### Test Generation Integration
```
frontend/
└── test-generation/
    └─ test-integration.js                  [NEW - Ready to use]
       ├─ handleTestStart()
       │  └─ Initialize test state
       │
       ├─ handleTestSubmission()
       │  └─ Calls: Career SyncProfile.saveEvaluation()
       │
       ├─ handleTestSave()
       │  └─ Save progress on exit
       │
       ├─ displayTestResults()
       │  └─ Show score to user
       │
       └─ UI Integration helpers
          ├─ setupStartTestButton()
          ├─ setupSubmitTestButton()
          ├─ setupSaveTestButton()
          └─ showToast() notifications
```

**How to use**:
1. Add to your test page HTML
2. Call `handleTestStart()` when test begins
3. Call `handleTestSubmission()` when user submits
4. Data automatically syncs to backend

---

## Frontend - Testing & Documentation

### Test Suite
```
frontend/
└── landing-page/
    └─ test-database-integration.html       [NEW - Complete test suite]
       ├─ Test 1: Backend Connection
       ├─ Test 2: Course Enrollment
       ├─ Test 3: Course Progress Update
       ├─ Test 4: Roadmap Enrollment
       ├─ Test 5: Test Submission
       ├─ Test 6: Profile Fetch
       ├─ Test 7: Run All Tests
       └─ Visual results with status indicators
```

**Access**: `http://localhost:4173/test-database-integration.html`

**What it tests**:
- Backend API connectivity
- Course enrollment to MongoDB
- Progress update endpoint
- Roadmap enrollment to MongoDB
- Evaluation submission to MongoDB
- Profile data retrieval from backend
- All data visible in results panel

### Documentation Files
```
Career-Sync/
├─ DATABASE_INTEGRATION_GUIDE.md            [NEW - Complete reference]
│  ├─ System architecture diagram
│  ├─ Data flow explanations
│  ├─ Core functions reference
│  ├─ Backend API endpoints
│  ├─ Implementation steps
│  ├─ Testing procedures
│  └─ Troubleshooting
│
├─ IMPLEMENTATION_COMPLETE.md               [NEW - What was done]
│  ├─ Summary of changes
│  ├─ Files changed list
│  ├─ Database schema
│  ├─ API reference
│  ├─ Testing checklist
│  └─ Real-world examples
│
├─ QUICK_START.md                           [NEW - Get started fast]
│  ├─ 30-second overview
│  ├─ 2-minute test procedure
│  ├─ Integration examples
│  ├─ Troubleshooting tips
│  └─ Pro tips
│
├─ FILE_LOCATIONS.md                        [THIS FILE]
│  └─ Where everything is
│
└─ INTEGRATION_GUIDE.md                     [NEW - Usage examples]
   ├─ Course page examples
   ├─ Roadmap page examples
   ├─ Test page examples
   ├─ Profile page examples
   └─ Data flow diagrams
```

---

## File Organization Summary

### By Functionality

**Backend API** (everything syncs here):
- `backend/routes/profile.js` - All endpoints

**Core Integration** (manages all sync):
- `frontend/landing-page/profile-utils.js` - Heart of system

**Frontend Integration** (per-page code):
- `frontend/course-generation/course-integration.js`
- `frontend/roadmap/roadmap-integration.js`
- `frontend/test-generation/test-integration.js`

**Display Layer** (shows data to users):
- `frontend/landing-page/profile.html` - Auto-refreshing

**Testing** (verify everything works):
- `frontend/landing-page/test-database-integration.html`

**Documentation** (understand the system):
- `DATABASE_INTEGRATION_GUIDE.md`
- `IMPLEMENTATION_COMPLETE.md`
- `QUICK_START.md`
- `INTEGRATION_GUIDE.md`
- `FILE_LOCATIONS.md` (this)

---

## Data Flow Between Files

```
Course Page
    ↓
course-integration.js (handleCourseEnrollment)
    ↓
profile-utils.js (saveCourse)
    ├→ localStorage (immediate)
    └→ profile.js API endpoint
        ↓
        MongoDB (persistent)
        ↓
profile.html (auto-refresh every 5 sec)
    ├→ profile-utils.js (getProfileData)
    └→ profile.js GET endpoint
        ↓
        MongoDB query
        ↓
        Display to user ✓
```

---

## How to Navigate

### If you want to...

**Test the system**
→ Open: `frontend/landing-page/test-database-integration.html`

**Understand architecture**
→ Read: `DATABASE_INTEGRATION_GUIDE.md`

**Get started quickly**
→ Read: `QUICK_START.md`

**See code examples**
→ Read: `INTEGRATION_GUIDE.md`

**Check what changed**
→ Read: `IMPLEMENTATION_COMPLETE.md`

**Add to course page**
→ Copy: `frontend/course-generation/course-integration.js`

**Add to roadmap page**
→ Copy: `frontend/roadmap/roadmap-integration.js`

**Add to test page**
→ Copy: `frontend/test-generation/test-integration.js`

**Debug issues**
→ Open: `frontend/landing-page/profile.html` → F12 Console

**Monitor backend**
→ Check: `backend/routes/profile.js`

**See database**
→ MongoDB Atlas → Career Sync → userenrollments

---

## File Modification Summary

| File | Modified | What Changed |
|------|----------|--------------|
| `backend/routes/profile.js` | ✅ YES | Added roadmap & evaluation endpoints |
| `frontend/landing-page/profile-utils.js` | ✅ YES | All functions now sync with backend |
| `frontend/landing-page/profile.html` | ✅ YES | Added 5-second auto-refresh |
| `frontend/course-generation/course-integration.js` | ✅ NEW | Created full integration module |
| `frontend/roadmap/roadmap-integration.js` | ✅ NEW | Created full integration module |
| `frontend/test-generation/test-integration.js` | ✅ NEW | Created full integration module |
| `frontend/landing-page/test-database-integration.html` | ✅ NEW | Created complete test suite |
| Documentation files | ✅ NEW | 5 comprehensive guides |

---

## Access URLs

| Component | URL |
|-----------|-----|
| Profile Page | `http://localhost:4173/profile.html` |
| Test Suite | `http://localhost:4173/test-database-integration.html` |
| Course Page | `http://localhost:3002` |
| Roadmap Page | `http://localhost:5173` |
| Test Page | `http://localhost:3001` |
| Backend API | `http://localhost:5000/api` |
| MongoDB Compass | `mongodb+srv://...` (from .env) |

---

## Database Locations

**MongoDB Collections**:
- `users` - User accounts
- `userenrollments` - ← **All course/roadmap/evaluation records here**
- `courses` - Course definitions
- `roadmaps` - Roadmap definitions
- `skillevaluations` - Test definitions

**New Records Added By**:
- Course enrollment → `UserEnrollment` with `type: "course"`
- Roadmap enrollment → `UserEnrollment` with `type: "roadmap"`
- Test submission → `UserEnrollment` with `type: "evaluation"`

---

## Key Filenames to Remember

```
profile-utils.js      = Core integration library
profile.html         = User-facing display with auto-refresh
profile.js          = Backend API routes
UserEnrollment.js   = Database schema
test-database-integration.html = Test everything here
*-integration.js    = Per-page integration code
```

---

**Everything is in place and ready to go! 🎉**

Start with: `test-database-integration.html` to verify everything works.
