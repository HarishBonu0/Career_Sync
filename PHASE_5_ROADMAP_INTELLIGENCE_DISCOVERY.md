# PHASE 5 — ROADMAP INTELLIGENCE DISCOVERY REPORT

## 1. Executive Summary
Currently, the CareerOS roadmap generation operates primarily as a "Prompt Wrapper" rather than a true Intelligence Engine. The platform successfully extracts text from user resumes (via `mammoth` and `pdfjs-dist`) and captures self-declared/assessed skills. However, these inputs are largely passed as raw text or simple appended strings to Gemini LLM prompts. To achieve a genuinely personalized, evidence-grounded CareerOS roadmap system, we must transition from raw-text prompting to structured extraction, verifiable evidence linking, and deterministic intelligence gathering.

## 2. Current Architecture & Data Flow
- **Resume Extraction**: The frontend (`SimulationForm.tsx`) extracts raw text from uploaded PDF/DOCX files. This text is temporarily stored in client state.
- **Skill Evaluation (`/api/skills/analyze-profile`)**: The backend takes the raw `resumeText` and passes it to Gemini with a basic JSON schema to extract `observedSkills` and `missingSkills`. There is no structured entity extraction (e.g., mapping a skill to a specific timeline or project).
- **Skill Profile Storage (`SkillProfile.js`)**: Tracks quiz performance (e.g., `score: 80`, `percentage: 80`). It does not track *where* the skill was acquired or the context of the evidence.
- **Roadmap Generation (`/api/roadmaps/ai-generate`)**: The frontend constructs a massive prompt containing the raw assessment report. The backend receives this prompt, blindly appends the user's numeric quiz scores (from `SkillProfile`), and forwards it to Gemini, returning unstructured markdown text.

## 3. Discovered Limitations
1. **Loss of Contextual Evidence**: Resume text is parsed into raw strings. Project context, tenure, chronological progression, and scope are lost when determining skill competency.
2. **LLM Over-Reliance**: The system relies on the LLM's zero-shot ability to parse up to 6000 characters of raw resume text and instantly output an accurate roadmap, rather than reasoning over a structured candidate profile.
3. **No Traceability**: When the AI suggests a roadmap step (e.g., "Learn React"), there is no programmatic link back to the user's existing evidence (e.g., "Recommended because you know vanilla JS but lack modern frontend frameworks").
4. **Shallow Persistence**: The `SkillProfile` only stores numeric quiz scores, lacking the rich context of a user's professional background.
5. **Client-Heavy Prompting**: The frontend orchestrates the roadmap logic by building the prompt in `simulationService.ts`. The backend acts merely as an API key proxy.

## 4. Architectural Recommendations for True Intelligence
To build an evidence-grounded roadmap system, we must introduce an **Intelligence Layer** that sits between data extraction and roadmap generation:

### A. Structured Evidence Extraction
Instead of passing raw `resumeText` to the generation prompt, we must first parse it into a structured schema (e.g., `ProfessionalExperience`, `Projects`, `Education`). This extracted structure should be stored in MongoDB so the backend can query it deterministically.

### B. Evidence-Backed Skill Graph
Enhance `SkillProfile` to link skills to evidence. A skill should not just have a `percentage`; it should have an `evidenceList` (e.g., `[{"type": "quiz", "score": 80}, {"type": "resume_project", "context": "Built a CRM"}]`). 

### C. Deterministic Gap Analysis
Before calling the LLM for roadmap generation, the backend should programmatically compare the user's enriched `SkillProfile` against known industry requirements for the `targetRole`. The LLM should only be used to *synthesize* the roadmap from this deterministic gap analysis, rather than performing the gap analysis entirely within its black box.

### D. Server-Side Roadmap Orchestration & Structured Outputs
Move away from raw Markdown generation in `ai-generate`. 
1. Move the prompt-building logic entirely to the backend.
2. Use the Gemini SDK's structured output capabilities to return structured JSON representing Roadmap Stages and Milestones.
3. The backend saves this structured roadmap to the `Roadmap` MongoDB collection, establishing it as the source of truth, and returns it to the frontend for rendering.

## 5. Next Steps for Implementation
1. **Schema Enhancements**: Update or create a `CandidateProfile` model to store structured resume data (Work History, Projects).
2. **Refactor `/analyze-profile`**: Upgrade this endpoint to extract structured entities (using Gemini's JSON mode) rather than just a flat list of observed skills.
3. **Refactor `/ai-generate`**: Transition from a proxy endpoint to a true backend service that builds the prompt using structured MongoDB data and returns structured roadmap nodes ready for persistence.
