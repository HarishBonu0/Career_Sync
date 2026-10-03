# CareerOS — Phase 4 Course Generator Discovery & Workflow Audit

## ROLE

You are acting as a **senior software architect and codebase investigator** for the CareerOS project.

Do **NOT** implement Phase 4 yet.

Your current task is strictly:

> **Understand, trace, document, and validate the complete current Course Generator system before any architectural changes are made.**

We have already completed the authentication and database/persistence consolidation phases. Do not redesign those systems during this task.

The output of this task will be used to decide the exact scope and architecture of the next implementation phase.

---

# 1. ABSOLUTE RULE — NO IMPLEMENTATION

This is an **inspection and analysis phase only**.

### You MUST NOT:

* modify application code
* delete files
* rename files
* move files
* change APIs
* change database schemas
* change authentication
* change MongoDB data
* change AI providers
* change prompts
* change UI
* refactor code
* "fix" bugs automatically
* remove legacy implementations
* merge implementations
* change deployment configuration
* install packages
* uninstall packages
* create migrations
* create new production routes

You MAY:

* read files
* trace imports
* trace API calls
* inspect schemas/models
* inspect prompts
* inspect frontend flows
* inspect backend flows
* inspect environment-variable usage without exposing secrets
* inspect MongoDB-related code
* inspect tests
* run existing safe read-only tests
* run production builds if already supported
* use static analysis
* map dependencies
* identify inconsistencies
* identify bugs
* identify duplicate implementations
* identify dead/legacy code
* identify architectural risks

If a test would mutate production data or create persistent records, DO NOT run it unless it is clearly designed for an isolated test environment.

---

# 2. PROJECT CONTEXT

CareerOS currently has:

### Frontend

`apps/web`

* Next.js 15.5.3
* React 18
* TypeScript/JavaScript
* App Router
* Tailwind
* Radix
* SWR
* React Hook Form
* Zod

### Backend

`apps/api`

* Node.js
* Express 4
* Mongoose 8
* MongoDB Atlas
* JWT authentication
* Canonical authenticated user identity from `req.user.id`

### Database

MongoDB database:

`CareerOs`

Relevant models include:

* User
* Course
* CourseGeneration
* UserEnrollment
* Roadmap
* SkillEvaluation
* SkillProfile

### Important previous findings

The existing project contains multiple Course Generator implementations.

At minimum, investigate these:

1. Next.js:
   `/api/generate-course`

2. Express:
   `/api/courses/generate`

3. Express:
   `/api/generate-course-v2`

There may be additional Course Generator logic elsewhere.

Do not assume these three are the only implementations.

Search the entire repository.

---

# 3. PRIMARY OBJECTIVE

Reconstruct the **actual end-to-end Course Generator workflow as it exists today**.

I want to understand exactly what happens when a user decides:

> "I want to generate a course."

Trace the entire journey from:

```text
User enters Course Generator
        ↓
Frontend page/component
        ↓
User inputs
        ↓
Validation
        ↓
Frontend request
        ↓
API endpoint
        ↓
Authentication
        ↓
Request transformation
        ↓
Prompt construction
        ↓
AI provider/model
        ↓
AI response
        ↓
Response parsing
        ↓
Validation/normalization
        ↓
Course object
        ↓
MongoDB persistence
        ↓
Course returned to frontend
        ↓
UI rendering
        ↓
Enrollment
        ↓
Course modules/content
        ↓
Progress tracking
        ↓
Dashboard / My Courses
        ↓
Refresh / resume
```

Do not infer missing steps.

If a step does not exist, explicitly say:

> NOT IMPLEMENTED

If multiple implementations exist, trace each separately.

---

# 4. FIRST: LOCATE EVERY COURSE GENERATOR IMPLEMENTATION

Search the entire repository for:

