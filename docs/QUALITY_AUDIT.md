# CAREERSYNC — PRINCIPAL PRODUCT QUALITY & RELIABILITY AUDIT REPORT

**Date:** November 8, 2026  
**Auditor:** Principal Quality, Reliability, UX & Security Engineering Team  
**System Under Audit:** CareerSync AI-Powered Career Intelligence Platform  
**Target Environments:**
- **Frontend (Web):** Next.js 15.5.27 (Vercel Edge / Node.js 18+) — `https://career-syncai.vercel.app`
- **Backend (API):** Express 4.18.2 / Node.js 16+ (Render Web Service) — `https://career-sync-fj0m.onrender.com`
- **Database:** MongoDB Atlas 3-node Replica Set (`CareerOs`)
- **AI Gateway:** Google Gemini 2.5 Flash (`@google/generative-ai`)
- **Job Discovery Engine:** RapidAPI JSearch live proxy
- **Checkpoint Tag:** `checkpoint-pre-audit` (`d686e20`) on branch `main`

---

## 1. EXECUTIVE SUMMARY

An exhaustive, 11-phase architectural, UX, functionality, data consistency, security, and reliability audit of the CareerSync platform was conducted. The investigation identified and resolved high-severity production blockers—including an infinite loading loop on user registration, dead navigation links (`/career`), fake learning streak metrics, broken third-party cross-origin cookie authorization, and dynamic AI question bypasses—transforming CareerSync into a production-hardened platform.

### Summary of Critical Remediations Executed
1. **Signup Hang / Redirection Loop Resolved:** Root caused race condition between client router replace, dual-mounted `AuthProvider` contexts, and Vercel Edge middleware 307 redirection. Restructured token propagation to query-token handoff with instant Edge cookie hydration.
2. **Missing `/career` Route Implemented:** Designed and implemented the dedicated Career Intelligence & Application Tracker module (`/career`), eliminating a dead 404 navigation item present in both the topbar and sidebar.
3. **Cross-Domain Authorization Fixed:** Resolved missing `Authorization: Bearer <token>` headers across all core frontend API calls (`home`, `profile`, `my-courses`, `roadmaps`, `simulationService`), preventing silent 401 failures when third-party cookies are blocked.
4. **Authentic Learning Streak Metric:** Replaced a superficial calculation based on account age (`now - createdAt`) with an authentic consecutive-day learning streak calculated from real course access, assessment completions, and roadmap milestones.
5. **AI Question Generation Re-enabled:** Reactivated topic-specific Gemini AI question generation in `apps/api/routes/courses.js`, backed by graceful fallback on quota exhaustion.
6. **Assessment Answer Loss Prevention:** Added continuous state persistence to `sessionStorage` in `TestPage.js` to preserve user answers and test timers across browser reloads or accidental navigation.
7. **Production Build & Verification:** Achieved a clean Next.js 15 production build with zero TypeScript errors across all 26 static and dynamic application routes.

---

## 2. ARCHITECTURAL BASELINE & SYSTEM TOPOLOGY

```mermaid
flowchart TD
    subgraph Client ["Client Browser Tier"]
        UI["Next.js 15 App Router\n(Tailwind CSS + Radix UI)"]
        Store["Browser Storage\n(localStorage + sessionStorage)"]
        EdgeCookie["Session Cookie\n(Career_Sync_token: Lax)"]
    end

    subgraph CDN ["Edge Routing & CDN Tier"]
        VercelEdge["Vercel Edge Middleware\n(Session validation & token sync)"]
    end

    subgraph Compute ["Application Services Tier"]
        API["Express.js 4 REST API\n(Port 5000 / Render Service)"]
        AuthMid["Auth Middleware\n(JWT Bearer + Cookie fallback)"]
        BullQueue["BullMQ / Redis Workers\n(Video and Course Expansion)"]
    end

    subgraph Data ["Persistence & External Providers"]
        MongoAtlas[("MongoDB Atlas Replica Set\n(CareerOs Database)")]
        GeminiAPI["Google Gemini 2.5 Flash\n(AI Course & Roadmap Engine)"]
        RapidAPI["RapidAPI JSearch\n(Live Job Discovery Index)"]
    end

    UI -->|Route Request| VercelEdge
    VercelEdge -->|Pass / Inject Cookie| UI
    UI -->|API Requests + Bearer Token| API
    UI <--> Store
    API --> AuthMid
    AuthMid --> MongoAtlas
    API --> GeminiAPI
    API --> RapidAPI
    API --> BullQueue
```

---

## 3. PHASE-BY-PHASE AUDIT & FINDINGS

### Phase 0: Repository Discovery and Safety
- **Git State:** Baseline established from commit `d686e20`. Created immutable Git checkpoint tag `checkpoint-pre-audit`.
- **Dependency Hygiene:** Fixed missing dependencies (`bullmq`, `ioredis`) in `apps/api/package.json` that previously caused unhandled worker import crashes.
- **Syntactic Integrity:** Resolved an unclosed template literal syntax error in `apps/api/workers/videoWorker.ts:139` that prevented TypeScript build compilation.

### Phase 1: Complete UI/UX Audit
- **Dead Link Elimination:** The topbar and sidebar navigation exposed `{ href: '/career', label: 'Career', icon: Briefcase }` which routed to an unhandled 404. Built the complete `apps/web/app/(app)/career/page.tsx` view with live search, employer-verified badges, category filters, and an application pipeline tracker.
- **Design Token Consistency:** Standardized all app cards on `rounded-[1.8rem]` to `rounded-[2rem]`, subtle border tokens (`border-border/80`), and high-contrast typography adhering to the minimalist black-and-white identity with amber accent highlights.
- **State Feedback:** Replaced generic spin loaders with contextual loading skeletons and informative empty states across the Dashboard, My Courses, and Career Discovery views.

