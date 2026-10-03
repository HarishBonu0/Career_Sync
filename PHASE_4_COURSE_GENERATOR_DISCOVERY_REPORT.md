# CareerOS Phase 4 Course Generator Discovery Report

Date: 2026-10-03
Scope: Read-only discovery and workflow audit. No application code, database data, authentication, AI providers, prompts, UI, APIs, schemas, or deployment files were modified.

## Executive Summary

**FACT:** The current user-facing course wizard is the Next.js page `apps/web/app/(app)/generate/[topic]/page.tsx`. It loads wizard questions from Express `POST /api/courses/generate-questions`, then sends the completed wizard to the Next.js route `POST /api/generate-course`.

**FACT:** The Next.js route uses the OpenRouter SDK and returns a course object to the browser. It does not persist `CourseGeneration` or `Course` itself.

**FACT:** The browser then calls `POST /api/courses/save`, persists a `Course`, stores a temporary `generatedCourse` localStorage value, and navigates to `/course-generated/:id` when a course ID is returned.

**FACT:** The current course detail page loads MongoDB by ID first, but its manual save action can call `/api/courses/save` again, which can create another Course because that request does not carry a client idempotency key.

**FACT:** The current implementation has three materially different generation paths:

1. Next.js `/api/generate-course`: current wizard path; OpenRouter SDK; rich JSON course; browser-side post-generation persistence.
2. Express `/api/courses/generate`: authenticated Gemini path; saves only `CourseGeneration`; not referenced by the current wizard in active source.
3. Express `/api/generate-course-v2`: authenticated modular OpenRouter path; creates `CourseGeneration` and `Course`; uses multiple generation stages and optional enrichment; not referenced by the current wizard in active source.

**FACT:** The read-only database inventory found 13 `Course` records, 0 `CourseGeneration` records, 4 `UserEnrollment` records, 2 `Roadmap` records, and 3 `SkillEvaluation` records. This strongly supports that the current tested/user-facing flow is using `Course` persistence rather than the Express generation-history model.

**INFERENCE:** Express v2 is a work-in-progress production-oriented implementation rather than the path currently exercised by the active wizard. Its route registration and service pipeline are real, but no active `apps/web` source reference was found for `/api/generate-course-v2`.

**UNKNOWN:** Whether external clients, legacy deployments, or users call the old Express generation endpoint directly. Lack of an active repository reference does not prove external non-use.

## 1. Current Course Generator Implementations

### Implementation A: active Next.js route

| Field | Finding |
|---|---|
| Frontend entry | `apps/web/app/(app)/generate/[topic]/page.tsx` |
| Route | `POST /api/generate-course` |
| Runtime | Next.js App Router server route in `apps/web/app/api/generate-course/route.ts` |
| Provider | OpenRouter through `@openrouter/sdk` |
| Model | `mistralai/mixtral-8x22b-instruct` |
| Input | `{ topic, answers }` |
| Auth at generation | No explicit backend auth middleware in the Next route |
| Output | Rich course JSON, returned to browser |
| Persistence | Not in the Next route; browser later calls `/api/courses/save` |
| Current status | Active user-facing path |

### Implementation B: Express legacy/simple path

| Field | Finding |
|---|---|
| Route | `POST /api/courses/generate` |
| File | `apps/api/routes/courses.js` |
| Auth | Current code requires `authenticate` and `requireMongo` |
| Provider | `@google/generative-ai` |
| Model | `gemini-2.0-flash` in source |
| Input | `courseName`, optional `duration`, optional `level` |
| Output | Raw Gemini curriculum text plus `generationId` |
| Persistence | Creates `CourseGeneration` only |
| Current status | Partially active route; generic `apps/web/lib/api.ts` exposes a client method, but no active wizard reference was found |

### Implementation C: Express modular v2 path

| Field | Finding |
|---|---|
| Route | `POST /api/generate-course-v2` |
| File | `apps/api/routes/course-generation-v2.js` |
| Auth | `authenticate` and `requireMongo` |
| Provider | OpenRouter through direct `fetch` in service modules |
| Pipeline | Title generation, semantic curriculum validation, module expansion, sanitation, optional enrichment queue |
| Input | `topic`, optional object `answers` |
| Output | Base generated course plus optional persistence metadata and enrichment metadata |
| Persistence | Creates `CourseGeneration` and `Course`; persistence errors are caught and logged, then response can still succeed with `persisted: null` |
| Current status | Registered and implemented, but no active `apps/web` caller found |

### Additional/legacy implementations