* `generate-course`
* `generateCourse`
* `CourseGeneration`
* `CourseGenerator`
* `course generation`
* `generateCourse`
* Gemini
* OpenAI
* AI generation helpers
* prompt builders
* course schemas
* course validators
* course creation
* course save endpoints
* course enrollment
* course module generation
* module generation
* lesson generation

Also inspect:

* route definitions
* controllers
* services
* utilities
* prompts
* AI clients
* frontend pages
* frontend hooks
* API clients
* server actions
* Next.js route handlers
* Express routes
* middleware
* models
* tests

Create a complete inventory.

---

# 5. IDENTIFY ALL USER ENTRY POINTS

Find every place where a user can initiate course generation.

For each entry point report:

| Field                   | Details |
| ----------------------- | ------- |
| File                    |         |
| Component/page          |         |
| Route                   |         |
| User action             |         |
| Required inputs         |         |
| Optional inputs         |         |
| Validation              |         |
| API called              |         |
| Authentication required |         |
| Result behavior         |         |

Examples of possible entry points:

* Course Generator page
* Dashboard
* Roadmap
* Skill evaluation
* Recommendation flow
* Direct URL
* Legacy course generator
* Admin/internal interface

Do not assume only one exists.

---

# 6. TRACE THE CURRENT FRONTEND WORKFLOW

For the canonical/current frontend flow, explain exactly:

### Step 1 — Page loading

What page/component loads?

What data is fetched?

Does it require authentication?

### Step 2 — User input

Identify every field.

For example, if present:

* course title
* topic
* skill
* difficulty
* duration
* goals
* experience
* language
* number of modules
* learning objectives
* prerequisites

Do not invent fields.

### Step 3 — Validation

Identify:

* client-side validation
* Zod schemas
* React Hook Form validation
* manual validation
* backend validation

Explain discrepancies.

### Step 4 — Request

Show the **request contract**, conceptually:

```text
Frontend
   ↓
HTTP method
   ↓
endpoint
   ↓
headers
   ↓
credentials/cookies
   ↓
request body
```

Do NOT expose secrets or tokens.

### Step 5 — Loading/error states

Explain:

* loading behavior
* timeout handling
* retry behavior
* error display
* partial-generation behavior
* duplicate submission prevention

---

# 7. TRACE EVERY BACKEND GENERATION ENDPOINT

For EACH discovered Course Generator endpoint, create a separate section.

At minimum investigate:

```text
/api/generate-course
/api/courses/generate
/api/generate-course-v2
```

For each endpoint document:

### Endpoint

```text
METHOD + PATH
```

### Authentication

* public/private
* middleware used
* user identity source

### Input

Exact logical request structure.

### Validation

What is checked?

### Processing

Trace:

```text
route
→ controller
→ service
→ helper
→ prompt builder
→ AI provider
→ parser
→ validator
→ database
```

### AI provider

Identify:

* provider
* SDK
* model
* temperature if configured
* token limits if configured
* retry logic
* timeout
* fallback model
* fallback provider

Do not expose API keys.

### Prompt

Identify:

* where prompt is constructed
* static instructions
* dynamic user information
* personalization
* output format
* JSON requirements
* examples/few-shot content
* system/user message separation

Do not dump huge prompts unnecessarily.

Instead explain the structure and include representative excerpts only if useful.

### Output

Document the actual generated structure.

For example:

```text
Course
├── title
├── description
├── difficulty
├── duration
├── modules[]
│   ├── title
│   ├── description
│   ├── lessons[]
│   └── ...
└── ...
```

Use the actual schema discovered in code.

---

# 8. COMPARE THE GENERATION IMPLEMENTATIONS

Create a direct comparison of every implementation.

Use a table like:

