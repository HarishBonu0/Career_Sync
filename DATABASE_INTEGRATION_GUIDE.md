# Complete Backend-Database Integration Guide

This guide explains how all user actions (enrolling in courses, completing modules, starting roadmaps, completing tests) are synced with the MongoDB database and reflected in the profile page in real-time.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Services                         │
├─────────────────────────────────────────────────────────────────┤
│
│  Landing Page (http://localhost:4173)
│  ├─ profile.html - Displays user profile with progress
│  ├─ auth.html - Login/Signup
│  └─ profile-utils.js - Backend API functions (CORE)
│
│  Course Generation (http://localhost:3002)
│  ├─ Course listing and enrollment
│  └─ course-integration.js - Integration functions
│
│  Roadmap (http://localhost:5173)
│  ├─ Roadmap generation and stage tracking
│  └─ roadmap-integration.js - Integration functions
│
│  Test Generation (http://localhost:3001)
│  ├─ Skill evaluations
│  └─ test-integration.js - Integration functions
│
└─────────────────────────────────────────────────────────────────┘
                            ↕ API Calls
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Port 5000)                       │
├─────────────────────────────────────────────────────────────────┤
│
│  profile.js Routes:
│  ├─ POST /enroll/course - Enroll in course
│  ├─ POST /enroll/roadmap - Enroll in roadmap
│  ├─ PUT /progress/course/:id - Update course progress
│  ├─ PUT /progress/roadmap/:id - Update roadmap progress
│  ├─ POST /evaluation/submit - Submit test results
│  └─ GET /:userId - Fetch user's profile data
│
└─────────────────────────────────────────────────────────────────┘
                            ↕ Queries
┌─────────────────────────────────────────────────────────────────┐
│                 MongoDB Atlas (Cloud Database)                   │
├─────────────────────────────────────────────────────────────────┤
│
│  Collections:
│  ├─ users - User accounts
│  ├─ userenrollments - Courses, roadmaps, evaluations tracking
│  ├─ courses - Course definitions
│  ├─ roadmaps - Roadmap definitions
│  └─ skillevaluations - Test definitions
│
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Course Enrollment Flow

```
User clicks "Start Course" (Course Page)
    ↓
handleCourseEnrollment() called
    ↓
saveCourse() in profile-utils.js
    ├─ Save to localStorage (for offline)
    └─ Send POST to /api/profile/enroll/course
        ↓
    Backend creates UserEnrollment record in MongoDB
        ↓
    Returns enrollment._id (stored as _id in localStorage)
```

### 2. Module Completion Flow

```
User completes module (Course Page)
    ↓
handleModuleCompletion() called
    ↓
updateCourseProgress() in profile-utils.js
    ├─ Calculate progress (e.g., 3/10 modules = 30%)
    ├─ Update localStorage
    └─ Send PUT to /api/profile/progress/course/{enrollmentId}
        ↓
    Backend updates courseProgress field in UserEnrollment
        ↓
    Profile auto-refreshes every 5 seconds
        ↓
    User sees updated progress on profile page
```

### 3. Test Submission Flow

```
User submits evaluation (Test Page)
    ↓
handleTestSubmission() called
    ↓
saveEvaluation() in profile-utils.js
    ├─ Calculate score percentage
    ├─ Update localStorage
    └─ Send POST to /api/profile/evaluation/submit
        ↓
    Backend creates UserEnrollment record with evaluation data
        ↓
    Profile auto-refreshes
        ↓
    User sees test result on profile page
```

## Core Functions

### profile-utils.js (Main Integration Library)

Located in: `frontend/landing-page/profile-utils.js`

All functions are available via `window.careersyncProfile` object:

#### Course Functions

```javascript
// Enroll in course
await careersyncProfile.saveCourse({
    id: 'course-001',
    title: 'Advanced JavaScript',
    modules: 12,
    totalModules: 12
});

// Update course progress
await careersyncProfile.updateCourseProgress(
    enrollmentId,  // From saveCourse() result._id
    30,           // Progress percentage
    3             // Completed modules count
);
```

#### Roadmap Functions

```javascript
// Enroll in roadmap
await careersyncProfile.saveRoadmap({
    id: 'roadmap-001',
    title: 'Backend Developer',
    stages: 5,
    totalStages: 5
});

// Update roadmap progress
await careersyncProfile.updateRoadmapProgress(
    enrollmentId,  // From saveRoadmap() result._id
    20,           // Progress percentage (1 of 5 stages)
    1             // Completed stages count
);
```

#### Evaluation Functions

```javascript
// Submit test results
await careersyncProfile.saveEvaluation({
    title: 'JavaScript Test',
    totalQuestions: 20,
    correctAnswers: 17,
    score: 85,
    timeTaken: '15 min'
});
```

#### Profile Functions

```javascript
// Fetch profile from backend
const profile = await careersyncProfile.getProfileData();

// Returns:
{
    courses: [
        { id, title, progress, completedModules, totalModules, ... },
        ...
    ],
    roadmaps: [
        { id, title, progress, completedStages, totalStages, ... },
        ...
    ],
    evaluations: [
        { id, title, score, correctAnswers, totalQuestions, ... },
        ...
    ]
}
```

## Backend API Endpoints

All endpoints are in `/api/profile/`:

### POST /enroll/course
Enroll a user in a course

```javascript
Request Body:
{
    userId: "user_id",
    userEmail: "user@example.com",
    courseId: "course-001",
    courseTitle: "Advanced JavaScript",
    courseModules: 12
}

Response:
{
    _id: "enrollment_id",
    userId: "user_id",
    userEmail: "user@example.com",
    courseId: "course-001",
    courseTitle: "Advanced JavaScript",
    courseProgress: 0,
    courseLastAccessed: "2024-01-15T10:30:00Z",
    type: "course",
    ...
}
```

### PUT /progress/course/:enrollmentId
Update course progress

```javascript
Request Body:
{
    progress: 30,              // Percentage
    completed: false,
    completedModules: [1, 2, 3]
}

Response: Updated enrollment object
```

### POST /enroll/roadmap
Enroll a user in a roadmap

```javascript
Request Body:
{
    userId: "user_id",
    userEmail: "user@example.com",
    roadmapId: "roadmap-001",
    roadmapTitle: "Backend Developer",
    roadmapStages: 5
}

Response: Created enrollment object
```

### PUT /progress/roadmap/:enrollmentId
Update roadmap progress

```javascript
Request Body:
{
    progress: 20,              // Percentage
    completedStages: [1]
}

Response: Updated enrollment object
```

### POST /evaluation/submit
Submit test results

```javascript
Request Body:
{
    userId: "user_id",
    userEmail: "user@example.com",
    evaluationTitle: "JavaScript Test",
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    timeTaken: "15 min"
}

Response: Created enrollment object with evaluation data
```

### GET /profile/:userId
Fetch user's complete profile

```javascript
Response:
{
    courses: [...],
    roadmaps: [...],
    evaluations: [...]
}
```

## Implementation Steps

### Step 1: Add to Course Generation Page

File: `frontend/course-generation/course-integration.js`

1. Include profile-utils.js:
```html
<script src="http://localhost:4173/profile-utils.js"></script>
<script src="./course-integration.js"></script>
```

2. When user starts course:
```javascript
const courseData = { id, title, modules, totalModules, ... };
await handleCourseEnrollment(courseData);
```

3. When user completes module:
```javascript
await handleModuleCompletion(courseId, moduleIndex, totalModules);
```

### Step 2: Add to Roadmap Page

File: `frontend/roadmap/roadmap-integration.js`

1. Include profile-utils.js:
```html
<script src="http://localhost:4173/profile-utils.js"></script>
<script src="./roadmap-integration.js"></script>
```

2. When user starts roadmap:
```javascript
const roadmapData = { id, title, stages, totalStages, ... };
await handleRoadmapEnrollment(roadmapData);
```

3. When user completes stage:
```javascript
await handleStageCompletion(roadmapId, stageIndex, totalStages);
```

### Step 3: Add to Test Generation Page

File: `frontend/test-generation/test-integration.js`

1. Include profile-utils.js:
```html
<script src="http://localhost:4173/profile-utils.js"></script>
<script src="./test-integration.js"></script>
```

2. When user submits test:
```javascript
const testResults = { title, totalQuestions, correctAnswers, score, ... };
await handleTestSubmission(testResults);
```

## Database Updates (Real-time)

The profile page auto-refreshes every 5 seconds:

```javascript
// In profile.html (already implemented)
setInterval(async () => {
    const data = await careersyncProfile.getProfileData();
    // Update display with latest data
    displayCachedProfile(userData);
}, 5000);
```

This means:
- User completes module on course page → Backend saves → Profile refreshes automatically
- User completes stage on roadmap page → Backend saves → Profile refreshes automatically
- User submits test → Backend saves → Profile refreshes automatically

## Testing the Integration

### Test Course Enrollment
1. Go to http://localhost:3002 (Course Generation)
2. Click on a course
3. Click "Start Course" button (with integration code)
4. Go to http://localhost:4173/profile.html
5. You should see the course in your profile

### Test Module Completion
1. Continue from course page
2. Progress through modules
3. Each module completion sends update to backend
4. Profile automatically shows updated progress

### Test Roadmap Enrollment
1. Go to http://localhost:5173 (Roadmap)
2. Generate/Start a roadmap
3. Go to profile
4. Roadmap appears in profile

### Test Evaluation Submission
1. Go to http://localhost:3001 (Test Generation)
2. Take a test
3. Submit results
4. Go to profile
5. Evaluation score appears in profile

## Troubleshooting

### Profile not updating?
- Check browser console for errors
- Verify user is logged in (check localStorage for careersync_user)
- Ensure backend is running on port 5000
- Check MongoDB connection in backend logs

### Data not saving to backend?
- Verify API endpoints are returning 200 OK
- Check backend route handlers
- Ensure userId/userEmail is being sent
- Check MongoDB collection for UserEnrollment records

### Integration functions not available?
- Ensure profile-utils.js is loaded before calling functions
- Check that functions are available via window.careersyncProfile
- Verify no JavaScript errors in console

## Key Files

- **Backend**: `backend/routes/profile.js` - All API endpoints
- **Backend Model**: `backend/models/UserEnrollment.js` - Database schema
- **Frontend Utility**: `frontend/landing-page/profile-utils.js` - Core functions
- **Integration Examples**: 
  - `frontend/course-generation/course-integration.js`
  - `frontend/roadmap/roadmap-integration.js`
  - `frontend/test-generation/test-integration.js`
- **Frontend Display**: `frontend/landing-page/profile.html` - Profile page with auto-refresh

## Data Sync Strategy

1. **Immediate**: Data saved to localStorage (offline access)
2. **Near-real-time**: Data sent to backend API (database persistence)
3. **Periodic Refresh**: Profile page fetches from backend every 5 seconds

This ensures:
- Fast UI updates (localStorage)
- Data persistence (backend)
- Automatic sync across pages (periodic refresh)
- Fallback to localStorage if backend unavailable (resilience)

---

**Status**: ✅ Complete - All user actions now sync with database and reflect on profile page in real-time!