- `frontend/course-generation` contains generated Next build artifacts and a historical Next course application. Its lockfile identifies a separate Next 14, Prisma, Supabase and NextAuth-era project. Source package metadata is incomplete in the current directory listing, while `.next` contains compiled route artifacts.
- `apps/web/lib/api.ts` has `generateCourse()` calling `/api/courses/generate`, but active course wizard code does not use that method.
- `apps/web/app/api/generate-course/route.ts` contains large resource/video helper logic and is separate from the Express orchestrator services.
- `apps/api/routes/courses.js` also contains course wizard question generation. That endpoint returns deterministic fallback questions in current source; its commented Gemini branch is not active.
- `apps/api/services/__tests__/services.test.ts` and `apps/api/test-services.js` cover supporting course services, not a full live course generation journey.

## 2. User Entry Points

| File | Component/page | Route/action | Inputs | Validation | API | Auth | Result |
|---|---|---|---|---|---|---|---|
| `apps/web/app/(app)/courses/page.tsx` | Course landing page | Link into course generator | Topic is selected through navigation/UI | Page-level behavior; generator validates flow | Navigation only | Protected app route | Opens generator entry |
| `apps/web/app/(app)/generate/[topic]/page.tsx` | `GenerateCoursePage` | Wizard completion and Generate button | Topic from URL; answers to generated wizard questions | Manual per-question validation; no Zod/React Hook Form schema found | `POST /api/courses/generate-questions`, then `POST /api/generate-course`, then `POST /api/courses/save` | Page is middleware-protected; Next generation route itself has no explicit auth middleware | Stores temporary course cache, navigates to course page |
| `apps/web/components/home/TopicPills.tsx` | Topic navigation | Navigates to generator topic route | Topic pill value | No generation request itself | Navigation | Auth depends on destination route | Enters the wizard |
| Dashboard/home | Quick action links | Links to `/courses` | None | None | No direct generation request | Protected | Enters course landing page |
| `apps/web/lib/api.ts` | Generic client method | `api.generateCourse()` | `prompt`, arbitrary options | No feature-specific validation | `POST /api/courses/generate` | Cookie credentials; no active caller found | Returns raw legacy generation response |
| Legacy `frontend/course-generation` | Historical generated app | Historical `/generate/[topic]` and API routes in compiled artifacts | Topic/answers | Historical implementation | Historical Next/OpenRouter routes and backend APIs | Legacy auth/storage assumptions | Legacy course flow; not proven active |

No active entry point was found where the roadmap or skill evaluator directly calls a course-generation endpoint. Roadmap mind-map nodes contain course search queries, but current evidence does not show them generating or persisting a Course.

## 3. Complete Current Workflow

```text
User opens /courses
  -> navigates to /generate/[topic]
  -> page requests wizard questions from Express /api/courses/generate-questions
  -> user answers questions in React state
  -> browser POSTs { topic, answers } to Next /api/generate-course
  -> Next route calls OpenRouter and parses course JSON
  -> Next route enriches modules with reading materials and video intelligence
  -> Next route returns { success, course, topic, userName }
  -> browser POSTs course object to Express /api/courses/save
  -> Express creates Course owned by req.user.id
  -> browser stores generatedCourse in localStorage
  -> browser navigates to /course-generated/:courseId
  -> page fetches GET /api/courses/:id first
  -> user can manually save/enroll from course page
  -> module navigation uses temporary module localStorage handoff
  -> module completion PUTs /api/courses/:id/progress
  -> My Courses reads GET /api/courses/enrollments/my
  -> profile/dashboard reads profile aggregates
```

The workflow is not one atomic generation transaction. The generation response, Course save, enrollment and progress are separate operations.

## 4. Frontend Workflow

### Page loading

`GenerateCoursePage` reads the dynamic `topic` route parameter. It requests wizard questions from `${NEXT_PUBLIC_API_URL}/courses/generate-questions`, with JSON content type and no explicit authorization header. The app route is protected by Next middleware, but the question endpoint itself is not an authenticated route in the current Express code.

### User inputs

The active wizard does not hard-code a fixed input schema in the page. It renders questions returned by the backend. Each question has:

- numeric `id`
- `type`: `text`, `single-choice` or `multiple-choice`
- `question`
- optional `placeholder`
- optional `options`

The current backend fallback question generator produces questions for goals, experience, time commitment, learning style, timeline, focus areas and requirements. The active page sends the answer map as `Record<number, string | string[]>`.

### Validation

- Text questions require non-empty input except the final question path allows the current text input to be empty at the final step.
- Single-choice questions require a truthy answer.
- Multiple-choice questions require at least one selected option.
- No Zod schema or React Hook Form schema was found in this page.
- Backend question generation validates `topic` as a string of length 1-200.
- Next `/api/generate-course` does not show equivalent schema validation for `topic`/`answers` before prompt construction.
- Express v2 validates `topic` and optional object `answers`, but the active wizard does not call it.