| Capability         | Next `/api/generate-course` | Express `/api/courses/generate` | Express `/api/generate-course-v2` | Other |
| ------------------ | --------------------------- | ------------------------------- | --------------------------------- | ----- |
| Authentication     |                             |                                 |                                   |       |
| Input schema       |                             |                                 |                                   |       |
| Validation         |                             |                                 |                                   |       |
| AI provider        |                             |                                 |                                   |       |
| AI model           |                             |                                 |                                   |       |
| Prompt             |                             |                                 |                                   |       |
| Output format      |                             |                                 |                                   |       |
| Course schema      |                             |                                 |                                   |       |
| Module generation  |                             |                                 |                                   |       |
| Lesson generation  |                             |                                 |                                   |       |
| Persistence        |                             |                                 |                                   |       |
| Enrollment         |                             |                                 |                                   |       |
| Error handling     |                             |                                 |                                   |       |
| Retry logic        |                             |                                 |                                   |       |
| Fallback           |                             |                                 |                                   |       |
| Ownership          |                             |                                 |                                   |       |
| Idempotency        |                             |                                 |                                   |       |
| Used by current UI |                             |                                 |                                   |       |
| Legacy status      |                             |                                 |                                   |       |

This comparison is extremely important.

---

# 9. DETERMINE WHICH IMPLEMENTATION IS ACTUALLY USED

Do not determine this merely from filenames.

Trace imports and network/API usage.

Answer:

### Current production/user-facing path

Which implementation is actually called by the current CareerOS frontend?

Provide evidence:

```text
UI component
→ function
→ API client
→ endpoint
→ backend route
```

### Other implementations

For every other implementation classify it as:

* Active
* Partially active
* Legacy
* Dead/unreferenced
* Test-only
* Unknown

Provide evidence for the classification.

---

# 10. TRACE AI GENERATION IN DETAIL

I want to understand the actual AI architecture.

Determine:

### Input → Prompt

What information is given to the AI?

### Prompt → Model

Which model receives it?

### Model → Raw response

What format does the AI return?

### Raw response → Parser

How is the response parsed?

### Parser → Validator

Is the output validated?

### Validator → Course

How is the final course object produced?

Identify failure cases such as:

* invalid JSON
* markdown wrapped JSON
* missing fields
* malformed modules
* malformed lessons
* duplicate modules
* empty content
* token truncation
* model refusal
* timeout
* rate limit
* provider failure

Explain how the current implementation handles each.

---

# 11. UNDERSTAND COURSE STRUCTURE

This is one of the most important parts.

Determine the exact conceptual structure of a generated course.

For example:

```text
Course
 ├── metadata
 ├── modules
 │    ├── module
 │    │    ├── lessons
 │    │    ├── resources
 │    │    ├── exercises
 │    │    └── assessment
 │    └── ...
 └── ...
```

But **only use structures that actually exist in the code**.

Document:

* Course fields
* Module fields
* Lesson fields
* Resource fields
* Quiz fields
* Assessment fields
* project fields
* prerequisites
* learning outcomes
* difficulty
* duration
* ordering
* identifiers

Then explain:

> Which parts are generated by AI vs created by backend logic?

---

# 12. COURSE PERSISTENCE WORKFLOW

Trace what happens after generation.

Determine:

```text
Generated course
     ↓
Does it get saved immediately?
     ↓
Which endpoint?
     ↓
Which model?
     ↓
Which User owns it?
     ↓
Which ID is assigned?
     ↓
How is it returned?
```

Then determine whether the system creates:

* Course
* CourseGeneration
* UserEnrollment

and in what order.

Document the exact sequence.

---

# 13. ENROLLMENT WORKFLOW

Trace what happens after a generated course exists.

Determine:

```text
Course
 ↓
Save
 ↓
Enrollment
 ↓
UserEnrollment
 ↓
Course page
 ↓
Progress
```

Answer:

1. Is every generated course automatically enrolled?
2. Does the user manually enroll?
3. Can a user generate without enrolling?
4. Can the same course be enrolled twice?
5. What prevents duplicates?
6. How is ownership enforced?
7. What happens after refresh?
8. What happens after logout/login?
9. What happens when another user accesses the course ID?

---

# 14. COURSE CONTENT GENERATION

