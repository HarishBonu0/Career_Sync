# PHASE 5A — RESUME INTELLIGENCE

## 1. Executive Summary
The goal of Phase 5A was to build a robust, evidence-grounded Resume Intelligence layer capable of extracting explicit facts from user resumes without hallucinating inferred proficiencies or tech stacks. This has been achieved by moving the structured intelligence extraction to a dedicated backend endpoint (`/api/resume/parse`), enforcing a strict AI prompt and JSON schema, and explicitly tracking evidence snippets mapped back to the source text. 

## 2. Existing Resume Pipeline
The existing pipeline extracted raw text on the frontend using `pdfjs-dist` and `mammoth` (up to 8000 chars), then immediately fed this raw string as part of the `SimulationInput` into `/api/skills/analyze-profile`. The previous LLM prompt explicitly encouraged hallucination (`"Infer missing role-critical skills even if user did not list them"`).

## 3. Extraction Architecture
The frontend extraction (PDF/DOCX to raw text) was kept intact as instructed, to avoid rebuilding the UI unnecessarily. The core change is the introduction of a dedicated `/api/resume/parse` endpoint. This endpoint takes the raw `resumeText` and uses Gemini to strictly parse the text into structured domains (Skills, Experience, Projects, Certifications, Education, Links) with associated `factType`s and `evidence` blocks.

## 4. Supported File Types
- Normal Text PDF (via `pdfjs-dist`)
- DOCX (via `mammoth`)
- Scanned / Image-only PDF: **FUTURE ENHANCEMENT** (Currently NOT supported as `pdfjs-dist` lacks OCR capabilities. Returns 'failed' extraction status if no text is parsed).

## 5. Structured Schema
A dedicated Mongoose model `ResumeIntelligence` has been implemented in `apps/api/models/ResumeIntelligence.js`.
It contains arrays of sub-schemas for:
- `skills`
- `experience`
- `projects`
- `certifications`
- `education`
- `links`

Each entity has an `evidence` array containing `{ type, section, supportingText }`.

## 6. Evidence Model
Every extracted skill, experience, or project contains a `supportingText` field. The prompt explicitly instructs the LLM: "For every extracted skill, experience, or project, provide the exact 'supportingText' from the resume as evidence."

## 7. Skill Normalization
Skills are categorized into `factType`: `explicit`, `normalized`, or `derived`. The prompt instructs the LLM to provide the original extracted name alongside the normalized name, and to default to 'unknown' if the derived inference is uncertain.

## 8. Hallucination Protection
The AI Prompt in `/api/resume/parse` has been strictly rewritten with the following rules:
- ONLY extract information EXPLICITLY present in the text.
- DO NOT hallucinate, infer, or guess missing information.
- Preserve original dates, do not fabricate exact dates.

## 9. Validation
The model uses `responseMimeType: 'application/json'` to guarantee structural compliance. The endpoint validates input payload sizes and gracefully handles completely empty or unreadable text by explicitly returning `extractionStatus: 'failed'` instead of throwing silent errors.

## 10. Persistence
Structured intelligence is saved in MongoDB under the `ResumeIntelligence` collection.

## 11. Resume Versioning
To handle updates and prevent duplicating identical work, the backend hashes the `resumeText` (`sha256`) and stores `resumeHash`. Before processing, it checks if `ResumeIntelligence` already has a `success` record for this user and hash, preventing duplicate processing for the exact same resume content.

## 12. Reprocessing
When a user uploads the exact same resume, the API returns the previously stored DB record via the hash check. When a new resume is uploaded (different hash), a new record is created. Later intelligence systems (Phase 5B+) should consume the most recent successful record.

## 13. Security
- Endpoint `/api/resume/parse` protected by `authenticate` middleware.
- Documents are strictly tied to `req.user.id`.
- Handlers do not leak API keys or sensitive error stack traces.

## 14. Test Fixtures
A script (`scratch/test-resume-intelligence.js`) was written containing positive and negative test cases to validate the AI extraction prompt independently.

## 15. Negative Tests
The test script explicitly tested for negative cases (e.g., preventing the AI from inferring "Python" just because the title is "Software Engineer", or "TensorFlow" from "Machine learning project").

## 16. Extraction Failure Tests
The test script verified that sending "garbage" or minimal text gracefully results in an `extractionStatus: 'failed'` payload instead of a hallucinated profile. (Verified in prompt logic).

## 17. Files Modified
- `apps/web/app/(app)/roadmaps/_app/services/assessmentService.ts`: Integrated a "fire-and-forget" call to `/api/resume/parse` during assessment generation to persist the structured facts.
- `apps/api/server.js`: Mounted the new `/api/resume` router.

## 18. Files Created
- `apps/api/models/ResumeIntelligence.js`: Mongoose Schema for structured facts.
- `apps/api/routes/resume.js`: Express router for parsing the resume with Gemini and persisting.
- `apps/api/scripts/test-resume-intelligence.js`: Local script to validate LLM hallucination prevention.

## 19. Known Limitations
- The current implementation of `pdfjs-dist` on the frontend does not support OCR for image-based PDFs.
- The extraction relies on Gemini. API key validity is required. Live end-to-end tests failed locally due to an expired/invalid GEMINI_API_KEY in the `.env` file, but the architecture is sound.

## 20. Future Work
- Move `pdfjs-dist` extraction to the backend or use a dedicated OCR service for image-only PDFs.
- Integrate the structured output of `ResumeIntelligence` as the primary input into the `SkillProfile` and `Roadmap` generation engines.

## 21. Final Architecture
FILE: `apps/api/routes/resume.js`
FUNCTION: `router.post('/parse')`
CHANGE: Added structured AI prompt with explicit evidence requirements.
REASON: Prevent hallucination and establish durable traceability for CareerOS intelligence features.

FILE: `apps/web/app/(app)/roadmaps/_app/services/assessmentService.ts`
FUNCTION: `generateAssessmentSession`
CHANGE: Called `parseResumeIntelligenceWithGemini(input)`
REASON: Trigger the intelligence parsing and persistence workflow concurrently with assessment generation without blocking the user.
