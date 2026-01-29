const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

export async function register(email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  return res.json();
}

export async function verifyToken(token) {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  return res.json();
}

export async function generateCourse(courseName, duration, level) {
  const res = await fetch(`${API_BASE}/courses/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseName, duration, level })
  });
  return res.json();
}

export async function generateRoadmap(currentRole, targetRole, timeline) {
  const res = await fetch(`${API_BASE}/roadmaps/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentRole, targetRole, timeline })
  });
  return res.json();
}

export async function evaluateSkill(skillName, difficulty, questionCount) {
  const res = await fetch(`${API_BASE}/skills/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skillName, difficulty, questionCount })
  });
  return res.json();
}

export async function submitEvaluation(skillName, answers, totalQuestions) {
  const res = await fetch(`${API_BASE}/skills/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skillName, answers, totalQuestions })
  });
  return res.json();
}

export function getToken() {
  return localStorage.getItem('skillroute_token');
}

export function setToken(token) {
  localStorage.setItem('skillroute_token', token);
}

export function getUser() {
  const userJSON = localStorage.getItem('skillroute_user');
  return userJSON ? JSON.parse(userJSON) : null;
}

export function setUser(user) {
  localStorage.setItem('skillroute_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('skillroute_token');
  localStorage.removeItem('skillroute_user');
}
