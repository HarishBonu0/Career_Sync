const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('careersync_token') ||
      localStorage.getItem('Career_Sync_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Generate and store questions using backend API
 */
export async function generateQuestions(skillName, difficulty) {
  const response = await fetch(`${API_BASE_URL}/skills/evaluate`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: JSON.stringify({
      skillName,
      difficulty: difficulty || 'intermediate',
      questionCount: 20,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Failed to generate questions (${response.status})`);
  }

  return response.json();
}

/**
 * Submit test answers and get score
 */
export async function submitTest(evaluationId, answers) {
  const response = await fetch(`${API_BASE_URL}/skills/submit`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: JSON.stringify({ evaluationId, answers }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to submit test');
  }

  return response.json();
}

/**
 * Get evaluation details by ID
 */
export async function getAttemptById(evaluationId) {
  const response = await fetch(`${API_BASE_URL}/skills/${evaluationId}`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch evaluation');
  return response.json();
}

/**
 * Get all skills
 */
export async function getSkills() {
  const response = await fetch(`${API_BASE_URL}/skills`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch skills');
  return response.json();
}

/**
 * Get user test history
 */
export async function getUserTests(_userId, skillId) {
  const response = await fetch(`${API_BASE_URL}/skills/${skillId}`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch test history');
  return response.json();
}