Very important:

Determine whether the initial Course Generator generates:

### A.

Entire course content in one AI request

OR

### B.

Course structure first, then individual modules/lessons are generated separately

OR

### C.

A hybrid approach.

Trace the actual implementation.

If module/lesson generation happens later, document:

```text
Course creation
 ↓
Module selection
 ↓
Lesson generation
 ↓
Content persistence
 ↓
Display
```

Determine:

* API endpoints
* AI calls
* persistence
* caching
* retries
* cost implications
* latency
* duplicate generation behavior

---

# 15. COURSE PROGRESS WORKFLOW

Trace:

```text
User opens course
 ↓
Current module
 ↓
Completed modules
 ↓
Progress API
 ↓
MongoDB
 ↓
Dashboard
```

Determine:

* what counts as completed
* how progress is calculated
* where it is stored
* whether localStorage is involved
* whether server state wins
* whether progress survives refresh
* whether progress survives logout/login
* whether progress can be manipulated
* whether invalid module indexes are rejected

Do not modify anything.

---

# 16. DASHBOARD / MY COURSES INTEGRATION

Determine how generated courses appear elsewhere.

Trace:

```text
Course Generator
 ↓
MongoDB
 ↓
My Courses
 ↓
Dashboard
 ↓
Course detail page
```

Identify all API calls and data transformations.

Determine whether each screen uses:

* MongoDB
* API response
* React state
* localStorage
* sessionStorage
* hardcoded/mock data

---

# 17. BROWSER STORAGE AUDIT

Search specifically for:

```text
localStorage
sessionStorage
course
generatedCourse
courseData
currentCourse
selectedCourse
courseProgress
```

For every course-related browser-storage usage document:

| Storage | Key | Purpose | Source of truth? | Temporary? |
| ------- | --- | ------- | ---------------- | ---------- |

Determine whether browser storage can cause stale or conflicting course data.

Do not remove it.

---

# 18. DATA CONSISTENCY AUDIT

Check for mismatches between:

### Frontend

Course representation

### API

Request/response representation

### MongoDB

Schema representation

### Enrollment

Course representation

### Progress

Course/module representation

Look specifically for:

* `courseModules`
* `courseModuleCount`
* `completedModules`
* `currentModule`
* IDs vs indexes
* ObjectId vs string
* numeric vs array values
* optional vs required fields
* duplicate field names
* legacy fields

We previously identified a `courseModules` contract mismatch.

Determine whether it is now fully resolved or whether any Course Generator implementation still uses the old contract.

---

# 19. ERROR HANDLING AUDIT

Map every important failure.

Create a table:

| Failure                   | Current behavior | User experience | Persisted partial data? |
| ------------------------- | ---------------- | --------------- | ----------------------- |
| Invalid input             |                  |                 |                         |
| Unauthorized              |                  |                 |                         |
| AI timeout                |                  |                 |                         |
| AI rate limit             |                  |                 |                         |
| AI malformed output       |                  |                 |                         |
| DB failure                |                  |                 |                         |
| Duplicate request         |                  |                 |                         |
| Network failure           |                  |                 |                         |
| Refresh during generation |                  |                 |                         |

Do not fix them.

---

# 20. PERFORMANCE / COST ANALYSIS

Without making changes, estimate from the code:

* number of AI calls per course
* sequential vs parallel calls
* expected latency
* retry multiplication
* potential duplicate AI calls
* token-heavy prompts
* unnecessary regeneration
* database writes
* caching

If exact cost cannot be calculated because pricing/configuration is unavailable, say so.

Do not invent numerical estimates.

---

# 21. SECURITY AUDIT

Inspect for Course Generator-specific risks:

* unauthorized generation
* cross-user course access
* cross-user enrollment
* trusting client-provided user IDs
* trusting client-provided email
* exposed API keys
* AI prompt injection
* malicious course titles/prompts
* unsafe HTML rendering
* stored XSS
* arbitrary URLs
* unvalidated generated content
* database ownership issues
* duplicate submissions
* replay behavior

