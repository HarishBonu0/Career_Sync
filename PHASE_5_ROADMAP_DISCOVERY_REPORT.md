# PHASE 5 — ROADMAP DISCOVERY REPORT

## 1. Executive Summary
The CareerOS roadmap feature operates via a dual-mode system where the frontend actively simulates career pathways and dynamically generates AI roadmap steps via a proxy (`/api/roadmaps/ai-generate`). However, generated roadmaps are never persisted by the frontend UI, leaving the database collection (`Roadmap`) mostly unused. While the UI visually functions as a "Career Workspace" with jobs, insights, and a mind map, there is a fundamental disconnect between the frontend workflow and backend persistence logic. Phase 5 must connect these pieces to establish MongoDB as the durable source of truth.

## 2. Current Architecture
- **Frontend (`apps/web/app/(app)/roadmaps`)**: Acts as a comprehensive "Career Workspace" guiding the user through an assessment and displaying `SimulationResults` and `RoadmapMindMap`.
- **Backend Generator (`/api/roadmaps/generate`)**: Legacy or alternate endpoint that explicitly creates and saves a `Roadmap` document in MongoDB via Gemini 1.5, but is completely unused by the active frontend.
- **Backend AI Proxy (`/api/roadmaps/ai-generate`)**: A pass-through proxy used by the frontend to fetch AI-generated roadmap steps (Gemini 2.0 Flash) injected with `SkillProfile` context.

## 3. All Roadmap Implementations
1. **Frontend Simulation Generator** (`simulationService.ts`): Active. Uses JSearch API to fetch real job listings and dynamically requests AI steps via the `ai-generate` proxy. Does not save to MongoDB.
2. **Backend Persistence Generator** (`/api/roadmaps/generate`): Inactive. Generates roadmap and persists immediately in MongoDB, but not integrated into the frontend workflow.
3. **Manual Creation API** (`POST /api/roadmaps` and `/api/roadmaps/create`): API available for roadmap creation but unused by the frontend.

## 4. Active User Flow
1. User navigates to `/roadmaps` (`HomePage` component).
2. Fills out Current/Target role forms.
3. Takes an Assessment (`generateAssessmentSession`, `AssessmentPage`).
4. Answers are processed (`calculateAssessmentReport`).
5. Workspace is built (`CareerWorkspacePage`), generating pathways via JSearch and `ai-generate`.
6. Generated pathways are kept in memory (and `localStorage`).

## 5. Roadmap Data Model
The MongoDB `Roadmap` schema (`apps/api/models/Roadmap.js`) contains:
- `user`, `userId`, `userEmail` for ownership tracking.
- `currentRole`, `targetRole`, `timeline`, `roadmapText`.
- `title`, `description`, `stages`.
- `progress` (0-100) and `milestones` array.
- `status` ('draft', 'in-progress', 'completed').
- `metadata` (for unstructured data like `completedStages`).
The model is sufficient but is practically unused by the active UI.

## 6. API Inventory
- `POST /api/roadmaps` (and `/create`): Save/Create a roadmap. (Unused by FE)
- `POST /api/roadmaps/generate`: Generate and persist roadmap. (Unused by FE)
- `POST /api/roadmaps/ai-generate`: Generic Gemini proxy that returns text. (Active)
- `POST /api/roadmaps/jobs-search`: JSearch API proxy. (Active)
- `GET /api/roadmaps`: List authenticated user's roadmaps. (Active, but returns empty due to lack of saves)
- `GET /api/roadmaps/:id`: Get a roadmap by ID. (Active theoretically)
- `PUT /api/roadmaps/:id/progress`: Update progress state. (Unused by FE)

## 7. AI Providers/Prompts
- `/api/roadmaps/generate` uses `gemini-2.0-flash`.
- `/api/roadmaps/ai-generate` uses `gemini-2.0-flash`.
The prompts are highly structured, enforcing 4 specific stages: Foundation, Tools/Certifications, Projects, and Job Prep. They instruct the AI not to assume the role is software/IT.

## 8. SkillProfile Integration
`SkillProfile` integration exists on the backend. In `/api/roadmaps/ai-generate`, the server fetches the user's `SkillProfile` and appends their evaluated skills as context to the AI prompt:
`Persisted CareerOS skill profile for this authenticated user: [Skills]... Use this profile as authoritative context where relevant.`
This ensures roadmap steps factor in the user's known strengths.

