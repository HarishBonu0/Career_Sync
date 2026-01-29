# Course Generation Platform - System Architecture

## Overview
A complete AI-powered course generation platform built with Next.js that generates personalized learning courses dynamically based on user inputs using the OpenRouter API (Mixtral 8x7B model).

---

## Project Structure

```
course generation/
├── app/
│   ├── api/
│   │   └── generate-course/
│   │       └── route.ts          # AI course generation endpoint
│   ├── (main)/
│   │   ├── home/
│   │   │   └── page.tsx          # Home page
│   │   ├── generate/
│   │   │   └── [topic]/
│   │   │       └── page.tsx      # 10-question wizard
│   │   ├── course-generated/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Course display page
│   │   └── course/
│   │       └── [slug]/
│   │           └── topic/
│   │               └── [topicId]/
│   │                   └── page.tsx  # Module/lesson viewer
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
├── lib/
│   ├── youtube.ts                # YouTube API integration
│   └── auth.ts
├── types/
│   └── index.ts
└── package.json
```

---

## Core Features

### 1. **10-Question Personalization Wizard**
**File:** `app/(main)/generate/[topic]/page.tsx`

Collects user preferences:
- Question 1: Name
- Question 2: Learning Goal
- Question 3: Experience Level (Beginner/Intermediate/Advanced)
- Question 4: Daily Time Commitment (< 30 min, 1-2 hrs, 2-3 hrs)
- Question 5: Learning Style (Visual/Hands-on/Reading/Mixed)
- Question 6: Timeline (1 week, 2 weeks, 1 month, 3 months)
- Question 7: Interest Areas (Multiple select)
- Question 8: Work Preference (Videos, Text, Mix)
- Question 9: Progress Tracking (Weekly, Bi-weekly, Monthly, All)
- Question 10: Specific Focus

**Data Storage:** Passed directly to API, stored in localStorage after course generation

---

### 2. **AI Course Generation Engine**
**File:** `app/api/generate-course/route.ts`

**Model:** Mixtral 8x7B Instruct (via OpenRouter API)

**Process:**
1. Receives POST request with topic and user answers
2. Extracts user preferences
3. Builds AI prompt with user context
4. Calls OpenRouter API (180-second timeout)
5. Parses JSON response from AI
6. Returns structured course object

**Course Structure Generated:**
```json
{
  "title": "Personalized [Topic] Course",
  "description": "Course overview",
  "duration": "[timeline]",
  "difficulty": "[experience_level]",
  "totalModules": [4-12],
  "objectives": ["goal1", "goal2"],
  "modules": [
    {
      "id": 1,
      "title": "Module Title",
      "duration": "1-2 weeks",
      "description": "Module overview",
      "topics": ["topic1", "topic2"],
      "activities": ["activity1", "activity2"],
      "project": "project description",
      "youtubeSearch": "search query"
    }
  ],
  "resources": [...],
  "finalProject": {...}
}
```

---

### 3. **Course Display Page**
**File:** `app/(main)/course-generated/[id]/page.tsx`

**Features:**
- Displays generated course overview
- Shows all modules in expandable sections
- "Start" button for each module
- Displays course objectives, prerequisites, resources
- Loading state with spinner animation
- Data sourced from localStorage
- Stores course ID when navigating to modules

**Navigation:**
- Stores `courseId` in localStorage when user clicks "Start" on a module
- Allows proper back navigation from module viewer

---

### 4. **Module/Lesson Viewer**
**File:** `app/(main)/course/[slug]/topic/[topicId]/page.tsx`

**Features:**
- Displays full lesson content
- Shows YouTube video embed (if available)
- Lists topics covered in the module
- Shows activities and assignments
- Displays project requirements
- Mark as complete functionality
- Loading states

**Navigation:**
- Back to Course button (uses courseId from localStorage)
- Back to Home button
- Fallback to router.back() if courseId not available

**Data Loading:**
- Reads from localStorage: `module_${topicId}`
- Extracts courseId for back navigation
- Loads YouTube videos for the module

---

## Data Flow

### Course Generation Flow
```
User Starts Wizard (Topic + Page)
    ↓
Answer 10 Questions
    ↓
Review Answers (Optional)
    ↓
Click "Generate Course"
    ↓
[API Call] POST /api/generate-course
    ↓
OpenRouter API (Mixtral 8x7B)
    ↓
Returns JSON Course Structure
    ↓
Save to localStorage: 'generatedCourse'
    ↓
Navigate to /course-generated/[id]
    ↓
Display Course with Modules
```

### Module Access Flow
```
User at Course Page
    ↓
Click "Start" on Module
    ↓
Store courseId in localStorage
    ↓
Store module data in localStorage
    ↓
Navigate to /course/[slug]/topic/[topicId]
    ↓
Load and Display Module Content
    ↓
Back to Course (uses stored courseId)
    ↓
Navigate back to /course-generated/[id]
```

---

## Storage Strategy

### localStorage Usage
```javascript
// Course data (persists across navigations)
localStorage.setItem('generatedCourse', JSON.stringify(course))

// Module data (per module)
localStorage.setItem(`module_${moduleId}`, JSON.stringify(moduleData))

// Module metadata includes:
{
  id, title, duration, description, topics, activities, project,
  courseTitle, moduleIndex, courseId  // courseId for back navigation
}

// Completed topics tracking
localStorage.setItem('completedTopics', JSON.stringify([1, 2, 3]))
```

