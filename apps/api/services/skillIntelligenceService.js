import SkillProfile from '../models/SkillProfile.js';
import { ResumeIntelligence } from '../models/ResumeIntelligence.js';

const SKILL_NORMALIZATION_DICT = {
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'python': 'Python',
  'python3': 'Python',
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'java': 'Java',
  'c++': 'C++',
  'c': 'C',
  'c#': 'C#',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'azure': 'Azure',
  'docker': 'Docker',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'html': 'HTML',
  'css': 'CSS'
};

export function normalizeSkillName(name) {
  if (!name) return null;
  const lowerName = name.toLowerCase().trim();
  if (SKILL_NORMALIZATION_DICT[lowerName]) {
    return SKILL_NORMALIZATION_DICT[lowerName];
  }
  return name.trim();
}

function mapSectionToSourceType(section) {
  if (!section) return 'resume_other';
  const sec = section.toLowerCase();
  if (sec.includes('experience') || sec.includes('employment') || sec.includes('work')) return 'resume_experience';
  if (sec.includes('project')) return 'resume_project';
  if (sec.includes('education') || sec.includes('degree') || sec.includes('university') || sec.includes('course')) return 'resume_education';
  if (sec.includes('cert')) return 'resume_certification';
  if (sec.includes('skill')) return 'resume_skill';
  return 'resume_other';
}

export async function syncResumeToSkillProfile(userId, resumeHash) {
  const resumeDoc = await ResumeIntelligence.findOne({ user: userId, resumeHash });
  if (!resumeDoc) {
    throw new Error('Resume intelligence not found.');
  }

  if (resumeDoc.extractionStatus !== 'success' && resumeDoc.extractionStatus !== 'partial') {
    throw new Error(`Cannot sync skill profile from resume with status: ${resumeDoc.extractionStatus}`);
  }

  let profile = await SkillProfile.findOne({ user: userId });
  if (!profile) {
    profile = new SkillProfile({ user: userId, skills: [] });
  }

  // Clear ALL previous evidence originating from any resume to avoid appending stale skills forever.
  // The new resume is the single source of truth for resume-based facts.
  profile.skills.forEach(skill => {
    skill.evidence = skill.evidence.filter(ev => ev.source !== 'resume');
  });

  const addEvidence = (rawSkillName, sourceCategory, factType, supportingText, explicitProficiency = null) => {
    if (!rawSkillName) return;
    const normalizedName = normalizeSkillName(rawSkillName);
    
    let skillEntry = profile.skills.find(s => 
      s.canonicalName?.toLowerCase() === normalizedName.toLowerCase() || 
      s.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (!skillEntry) {
      profile.skills.push({
        name: normalizedName,
        canonicalName: normalizedName.toLowerCase(),
        score: 0,
        percentage: 0,
        proficiency: explicitProficiency,
        evidence: []
      });
      skillEntry = profile.skills[profile.skills.length - 1];
    } else if (explicitProficiency && !skillEntry.proficiency) {
      skillEntry.proficiency = explicitProficiency;
    }

    // Deduplicate identical evidence from the same document
    const duplicateEvidence = skillEntry.evidence.find(e => 
      e.sourceType === sourceCategory && 
      e.supportingText === supportingText &&
      e.resumeIntelligenceId?.toString() === resumeDoc._id.toString()
    );

    if (!duplicateEvidence) {
      skillEntry.evidence.push({
        source: 'resume',
        sourceType: sourceCategory,
        factType: factType || 'unknown',
        supportingText: supportingText,
        confidence: 1.0,
        resumeIntelligenceId: resumeDoc._id
      });
    }
  };

  // Extract from explicit Skills array
  (resumeDoc.skills || []).forEach(skillFact => {
    if (!skillFact.name) return;
    const profMatch = skillFact.name.match(/(beginner|intermediate|advanced|expert)/i);
    const explicitProficiency = profMatch ? profMatch[1].toLowerCase() : null;
    let cleanName = skillFact.name.replace(/(beginner|intermediate|advanced|expert|-|—|:)/ig, '').trim();
    if (!cleanName) cleanName = skillFact.name;
    
    if (skillFact.evidence && skillFact.evidence.length > 0) {
      skillFact.evidence.forEach(ev => {
        addEvidence(cleanName, mapSectionToSourceType(ev.section), skillFact.factType, ev.supportingText, explicitProficiency);
      });
    } else {
      // Should have been filtered by Phase 5A, but just in case
      addEvidence(cleanName, 'resume_skill', skillFact.factType, cleanName, explicitProficiency);
    }
  });

  // Extract from Experience technologies
  (resumeDoc.experience || []).forEach(expFact => {
    (expFact.technologies || []).forEach(tech => {
      const evStr = expFact.evidence && expFact.evidence[0] ? expFact.evidence[0].supportingText : (expFact.description || expFact.title);
      addEvidence(tech, 'resume_experience', 'explicit', evStr);
    });
  });

  // Extract from Projects technologies
  (resumeDoc.projects || []).forEach(projFact => {
    (projFact.technologies || []).forEach(tech => {
      const evStr = projFact.evidence && projFact.evidence[0] ? projFact.evidence[0].supportingText : (projFact.description || projFact.title);
      addEvidence(tech, 'resume_project', 'explicit', evStr);
    });
  });

  // Extract from Education technologies
  (resumeDoc.education || []).forEach(eduFact => {
    if (eduFact.technologies) {
      eduFact.technologies.forEach(tech => {
        const evStr = eduFact.evidence && eduFact.evidence[0] ? eduFact.evidence[0].supportingText : eduFact.fieldOfStudy;
        addEvidence(tech, 'resume_education', 'explicit', evStr);
      });
    }
  });

  // Extract from Certification technologies
  (resumeDoc.certifications || []).forEach(certFact => {
    if (certFact.name && certFact.technologies) {
      const evStr = certFact.evidence && certFact.evidence[0] ? certFact.evidence[0].supportingText : certFact.name;
      certFact.technologies.forEach(tech => {
        addEvidence(tech, 'resume_certification', 'explicit', evStr);
      });
    }
  });

  // Remove completely orphaned skills
  profile.skills = profile.skills.filter(s => s.evidence && s.evidence.length > 0);
  profile.updatedAt = new Date();
  await profile.save();

  return profile;
}

export const buildSkillProfile = syncResumeToSkillProfile;