Report findings only.

Do not fix them.

---

# 22. IDENTIFY DUPLICATION

Find duplicated logic across:

* Next.js
* Express
* legacy frontend
* backend
* prompts
* AI utilities
* schemas
* validators
* API clients
* course rendering
* persistence

For each duplicate, explain:

```text
Implementation A
Implementation B
Difference
Why both exist
Which appears active
Risk of keeping both
```

---

# 23. IDENTIFY WHAT IS ACTUALLY GOOD

Do NOT assume everything needs to be rewritten.

Explicitly identify:

### Working correctly

### Architecturally sound

### Worth preserving

### Needs minor adjustment

### Needs redesign

### Legacy and likely removable

This section is critical.

We want to preserve working functionality rather than blindly rebuild the Course Generator.

---

# 24. IDENTIFY WHAT SHOULD NOT BE CHANGED IN PHASE 4

Based on your investigation, identify systems that should remain untouched during Course Generator consolidation.

Likely examples may include:

* authentication
* Google OAuth
* MongoDB connection
* User model
* existing persistence contracts
* SkillProfile
* roadmap system

But do not assume.

Base this on actual dependencies.

---

# 25. PROPOSE POSSIBLE TARGET ARCHITECTURE — WITHOUT IMPLEMENTING IT

After understanding the current system, propose **one or more possible architectures** for consolidation.

Do NOT choose the final architecture for us.

For example:

### Option A — Express canonical generator

```text
Frontend
   ↓
Express Course Generator
   ↓
AI service
   ↓
Course validation
   ↓
MongoDB
```

### Option B — Modular generation service

```text
Frontend
   ↓
Course Generation Orchestrator
   ├── Input validation
   ├── Prompt builder
   ├── AI provider
   ├── Output parser
   ├── Course validator
   └── Persistence
```

### Option C

Whatever architecture the codebase suggests.

For each option explain:

* advantages
* disadvantages
* migration complexity
* risk
* performance
* maintainability
* compatibility with current database
* compatibility with current frontend
* compatibility with future AI providers

Do NOT rank the options.

We will make the final architectural decision ourselves.

---

# 26. RECOMMENDATION CRITERIA

Do NOT give a subjective "best" verdict.

Instead provide:

> "Based on the current codebase, these are the factual considerations that should drive the decision."

Include:

* current frontend dependency
* backend dependency
* persistence compatibility
* authentication compatibility
* AI implementation quality
* duplication
* test coverage
* migration complexity
* legacy dependencies
* future extensibility

---

# 27. TEST THE CURRENT SYSTEM — READ ONLY

Where safe, run existing tests that verify Course Generator behavior.

Do NOT create destructive tests.

Record:

```text
Test
Result
What it proves
```

At minimum verify where possible:

* frontend build
* backend health
* course route availability
* route registration
* schema validation
* existing Course Generator tests
* persistence tests
* ownership tests

If actual AI generation would consume paid API credits or create persistent records, do NOT run it unless an isolated test/mock environment is already configured.

---

# 28. DATABASE OBSERVATION

Inspect current database-related Course Generator records safely.

Do not modify anything.

Determine:

* number of Courses
* number of CourseGenerations
* number of UserEnrollments
* relationship between them
* whether generated courses have owners
* whether CourseGeneration is actually being used
* whether there are orphan records
* whether legacy test records exist

Do not delete or migrate anything.

---

# 29. FINAL DELIVERABLE

Create a detailed report named:

```text
PHASE_4_COURSE_GENERATOR_DISCOVERY_REPORT.md
```

Do not modify production application code.

The report MUST contain:

# Executive Summary

# 1. Current Course Generator Implementations

# 2. User Entry Points

# 3. Complete Current Workflow

# 4. Frontend Workflow

# 5. Backend Workflow

# 6. AI Generation Workflow

