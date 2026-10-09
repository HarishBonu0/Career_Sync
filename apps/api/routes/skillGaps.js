import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireMongo } from '../middleware/mongoCheck.js';
import SkillProfile from '../models/SkillProfile.js';
import { ResumeIntelligence } from '../models/ResumeIntelligence.js';
import SkillGapAnalysis from '../models/SkillGapAnalysis.js';
import { createAndPersistGapAnalysis } from '../services/skillGapAnalysisService.js';
import { createAndPersistLearningPlan } from '../services/skillGapPrioritizationService.js';
import { getTargetRole } from '../config/targetRoles.js';

const router = express.Router();

/**
 * @route POST /api/skill-gaps/analyze
 * @desc Analyze skill gap for a specific target role
 * @access Private
 */
router.post('/analyze', authenticate, requireMongo, [
  body('targetRole').isString().trim().notEmpty().withMessage('targetRole is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { targetRole } = req.body;
    const userId = req.user.id;

    // 1. Validate Target Role
    const targetRoleConfig = getTargetRole(targetRole);
    if (!targetRoleConfig) {
      return res.status(400).json({ success: false, message: 'Unknown target role configuration.' });
    }

    // 2. Load SkillProfile
    const skillProfile = await SkillProfile.findOne({ user: userId });
    
    if (!skillProfile) {
      return res.status(404).json({ success: false, message: 'Skill intelligence is unavailable. No SkillProfile found.' });
    }

    // 3. Check for incomplete ResumeIntelligence
    // Phase 5A rules state if resume intelligence is "processing" or "failed", we should reject or report unavailable.
    // If it is "partial" or "success", we proceed.
    // We can find the latest ResumeIntelligence for this user to check status.
    const latestResume = await ResumeIntelligence.findOne({ user: userId }).sort({ createdAt: -1 });
    if (latestResume) {
      if (latestResume.extractionStatus === 'processing') {
        return res.status(409).json({ success: false, message: 'Resume analysis is currently processing. Please try again later.' });
      }
      if (latestResume.extractionStatus === 'failed') {
        return res.status(422).json({ success: false, message: 'Resume analysis failed. Cannot perform gap analysis.' });
      }
    }

    // 4. Perform deterministic gap analysis
    const analysisDoc = await createAndPersistGapAnalysis(userId, skillProfile, targetRole);

    return res.status(200).json({
      success: true,
      data: {
        targetRole: analysisDoc.targetRoleTitle,
        targetRoleId: analysisDoc.targetRoleId,
        matchedSkills: analysisDoc.matchedSkills,
        partialSkills: analysisDoc.partialSkills,
        missingSkills: analysisDoc.missingSkills,
        summary: analysisDoc.summary
      }
    });

  } catch (error) {
    console.error('Skill Gap Analysis Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
});

/**
 * @route POST /api/skill-gaps/prioritize
 * @desc Prioritize skill gaps for a specific target role
 * @access Private
 */
router.post('/prioritize', authenticate, requireMongo, [
  body('targetRole').isString().trim().notEmpty().withMessage('targetRole is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { targetRole } = req.body;
    const userId = req.user.id;

    // 1. Validate Target Role
    const targetRoleConfig = getTargetRole(targetRole);
    if (!targetRoleConfig) {
      return res.status(400).json({ success: false, message: 'Unknown target role configuration.' });
    }

    // 2. Fetch existing Gap Analysis
    const gapAnalysis = await SkillGapAnalysis.findOne({ user: userId, targetRoleId: targetRoleConfig.roleId });
    if (!gapAnalysis) {
      return res.status(404).json({ success: false, message: 'Skill Gap Analysis not found. Please run gap analysis first.' });
    }

    // 3. Create and persist learning plan
    const planDoc = await createAndPersistLearningPlan(userId, gapAnalysis);

    return res.status(200).json({
      success: true,
      data: {
        targetRole: planDoc.targetRole,
        targetRoleId: planDoc.targetRoleId,
        prioritizedGaps: planDoc.prioritizedGaps,
        summary: planDoc.summary
      }
    });

  } catch (error) {
    console.error('Skill Gap Prioritization Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
});

/**
 * @route POST /api/skill-gaps/resources
 * @desc Discover external resources for missing prioritized skills
 * @access Private
 */
router.post('/resources', authenticate, requireMongo, [
  body('targetRole').isString().trim().notEmpty().withMessage('targetRole is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { targetRole } = req.body;
    const userId = req.user.id;

    const targetRoleConfig = getTargetRole(targetRole);
    if (!targetRoleConfig) {
      return res.status(400).json({ success: false, message: 'Unknown target role configuration.' });
    }

    // Pass 'mock' to use deterministic mock if in test environment, else let it use default
    const providers = process.env.NODE_ENV === 'test' ? ['mock'] : undefined;
    
    // Using dynamic import to avoid circular dependencies and load the intelligence service
    const { processLearningResources } = await import('../services/learningResourceIntelligenceService.js');
    
    const resourcePlan = await processLearningResources(userId, targetRoleConfig.roleId, providers);

    return res.status(200).json({
      success: true,
      data: resourcePlan
    });

  } catch (error) {
    console.error('Learning Resource Intelligence Error:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message || 'Server Error' });
  }
});

export default router;
