# System Architecture Diagrams

## 1. Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               Frontend Pages (React/Vite/Next.js)            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │Course Page   │  │Roadmap Page  │  │Test Page     │       │  │
│  │  │:3002         │  │:5173         │  │:3001         │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  │           ↓                ↓                 ↓               │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │  Integration Code:                                   │   │  │
│  │  │  - course-integration.js                            │   │  │
│  │  │  - roadmap-integration.js                           │   │  │
│  │  │  - test-integration.js                              │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │           ↓                ↓                 ↓               │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │  profile-utils.js (CORE LIBRARY)                   │   │  │
│  │  │  ✓ saveCourse()                                     │   │  │
│  │  │  ✓ updateCourseProgress()                           │   │  │
│  │  │  ✓ saveRoadmap()                                    │   │  │
│  │  │  ✓ updateRoadmapProgress()                          │   │  │
│  │  │  ✓ saveEvaluation()                                 │   │  │
│  │  │  ✓ getProfileData()                                 │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │           ↓           ↓           ↓           ↓             │  │
│  │  localStorage (offline)     Profile Page (:4173)           │  │
│  │  - saveLocal                - Auto-refresh (5sec)          │  │
│  │  - getLocal                 - Display progress bars        │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│           ↕ HTTP API Calls ↕                                      │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER (Port 5000)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Node.js + Express                                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  API Routes (profile.js)                                  │    │
│  │  ├─ POST /enroll/course                                  │    │
│  │  ├─ POST /enroll/roadmap                                 │    │
│  │  ├─ PUT /progress/course/:id                             │    │
│  │  ├─ PUT /progress/roadmap/:id                            │    │
│  │  ├─ POST /evaluation/submit                              │    │
│  │  └─ GET /:userId                                         │    │
│  │                                                            │    │
│  │  Middleware                                               │    │
│  │  ├─ Authentication                                        │    │
│  │  ├─ Validation                                            │    │
│  │  └─ Error Handling                                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                           ↓ Query                                   │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Models (Mongoose)                                        │    │
│  │  ├─ User Model                                            │    │
│  │  ├─ UserEnrollment Model (MAIN)                          │    │
│  │  ├─ Course Model                                          │    │
│  │  ├─ Roadmap Model                                         │    │
│  │  └─ SkillEvaluation Model                                │    │
│  └────────────────────────────────────────────────────────────┘    │
│           ↕ Database Driver ↕                                      │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│            MONGODB ATLAS (Cloud Database)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Database: Career Sync                                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Collections                                              │    │
│  │  ├─ users                      [user accounts]           │    │
│  │  ├─ userenrollments ← NEW RECORDS HERE                  │    │
│  │  │   ├─ Course enrollments                               │    │
│  │  │   ├─ Roadmap enrollments                              │    │
│  │  │   └─ Evaluation submissions                           │    │
│  │  ├─ courses                    [course definitions]      │    │
│  │  ├─ roadmaps                   [roadmap definitions]     │    │
│  │  └─ skillevaluations           [test definitions]        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Action Flow - Course Enrollment

```
User Interface Flow:
─────────────────────

User Opens Course Page (http://localhost:3002)
         ↓
    [View Courses]
         ↓
    [Click Course]
         ↓
    [Click "Start Course" Button]
         ↓
Course JavaScript (course-integration.js)
─────────────────────────────────────────

    handleCourseEnrollment(courseData)
         ↓
    Prepare data object
    {
      id: "course-001",
      title: "Advanced JavaScript",
      modules: 12,
      totalModules: 12,
      ...
    }
         ↓
Profile Utils (profile-utils.js)
────────────────────────────────

    saveCourse(courseData)
         ├─ Step 1: Get user ID from localStorage
         │          (getUserId(), getUserEmail())
         │
         ├─ Step 2: Save to localStorage
         │          (for offline access)
         │
         ├─ Step 3: Prepare backend payload
         │          {
         │            userId,
         │            userEmail,
         │            courseId,
         │            courseTitle,
         │            courseModules
         │          }
         │
         └─ Step 4: Send to backend API
                   POST /api/profile/enroll/course
                   ↓
Backend (profile.js)
──────────────────

    POST /enroll/course Handler
         ├─ Step 1: Validate data
         ├─ Step 2: Create UserEnrollment document
         │          {
         │            userId,
         │            userEmail,
         │            courseId,
         │            courseTitle,
         │            courseProgress: 0,
         │            type: "course",
         │            createdAt,
         │            updatedAt
         │          }
         │
         ├─ Step 3: Save to MongoDB
         │
         ├─ Step 4: Return result with _id
         │
         └─ HTTP 200 Response
            {
              _id: "enrollment_id_123",
              userId,
              courseId,
              courseProgress: 0,
              ...
            }
            ↓
Frontend (profile-utils.js)
───────────────────────────

    Handle Response
         ├─ Store enrollment._id in localStorage
         │  (for future progress updates)
         │
         ├─ Update localStorage with result
         │
         ├─ Show success notification
         │  "✓ Enrolled in Advanced JavaScript"
         │
         └─ Return result to caller
            ↓
User Interface
──────────────

    Show confirmation
    Display "Course Started" message
    (optional) Redirect to course content
         ↓
Profile Page (Background)
──────────────────────────

    Every 5 seconds:
    GET /api/profile/{userId}
         ↓
    Backend queries UserEnrollment collection
         ├─ Find all enrollments for this userId
         ├─ Group by type (course/roadmap/evaluation)
         └─ Return aggregated profile
         ↓
    Frontend receives fresh data
         ├─ Updates localStorage
         ├─ Refreshes display
         └─ Shows course in profile! ✓
```