## 9. Course Integration
Currently, the roadmap integrates with courses **conceptually** rather than via direct database relations. In `RoadmapMindMap.tsx`, subtopics are rendered with a "Learn now" button. Clicking this executes `openCourse(query)`, routing the user to `/generate/${encodeURIComponent(query)}`. This hands off the subtopic query to the Phase 4 Course Generator. No explicit `courseId` is stored in the roadmap document.

## 10. Persistence
Persistence is currently broken/inactive for the main workflow. Roadmaps generated in the Career Workspace remain in React state and `localStorage` (`Career Sync_saved_roadmaps`). The `/api/roadmaps/ai-generate` endpoint deliberately only returns text.

## 11. Progress
Progress functionality exists in the backend API (`PUT /api/roadmaps/:id/progress`), updating a `progress` integer and `metadata.completedStages`. However, because roadmaps aren't saved to MongoDB from the frontend, progress tracking is completely disconnected.

## 12. Resume
Resuming a roadmap does not work. The `/roadmaps` page fetches `savedRoadmaps`, but they are empty because they are never persisted. Any "Resume" functionality relying on MongoDB fails gracefully but leaves the user with an empty list.

## 13. Duplicate Behavior
The `generateRoadmapHandler` simply creates a new document unconditionally via `Roadmap.create()`. There is no logic to detect duplicates or version existing roadmaps. If a user runs it twice, two identical entries are made.

## 14. Browser Storage
- `Career Sync_saved_roadmaps`: TEMPORARY/LEGACY. Stores mock/cached pathways.
- `Career Sync_profile_data`: TEMPORARY/LEGACY. Stores mock assessment profile data.
Both should be phased out in favor of MongoDB as the durable source of truth.

## 15. Security
The endpoints in `apps/api/routes/roadmaps.js` are properly secured using the `authenticate` middleware. The `req.user.id` is explicitly used for creation (`user: req.user.id`) and `documentOwnedByUser` verifies ownership on reads, preventing IDOR.

## 16. Database State
*Note: Evaluated based on code inspection. No live DB connection was possible due to `.env` Atlas constraints.*
The `Roadmap` collection is likely very sparse or empty for real users, except for tests manually triggering `/api/roadmaps/generate`.

## 17. Tests
*(No explicit test files found for roadmap generation in the active search space)*

## 18. Legacy Systems
`simulationService.ts` contains large fallback structures (`generateFallbackRoadmap`) containing hardcoded roadmaps for various disciplines. It uses `localStorage` heavily to mimic persistence (`Career Sync_saved_roadmaps`).

## 19. Problems Found
1. **Frontend Disconnect**: The frontend generates brilliant insights and pathways but throws them away on page close.
2. **Duplicated AI Logic**: There are two backend endpoints using Gemini to generate roadmaps.
3. **No Progress Linkage**: A user cannot track progress on a roadmap milestone.

## 20. Target Architecture Candidates
**Candidate A: "Save As" Workflow**
- User runs Career Workspace.
- When they select a pathway they like, they click "Save Roadmap".
- Frontend calls `POST /api/roadmaps` to persist the chosen pathway to MongoDB.
- **Advantage**: Prevents DB bloat from unselected pathways.
- **Disadvantage**: Requires user action to persist.

**Candidate B: Auto-Persist**
- Career Workspace automatically saves generated pathways.
- **Advantage**: Seamless.
- **Disadvantage**: Will create multiple MongoDB documents (one for each of the 12 generated pathways in the simulation), polluting the DB.

## 21. Recommended Migration Strategy
Follow **Candidate A**. 
1. Maintain the current `simulationService.ts` dynamic generation.
2. Add a "Save Roadmap" CTA to the chosen pathway in `CareerWorkspacePage`.
3. Hook the CTA to the existing `roadmapService.ts` -> `createRoadmap` API.
4. Update `My Roadmaps` dashboard to list MongoDB-backed roadmaps.
5. Create a dedicated `Roadmap Viewer` page (`/roadmaps/[id]`) that loads from MongoDB and implements progress tracking.

## 22. Open Questions
- Should we prune the unused `/api/roadmaps/generate` endpoint since `ai-generate` is preferred?
- Should saving a roadmap automatically create a corresponding Course, or is the JIT (Just-in-Time) `/generate/[query]` handoff acceptable?