### Request contract

```text
Browser page
  -> fetch('/api/generate-course')
  -> POST
  -> Content-Type: application/json
  -> body: { topic, answers }
  -> no explicit auth header; browser credentials are not explicitly set on this Next route call
```

The subsequent save request is:

```text
Browser page
  -> POST ${NEXT_PUBLIC_API_URL}/courses/save
  -> Content-Type: application/json
  -> credentials: include
  -> body: { course: generatedCourse }
```

### Loading, errors and duplicates

- Question loading shows a dedicated loading state.
- Question errors render a retry/reload action.
- Generation uses `AbortSignal.timeout(180000)`.
- Generation disables the Generate button while `isGenerating` is true.
- Generation errors are rendered in the wizard.
- Save failure is caught in the current wizard and does not fail the whole workflow; it stores the course in localStorage and navigates using a topic slug fallback. This means a failed durable save can still look like a usable generated course.
- The Next route itself falls back to a constructed course when JSON parsing or generation processing fails and still returns success.

## 5. Backend Workflow

### Question endpoint

`POST /api/courses/generate-questions` in `apps/api/routes/courses.js`:

- Validates `topic` with express-validator.
- Current active implementation uses deterministic fallback questions.
- The Gemini generation implementation is commented out in the current source.
- It does not create a Course or CourseGeneration.

### Next.js generation endpoint

`POST /api/generate-course` is implemented in `apps/web/app/api/generate-course/route.ts`:

- Reads JSON body `{ topic, answers }`.
- Requires `OPENROUTER_API_KEY` to be configured.
- Builds a large prompt from topic and answer-derived values.
- Uses OpenRouter SDK streaming.
- Parses streamed text with `jsonrepair` after stripping markdown fences.
- Enriches modules with deterministic reading-material maps and video intelligence calls.
- Returns a course object.
- Does not write MongoDB directly.

### Express simple endpoint

`POST /api/courses/generate`:

```text
authenticate + requireMongo
  -> validate courseName/duration/level
  -> use GeminiGenerativeAI
  -> model gemini-2.0-flash
  -> generate one raw curriculum text response
  -> create CourseGeneration
  -> return curriculum and generationId
```

It does not create a Course or UserEnrollment in this handler.

### Express v2 endpoint

`POST /api/generate-course-v2`:

```text
authenticate + requireMongo
  -> validate topic and answers
  -> extract difficulty from answers[3]
  -> derive module count from answers[6]
  -> call generationOrchestrator.generateCourse
      -> titleGenerator.generateModuleTitles
      -> curriculumValidator.validateCurriculum
          -> embeddings/similarity
          -> possible duplicate-title regeneration
      -> moduleExpander.expandModules
          -> one sequential OpenRouter call per module
          -> schema sanitation/validation
          -> deterministic module fallback on expansion failure
      -> generate objectives in backend code
      -> queue enrichment job
  -> create CourseGeneration
  -> create Course
  -> return generated course and persisted IDs
```

The v2 route catches generation failure and constructs a deterministic fallback base course. It also catches persistence failures and can return a successful generation response with `persisted: null`.

## 6. AI Generation Workflow

### Next.js/OpenRouter path

- Provider: OpenRouter.
- SDK: `@openrouter/sdk`.
- Model: `mistralai/mixtral-8x22b-instruct` in the active route.
- Request: streamed chat completion, JSON object response format, maximum token setting in the SDK request.
- Prompt: includes topic, inferred user name, goal, experience, time commitment, timeline, and topic-specific instructions. It requests exact module count, specific searchable titles, objectives, topics, activities, projects, YouTube searches, resources and final project.
- Parser: streams content into a string, strips JSON markdown fences, applies `jsonrepair`, then `JSON.parse`.
- Post-parser: enriches each module with reading materials and calls video intelligence. Resources are also generated/replaced by deterministic code when absent or invalid.
- Failure behavior: constructed fallback course with generated fallback modules and resources.

### Express simple/Gemini path

- Provider: Google Gemini.
- SDK: `@google/generative-ai`.
- Model in source: `gemini-2.0-flash`.
- Prompt: one short curriculum request containing course name, level and duration.
- Output: raw text stored in `CourseGeneration.curriculum`.
- No structured JSON parser or module validator appears in this path.

### Express v2/OpenRouter path

