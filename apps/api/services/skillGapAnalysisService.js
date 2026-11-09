import { normalizeSkillName } from './skillIntelligenceService.js';
import SkillGapAnalysis from '../models/SkillGapAnalysis.js';
import { getTargetRole } from '../config/targetRoles.js';

/**
 * Deterministically analyzes the gap between a user's SkillProfile and a Target Role's requirements.
 * 
 * @param {Object} skillProfile - The user's SkillProfile document
 * @param {Object} targetRoleConfig - The target role configuration from targetRoles.js
 * @returns {Object} The gap analysis result
 */
export function analyzeSkillGap(skillProfile, targetRoleConfig) {
  if (!targetRoleConfig || !targetRoleConfig.skills) {
    throw new Error('Invalid target role configuration provided.');
  }

  const result = {
    targetRoleId: targetRoleConfig.roleId,
    targetRoleTitle: targetRoleConfig.title,
    matchedSkills: [],
    partialSkills: [],
    missingSkills: [],
    summary: {
      required: 0,
      matched: 0,
      partial: 0,
      missing: 0,
      coveragePercentage: 0
    }
  };

  // Build a lookup map of the user's trusted skills (canonicalName -> skill object)
  // Only consider skills with valid evidence.
  const userTrustedSkills = new Map();
  if (skillProfile && Array.isArray(skillProfile.skills)) {
    skillProfile.skills.forEach(userSkill => {
      // Must have valid evidence
      if (!userSkill.evidence || userSkill.evidence.length === 0) {
        return;
      }
      
      // Fallback normalization in case canonicalName is missing for legacy data
      const canonical = (userSkill.canonicalName || normalizeSkillName(userSkill.name) || userSkill.name).toLowerCase();
      userTrustedSkills.set(canonical, userSkill);
    });
  }

  // Iterate over requirements
  targetRoleConfig.skills.forEach(reqSkill => {
    const canonicalReq = (reqSkill.canonicalName || normalizeSkillName(reqSkill.name) || reqSkill.name).toLowerCase();
    
    if (reqSkill.required) {
      result.summary.required++;
    }

    const matchedUserSkill = userTrustedSkills.get(canonicalReq);

    const analyzedSkill = {
      name: reqSkill.name,
      canonicalName: canonicalReq,
      required: reqSkill.required,
      evidence: []
    };

    if (matchedUserSkill) {
      // Retain the exact evidence from SkillProfile
      analyzedSkill.evidence = matchedUserSkill.evidence;
      result.matchedSkills.push(analyzedSkill);
      if (reqSkill.required) {
        result.summary.matched++;
      }
    } else {
      // Missing
      result.missingSkills.push(analyzedSkill);
      if (reqSkill.required) {
        result.summary.missing++;
      }
    }
  });

  // Coverage percentage
  if (result.summary.required > 0) {
    result.summary.coveragePercentage = Math.round((result.summary.matched / result.summary.required) * 100);
  } else {
    result.summary.coveragePercentage = 100; // If no skills are strictly required
  }

  return result;
}

/**
 * Service to execute and optionally persist the gap analysis.
 */
export async function createAndPersistGapAnalysis(userId, skillProfile, targetRoleId) {
  const targetRoleConfig = getTargetRole(targetRoleId);
  if (!targetRoleConfig) {
    throw new Error(`Unknown target role: ${targetRoleId}`);
  }

  if (!skillProfile) {
    // If no profile, we can still run analysis (it will just yield 100% missing)
    // But per instructions: "No SkillProfile -> Expected: safe response indicating that skill intelligence is unavailable."
    throw new Error('Skill intelligence is unavailable for this user.');
  }

  // Perform deterministic analysis
  const analysisResult = analyzeSkillGap(skillProfile, targetRoleConfig);

  // Persist the result
  let analysisDoc = await SkillGapAnalysis.findOne({ user: userId, targetRoleId: targetRoleConfig.roleId });
  
  if (!analysisDoc) {
    analysisDoc = new SkillGapAnalysis({
      user: userId,
      skillProfileId: skillProfile._id,
      ...analysisResult
    });
  } else {
    analysisDoc.skillProfileId = skillProfile._id;
    analysisDoc.matchedSkills = analysisResult.matchedSkills;
    analysisDoc.partialSkills = analysisResult.partialSkills;
    analysisDoc.missingSkills = analysisResult.missingSkills;
    analysisDoc.summary = analysisResult.summary;
    analysisDoc.targetRoleTitle = analysisResult.targetRoleTitle;
  }

  await analysisDoc.save();
  return analysisDoc;
}
