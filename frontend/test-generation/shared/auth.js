// Shared Authentication Service
// Cookie-based authentication using HttpOnly cookies

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';

let currentUser = null;
let authCheckPromise = null;

// Check current authentication status
export async function checkAuth() {
    // Return existing promise if check is already in progress
    if (authCheckPromise) {
        return authCheckPromise;
    }

    authCheckPromise = fetch(`${API_BASE}/auth/me`, {
        credentials: 'include' // Include cookies
    })
    .then(async (resp) => {
        if (resp.ok) {
            const data = await resp.json();
            currentUser = data.user;
            return data.user;
        }
        currentUser = null;
        return null;
    })
    .catch(() => {
        currentUser = null;
        return null;
    })
    .finally(() => {
        authCheckPromise = null;
    });

    return authCheckPromise;
}

// Get current user (from cache or fetch)
export async function getCurrentUser() {
    if (currentUser) {
        return currentUser;
    }
    return await checkAuth();
}

// Check if user is logged in
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}

// Logout user
export async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    currentUser = null;
    const landingUrl = window.getModuleUrls ? window.getModuleUrls().landing : (window.location.hostname.includes('onrender.com') ? 'https://careersync-landing-oldo.onrender.com' : 'http://localhost:4173');
    window.location.href = landingUrl + '/auth.html';
}

// Redirect to login if not authenticated
export async function requireAuth() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        const landingUrl = window.getModuleUrls ? window.getModuleUrls().landing : (window.location.hostname.includes('onrender.com') ? 'https://careersync-landing-oldo.onrender.com' : 'http://localhost:4173');
        window.location.href = landingUrl + '/auth.html';
        return false;
    }
    return true;
}

// Get user display name
export async function getUserDisplayName() {
    const user = await getCurrentUser();
    if (!user) return 'Guest';
    return user.name || user.email?.split('@')[0] || 'User';
}

// API helper with automatic credentials
export async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include' // Always include cookies
    });
    
    // Handle unauthorized
    if (response.status === 401) {
        currentUser = null;
        throw new Error('Session expired. Please login again.');
    }
    
    return response;
}