# 7. Course Data Structure

# 8. Course Persistence Workflow

# 9. Enrollment Workflow

# 10. Module/Lesson Content Workflow

# 11. Progress Workflow

# 12. Dashboard/My Courses Integration

# 13. Browser Storage Usage

# 14. Data Contract Audit

# 15. Error Handling

# 16. Performance and AI Cost Considerations

# 17. Security Findings

# 18. Duplicate Implementations

# 19. Active vs Legacy Components

# 20. What Is Working Correctly

# 21. What Needs Change

# 22. What Should Be Preserved

# 23. Candidate Target Architectures

# 24. Migration Considerations

# 25. Test Results

# 26. Database Observations

# 27. Open Questions

# 28. Proposed Scope for Phase 4

---

# 30. CRITICAL: OPEN QUESTIONS

End with a section:

## Questions We Must Answer Before Implementation

List every question where the codebase does not provide enough evidence.

Examples:

* Should course generation produce full content immediately?
* Should modules be generated lazily?
* Should courses automatically enroll users?
* Should CourseGeneration become the canonical generation record?
* Should generated courses be editable?
* Should users regenerate individual modules?
* Should AI-generated resources be validated?
* Should generation be resumable?
* Should generation be streamed?
* Should users see generation progress?
* Should multiple generation strategies remain?
* Should generated courses be public or private?
* Should users be able to share courses?
* Should course versions be supported?

Only include questions relevant to the actual codebase.

---

# 31. IMPORTANT: DO NOT MAKE PRODUCT DECISIONS FOR US

You are investigating the existing system.

You must distinguish:

### FACT

Something directly established by code/config/tests.

### INFERENCE

Something strongly suggested by implementation.

### UNKNOWN

Something the codebase cannot establish.

Use labels where appropriate.

Example:

```text
FACT:
The frontend currently calls /api/courses/generate.

INFERENCE:
The Next.js /api/generate-course route appears to be legacy because no active component references it.

UNKNOWN:
Whether the legacy endpoint is still used externally.
```

---

# 32. EVIDENCE REQUIREMENT

Every important architectural conclusion must include evidence.

For example:

```text
Finding:
Express /api/courses/generate appears to be the active Course Generator.

Evidence:
- apps/web/.../CourseGenerator.tsx calls ...
- apps/web/.../api.ts invokes ...
- apps/api/routes/... registers ...
- no active frontend reference found for ...
```

Include file paths and relevant function/class names.

Use line numbers when practical.

Do not make claims such as "unused" merely because you did not immediately find a reference.

---

# 33. FINAL STATUS

At the end provide:

```text
PHASE 4 DISCOVERY STATUS

Code modified: NO
Database modified: NO
Production behavior changed: NO

Course Generator implementations found: X
Active implementations: X
Legacy implementations: X
Unknown implementations: X

Frontend flow traced: YES/NO
Backend flow traced: YES/NO
AI flow traced: YES/NO
Persistence flow traced: YES/NO
Enrollment flow traced: YES/NO
Progress flow traced: YES/NO
Dashboard flow traced: YES/NO
Browser storage audited: YES/NO
Data contracts audited: YES/NO
Security audited: YES/NO
Existing tests executed: YES/NO

Ready for Phase 4 implementation: YES / NO / ONLY AFTER QUESTIONS ARE ANSWERED
```

If there are unresolved architectural questions, explicitly identify them.

---

# 34. MOST IMPORTANT INSTRUCTION

Do NOT start Phase 4 implementation after completing this investigation.

Do NOT automatically "clean up" anything.

Do NOT remove duplicate code.

Do NOT select a canonical implementation.

Do NOT change the Course Generator.

The purpose of this task is to give me a **complete factual map of how Course Generator works today**, including what is good, what is broken, what is duplicated, what is legacy, and what decisions we need to make.

Once the report is complete, STOP.

Wait for my review and instructions before modifying the codebase.
