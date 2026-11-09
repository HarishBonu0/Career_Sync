# CAREERSYNC — FINAL PRODUCTION RELEASE CHECKLIST & DEPLOYMENT RUNBOOK

**Target Release:** Production v1.0.0-audited  
**Date:** November 8, 2026  
**Auditor:** Principal Product Quality Engineer & Release Manager  
**Target Environments:**
- **Web:** Vercel Production (`https://career-syncai.vercel.app`)
- **API:** Render Web Service (`https://career-sync-fj0m.onrender.com`)
- **Database:** MongoDB Atlas Replica Set (`CareerOs`)

---

## 1. GO / NO-GO DECISION GATE

| Gate Requirement | Verification Standard | Result | Decision |
| :--- | :--- | :--- | :--- |
| **No Blocker Defects** | Zero critical bugs in authentication, navigation, and persistence | **PASS** | **GO** |
| **Clean Next.js 15 Build**| `next build` generates 26/26 static/dynamic pages with 0 errors | **PASS** | **GO** |
| **API Health Validation** | `/api/health` reports status OK with MongoDB & Gemini configured | **PASS** | **GO** |
| **Data Consistency** | Real streak and stats computed from MongoDB Atlas persistence | **PASS** | **GO** |
| **Security Standards** | Passwords salted with bcrypt, tokens sanitized from logs, CORS locked | **PASS** | **GO** |
| **Navigation Integrity** | All routes (including `/career`) functional with 0 dead links | **PASS** | **GO** |

**OVERALL RELEASE STATUS: APPROVED FOR PRODUCTION DEPLOYMENT (GO)**

---

## 2. PRE-DEPLOYMENT VERIFICATION CHECKLIST

### Codebase & Build Hygiene
- [x] Immutable Git checkpoint tag `checkpoint-pre-audit` verified at commit `d686e20`.
- [x] TypeScript compiler passes with 0 errors (`tsc -p apps/web/tsconfig.json --noEmit`).
- [x] Production build passes cleanly (`next build` generates all static and dynamic bundles).
- [x] No plaintext credentials or private keys committed to repository tracking.

### Environment Variables Checklist (Render Backend)
Verify that the following variables are active in the Render Web Service settings:
- [x] `PORT=5000`
- [x] `NODE_ENV=production`
- [x] `MONGODB_URI=mongodb+srv://...` (Production MongoDB Atlas connection string)
- [x] `JWT_SECRET=...` (High-entropy secret string)
- [x] `GEMINI_API_KEY=...` (Google Gemini API key for course & roadmap generation)
- [x] `RAPIDAPI_KEY=...` (RapidAPI key for JSearch live job discovery)
- [x] `CORS_ORIGINS=https://career-syncai.vercel.app,http://localhost:3000`

### Environment Variables Checklist (Vercel Frontend)
Verify that the following variables are configured in the Vercel Project settings:
- [x] `NEXT_PUBLIC_API_URL=https://career-sync-fj0m.onrender.com/api`
- [x] `NEXT_PUBLIC_APP_URL=https://career-syncai.vercel.app`
- [x] `NODE_ENV=production`

---

## 3. POST-DEPLOYMENT SMOKE TEST RUNBOOK

Upon deploying the latest commit to `main`, execute the following smoke tests against the live production URLs:

1. **System Health Check:**
   - Execute: `GET https://career-sync-fj0m.onrender.com/api/health`
   - Expect: HTTP 200 with `{ "status": "OK", "environment": { "mongodbConfigured": true, ... } }`.
2. **User Registration & Instant Navigation:**
   - Visit: `https://career-syncai.vercel.app/signup`
   - Action: Register a new account (`test_release_<random>@careersync.test`).
   - Expect: Instant navigation to `/home` without spinner freeze or redirect loops.
3. **Career Discovery & Application Tracker:**
   - Visit: `https://career-syncai.vercel.app/career`
   - Action: Search for "Full Stack", toggle category filters, and bookmark a job.
   - Expect: Job appears immediately in "Application Tracker" tab.
4. **Assessment & Answer Resilience:**
   - Visit: `https://career-syncai.vercel.app/assessments`
   - Action: Select a skill, answer 2 questions, refresh the browser page.
   - Expect: Previously selected answers and timer remain preserved upon reload.
5. **Interactive Roadmap Mind Map:**
   - Visit: `https://career-syncai.vercel.app/roadmaps`
   - Action: Generate a pathway and verify that progress milestones save correctly.

---

## 4. ROLLBACK & DISASTER RECOVERY CONTINGENCY

If an unforeseen defect is detected post-release, follow this rollback procedure:

1. **Vercel Frontend Rollback:**
   - Go to [Vercel Dashboard](https://vercel.com) > Project `career-syncai` > **Deployments**.
   - Locate the previous stable deployment tagged before this release.
   - Click **Instant Rollback**. Vercel routes 100% of edge traffic to the previous deployment in under 5 seconds.
2. **Render Backend Rollback:**
   - Go to [Render Dashboard](https://dashboard.render.com) > Service `career-sync-api`.
   - Under **Deploys**, click on the previous stable commit.
   - Click **Rollback to this deploy**.
3. **Database Restore (If Corrupted):**
   - Follow the step-by-step Point-In-Time Restoration procedure documented in `docs/BACKUP_AND_RECOVERY.md`.