- Provider: OpenRouter through direct `fetch`.
- Model in title, duplicate regeneration and module expansion services: `mistralai/mixtral-8x7b-instruct`.
- Title generation asks for an exact JSON array and validates count, strings and minimum length.
- Curriculum validation computes embeddings, clusters similar titles, may call OpenRouter to regenerate duplicates, and reorders by progression heuristics.
- Module expansion requests strict JSON with description, objectives, topics, activities, project, hours, YouTube search and duration.
- Module expansion parses JSON, sanitizes fields, validates the module, and falls back to a deterministic module when expansion fails.
- Enrichment is queued after base generation. Queue/worker availability is conditional on Redis configuration and the active package/runtime dependency state.

## 7. Course Data Structure

### MongoDB Course

`apps/api/models/Course.js` stores:

```text
Course
├── _id
├── user: ObjectId reference
├── userId: compatibility string
├── userEmail: compatibility string
├── generation: CourseGeneration reference
├── title
├── description
├── level / difficulty
├── duration
├── totalModules
├── objectives: string[]
├── modules[]
│   ├── id
│   ├── title
│   ├── content
│   ├── description
│   ├── duration
│   ├── lessons[]
│   │   ├── title
│   │   ├── content
│   │   └── resources[]
│   ├── topics[] mixed
│   ├── activities[] mixed
│   ├── project mixed
│   ├── assessment mixed
│   ├── readingMaterials[]
│   ├── youtubeLinks[]
│   └── metadata
├── resources[] mixed
├── finalProject mixed
├── progress
├── completedModules[]
├── status
├── metadata
├── createdAt
└── updatedAt
```

### CourseGeneration

`CourseGeneration` has required `user`, `courseName`, optional duration/level/prompt/model/curriculum/modules/status/tokens and timestamps. Its module subdocument is narrower: title, topics, learning outcomes and duration.

### Generated module variants

- Next route generates richer fields including `weekNumber`, `objectives`, `topics`, `activities`, `project`, `estimatedHours`, `youtubeSearch`, reading materials and video intelligence.
- v2 `sanitizeModule` retains id, title, description, weekNumber, duration, objectives, topics, activities, project, estimatedHours, YouTube search and reading materials.
- Express simple path stores raw curriculum text and does not create structured modules.
- Mongoose Course accepts multiple variants through mixed fields and normalization in `courses.js`.

**FACT:** Lessons are represented in the Mongo schema, but no active current-generation path was found that creates a populated `lessons[]` structure as a separate persistence step.

## 8. Course Persistence Workflow

### Current wizard

```text
Next generation response
  -> browser receives course
  -> browser POST /api/courses/save
  -> Express creates Course owned by req.user.id
  -> response returns courseId
  -> browser navigates to /course-generated/:courseId
```

The current wizard does not create `CourseGeneration` through the Next route.

### v2

```text
Orchestrator returns base course
  -> CourseGeneration.create
  -> Course.create with generation reference
  -> response includes persisted generationId/courseId
```

Persistence is inside a nested try/catch, so persistence can fail while the outer response still reports a generated course.

### Database observation

The safe inventory found:

```text
Courses: 13
CourseGenerations: 0
UserEnrollments: 4
```

This is factual evidence that inspected data currently contains Course records without CourseGeneration records. The inventory also found one orphan Course from a prior Phase 0 test artifact; it was not modified.

## 9. Enrollment Workflow

After Phase 3 changes, the course page’s manual save action:

```text
POST /api/courses/save
  -> POST /api/profile/enroll/course
```

The enrollment endpoint resolves `courseId`, checks ownership when the Course exists, derives `req.user.id`, normalizes `courseModuleCount`, and returns an existing enrollment for repeated matching requests.

Important current behavior:

1. The wizard itself already calls `/api/courses/save` before navigating.
2. The course detail page can call `/api/courses/save` again through its manual save action.
3. The second save request does not use the wizard’s client request ID, so duplicate Course documents remain possible.
4. Enrollment is not automatically created by the wizard’s save call; it is created by the later course-page save action.
5. A user can therefore have a generated/saved Course before enrollment.
6. `GET /api/courses/enrollments/my` returns durable enrollments and course progress.
7. Cross-user course retrieval is ownership-protected.

## 10. Module/Lesson Content Workflow

**FACT:** The current Next route generates the module structures and enriches them before returning the response. There is no separate current API call for generating an individual lesson after the course is created.

**FACT:** The current module page uses a temporary `module_<number>` localStorage handoff to navigate from a generated course page to a topic page.

**FACT:** Course progress is now written to `PUT /api/courses/:id/progress`, but the topic page still needs the temporary module handoff to reconstruct the current module view in its existing route shape.

**NOT IMPLEMENTED:** A durable lazy module/lesson generation workflow with persisted lesson documents, resumable generation jobs, or per-lesson APIs was not found.

## 11. Progress Workflow

