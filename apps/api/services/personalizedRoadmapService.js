import mongoose from 'mongoose';
import Roadmap from '../models/Roadmap.js';
import SkillLearningPlan from '../models/SkillLearningPlan.js';
import SkillLearningResource from '../models/SkillLearningResource.js';
import { getTargetRole } from '../config/targetRoles.js';

export async function constructPersonalizedRoadmap(userId, targetRoleId, userEmail = null) {
  // 1. Validate Target Role
  const roleConfig = getTargetRole(targetRoleId);
  if (!roleConfig) {
    throw new Error('Unknown target role configuration.');
  }

  // 2. Fetch SkillLearningPlan or fallback to roleConfig skills
  const plan = await SkillLearningPlan.findOne({ user: userId, targetRoleId });
  let gaps = plan?.prioritizedGaps || [];
  
  if (!plan || gaps.length === 0) {
    gaps = (roleConfig.skills || []).map((skillItem, index) => ({
      order: index + 1,
      skill: skillItem.name,
      canonicalName: skillItem.canonicalName || skillItem.name.toLowerCase(),
      priority: skillItem.required ? 'high' : 'medium',
      prerequisites: [],
    }));
  }
  
  // 3. Construct Steps from Prioritized Gaps and retrieve resources
  const steps = [];
  let totalSteps = gaps.length;
  let resourcesAvailable = 0;
  let resourcesUnavailable = 0;
  
  // To preserve 5D order, we just iterate through gaps (they are already sorted by `order`)
  for (const gap of gaps) {
    // 3A. Fetch 5E Resources for this skill
    // Find all validated resources for this user + target role + skill
    let resources = await SkillLearningResource.find({
      user: userId,
      targetRoleId,
      skillCanonicalName: gap.canonicalName,
      validationStatus: 'validated'
    }).sort({ rank: -1 });

    let resourceAvailability = 'unavailable';
    const cleanResources = [];

    if (resources && resources.length > 0) {
      resourceAvailability = 'available';
      resourcesAvailable++;
      
      for (const res of resources) {
        cleanResources.push({
          provider: res.provider,
          externalId: res.externalId,
          title: res.title,
          url: res.url,
          resourceType: res.resourceType,
          rank: res.rank
        });
      }
    } else {
      resourcesUnavailable++;
    }

    // 3B. Construct step
    steps.push({
      order: gap.order,
      skill: gap.skill,
      priority: gap.priority,
      prerequisites: gap.prerequisites || [],
      resources: cleanResources,
      resourceAvailability
    });
  }

  // 4. Determine status
  let status = 'ready';
  if (totalSteps > 0 && resourcesUnavailable > 0) {
    status = 'partial';
  }
  if (totalSteps > 0 && resourcesAvailable === 0) {
    status = 'draft'; 
  }

  // 5. Construct Metadata
  const metadata = {
    totalSteps,
    completedSkills: 0, 
    remainingSkills: totalSteps,
    resourcesAvailable,
    resourcesUnavailable,
    generatedAt: new Date()
  };

  // 6. Idempotently update or create Roadmap
  let roadmap = await Roadmap.findOne({
    user: userId,
    targetRole: roleConfig.id || targetRoleId
  }).sort({ createdAt: -1 });

  if (roadmap) {
    roadmap.steps = steps;
    roadmap.status = status;
    roadmap.metadata = { ...roadmap.metadata, ...metadata };
    roadmap.title = `Personalized Roadmap: ${roleConfig.title}`;
    await roadmap.save();
  } else {
    roadmap = await Roadmap.create({
      user: userId,
      userId: userId.toString(),
      userEmail: userEmail || '',
      currentRole: '', 
      targetRole: roleConfig.id || targetRoleId,
      title: `Personalized Roadmap: ${roleConfig.title}`,
      description: 'Automatically generated deterministic roadmap based on your skill gaps.',
      timeline: 'Self-paced',
      stages: totalSteps,
      steps,
      status,
      metadata
    });
  }

  return roadmap;
}
