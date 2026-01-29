// Backend API auth for Landing Page
const API_BASE = 'http://localhost:5000/api';

export async function register(email, password, name = '') {
  const resp = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Registration failed' }));
    return { success: false, error: err.error || 'Registration failed' };
  }
  const data = await resp.json();
  return { success: true, user: data.user, token: data.token };
}

export async function login(email, password) {
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return { success: false, error: data.error || 'Invalid email or password' };
  }
  return { success: true, user: data.user, token: data.token };
}

export async function requestOtp(email) {
  const resp = await fetch(`${API_BASE}/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return { success: false, error: data.error || 'Failed to send OTP' };
  }
  return { success: true, message: data.message || 'OTP sent to email' };
}

export async function loginWithOtp(email, otp) {
  const resp = await fetch(`${API_BASE}/auth/login-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return { success: false, error: data.error || 'Invalid OTP' };
  }
  return { success: true, user: data.user, token: data.token };
}

export async function logout() {
  localStorage.removeItem('careeros_user');
  localStorage.removeItem('careeros_token');
  return { success: true };
}
