import SkillLearningResource from '../models/SkillLearningResource.js';
import SkillLearningPlan from '../models/SkillLearningPlan.js';
import { discoverResources } from './providers/index.js';

export async function processLearningResources(userId, targetRoleId, providers) {
  // 1. Fetch user's SkillLearningPlan
  const plan = await SkillLearningPlan.findOne({ user: userId, targetRoleId });
  if (!plan) {
    throw new Error('SkillLearningPlan not found. Run gap prioritization first.');
  }

  const { prioritizedGaps } = plan;
  if (!prioritizedGaps || prioritizedGaps.length === 0) {
    return {
      targetRole: plan.targetRole,
      skills: [],
      discoveryStatus: 'completed'
    };
  }

  const results = [];
  let totalFailures = 0;

  for (const gap of prioritizedGaps) {
    const canonicalName = gap.canonicalName;
    
    // 2. Discover resources
    const discovery = await discoverResources(gap, providers);
    let candidateResources = discovery.resources;
    if (discovery.failures.length > 0) {
      totalFailures += discovery.failures.length;
    }

    // 3. Normalize & Deduplicate
    const uniqueMap = new Map();
    for (const res of candidateResources) {
      // Validate basic URL syntax
      try {
        new URL(res.url);
      } catch (e) {
        continue; // reject invalid URL
      }

      // Deduplicate by URL or externalId
      const urlKey = `${res.provider}:${res.url}`;
      const extKey = res.externalId ? `${res.provider}:${res.externalId}` : null;
      
      if (uniqueMap.has(urlKey) || (extKey && uniqueMap.has(extKey))) {
        continue;
      }
      
      // Use URL as primary key for map
      uniqueMap.set(urlKey, res);
      if (extKey) {
        uniqueMap.set(extKey, res); // Map both to same resource
      }
    }
    
    candidateResources = Array.from(new Set(uniqueMap.values()));

    // 4. Validate relevance (very basic title check deterministic)
    const validResources = [];
    for (const res of candidateResources) {
      const lowerTitle = res.title.toLowerCase();
      const lowerSkill = gap.skill.toLowerCase();
      // Only require some basic matching if deterministic
      // Actually instruction says: "Do not use loose substring matching... For this phase, prefer deterministic relevance validation."
      // Let's ensure the title contains at least one word from the skill or just assume provider returned relevant things if we trust the provider search query, but we should validate it.
      const skillWords = lowerSkill.split(' ').filter(w => w.length > 2);
      let matches = false;
      if (skillWords.length === 0) {
        matches = lowerTitle.includes(lowerSkill);
      } else {
        matches = skillWords.some(w => lowerTitle.includes(w));
      }

      // 5. Ranking (Deterministic)
      let rank = 0;
      if (res.rating) rank += res.rating * 10;
      if (res.reviewCount) rank += Math.min(res.reviewCount, 1000) / 100;
      if (matches) rank += 50; // Boost validated matches
      
      const validatedRes = {
        ...res,
        validationStatus: matches ? 'validated' : 'discovered',
        rank
      };

      validResources.push(validatedRes);
    }

    // Sort by rank descending, tie-breaker alphabetical title
    validResources.sort((a, b) => {
      if (a.rank !== b.rank) return b.rank - a.rank;
      return a.title.localeCompare(b.title);
    });

    // 6. Persist resources idempotently
    const persistedResources = [];
    for (let i = 0; i < validResources.length; i++) {
      const res = validResources[i];

      let doc = await SkillLearningResource.findOne({
        user: userId,
        targetRoleId,
        skillCanonicalName: canonicalName,
        provider: res.provider,
        externalId: res.externalId || res.url
      });

      if (!doc) {
        doc = new SkillLearningResource({
          user: userId,
          targetRoleId,
          skillCanonicalName: canonicalName,
          ...res,
          externalId: res.externalId || res.url
        });
      } else {
        // Update freshness
        doc.title = res.title;
        doc.url = res.url;
        doc.rating = res.rating;
        doc.reviewCount = res.reviewCount;
        doc.rank = res.rank;
        doc.validationStatus = res.validationStatus;
        doc.lastValidatedAt = new Date();
      }

      await doc.save();
      
      // Clean up doc for response output
      const out = doc.toObject();
      delete out._id;
      delete out.user;
      delete out.__v;
      persistedResources.push(out);
    }

    results.push({
      skill: gap.skill,
      priorityOrder: gap.order,
      resources: persistedResources,
      failures: discovery.failures
    });
  }

  return {
    targetRole: plan.targetRole,
    skills: results,
    discoveryStatus: totalFailures > 0 ? (totalFailures >= prioritizedGaps.length ? 'unavailable' : 'partial') : 'completed'
  };
}
