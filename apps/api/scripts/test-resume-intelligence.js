import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../apps/api/.env') });

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

async function testPrompt(resumeText, description) {
  console.log(`\n--- Running Test: ${description} ---`);
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
  ]
}

Resume Text:
"""
${resumeText}
"""
`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = extractJsonObject(result.response.text());
    console.log(JSON.stringify(parsed, null, 2));
  } catch(e) {
    console.error('Error:', e);
  }
}

async function runTests() {
  const negativeResume1 = `
John Doe
Software Engineer
Jan 2024 - Dec 2024
Built a web application.
`;

  await testPrompt(negativeResume1, "Negative Test: Inferring Tech Stack from 'Software Engineer' or 'web application'");

  const negativeResume2 = `
Jane Doe
Machine learning project
`;
  await testPrompt(negativeResume2, "Negative Test: Inferring ML frameworks without evidence");

  const partialResume = `
??? $$$ garbage %%%
`;
  await testPrompt(partialResume, "Extraction Failure: Garbage text");
}

runTests();
