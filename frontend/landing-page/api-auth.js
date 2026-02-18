// Backend API auth for Landing Page
const API_BASE = (typeof window.getModuleUrls === 'function')
    ? window.getModuleUrls().backend + '/api'
    : (window.location.hostname.includes('onrender.com')
        ? 'https://careersync-backend-oldo.onrender.com/api'
        : 'http://localhost:5000/api');

export async function register(email, password, name = '') {
  try {
    const resp = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name })
    });
    
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Registration failed' }));
      return { success: false, error: err.error || 'Registration failed' };
    }
    
    const data = await resp.json();
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Registration network error:', error);
    return { success: false, error: `Network error: ${error.message}. Make sure the backend is running at ${API_BASE}` };
  }
}

export async function login(email, password) {
  try {
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Login failed' }));
      return { success: false, error: err.error || 'Login failed' };
    }

    const data = await resp.json();
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login network error:', error);
    console.error('API_BASE:', API_BASE);
    return { success: false, error: `Network error: ${error.message}. Make sure the backend is running at ${API_BASE}` };
  }
}

export async function requestOtp(email) {
  try {
    const resp = await fetch(`${API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return { success: false, error: data.error || 'Failed to send OTP' };
    }
    return { success: true, message: data.message || 'OTP sent to email' };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function loginWithOtp(email, otp) {
  try {
    const resp = await fetch(`${API_BASE}/auth/login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, otp })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return { success: false, error: data.error || 'Invalid OTP' };
    }
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  return { success: true };
}

export async function getCurrentUser() {
  try {
    const resp = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    });
    
    if (!resp.ok) {
      return { success: false, user: null };
    }
    
    const data = await resp.json();
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Get current user error:', error);
    return { success: false, user: null };
  }
}
