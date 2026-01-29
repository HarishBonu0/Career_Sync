// Shared Authentication Service
// This ensures consistent auth state across all modules

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';

// Get current user from localStorage
export function getCurrentUser() {
    const token = localStorage.getItem('careeros_token');
    const userStr = localStorage.getItem('careeros_user');
    
    if (!token || !userStr) {
        return null;
    }
    
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

// Check if user is logged in
export function isAuthenticated() {
    return !!localStorage.getItem('careeros_token');
}

// Get auth token
export function getToken() {
    return localStorage.getItem('careeros_token');
}

// Logout user
export function logout() {
    localStorage.removeItem('careeros_token');
    localStorage.removeItem('careeros_user');
    window.location.href = '/auth';
}

// Redirect to login if not authenticated
export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/auth';
        return false;
    }
    return true;
}

// Get user display name
export function getUserDisplayName() {
    const user = getCurrentUser();
    if (!user) return 'Guest';
    return user.name || user.email?.split('@')[0] || 'User';
}

// API helper with automatic token injection
export async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });
    
    // Handle unauthorized
    if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
    }
    
    return response;
}
