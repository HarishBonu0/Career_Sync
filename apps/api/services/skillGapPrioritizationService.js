import { getSkillDependencies } from '../config/skillDependencies.js';
import SkillLearningPlan from '../models/SkillLearningPlan.js';

export function prioritizeSkillGaps(gapAnalysis) {
  const { targetRoleTitle, targetRoleId, missingSkills, matchedSkills } = gapAnalysis;

  const matchedSet = new Set(matchedSkills.map(s => s.canonicalName));
  const missingMap = new Map();
  missingSkills.forEach(s => missingMap.set(s.canonicalName, s));

  // Build graphs
  // adj[u] = list of skills that DEPEND ON u (u -> v means u is prerequisite of v)
  const adj = new Map();
  const inDegree = new Map(); // number of missing prerequisites
  const satisfiedPrereqs = new Map();
  const activePrereqs = new Map(); // missing prereqs

  missingSkills.forEach(s => {
    adj.set(s.canonicalName, []);
    inDegree.set(s.canonicalName, 0);
    satisfiedPrereqs.set(s.canonicalName, []);
    activePrereqs.set(s.canonicalName, []);
  });

  missingSkills.forEach(skill => {
    const canonical = skill.canonicalName;
    const prereqs = getSkillDependencies(canonical);

    prereqs.forEach(prereqCanonical => {
      if (matchedSet.has(prereqCanonical)) {
        satisfiedPrereqs.get(canonical).push(prereqCanonical);
      } else if (missingMap.has(prereqCanonical)) {
        activePrereqs.get(canonical).push(prereqCanonical);
        adj.get(prereqCanonical).push(canonical);
        inDegree.set(canonical, inDegree.get(canonical) + 1);
      }
      // If a prereq is not in matched and not in missing (e.g. not a requirement of the role),
      // we ignore it per instruction 12: "ignore invalid dependency configuration with a clear validation result"
      // Or we can throw an error. The instruction says "Prefer rejecting invalid configuration if this can be done without breaking existing target-role contracts."
      // But actually, a skill might have a prerequisite that isn't explicitly required by the target role.
      // Wait! The instruction says:
      // "If a prerequisite refers to a skill that is not represented in the target role's known requirement set:
      // DO NOT silently invent or add it to the user's missing skills.
      // Decide on one explicit safe behavior: reject invalid configuration OR ignore invalid dependency configuration with a clear validation result.
      // Prefer rejecting invalid configuration if this can be done without breaking existing target-role contracts."
      // Let's reject it for strictness.
      else {
        throw new Error(`Invalid dependency configuration: Prerequisite '${prereqCanonical}' for skill '${canonical}' is not part of the target role requirements.`);
      }
    });
  });

  // Cycle Detection using DFS
  const visited = new Set();
  const recStack = new Set();
  
  function detectCycle(node) {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    const neighbors = adj.get(node) || [];
    for (let neighbor of neighbors) {
      if (detectCycle(neighbor)) return true;
    }

    recStack.delete(node);
    return false;
  }

  for (let [node] of adj) {
    if (detectCycle(node)) {
      throw new Error('Circular dependency detected in prerequisite configuration.');
    }
  }

  // Calculate downstreamCount using BFS/DFS from each node
  const downstreamCount = new Map();
  missingSkills.forEach(s => {
    const queue = [s.canonicalName];
    const reachable = new Set();
    while (queue.length > 0) {
      const curr = queue.shift();
      const neighbors = adj.get(curr) || [];
      for (let neighbor of neighbors) {
        if (!reachable.has(neighbor)) {
          reachable.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    downstreamCount.set(s.canonicalName, reachable.size);
  });

  // Sort skills
  const sortedSkills = [...missingSkills].sort((a, b) => {
    const aIn = inDegree.get(a.canonicalName);
    const bIn = inDegree.get(b.canonicalName);
    if (aIn !== bIn) return aIn - bIn; // Ascending inDegree

    const aDown = downstreamCount.get(a.canonicalName);
    const bDown = downstreamCount.get(b.canonicalName);
    if (aDown !== bDown) return bDown - aDown; // Descending downstreamCount

    return a.canonicalName.localeCompare(b.canonicalName); // Alphabetical
  });

  let foundationalGaps = 0;
  let downstreamGaps = 0;
  let normalGaps = 0;

  const prioritizedGaps = sortedSkills.map((skill, index) => {
    const canonical = skill.canonicalName;
    const inDeg = inDegree.get(canonical);
    const downCount = downstreamCount.get(canonical);

    let priorityStr = 'normal';
    let reason = '';

    if (inDeg === 0 && downCount > 0) {
      priorityStr = 'foundational';
      foundationalGaps++;
      reason = `Prioritized because ${downCount} other missing skill(s) depend on it.`;
    } else if (inDeg > 0) {
      priorityStr = 'downstream';
      downstreamGaps++;
      const active = activePrereqs.get(canonical);
      reason = `Blocked by missing prerequisites: ${active.join(', ')}.`;
    } else {
      priorityStr = 'normal';
      normalGaps++;
      reason = 'Independent skill requirement.';
    }

    return {
      skill: skill.name,
      canonicalName: canonical,
      priority: priorityStr,
      order: index + 1,
      prerequisites: activePrereqs.get(canonical),
      satisfiedPrerequisites: satisfiedPrereqs.get(canonical),
      reason
    };
  });

  return {
    targetRole: targetRoleTitle,
    targetRoleId,
    prioritizedGaps,
    summary: {
      totalGaps: missingSkills.length,
      foundationalGaps,
      downstreamGaps,
      normalGaps
    }
  };
}

export async function createAndPersistLearningPlan(userId, gapAnalysis) {
  const planData = prioritizeSkillGaps(gapAnalysis);

  let planDoc = await SkillLearningPlan.findOne({ user: userId, targetRoleId: gapAnalysis.targetRoleId });
  
  if (!planDoc) {
    planDoc = new SkillLearningPlan({
      user: userId,
      skillGapAnalysisId: gapAnalysis._id,
      ...planData
    });
  } else {
    planDoc.skillGapAnalysisId = gapAnalysis._id;
    planDoc.prioritizedGaps = planData.prioritizedGaps;
    planDoc.summary = planData.summary;
  }

  await planDoc.save();
  return planDoc;
}