---

## 3. Data Update Flow - Module Completion

```
User Completes Module
──────────────────────

Module Content Page (course-integration.js)
         ↓
    handleModuleCompletion(
      courseId: "course-001",
      moduleIndex: 2,      // 0-indexed (3rd module)
      totalModules: 12
    )
         ↓
    Calculate Progress:
    progress = (moduleIndex + 1) / totalModules * 100
             = (2 + 1) / 12 * 100
             = 25%
         ↓
Profile Utils (profile-utils.js)
─────────────────────────────────

    updateCourseProgress(enrollmentId, 25, 3)
         ├─ Get enrollment ID from localStorage
         ├─ Update localStorage immediately
         │  courses[i].progress = 25
         │  courses[i].completedModules = 3
         │
         └─ Send to backend
            PUT /api/profile/progress/course/{enrollmentId}
            Body: {
              progress: 25,
              completed: false,
              completedModules: 3
            }
            ↓
Backend (profile.js)
────────────────────

    PUT /progress/course/:enrollmentId
         ├─ Validate enrollmentId
         ├─ Find UserEnrollment by _id
         ├─ Update fields:
         │  - courseProgress: 25
         │  - courseCompleted: false
         │  - courseLastAccessed: now()
         │
         └─ Save to MongoDB
            ↓
MongoDB
───────

    userenrollments collection
    Update one document:
    {
      _id: enrollmentId,
      courseProgress: 25,    ← Updated
      courseLastAccessed: 2024-01-15...,  ← Updated
      ...
    }
         ↓
Backend Response
────────────────

    HTTP 200
    {
      _id: enrollmentId,
      courseProgress: 25,
      courseCompleted: false,
      ...
    }
         ↓
Frontend Notification
─────────────────────

    Show Toast:
    "Module 3/12 Completed - 25%"
         ↓
Profile Page (Next Refresh)
────────────────────────────

    Auto-refresh (every 5 seconds)
         ├─ Fetch from backend
         ├─ Backend queries MongoDB
         ├─ Returns: courseProgress: 25
         ├─ Updates display
         └─ User sees progress bar at 25% ✓
```

---

## 4. Complete Data Synchronization

```
Timeline of Complete Sync Process:
───────────────────────────────────

T+0ms:      User clicks "Start Course"
            ↓
T+5ms:      handleCourseEnrollment() called
            ↓
T+10ms:     saveCourse() executes
            ├─ localStorage updated (instant)
            └─ Starts fetch() to backend
                ↓
T+50ms:     Frontend waits for backend response
            ↓
T+250ms:    Backend receives request
            ├─ Validates data
            └─ Creates UserEnrollment in MongoDB
                ↓
T+300ms:    MongoDB responds with new document
            ↓
T+350ms:    Backend sends HTTP 200 response
            ├─ Includes enrollment._id
            ├─ Includes full document
            └─ Sends to frontend
                ↓
T+400ms:    Frontend receives response
            ├─ Updates localStorage with _id
            ├─ Shows success notification
            └─ Returns to user
                ↓
T+5000ms:   Profile Page Auto-Refresh #1
            ├─ GET /api/profile/{userId}
            ├─ Backend queries MongoDB
            ├─ Returns user's enrollments
            ├─ Frontend updates localStorage
            └─ Displays course in profile! ✓
```

---

## 5. Component Interaction Diagram