```text
GeneratedCourse page
  -> stores module navigation payload in localStorage
Topic page
  -> reads module_<topicId>
  -> gets courseId from that temporary payload
  -> PUT /api/courses/:id/progress
  -> Course and matching UserEnrollment are updated in MongoDB
  -> profile/dashboard can read persisted progress
```

Server-side progress fields include Course `progress` and `completedModules`, plus enrollment progress/current/completed fields. The frontend updates its local completed-topic cache only after the API responds successfully.

Known limitation: if the temporary module handoff is absent, the existing topic route may not have enough information to render the module, even though the Course itself is durable and My Courses can reopen the course by ID.

## 12. Dashboard/My Courses Integration

- `GET /api/courses/enrollments/my` is the durable My Courses source.
- My Courses links to `/course-generated/:courseId`.
- Profile aggregation reads Courses, Roadmaps, Evaluations, Enrollments and SkillProfile.
- Dashboard/home reads profile API data for counts, recent courses, roadmap and evaluations.
- Recent-course browser storage remains a UI convenience, not the persisted source.
- `apps/web/app/(app)/course/[slug]/page.tsx` still uses `mockCourses` and `mockJourneys`, so that route is not the durable generated-course detail route.

## 13. Browser Storage Usage

| Storage | Key/pattern | Purpose | Source of truth? | Temporary? |
|---|---|---|---|---|
| localStorage | `generatedCourse` | Fallback/generated-course navigation cache | No; API is attempted first | Yes |
| localStorage | `module_<number>` | Module navigation payload | No; UI handoff | Yes, legacy shape |
| localStorage | `completedTopics` | Local completion cache | No; progress API is authoritative | Yes |
| localStorage | `savedCourses` | Legacy course cache | No | Yes/legacy |
| sessionStorage | assessment keys | Test setup/result handoff | No; persisted evaluation is authoritative | Yes |
| localStorage | `recent_courses` | Recently viewed UI list | No | Yes |

Authentication token storage is not present in active source after Phase 2.

## 14. Data Contract Audit

| Concern | Finding |
|---|---|
| `courseModules` vs `courseModuleCount` | Phase 3 canonicalized count handling with `courseModuleCount`; legacy numeric/array `courseModules` remains compatibility input. |
| IDs | Mongo Course IDs are ObjectIds; generated v2 also creates a temporary `course_<timestamp>...` ID before persistence. The persisted Course ID is the durable one. |
| `completedModules` | Course and enrollment use number arrays; the topic flow also uses topic IDs/numbers in local cache. |
| CourseGeneration | Structured module shape is narrower than Course module shape; no current records were found in the inspected database. |
| API response shape | Course save uses `{ success, courseId, data }`; course get uses `{ success, data }`; v2 uses `{ success, course, persisted, meta }`; simple Gemini route returns `{ courseName, curriculum, generationId }`. |
| Enrollment | Idempotency is application-level matching, not a unique database index; concurrent duplicate requests remain a theoretical race. |
| Validation | Next route lacks the same structured server-side input validation as Express v2. Generated course validation is richer in v2 than in the Next route. |

## 15. Error Handling

| Failure | Current behavior | User experience | Persisted partial data? |
|---|---|---|---|
| Invalid wizard input | Client blocks most incomplete answers; Next route has limited validation | Inline wizard error or route error | No direct Next persistence |
| Unauthorized save | Express save returns 401 | Wizard catches save failure and can still show local fallback | No Course from failed save |
| AI timeout | Next route has 180-second client timeout; provider/route catch returns error or fallback | Error or fallback course | Usually no Next route DB write |
| AI rate/provider failure | Next route can construct fallback; v2 constructs deterministic fallback; simple Gemini returns 500 | May appear successful with lower-quality fallback | v2 may persist fallback Course |
| Malformed JSON | Next uses `jsonrepair`; v2 service parsers throw and module expansion falls back | Fallback or error depending path | Path-dependent |
| Database failure | Save endpoints return error; frontend progress/save handles failure | Error/alert in current modified flow | No false success for those writes; v2 persistence warning can still return generation success |
| Duplicate request | Save supports client request ID in some callers; enrollment is idempotent by matching | Existing record returned in enrollment | Duplicate Course still possible without request ID |
| Network failure | Wizard catches save and stores local cache; roadmap/course UI has mixed fallback behavior | Can look usable without durable save | Browser cache may remain unsynchronized |
| Refresh during generation | React generation state is lost; no resumable generation record in Next path | User must restart | No durable generation checkpoint |

## 16. Performance and AI Cost Considerations

**Next path:** One streamed OpenRouter generation call, followed by per-module video intelligence work and deterministic resource construction. The exact number of external video calls depends on `getBestVideo` implementation and module count. A parse failure still performs the upstream call before fallback construction.

