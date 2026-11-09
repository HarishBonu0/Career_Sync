import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireMongo } from '../middleware/mongoCheck.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { ResumeIntelligence } from '../models/ResumeIntelligence.js';
import { syncResumeToSkillProfile } from '../services/skillIntelligenceService.js';

const router = express.Router();

function extractJsonObject(text) {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

// Helper to verify that evidence exists in the source text
function verifyEvidence(factArray, resumeText) {
  if (!Array.isArray(factArray)) return [];
  const normalizedResumeText = resumeText.toLowerCase().replace(/\s+/g, ' ');
  
  return factArray.map(fact => {
    if (fact.evidence && Array.isArray(fact.evidence)) {
      fact.evidence = fact.evidence.filter(ev => {
        if (!ev.supportingText) return false;
        const normalizedEvidence = ev.supportingText.toLowerCase().replace(/\s+/g, ' ');
        // We do a loose includes check. If the LLM heavily hallucinated the exact string, we drop it.
        return normalizedResumeText.includes(normalizedEvidence);
      });
    }
    return fact;
  }).filter(fact => {
    // If a fact (like a skill) has no verifiable evidence, we might still keep it if it's not strictly required to have evidence,
    // but the safest design is to drop facts that completely failed evidence verification.
    // We will keep them for now but with empty evidence, EXCEPT for skills which must have evidence.
    if (fact.name && (!fact.evidence || fact.evidence.length === 0)) return false;
    return true;
  });
}

router.post(
  '/parse',
  authenticate,
  requireMongo,
  body('resumeText').isString().isLength({ max: 80000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { resumeText, resumeTextOriginalLength, resumeTextTruncated } = req.body;
      const userObjectId = req.user.id;

      if (!resumeText || resumeText.trim().length < 50) {
        return res.status(400).json({
          extractionStatus: 'failed',
          extractionReason: 'Resume text is empty or too short to analyze.',
        });
      }

      // Hash resume to detect if it's already processed
      const resumeHash = crypto.createHash('sha256').update(resumeText).digest('hex');

      // Check if we already have this resume processed or currently processing
      let intelligenceDoc = await ResumeIntelligence.findOne({ user: userObjectId, resumeHash });
      
      if (intelligenceDoc) {
        if (['success', 'partial', 'processing'].includes(intelligenceDoc.extractionStatus)) {
          return res.status(200).json(intelligenceDoc);
        }
      }

      // Create new processing document
      intelligenceDoc = new ResumeIntelligence({
        user: userObjectId,
        resumeHash,
        extractionStatus: 'processing',
        textTruncated: resumeTextTruncated || false,
        originalTextLength: resumeTextOriginalLength || resumeText.length,
        processedTextLength: resumeText.length
      });
      await intelligenceDoc.save();

      // Return 202 Accepted early to avoid blocking the frontend
      res.status(202).json(intelligenceDoc);

      // --- ASYNCHRONOUS PROCESSING ---
      (async () => {
        try {
          if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured.');
          }

          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            }
          });

          const prompt = `
You are a highly conservative resume intelligence engine. 
Your goal is to extract facts from the provided resume text.

CRITICAL RULES:
1. ONLY extract information EXPLICITLY present in the text.
2. DO NOT hallucinate, infer, or guess missing information (e.g., do not infer skills from job titles, do not invent dates).
3. Distinguish between 'explicit', 'normalized', and 'derived' facts. If unsure, use 'unknown'.
4. For every extracted skill, experience, or project, provide the exact 'supportingText' from the resume as evidence.
5. If the resume text is garbage, empty, or unreadable, set extractionStatus to 'failed' and provide a reason.
6. Preserve original dates, do not fabricate exact dates if only years are given.

Return ONLY a valid JSON object matching this schema exactly:
{
  "extractionStatus": "success" | "partial" | "failed",
  "extractionReason": "Reason for status",
  "summary": "Extracted summary if any",
  "skills": [
    {
      "name": "Original skill name",
      "normalizedName": "Normalized skill name",
      "factType": "explicit" | "normalized" | "derived" | "unknown",
      "evidence": [{ "type": "resume", "section": "Skills", "supportingText": "Exact text snippet" }]
    }
  ],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "startDate": "Start date",
      "endDate": "End date",
      "isCurrent": true/false,
      "description": "Job description",
      "technologies": ["Tech 1", "Tech 2"],
      "evidence": [{ "type": "resume", "section": "Experience", "supportingText": "Exact text snippet" }]
    }
  ],
  "projects": [
    {
      "title": "Project title",
      "description": "Project description",
      "technologies": ["Tech 1"],
      "startDate": "Start date",
      "endDate": "End date",
      "evidence": [{ "type": "resume", "section": "Projects", "supportingText": "Exact text snippet" }]
    }
  ],
  "certifications": [
    {
      "name": "Cert name",
      "issuer": "Issuer",
      "date": "Date",
      "evidence": [{ "type": "resume", "section": "Certifications", "supportingText": "Exact text snippet" }]
    }
  ],
  "education": [
    {
      "institution": "School",
      "degree": "Degree",
      "fieldOfStudy": "Field",
      "startDate": "Start date",
      "endDate": "End date",
      "expectedGraduation": true/false,
      "evidence": [{ "type": "resume", "section": "Education", "supportingText": "Exact text snippet" }]
    }
  ],
  "links": [
    {
      "name": "Link name (e.g. GitHub)",
      "url": "URL",
      "evidence": [{ "type": "resume", "section": "Links", "supportingText": "Exact text snippet" }]
    }
  ]
}

Resume Text:
"""
${resumeText}
"""
`;

          const result = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Resume extraction timeout')), 45000))
          ]);

          const text = result.response.text();
          const parsed = extractJsonObject(text);

          if (!parsed || !parsed.extractionStatus) {
            throw new Error('Failed to parse AI response into structured schema.');
          }

          // Verify evidence
          intelligenceDoc.extractionStatus = parsed.extractionStatus;
          intelligenceDoc.extractionReason = parsed.extractionReason || '';
          intelligenceDoc.summary = parsed.summary || '';
          intelligenceDoc.skills = verifyEvidence(parsed.skills, resumeText);
          intelligenceDoc.experience = verifyEvidence(parsed.experience, resumeText);
          intelligenceDoc.projects = verifyEvidence(parsed.projects, resumeText);
          intelligenceDoc.certifications = verifyEvidence(parsed.certifications, resumeText);
          intelligenceDoc.education = verifyEvidence(parsed.education, resumeText);
          intelligenceDoc.links = verifyEvidence(parsed.links, resumeText);

          // Ensure failed status if verification wiped out everything
          if (intelligenceDoc.skills.length === 0 && intelligenceDoc.experience.length === 0 && intelligenceDoc.education.length === 0) {
             intelligenceDoc.extractionStatus = 'failed';
             intelligenceDoc.extractionReason = 'LLM extraction produced no verifiable facts.';
          }

          await intelligenceDoc.save();

          // Phase 5B: Synchronize successfully extracted facts to the user's SkillProfile
          if (intelligenceDoc.extractionStatus === 'success' || intelligenceDoc.extractionStatus === 'partial') {
            await syncResumeToSkillProfile(userObjectId, resumeHash).catch(err => {
              console.error('Failed to sync SkillProfile from ResumeIntelligence:', err);
            });
          }

        } catch (bgError) {
          console.error('Async Resume Parse Error:', bgError);
          intelligenceDoc.extractionStatus = 'failed';
          intelligenceDoc.extractionReason = bgError.message;
          await intelligenceDoc.save();
        }
      })();

    } catch (error) {
      console.error('Resume Parse Init Error:', error);
      res.status(500).json({ 
        error: 'Failed to initiate resume parsing', 
        message: process.env.NODE_ENV === 'production' ? 'An internal error occurred.' : error.message 
      });
    }
  }
);

// Add an endpoint to poll status
router.get(
  '/status/:hash',
  authenticate,
  requireMongo,
  async (req, res) => {
    try {
      const { hash } = req.params;
      const doc = await ResumeIntelligence.findOne({ user: req.user.id, resumeHash: hash });
      if (!doc) {
         return res.status(404).json({ error: 'Not found' });
      }
      res.json(doc);
    } catch (e) {
      console.error('Resume Status Error:', e);
      res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'An internal error occurred.' : e.message });
    }
  }
);

export default router;
