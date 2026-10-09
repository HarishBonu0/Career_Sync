import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mongoose Models
import { ResumeIntelligence } from '../models/ResumeIntelligence.js';
import SkillProfile from '../models/SkillProfile.js';
import SkillGapAnalysis from '../models/SkillGapAnalysis.js';
import SkillLearningPlan from '../models/SkillLearningPlan.js';
import SkillLearningResource from '../models/SkillLearningResource.js';
import Roadmap from '../models/Roadmap.js';

// Services
import { buildSkillProfile } from '../services/skillIntelligenceService.js';
import { analyzeSkillGap } from '../services/skillGapAnalysisService.js';
import { prioritizeSkillGaps } from '../services/skillGapPrioritizationService.js';
import { discoverResourcesForPlan } from '../services/learningResourceIntelligenceService.js';
import { generateRoadmap } from '../services/personalizedRoadmapService.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careeros';
const TEST_USER_A = new mongoose.Types.ObjectId().toString();
const TEST_USER_B = new mongoose.Types.ObjectId().toString();

const sampleResumeIntelligence = {
  user: TEST_USER_A,
  resumeHash: 'e2e-hash-12345',
  extractionStatus: 'success',
  skills: [
    { name: 'JavaScript', evidence: [{ supportingText: 'Built React apps with JavaScript', section: 'Experience' }] },
    { name: 'React', evidence: [{ supportingText: 'Frontend dev using React', section: 'Experience' }] }
  ],
  experience: [],
  education: [],
  projects: [],
  certifications: []
};

async function runE2E() {
  console.log('--- Phase 7: End-to-End Pipeline Validation ---');
  await mongoose.connect(MONGODB_URI);
  
  // Cleanup
  await ResumeIntelligence.deleteMany({ user: { $in: [TEST_USER_A, TEST_USER_B] } });
  await SkillProfile.deleteMany({ userId: { $in: [TEST_USER_A, TEST_USER_B] } });
  await SkillGapAnalysis.deleteMany({ userId: { $in: [TEST_USER_A, TEST_USER_B] } });
  await SkillLearningPlan.deleteMany({ userId: { $in: [TEST_USER_A, TEST_USER_B] } });
  await SkillLearningResource.deleteMany({ userId: { $in: [TEST_USER_A, TEST_USER_B] } });
  await Roadmap.deleteMany({ userId: { $in: [TEST_USER_A, TEST_USER_B] } });
  
  try {
    // 1. Create Resume Intelligence
    await ResumeIntelligence.create(sampleResumeIntelligence);
    console.log('✅ PASS: 1. Resume Intelligence exists.');

    // 2. Phase 5B: Skill Intelligence
    const skillProfile = await buildSkillProfile(TEST_USER_A, sampleResumeIntelligence.resumeHash);
    if (!skillProfile || skillProfile.skills.length === 0) throw new Error('SkillProfile failed');
    console.log('✅ PASS: 2. Phase 5B creates trusted SkillProfile.');

    // 3. Phase 5C: Skill Gap Analysis
    const TARGET_ROLE = 'frontend_developer';
    const gapAnalysis = await analyzeSkillGap(TEST_USER_A, TARGET_ROLE);
    if (!gapAnalysis || gapAnalysis.missingSkills.length === 0) throw new Error('SkillGapAnalysis failed');
    console.log('✅ PASS: 3. Phase 5C generates skill gap.');

    // 4. Phase 5D: Skill Gap Prioritization
    const prioritizedPlan = await prioritizeSkillGaps(TEST_USER_A, gapAnalysis._id);
    if (!prioritizedPlan || prioritizedPlan.learningSteps.length === 0) throw new Error('SkillGapPrioritization failed');
    console.log('✅ PASS: 4. Phase 5D prioritizes missing skills.');

    // 5. Phase 5E: Learning Resources
    const resources = await discoverResourcesForPlan(TEST_USER_A, prioritizedPlan._id);
    if (!resources) throw new Error('Learning resources discovery failed');
    console.log('✅ PASS: 5. Phase 5E retrieves/validates resources.');

    // 6. Phase 5F: Personalized Roadmap
    const roadmap = await generateRoadmap(TEST_USER_A, TARGET_ROLE);
    if (!roadmap || !roadmap.steps || roadmap.steps.length === 0) throw new Error('Personalized Roadmap failed');
    console.log('✅ PASS: 6. Phase 5F generates personalized roadmap.');

    // 7. Test Idempotency
    const roadmap2 = await generateRoadmap(TEST_USER_A, TARGET_ROLE);
    if (roadmap._id.toString() !== roadmap2._id.toString()) throw new Error('Idempotency failed');
    console.log('✅ PASS: 7. Idempotency test passed (repeated execution reused same Roadmap doc).');

    // 8. Test Isolation
    try {
      await generateRoadmap(TEST_USER_B, TARGET_ROLE);
      throw new Error('User B should not have roadmap generated without SkillProfile/Resume');
    } catch(err) {
      if (!err.message.includes('unavailable') && !err.message.includes('No valid learning plan') && !err.message.includes('No trusted SkillProfile found')) {
        console.error('Unexpected isolation error:', err);
      } else {
        console.log('✅ PASS: 8. Cross-user isolation passed (User B cannot access/trigger A).');
      }
    }

  } catch(e) {
    console.error('❌ FAIL:', e);
  } finally {
    await mongoose.disconnect();
    console.log('End-to-End tests finished.');
  }
}

runE2E();