**Express simple path:** One Gemini generation call and one `CourseGeneration` write.

**Express v2 path:**

- One title-generation call.
- Embedding calls for curriculum similarity, depending on embedding configuration.
- Possible duplicate-title regeneration calls.
- One sequential module-expansion call per module.
- Optional enrichment queue and worker activity.
- CourseGeneration and Course writes.

The v2 path has the highest latency and AI-call multiplication because module expansion is sequential and duplicate regeneration is conditional. Exact monetary cost cannot be calculated from the repository because provider pricing, token usage and runtime quotas are not fixed here.

## 17. Security Findings

- Current Next `/api/generate-course` has no explicit authentication middleware; it can generate content without a server-resolved user session.
- The subsequent save endpoint is authenticated, so anonymous generated output may fail to persist and fall back to browser storage.
- Express generation routes now require authentication after Phase 3.
- Course retrieval and progress are ownership-scoped in the active API.
- User-supplied title/topic/answers are interpolated into AI prompts; prompt injection and oversized input handling require product/security decisions.
- Generated URLs and resource links are stored/rendered as data; URL allowlisting and safe rendering policy are not centralized.
- The Next route generates search/resource URLs and video metadata from model/user-derived content.
- Fallback content and AI output are not governed by one shared Course validator across all implementations.
- The v2 route catches persistence failure and can return generated content without durable ownership confirmation.
- Duplicate Course creation remains possible when the wizard saves and the detail page saves again without the same idempotency key.
- No evidence was found that external clients cannot call legacy endpoints outside the active web app.

## 18. Duplicate Implementations

### Next route vs Express v2

- Difference: Next route produces one rich response with resource/video enrichment; v2 uses a modular multi-call orchestrator and optional queue.
- Evidence: `apps/web/app/api/generate-course/route.ts` versus `apps/api/services/generationOrchestrator.ts` and `apps/api/routes/course-generation-v2.js`.
- Risk: different prompts, models, schemas, fallback behavior, persistence timing and costs.

### Next route vs Express simple route

- Difference: OpenRouter structured JSON versus Gemini raw curriculum text.
- Evidence: Next OpenRouter SDK code versus `apps/api/routes/courses.js` `/generate`.
- Risk: generic API client can expose behavior inconsistent with the active wizard.

### Course schema vs generation schema

- Difference: `CourseGeneration` stores raw curriculum and narrow module summaries; `Course` stores normalized rich modules.
- Risk: generation history may not reconstruct the same course rendered by the frontend.

### Active frontend vs legacy frontend

- Difference: `apps/web` is the active unified Next app; `frontend/course-generation` contains historical compiled Next artifacts and separate dependency assumptions.
- Risk: legacy links or external deployments may still call old routes and storage conventions.

### Rendering paths

- `course-generated/[id]` reads durable generated Courses.
- `course/[slug]` reads `mockCourses` and is a separate/mock-oriented detail path.
- Risk: users can see different behavior depending on navigation path.

## 19. Active vs Legacy Components

| Component | Classification | Evidence |
|---|---|---|
| `apps/web/app/(app)/generate/[topic]/page.tsx` | Active | Directly calls `/api/generate-course` in source |
| `apps/web/app/api/generate-course/route.ts` | Active | Direct caller target of current wizard |
| `apps/api/routes/courses.js` `/generate-questions` | Active support path | Current wizard requests it |
| `apps/api/routes/courses.js` `/generate` | Partially active/unknown | Exposed by generic `lib/api.ts`; no active wizard reference found |
| `apps/api/routes/course-generation-v2.js` | Partially active/unknown | Mounted in server and fully implemented; no active web caller found |
| `apps/api/services/generationOrchestrator.ts` and related services | Active only through v2 | Imported by v2 route; not current wizard path |
| `frontend/course-generation` | Legacy/unknown external dependency | Historical separate app and compiled artifacts remain |
| `apps/web/app/(app)/course-generated/[id]` | Active generated-course renderer | Fetches `/courses/:id` and manual save/enrollment flow |
| `apps/web/app/(app)/course/[slug]` | Legacy/mock-oriented path | Imports `mockCourses` and `mockJourneys` |

## 20. What Is Working Correctly

- Current wizard-to-Next-route call chain is identifiable and builds successfully.
- Next route has JSON repair, streaming collection, deterministic resource helpers and video enrichment integration.
- Express v2 has a clear modular service boundary, title validation, module sanitation and Course/CourseGeneration persistence.
- MongoDB ownership and progress APIs are now tested by the Phase 3 journey.
- My Courses now consumes durable enrollment data and server course IDs.
- Course schema can represent rich module/resource variants.
- Existing course service tests cover schema validation, similarity, ranking and resource resolution.
- The active frontend production build passes.

