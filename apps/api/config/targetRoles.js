export const TARGET_ROLES = {
  'software-engineer': {
    roleId: 'software-engineer',
    title: 'Software Engineer',
    skills: [
      { name: 'Python', canonicalName: 'python', required: true },
      { name: 'SQL', canonicalName: 'sql', required: true },
      { name: 'Git', canonicalName: 'git', required: true },
      { name: 'Data Structures', canonicalName: 'data structures', required: true },
      { name: 'Algorithms', canonicalName: 'algorithms', required: true },
      { name: 'REST APIs', canonicalName: 'rest apis', required: false }
    ]
  },
  'frontend-developer': {
    roleId: 'frontend-developer',
    title: 'Frontend Developer',
    skills: [
      { name: 'JavaScript', canonicalName: 'javascript', required: true },
      { name: 'HTML', canonicalName: 'html', required: true },
      { name: 'CSS', canonicalName: 'css', required: true },
      { name: 'React', canonicalName: 'react', required: true },
      { name: 'TypeScript', canonicalName: 'typescript', required: false }
    ]
  },
  'data-scientist': {
    roleId: 'data-scientist',
    title: 'Data Scientist',
    skills: [
      { name: 'Python', canonicalName: 'python', required: true },
      { name: 'Machine Learning', canonicalName: 'machine learning', required: true },
      { name: 'SQL', canonicalName: 'sql', required: true },
      { name: 'Statistics', canonicalName: 'statistics', required: true }
    ]
  },
  'test-role': {
    roleId: 'test-role',
    title: 'Test Role',
    skills: [
      { name: 'Python', canonicalName: 'python', required: true },
      { name: 'React', canonicalName: 'react', required: true },
      { name: 'Java', canonicalName: 'java', required: true },
      { name: 'Docker', canonicalName: 'docker', required: true }
    ]
  }
};

export function getTargetRole(roleId) {
  if (!roleId) return null;
  const normalizedRoleId = roleId.toLowerCase().trim().replace(/\s+/g, '-');
  return TARGET_ROLES[normalizedRoleId] || null;
}
