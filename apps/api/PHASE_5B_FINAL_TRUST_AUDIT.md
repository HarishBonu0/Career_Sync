# PHASE 5B — FINAL TRUST-BOUNDARY AUDIT

## Overview
A focused trust-boundary audit of the Phase 5B Skill Intelligence Foundation was performed to verify that Phase 5B is strictly deterministic and does not leak semantic extraction assumptions into the pipeline (which belong strictly to Phase 5A).

### Files Inspected
- `apps/api/models/SkillProfile.js`
- `apps/api/services/skillIntelligenceService.js`
- `apps/api/models/ResumeIntelligence.js`
- `apps/api/routes/resume.js`
- `apps/api/scripts/test-skill-intelligence.js`

### Files Changed
- `apps/api/scripts/test-skill-intelligence.js` (Added deterministic negative tests for semantic inference)

## Audit Results

### 1. Phase 5A → Phase 5B Trust Boundary [PASS]
Phase 5B purely consumes the arrays (`skills`, `experience`, `projects`, `education`, `certifications`) provided by `ResumeIntelligence` in Phase 5A. It iterates over the explicitly extracted `technologies` fields and does not parse arbitrary text (like "Built a web application") independently to extract new technologies.

### 2. Semantic Inference Tests [PASS]
Added and ran deterministic negative tests proving Phase 5B does NOT independently infer skills:
- **TEST 18**: 'Full Stack Developer' & 'Built a web application' → *0 inferred skills (No React, No Node.js)*
- **TEST 19**: 'Cloud Engineer' → *0 inferred skills (No AWS, GCP, or Azure)*
- **TEST 20**: 'AWS Certified Developer' without technologies explicitly extracted by 5A → *0 AWS skill inferred*

### 3. Evidence Source Verification [PASS]
For every `SkillProfile` evidence item, the `supportingText` is drawn directly from the corresponding `ResumeIntelligence` fact (`ev.supportingText` or the raw `description`/`title`). No new explanatory text (e.g., "Python was found in the resume") is invented. 

### 4. Fact Type Preservation [PASS]
Phase 5B explicitly preserves `factType` (explicit, normalized, derived) from Phase 5A directly into the `SkillProfile` evidence schema. It defaults to 'unknown' if missing, but it does not aggressively upgrade 'unknown' or 'derived' to 'explicit'.

### 5. Proficiency Trust Boundary [PASS]
Phase 5B only extracts an explicit proficiency if it is physically present in the skill string (e.g., "Python - Advanced" -> `advanced`). It does **not** count the frequency of the skill to invent a 5/5 score or an "expert" level. Frequency simply leads to multiple `evidence` blocks.

### 6. Experience Duration Trust Boundary [PASS]
Phase 5B does not inspect `startDate` or `endDate` to calculate "years of experience". Skill possession is treated as a boolean fact supported by evidence.

### 7. Normalization Audit [PASS]
Inspected `SKILL_NORMALIZATION_DICT`. It uses a rigid map containing explicit equivalencies.
- `ReactJS` → `React`
- `PostgreSQL` → `PostgreSQL`
- `JavaScript` ≠ `Java` (no overlap)
- Ambiguous rules are absent.

### 8. Partial / Failed / Processing States [PASS]
- **Processing/Failed**: Rejected by the synchronization script. Throws an error (Verified by TEST 13).
- **Partial**: Allowed. Only trusted facts that successfully made it into the `ResumeIntelligence` arrays are synced (Verified by TEST 21).

### 9. Resume Replacement Safety [PASS]
When a new resume is processed for a user, Phase 5B actively drops all old evidence where `source === 'resume'`, but securely leaves other sources untouched. It then rebuilds the profile entirely from the new `ResumeIntelligence` (Verified by TEST 17).

### 10. Cross-User Isolation [PASS]
The database queries strictly isolate by `user: userId` (the authenticated user). `SkillProfile.findOne({ user: userId })` prevents cross-user pollution.

### 11. Existing Skill Evaluation Compatibility [PASS]
The extension to `SkillProfile` is entirely additive (`canonicalName`, `proficiency`, `evidence`). Existing fields (`score`, `percentage`, `difficulty`) remain intact and default to `0`. Existing UI/eval consumers will continue to receive the skills array seamlessly.

## Final Conclusion
**Phase 5B deterministically transforms trusted ResumeIntelligence facts into normalized SkillProfile evidence and does not independently perform semantic skill extraction.** The trust boundary is highly secure.