## 21. What Needs Change

Discovery findings only; no changes were made in this phase.

- The current wizard, Express simple route and Express v2 route need an architectural ownership decision.
- Generation and persistence should not be split between a Next route and a later browser save without an explicit failure contract.
- CourseGeneration is not being populated by the active wizard path, despite being part of the planned model relationship.
- Course save/enrollment flow can create duplicate Course documents.
- Course detail navigation still has a mock course route separate from durable generated course rendering.
- A common Course output validator is not shared by all generation paths.
- Durable generation resumability/streaming/progress is not implemented for the active path.
- Legacy localStorage module handoff remains necessary for the current topic route shape.

## 22. What Should Be Preserved

- Phase 2 canonical cookie authentication and `req.user.id` ownership.
- Phase 3 Course/UserEnrollment progress contracts and ownership tests.
- MongoDB/Mongoose models and additive compatibility fields.
- `apps/web` wizard UX and current question endpoint unless product requirements change.
- Next route resource/video intelligence only if its behavior is intentionally retained and tested.
- v2 service-level separation, schema validation and semantic curriculum checks as candidate reusable components.
- Existing Course model rich module fields until a versioned contract is agreed.

## 23. Candidate Target Architectures

### Option A: Express canonical generator

```text
apps/web wizard
  -> Express course-generation route
  -> one orchestrator/provider path
  -> shared Course validator
  -> CourseGeneration + Course persistence
  -> durable Course ID response
```

Advantages: one backend auth/persistence boundary, simpler CORS/cookies, easier ownership and integration tests.

Disadvantages: requires moving or reproducing the Next route’s resource/video logic; migration risk for current response shape.

### Option B: Modular orchestrator as canonical service

```text
Express route
  -> input contract
  -> generation orchestrator
     -> title generation
     -> curriculum validation
     -> module expansion
     -> output validation
     -> persistence
     -> optional enrichment
```

Advantages: existing service separation, explicit stages, reusable validators and background-enrichment boundary.

Disadvantages: more provider calls, higher latency/cost, queue dependency uncertainty, and current fallback/persistence error semantics need decisions.

### Option C: Next.js server route as canonical generator

```text
apps/web wizard
  -> Next server route
  -> OpenRouter/resource/video pipeline
  -> Express persistence API
  -> Course ID
```

Advantages: least frontend migration; current wizard already works with this route.

Disadvantages: generation remains in a separate runtime boundary from Express; auth/persistence transaction remains split; server-side Next route must gain explicit ownership and shared validation.

No option is ranked here, per the task instructions.

## 24. Migration Considerations

- Preserve the current Course schema and response compatibility while selecting one generator.
- Establish whether generation output must be persisted atomically with CourseGeneration and Course.
- Decide how to handle already-created Courses without CourseGeneration records.
- Add golden fixtures for course JSON before moving prompts/providers.
- Preserve user ownership and existing Course IDs.
- Define idempotency across wizard save, course detail save and enrollment.
- Decide whether enrichment is synchronous, queued, or removed from the first response.
- Keep legacy routes during a measured compatibility period; do not delete them based solely on repository references.
- Decide how the module topic route should reconstruct durable module content without relying on localStorage.
- Avoid running real generation from discovery tests because it consumes provider quota and writes persistent data.

## 25. Test Results

| Test | Result | What it proves |
|---|---|---|
| `npm --prefix apps/web run build` | PASS | Current Next app compiles, type/lint checks pass and routes generate |
| `npm --prefix apps/api run test:services` | PASS with test defect | Supporting validators/similarity/ranking/resource resolver run; content-intelligence assertion incorrectly calls `.then` on a synchronous return |
| `POST /api/courses/generate` without auth | PASS: 401 | Express simple route is registered and protected |
| `POST /api/generate-course-v2` without auth | PASS: 401 | Express v2 route is registered and protected |
| `GET /api/health` | PASS: 200 | API is live and MongoDB reports connected |
| Read-only `inspect:phase3` inventory | PASS | Current Course/CourseGeneration/Enrollment counts and ownership/orphan observations |
| Live AI generation | NOT RUN | Would consume provider credits and create/return generated content; prohibited for this discovery run |
| Existing Phase 3 persistence journey | NOT RUN in this discovery phase | It creates persistent test records; prior Phase 3 run is documented separately |

## 26. Database Observations

Read-only inventory from the active configured MongoDB environment:

```text
Users:              34
Courses:            13
CourseGenerations:   0
Roadmaps:            2
Evaluations:         3
Enrollments:         4
SkillProfiles:        2
```

Ownership observations:

