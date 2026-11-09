export const SKILL_DEPENDENCIES = {
  'machine learning': {
    prerequisites: ['statistics', 'python']
  },
  'deep learning': {
    prerequisites: ['machine learning']
  },
  'react': {
    prerequisites: ['javascript', 'html', 'css']
  },
  'typescript': {
    prerequisites: ['javascript']
  },
  'algorithms': {
    prerequisites: ['data structures']
  }
};

export function getSkillDependencies(canonicalName) {
  if (!canonicalName) return [];
  const skill = SKILL_DEPENDENCIES[canonicalName.toLowerCase()];
  return skill ? skill.prerequisites : [];
}
