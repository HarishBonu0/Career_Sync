import mongoose from 'mongoose';
import { normalizeSkillName, syncResumeToSkillProfile } from '../services/skillIntelligenceService.js';
import { ResumeIntelligence } from '../models/ResumeIntelligence.js';
import SkillProfile from '../models/SkillProfile.js';

// Setup Mock Mongoose
const userId = new mongoose.Types.ObjectId();
const resumeHash = 'testhash123';
const resumeId = new mongoose.Types.ObjectId();

let mockResumeDoc = null;
let mockSkillProfile = null;

// Monkey-patch mongoose models for testing without DB
ResumeIntelligence.findOne = async () => mockResumeDoc;
SkillProfile.findOne = async () => mockSkillProfile;
SkillProfile.prototype.save = async function() {
  mockSkillProfile = this;
  return this;
};

async function runTests() {
  let passed = 0;
  let total = 0;
  
  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
    } else {
      passed++;
      console.log(`✅ PASS: ${message}`);
    }
  }

  console.log("--- Skill Normalization Tests ---");
  assert(normalizeSkillName("Python") === "Python", "TEST 1: Python -> Python");
  assert(normalizeSkillName("Python3") === "Python", "TEST 2: Python3 -> Python");
  assert(normalizeSkillName("Postgres") === "PostgreSQL", "TEST 3: Postgres -> PostgreSQL");
  assert(normalizeSkillName("React.js") === "React", "TEST 4: React.js -> React");
  assert(normalizeSkillName("JavaScript") === "JavaScript", "TEST 5: JavaScript -> JavaScript (not Java)");

  console.log("\n--- Pipeline Tests ---");

  // TEST 6: Generic Job Title (No Tech Evidence) -> No Invented Skills
  mockSkillProfile = null; // reset
  mockResumeDoc = {
    _id: resumeId,
    user: userId,
    resumeHash: resumeHash,
    extractionStatus: 'success',
    experience: [{ title: 'Software Engineer', technologies: [] }],
    skills: []
  };
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills.length === 0, "TEST 6: Software Engineer w/o tech creates no skills");

  // TEST 7: Project mentions Python
  mockSkillProfile = null;
  mockResumeDoc.projects = [{ title: 'ML Tool', technologies: ['Python'], evidence: [{ supportingText: 'Built with Python' }] }];
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills[0].name === 'Python' && mockSkillProfile.skills[0].evidence[0].sourceType === 'resume_project', "TEST 7: Project mentions Python -> source = project");

  // TEST 8: Employment mentions Postgres
  mockSkillProfile = null;
  mockResumeDoc.projects = [];
  mockResumeDoc.experience = [{ title: 'DBA', technologies: ['Postgres'], evidence: [{ supportingText: 'Managed Postgres' }] }];
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills[0].name === 'PostgreSQL' && mockSkillProfile.skills[0].evidence[0].sourceType === 'resume_experience', "TEST 8: Employment mentions Postgres -> experience & normalized");

  // TEST 9: Certification mentions AWS
  mockSkillProfile = null;
  mockResumeDoc.experience = [];
  mockResumeDoc.certifications = [{ name: 'AWS Certified', technologies: ['AWS'], evidence: [{ supportingText: 'AWS cert' }] }];
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills[0].name === 'AWS' && mockSkillProfile.skills[0].evidence[0].sourceType === 'resume_certification', "TEST 9: Certification mentions AWS -> source = certification");

  // TEST 10: Python appears in 3 sections
  mockSkillProfile = null;
  mockResumeDoc.certifications = [];
  mockResumeDoc.education = [];
  mockResumeDoc.skills = [{ name: 'Python', evidence: [{ section: 'Skills', supportingText: 'Python' }] }];
  mockResumeDoc.experience = [{ title: 'Dev', technologies: ['Python'], evidence: [{ supportingText: 'Used Python' }] }];
  mockResumeDoc.projects = [{ title: 'App', technologies: ['Python'], evidence: [{ supportingText: 'Python backend' }] }];
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills.length === 1 && mockSkillProfile.skills[0].evidence.length === 3, "TEST 10: Python in 3 sections -> 1 Skill, 3 Evidence Records");

  // TEST 11: No proficiency statement
  assert(mockSkillProfile.skills[0].proficiency === null, "TEST 11: No proficiency statement -> proficiency remains null");

  // TEST 12: Explicit proficiency retained
  mockSkillProfile = null;
  mockResumeDoc.skills = [{ name: 'Python - Advanced', factType: 'explicit', evidence: [{ section: 'Skills', supportingText: 'Python - Advanced' }] }];
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills[0].proficiency === 'advanced' && mockSkillProfile.skills[0].name === 'Python', "TEST 12: Python - Advanced -> Extracted proficiency 'advanced'");

  // TEST 13/14: Failed / Processing
  mockResumeDoc.extractionStatus = 'failed';
  try {
    await syncResumeToSkillProfile(userId, resumeHash);
    assert(false, "TEST 13: Failed resume intelligence should throw");
  } catch (e) {
    assert(true, "TEST 13: Failed resume intelligence throws error");
  }

  // TEST 15: Same ResumeIntelligence processed twice
  mockResumeDoc.skills = [{ name: 'Java', evidence: [{ section: 'Skills', supportingText: 'Java' }] }];
  mockResumeDoc.experience = [];
  mockResumeDoc.projects = [];
  mockResumeDoc.certifications = [];
  mockResumeDoc.extractionStatus = 'success';
  mockSkillProfile = null;
  await syncResumeToSkillProfile(userId, resumeHash);
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills.length === 1 && mockSkillProfile.skills[0].evidence.length === 1, "TEST 15: Same ResumeIntelligence processed twice -> NO duplicate skills/evidence");

  // TEST 17: Changed resume removes Python
  const newResumeId = new mongoose.Types.ObjectId();
  const newResumeHash = 'testhash456';
  const newMockResumeDoc = {
    _id: newResumeId,
    user: userId,
    resumeHash: newResumeHash,
    extractionStatus: 'success',
    skills: [{ name: 'Java', evidence: [{ section: 'Skills', supportingText: 'Java' }] }]
  };
  ResumeIntelligence.findOne = async (q) => {
    if (q.resumeHash === newResumeHash) return newMockResumeDoc;
    return null;
  };
  await syncResumeToSkillProfile(userId, newResumeHash);
  assert(mockSkillProfile.skills.find(s => s.name === 'Java') && !mockSkillProfile.skills.find(s => s.name === 'Python'), "TEST 17: New resume clears stale skills (Python removed, Java added)");

  // TEST 18: Semantic Inference - Full Stack Developer -> no inferred skills
  mockSkillProfile = null;
  mockResumeDoc.skills = [];
  mockResumeDoc.experience = [{ title: 'Full Stack Developer', description: 'Built a web application', technologies: [] }];
  mockResumeDoc.projects = [];
  mockResumeDoc.certifications = [];
  mockResumeDoc.extractionStatus = 'success';
  ResumeIntelligence.findOne = async () => mockResumeDoc;
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills.length === 0, "TEST 18: 'Full Stack Developer' & 'web application' -> No inferred skills (React/Node.js)");

  // TEST 19: Semantic Inference - Cloud Engineer -> no inferred skills
  mockSkillProfile = null;
  mockResumeDoc.experience = [{ title: 'Cloud Engineer', description: 'Managed cloud infrastructure', technologies: [] }];
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills.length === 0, "TEST 19: 'Cloud Engineer' -> No inferred skills (AWS/GCP/Azure)");

  // TEST 20: Semantic Inference - AWS Certified Developer without technologies extracted -> no AWS skill
  mockSkillProfile = null;
  mockResumeDoc.experience = [];
  mockResumeDoc.certifications = [{ name: 'AWS Certified Developer', technologies: [], evidence: [{ supportingText: 'AWS Certified Developer' }] }];
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills.length === 0, "TEST 20: 'AWS Certified Developer' without technologies -> No AWS skill inferred");

  // TEST 21: Partial status
  mockSkillProfile = null;
  mockResumeDoc.extractionStatus = 'partial';
  mockResumeDoc.skills = [{ name: 'Docker', evidence: [{ section: 'Skills', supportingText: 'Docker' }] }];
  mockResumeDoc.certifications = [];
  await syncResumeToSkillProfile(userId, resumeHash);
  assert(mockSkillProfile.skills.length === 1 && mockSkillProfile.skills[0].name === 'Docker', "TEST 21: Partial status -> Syncs trusted facts");

  console.log(`\nResults: ${passed}/${total} passed.`);
}

runTests();
