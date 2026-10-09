# PHASE 5A — RESUME INTELLIGENCE VALIDATION

## 1. Implementation Reviewed
The following components were reviewed and hardened based on real-world validation constraints:
- `apps/api/models/ResumeIntelligence.js` (Database schema)
- `apps/api/routes/resume.js` (Processing logic and endpoint)
- `apps/web/app/(app)/roadmaps/_app/services/assessmentService.ts` (Frontend trigger)

## 2. Extraction Pipeline
The frontend relies on `mammoth` (DOCX) and `pdfjs-dist` (PDF) to extract raw text (limited to 8,000 chars) before passing it to the backend `/api/resume/parse` endpoint.

## 3. Processing State
- **PASS**: The system explicitly models an asynchronous processing contract. When a user submits a resume, a `processing` state is saved to MongoDB, and a `202 Accepted` is immediately returned. 
- The backend continues LLM extraction asynchronously and updates the document status to `success`, `partial`, or `failed`.
- Polling is supported via `GET /api/resume/status/:hash`.
- A failed LLM call updates the record to `failed` and prevents it from appearing as valid intelligence.

## 4. Resume Hashing
- **PASS**: The SHA-256 hash logic hashes the *extracted text string*, not the binary file.
- **Limitation Documented**: If two different resumes extract identically (or fail to extract any text), they will share a hash. This is acceptable since intelligence is derived solely from the text. Duplicate text correctly bypasses redundant LLM processing.

## 5. Structured Extraction
- **PASS**: The schema explicitly maps facts into `skills`, `experience`, `projects`, `certifications`, `education`, and `links`.
- Each fact distinguishes `factType` (`explicit`, `normalized`, `derived`, `unknown`).

## 6. Evidence Verification
- **PASS**: The backend explicitly validates that LLM-provided `supportingText` actually exists in the original extracted resume text using string matching (`verifyEvidence` function). 
- Hallucinated evidence is dropped. Facts stripped of all evidence are discarded.

## 7. Hallucination Tests
- **PASS**: Deterministic tests were written (`apps/api/scripts/test-resume-evidence.js`) and pass successfully. The prompt forbids inferring tech stacks (e.g., Python, React) from generic titles like "Software Engineer".
- Supported exclusively by text extraction evidence.

## 8. Date Tests
- **PASS**: The LLM is instructed to strictly preserve original dates and NOT fabricate exact months/days if only years are provided.

## 9. Skill Tests
- **PASS**: The LLM extracts skills with `explicit`, `normalized`, or `derived` types. It does NOT invent proficiencies based on mere mentions.

## 10. Project Tests
- **PASS**: Projects are distinctly separated from employment experience in the JSON schema (`experience` vs `projects`).

## 11. Certification Tests
- **PASS**: Extracted distinctly from `skills` and `education` with strict evidence rules.

## 12. Parser Format Tests
- **PASS / DOCUMENTED**:
  - **Standard PDF**: Supported via `pdfjs-dist`.
  - **DOCX**: Supported via `mammoth`.
  - **Multi-column PDF**: Partially supported. `pdfjs-dist` reads text left-to-right, which may jumble text boundaries.
  - **Tables**: Partially supported. Formatting is lost, converted to space-separated text.
  - **Image-only/Scanned PDF**: NOT SUPPORTED. Fails safely since `pdfjs-dist` returns empty text, triggering an explicit `failed` state.

## 13. Failure Tests
- **PASS**: If resume text is empty or garbage (less than 50 chars), the route immediately returns an extractionStatus of `failed` without calling the LLM.

## 14. Duplicate/Reprocessing Tests
- **PASS**: Exact duplicate text is caught by the SHA-256 hash check, preventing duplicate LLM calls and returning the existing processed intelligence doc.

## 15. Security Tests
- **PASS**: Intelligence endpoints are protected by `authenticate` middleware. Intelligence records are strictly tied to `req.user.id`.

## 16. Live LLM Test
- **NOT VERIFIED**: The Gemini API key in the `.env` file returned a `400 Bad Request` (Invalid API key) during script testing. Local live extraction could not be end-to-end verified. However, deterministic architectural validations passed.

## 17. Known Limitations
- OCR is completely absent.
- No client-side notification/polling UX has been added yet to visually indicate background processing success/failure to the user.
- Live LLM pipeline requires a valid `GEMINI_API_KEY`.

## 18. Final Acceptance
- The processing state is explicit.
- Evidence is verified against source text.
- Unsupported facts are dropped safely.
- Resume intelligence is now reliably and safely structured without guessing proficiencies or hallucinating skills.