```
┌──────────────────────┐
│  course-page.html    │
│  (User UI)           │
└──────────┬───────────┘
           │
           │ "Start Course" click
           ↓
┌──────────────────────────────────────────┐
│ course-integration.js                    │
│ handleCourseEnrollment()                 │
└──────────┬───────────────────────────────┘
           │
           ↓
┌──────────────────────────────────────────┐
│ profile-utils.js                         │
│ saveCourse()                             │
│ ├─ Save to localStorage                  │
│ └─ POST /api/profile/enroll/course       │
└──────────┬───────────────────────────────┘
           │
           ↓ HTTP
┌──────────────────────────────────────────┐
│ Backend: profile.js                      │
│ POST /enroll/course                      │
│ ├─ Validate                              │
│ ├─ Create UserEnrollment                 │
│ └─ Save to MongoDB                       │
└──────────┬───────────────────────────────┘
           │
           ↓
┌──────────────────────────────────────────┐
│ MongoDB: UserEnrollment Collection       │
│ _id: enrollment_id                       │
│ userId: user_id                          │
│ courseId: course_id                      │
│ courseProgress: 0                        │
│ type: "course"                           │
└──────────┬───────────────────────────────┘
           │
           ↓ (Response with _id)
┌──────────────────────────────────────────┐
│ Frontend: profile-utils.js               │
│ Store _id in localStorage                │
└──────────┬───────────────────────────────┘
           │
           ├─→ Show success notification
           │
           └─→ Every 5 seconds...
               ↓
           GET /api/profile/{userId}
               ↓
           Backend queries MongoDB
               ↓
           Frontend displays updated data ✓
```

---

## 6. Database Schema - UserEnrollment

```
{
  _id: ObjectId,                        ← Unique enrollment ID
  
  // User identification
  userId: String,                       ← User identifier
  userEmail: String,                    ← User email
  
  // Course enrollment (if type="course")
  courseId: String,
  courseTitle: String,
  courseModules: Number,
  courseProgress: Number,               ← 0-100 (percentage)
  courseCompleted: Boolean,
  courseLastAccessed: Date,
  
  // Roadmap enrollment (if type="roadmap")
  roadmapId: String,
  roadmapTitle: String,
  roadmapStages: Number,
  roadmapProgress: Number,              ← 0-100 (percentage)
  
  // Evaluation enrollment (if type="evaluation")
  evaluationTitle: String,
  evaluationScore: Number,              ← 0-100 (percentage)
  evaluationCompletedAt: Date,
  
  // Metadata
  type: String,                         ← "course" | "roadmap" | "evaluation"
  metadata: {                           ← Flexible for extra data
    completedModules: Array,
    completedStages: Array,
    totalQuestions: Number,
    correctAnswers: Number,
    timeTaken: String
  },
  
  // Timestamps
  createdAt: Date,                      ← When enrolled
  updatedAt: Date                       ← Last update
}
```

---

## 7. Function Call Stack

```
User Action
    ↓
Integration Handler (per-page)
├─ course-integration.js: handleCourseEnrollment()
├─ roadmap-integration.js: handleRoadmapEnrollment()
└─ test-integration.js: handleTestSubmission()
    ↓
profile-utils.js (Core Library)
├─ saveCourse()                  → POST /enroll/course
├─ updateCourseProgress()        → PUT /progress/course
├─ saveRoadmap()                 → POST /enroll/roadmap
├─ updateRoadmapProgress()       → PUT /progress/roadmap
├─ saveEvaluation()              → POST /evaluation/submit
└─ getProfileData()              → GET /profile/{userId}
    ↓
Backend API (profile.js)
├─ POST /enroll/course           → UserEnrollment.create()
├─ PUT /progress/course          → UserEnrollment.findByIdAndUpdate()
├─ POST /enroll/roadmap          → UserEnrollment.create()
├─ PUT /progress/roadmap         → UserEnrollment.findByIdAndUpdate()
├─ POST /evaluation/submit       → UserEnrollment.create()
└─ GET /:userId                  → UserEnrollment.find()
    ↓
MongoDB
├─ Insert / Update / Query
└─ Persist to disk
    ↓
Response Back Through Stack
```

---

## 8. Auto-Refresh Cycle

```
Profile Page Timeline:
──────────────────────

Page Load (T=0)
    ├─ Load profile-utils.js ✓
    ├─ Get user from localStorage ✓
    └─ Display initial data ✓
    
Auto-Refresh Interval Starts
    │
    ├─ T+5000ms: Check backend for updates
    │   ├─ GET /api/profile/{userId}
    │   ├─ Backend queries MongoDB
    │   ├─ Updates localStorage
    │   └─ Refresh display
    │
    ├─ T+10000ms: Check backend for updates
    │   ├─ GET /api/profile/{userId}
    │   ├─ Shows new enrollments
    │   ├─ Shows updated progress
    │   └─ Refresh display
    │
    ├─ T+15000ms: Check backend for updates
    │   └─ ...continues...
    │
    └─ ... Every 5 seconds forever (or until page closed)
```

---

**These diagrams show how every piece fits together to create a real-time, database-backed system! 🔧**
