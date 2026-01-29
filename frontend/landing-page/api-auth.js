// Backend API auth for Landing Page
const API_BASE = 'http://localhost:5000/api';

// Mock users for fallback
const MOCK_USERS_KEY = 'careeros_mock_users';

function getMockUsers() {
  const users = localStorage.getItem(MOCK_USERS_KEY);
  return users ? JSON.parse(users) : [];
}

function saveMockUser(user) {
  const users = getMockUsers();
  users.push(user);
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function findMockUser(email, password) {
  const users = getMockUsers();
  return users.find(u => u.email === email && u.password === password);
}

export async function register(email, password, name = '') {
  try {
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
  } catch (error) {
    console.warn('Backend unavailable, using mock auth:', error.message);
    
    // Check if user already exists
    const existingUsers = getMockUsers();
    if (existingUsers.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Create mock user
    const mockUser = {
      id: 'mock_' + Date.now(),
      email,
      password,
      name: name || email.split('@')[0],
      created_at: new Date().toISOString()
    };
    
    saveMockUser(mockUser);
    
    return { 
      success: true, 
      user: { id: mockUser.id, email: mockUser.email, name: mockUser.name },
      token: 'mock_token_' + Date.now()
    };
  }
}

export async function login(email, password) {
  try {
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
  } catch (error) {
    console.warn('Backend unavailable, using mock auth:', error.message);
    
    // Try mock authentication
    const mockUser = findMockUser(email, password);
    
    if (mockUser) {
      return { 
        success: true, 
        user: { id: mockUser.id, email: mockUser.email, name: mockUser.name },
        token: 'mock_token_' + Date.now()
      };
    }
    
    return { success: false, error: 'Invalid email or password. Backend is offline - please register first.' };
  }
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