- Courses: 13 canonical ownership records, 0 legacy-only, 1 orphaned Course.
- CourseGenerations: 0 records observed.
- Enrollments: 4 canonical records, 0 legacy-only, 0 orphaned records.
- Duplicate enrollment keys observed: 0.
- The orphan Course is preserved and was not modified; it is classified as a recoverable/ambiguous prior test artifact.

**FACT:** The active database contains Course records but no CourseGeneration records. This is consistent with the current wizard persisting through `/api/courses/save` rather than the v2 generation path.

## 27. Open Questions

- Is `/api/courses/generate` still used by an external client or can it be compatibility-only?
- Is `/api/generate-course-v2` deployed or called outside this repository?
- Should the active Next route require an authenticated session before spending AI credits?
- Should generation, CourseGeneration creation, Course creation and enrollment be one user action or separate actions?
- Should a generated course automatically enroll the owner?
- Should the wizard’s first save and course-page save be one idempotent operation?
- Should CourseGeneration store the exact structured output rather than a raw curriculum string or module summary?
- Should the initial response contain full module content, or should module/lesson generation be lazy?
- Should enrichment be required for a Course to be considered complete?
- What is the supported behavior when AI succeeds but MongoDB persistence fails?
- Should deterministic fallback content be shown to users or only used for controlled development/testing?
- Should generated resources and video URLs be allowlisted or verified before persistence/display?
- Should Course and module versions be supported when a user regenerates content?
- Should generated Courses be private, shareable, or publicly discoverable?
- Should `/course/[slug]` be retired or converted to the durable Course ID route?
- How should a refreshed topic page reconstruct a module when the localStorage handoff is absent?
- What production/legacy clients still depend on the historical frontend course application?

## 28. Proposed Scope for Phase 4

This is a discovery-derived scope, not an implementation decision:

1. Select one generation contract and document compatibility behavior for the others.
2. Define a versioned request/response schema for topic, answers, difficulty, duration, modules and generated output.
3. Define atomic persistence semantics for CourseGeneration, Course and enrollment.
4. Reuse or consolidate the strongest output validation and resource/video enrichment components only after golden fixtures exist.
5. Define generation failure, fallback, retry, timeout, quota and persistence error semantics.
6. Remove durable reliance on localStorage module handoff after a server-backed module route or equivalent contract exists.
7. Add non-mutating unit tests and isolated integration fixtures before live AI tests.
8. Add idempotency coverage for generation/save/enrollment and ownership coverage for every generation output.
9. Decide whether background enrichment is part of the canonical Course lifecycle.

## Questions We Must Answer Before Implementation

1. Which of the three generation paths is contractually supported for external clients today?
2. Should the Next.js route, Express simple route, or Express v2 orchestrator be the selected implementation?
3. Must every successful generation create both CourseGeneration and Course immediately?
4. Should users be automatically enrolled when generation succeeds, or only after an explicit save/enroll action?
5. Should generation return immediately with a base Course or wait for resources/video enrichment?
6. Should module lessons be generated in the initial request or through a lazy persisted workflow?
7. What output schema is authoritative for Course, module, lesson, resources, assessment and final project fields?
8. What is the expected behavior when AI output is malformed or a provider fails: retry, deterministic fallback, or user-visible failure?
9. Should deterministic fallback content be allowed in production?
10. Should AI-generated resource URLs be validated before persistence and display?
11. Should users be able to regenerate a single module, and if so, does that create a Course version?
12. Should users be able to edit generated courses?
13. Should generated courses be private, shareable, or public?
14. What is the supported legacy frontend/deployment compatibility window?
15. What exact route should durable module content use after browser refresh without localStorage?
16. What idempotency key should represent one generation/save intent across retries and page transitions?
17. Is Redis/BullMQ available and supported in production for enrichment?
18. What latency and provider-cost budget should constrain the number of AI calls per course?

## Final Status

```text
PHASE 4 DISCOVERY STATUS

Code modified: NO
Database modified: NO
Production behavior changed: NO

Course Generator implementations found: 3 primary + legacy artifacts
Active implementations: 1 user-facing, 1 partially active/unknown, 1 registered modular path
Legacy implementations: 1 legacy frontend family + mock-oriented rendering path
Unknown implementations: external use of legacy/Express routes

Frontend flow traced: YES
Backend flow traced: YES
AI flow traced: YES
Persistence flow traced: YES
Enrollment flow traced: YES
Progress flow traced: YES
Dashboard flow traced: YES
Browser storage audited: YES
Data contracts audited: YES
Security audited: YES
Existing tests executed: YES

Ready for Phase 4 implementation: ONLY AFTER QUESTIONS ARE ANSWERED
```

No Phase 4 implementation was started.
