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
  if (!roleId || typeof roleId !== 'string') return null;
  const normalizedRoleId = roleId.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  
  // Exact match
  if (TARGET_ROLES[normalizedRoleId]) {
    return TARGET_ROLES[normalizedRoleId];
  }

  // Partial match
  for (const [key, config] of Object.entries(TARGET_ROLES)) {
    if (normalizedRoleId.includes(key) || key.includes(normalizedRoleId)) {
      return config;
    }
  }

  // Common role family mappings
  if (normalizedRoleId.includes('backend') || normalizedRoleId.includes('node') || normalizedRoleId.includes('api')) {
    return {
      roleId: normalizedRoleId,
      title: 'Backend Developer',
      skills: [
        { name: 'Node.js', canonicalName: 'node.js', required: true },
        { name: 'SQL', canonicalName: 'sql', required: true },
        { name: 'REST APIs', canonicalName: 'rest apis', required: true },
        { name: 'System Design', canonicalName: 'system design', required: true },
        { name: 'Git', canonicalName: 'git', required: true }
      ]
    };
  }

  if (normalizedRoleId.includes('fullstack') || normalizedRoleId.includes('full-stack') || normalizedRoleId.includes('web')) {
    return {
      roleId: normalizedRoleId,
      title: 'Full Stack Developer',
      skills: [
        { name: 'JavaScript', canonicalName: 'javascript', required: true },
        { name: 'React', canonicalName: 'react', required: true },
        { name: 'Node.js', canonicalName: 'node.js', required: true },
        { name: 'SQL', canonicalName: 'sql', required: true },
        { name: 'Git', canonicalName: 'git', required: true }
      ]
    };
  }

  if (normalizedRoleId.includes('devops') || normalizedRoleId.includes('cloud') || normalizedRoleId.includes('sre')) {
    return {
      roleId: normalizedRoleId,
      title: 'DevOps / Cloud Engineer',
      skills: [
        { name: 'Linux', canonicalName: 'linux', required: true },
        { name: 'Docker', canonicalName: 'docker', required: true },
        { name: 'Kubernetes', canonicalName: 'kubernetes', required: true },
        { name: 'CI/CD', canonicalName: 'ci/cd', required: true },
        { name: 'AWS', canonicalName: 'aws', required: false }
      ]
    };
  }

  if (normalizedRoleId.includes('ai') || normalizedRoleId.includes('ml') || normalizedRoleId.includes('learning')) {
    return {
      roleId: normalizedRoleId,
      title: 'Machine Learning / AI Engineer',
      skills: [
        { name: 'Python', canonicalName: 'python', required: true },
        { name: 'Machine Learning', canonicalName: 'machine learning', required: true },
        { name: 'PyTorch / TensorFlow', canonicalName: 'pytorch', required: true },
        { name: 'SQL', canonicalName: 'sql', required: true },
        { name: 'Statistics', canonicalName: 'statistics', required: true }
      ]
    };
  }

  // Dynamic fallback for any arbitrary target role
  const formattedTitle = roleId
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return {
    roleId: normalizedRoleId,
    title: formattedTitle || 'Specialized Engineer',
    skills: [
      { name: 'Core Foundations', canonicalName: 'core foundations', required: true },
      { name: 'Domain Architecture', canonicalName: 'domain architecture', required: true },
      { name: 'Tools & Frameworks', canonicalName: 'tools and frameworks', required: true },
      { name: 'Best Practices & Security', canonicalName: 'best practices', required: true }
    ]
  };
}