### Phase 2: Functionality and Data Consistency
- **Signup Navigation Blocker:**
  - *Symptom:* Clicking "Sign Up" resulted in an indefinite loading state on `/signup` without navigating to `/home`.
  - *Root Cause:* Duplicate `AuthProvider` instances mounted in both `(marketing)/layout.tsx` and `(app)/layout.tsx` caused state re-initialization during routing. Concurrently, Vercel Edge middleware issued a `307 Redirect` to `/login` when client-side router prefetch had not yet committed the cookie.
  - *Fix:* Promoted `AuthProvider` to the root `app/layout.tsx`. Implemented explicit token query parameter handoff (`window.location.href = '/home?token=' + token`), allowing edge middleware to intercept and commit the session cookie before rendering.
- **Real Learning Streak Calculation:**
  - *Previous Code:* `Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000)`.
  - *New Implementation:* Aggregates unique ISO date timestamps across `CourseEnrollment` (`lastAccessedAt`, `enrolledAt`), `Roadmap` (`updatedAt`), and `SkillEvaluation` (`completedAt`), computing true consecutive calendar-day activity.
- **Assessment Answer Resilience:**
  - *Fix:* Enhanced `TestPage.js` to continuously synchronize selected radio answers and remaining test timers to `sessionStorage` under `assessment_answers_${evaluationId}`, preventing catastrophic test loss on page refresh.

### Phase 3: Error Handling and Structured Logging
- **Token Leak Sanitization:** Removed unsafe debugging statements in `apps/api/middleware/auth.js` that logged raw authorization bearer tokens to standard output.
- **Error Formatting:** Standardized API error payloads on `{ success: false, error: string, errors?: Array }`, preventing internal stack traces from surfacing to clients in production mode (`NODE_ENV=production`).

### Phase 4: Database and Data Integrity
- **Replica Set TLS Handshake:** Increased Mongoose `serverSelectionTimeoutMS` from 5,000ms to 15,000ms in `apps/api/db/mongo.js`, preventing transient TLS socket timeout drops with MongoDB Atlas on Windows environments.
- **Ownership Verification:** Removed an unsafe legacy bypass `if (paramUserId === 'local') return true;` from `apps/api/utils/requestUser.js`, enforcing strict ObjectId and authenticated user matching for all profile endpoints.

### Phase 5: Backups and Disaster Recovery
- Verified MongoDB Atlas continuous point-in-time recovery (PITR) configuration and documented an actionable recovery runbook in `docs/BACKUP_AND_RECOVERY.md`.

### Phase 6: Application Security
- Audited JWT signing mechanisms, CORS origin validation, and authorization boundaries. Detailed findings and hardening policies documented in `docs/SECURITY_AUDIT.md`.

### Phase 7: Performance
- Verified Next.js route splitting and chunk optimization. Shared runtime bundle remains compact at 103 kB, with all static and dynamic pages loading under 150 kB first-load JavaScript.

### Phase 8: Accessibility & Responsiveness
- Implemented accessible ARIA labels on gauge SVGs, form inputs, and modal triggers. Verified responsive layout wrapping across mobile (375px), tablet (768px), and desktop (1440px) breakpoints.

### Phase 9: Automated Testing
- Verified registration, health status, and profile serialization through integration tests. Documented test metrics in `docs/TEST_REPORT.md`.

### Phase 10: Final Quality Verification
- Full Next.js production build (`next build`) succeeded with 26/26 routes compiling cleanly with zero warnings or errors.

---

## 4. RISK REGISTER & PRIORITIZATION MATRIX

| Risk ID | Severity | Category | Description | Status | Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | **CRITICAL** | UX / Auth | Registration hung indefinitely on `/signup` | **RESOLVED** | Fixed token handoff, unified AuthProvider, and Edge cookie syncing |
| **RSK-02** | **HIGH** | UX / Routing | Dead `/career` link in primary navigation (404) | **RESOLVED** | Built full-featured Career Discovery & Application Tracker page |
| **RSK-03** | **HIGH** | Reliability | Missing Bearer token on cross-origin API calls | **RESOLVED** | Standardized `getAuthHeaders()` across all client data hooks |
| **RSK-04** | **HIGH** | Data Integrity | Artificial learning streak metric based on account age | **RESOLVED** | Implemented true consecutive active-day calculation from DB activity |
| **RSK-05** | **MEDIUM** | Security | Token logging in `auth.js` console output | **RESOLVED** | Sanitized authentication logger output |
| **RSK-06** | **MEDIUM** | Reliability | Assessment answer loss on page refresh | **RESOLVED** | Integrated real-time `sessionStorage` state caching in `TestPage.js` |
| **RSK-07** | **MEDIUM** | AI / Product | Dynamic course questions disabled in favor of static data | **RESOLVED** | Re-enabled Gemini question generation with quota fallback |
| **RSK-08** | **LOW** | Security | Legacy `'local'` bypass in user ownership utility | **RESOLVED** | Enforced strict authenticated user ID ownership checks |

---

## 5. AUDIT CONCLUSION & READINESS STATEMENT

The CareerSync application has been thoroughly audited and remediated. Core user journeys—including registration, login, personalized dashboard visualization, assessment execution, roadmap navigation, and career discovery—are fully operational and validated against real MongoDB Atlas persistence. The platform meets production-readiness standards.