**Advantages:**
- Persists across page navigations
- Fast access without API calls
- Works offline
- No database dependency (yet)

**Limitations:**
- ~5-10MB storage limit per domain
- Not shared across devices/browsers
- Lost on browser cache clear

---

## API Integration

### OpenRouter API Configuration
- **Endpoint:** https://openrouter.ai/api/v1/chat/completions
- **Model:** mistralai/mixtral-8x7b-instruct
- **Temperature:** 0.7 (balanced creativity)
- **Max Tokens:** 4000 (for complete course structure)
- **Timeout:** 180 seconds (3 minutes)
- **Headers:** Authorization, Content-Type, HTTP-Referer, X-Title

### API Key
- Stored in `.env.local` as `OPENROUTER_API_KEY`
- Loaded from environment at runtime
- Returns error if not configured

---

## Navigation URL Structure

### Pages and Routes
```
/                                 # Home page
/home                            # Home (alternative)
/generate/[topic]                # Wizard (topic from URL param)
/course-generated/[id]           # Course display (id = course identifier)
/course/[slug]/topic/[topicId]   # Module viewer
                                 # slug = course title slugified
                                 # topicId = module number (1-based)
```

### URL Examples
```
/generate/python
  → User starts wizard for Python

/course-generated/abc123def
  → Display generated course (abc123def is course ID)

/course/python-web-development/topic/1
  → Display Module 1 of Python Web Development course
```

---

## State Management

### Component State
- **Loading states:** Track API calls and data loading
- **Course data:** Cached in localStorage
- **Module data:** Cached per module in localStorage
- **Navigation:** Using Next.js router for navigation
- **courseId:** Stored in localStorage for back navigation

### Global Context
- **AuthContext:** User authentication (stub)
- **No Redux/Zustand:** Simple state management sufficient for current needs

---

## Error Handling

### Course Generation Errors
1. **Missing API Key:** Returns 500 with clear message
2. **API Call Failure:** Returns 400 with error details
3. **JSON Parse Error:** Fallback to structured response
4. **No Content Generated:** Returns 500 with error details

### Navigation Errors
1. **Missing courseId:** Falls back to router.back()
2. **Missing module data:** Shows 100ms delay before checking localStorage
3. **Invalid routes:** Next.js 404 handling

### User-Facing Errors
- Loading spinners during long operations
- Error messages with actionable feedback
- Retry mechanisms for API calls

---

## Key Improvements Made

### ✅ Dynamic Module Generation
- **Before:** Fixed 3-module structure
- **After:** 4-12 modules based on timeline + interests + experience level

### ✅ AI-Only Course Generation
- **Before:** Helper functions trying to generate locally
- **After:** Pure AI generation via OpenRouter API

### ✅ Navigation Fixes
- **Before:** Back button trying to navigate with slug as ID
- **After:** courseId stored in localStorage for reliable back navigation

### ✅ Storage Strategy
- **Before:** sessionStorage (cleared on navigation)
- **After:** localStorage (persists across navigations)

### ✅ Clean Architecture
- Single responsibility principle for each page
- Clear data flow between pages
- Minimal complexity for database integration

---

## Ready for Database Integration

The system is now structured for easy database integration:

### What to Add:
1. **User Authentication** (stub in place)
2. **User Profiles** table
3. **Courses** table (replace localStorage)
4. **Modules** table (replace localStorage)
5. **User Progress** tracking
6. **Saved Courses** for users

### Current Placeholders:
- localStorage ← Replace with database queries
- No user sessions ← Add authentication
- courseId is generic ← Use actual database IDs
- No data persistence ← Database will handle this

### Migration Path:
1. Keep UI/navigation unchanged
2. Replace localStorage.setItem/getItem with API calls
3. Update course generation to save to database
4. Add user authentication before saving
5. Create dashboard for saved courses

---

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI API:** OpenRouter (Mixtral 8x7B)
- **External APIs:** YouTube API (for video search)
- **Icons:** Lucide React
- **State:** React hooks + localStorage
- **Database:** (Ready for integration)

---

## Performance Metrics

- **Course Generation:** ~30-60 seconds (Mixtral processing)
- **Page Load:** <2 seconds (after course generated)
- **Navigation:** <100ms (localStorage access)
- **API Timeout:** 180 seconds (safe margin for Mixtral)

---

## Security Considerations

- ✅ API keys in environment variables
- ✅ No sensitive data in localStorage
- ✅ Input validation on form submissions
- ⚠️ TODO: User authentication
- ⚠️ TODO: Role-based access control
- ⚠️ TODO: Rate limiting on API endpoints

---

## Next Steps

1. **Database Schema Design** (PostgreSQL/MongoDB)
2. **User Authentication** (NextAuth.js or similar)
3. **API Routes for CRUD** (Courses, Modules, Progress)
4. **User Dashboard** (My Courses, Progress Tracking)
5. **Data Migration** (localStorage → Database)
6. **Testing** (Unit, Integration, E2E)
7. **Deployment** (Production setup)

