// Shared Authentication Service
// Cookie-based authentication using HttpOnly cookies + localStorage fallback

const API_BASE = (typeof window.getModuleUrls === 'function')
    ? window.getModuleUrls().backend + '/api'
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : (window.location.hostname.includes('onrender.com')
            ? 'https://careersync-backend-oldo.onrender.com/api'
            : '/api'));

let currentUser = null;
let authCheckPromise = null;

// Check current authentication status
export async function checkAuth() {
    // Return existing promise if check is already in progress
    if (authCheckPromise) {
        return authCheckPromise;
    }

    authCheckPromise = (async () => {
        try {
            // First, check backend for authenticated user (via cookies)
            const resp = await fetch(`${API_BASE}/auth/me`, {
                credentials: 'include' // Include cookies
            });
            
            if (resp.ok) {
                const data = await resp.json();
                currentUser = data.user;
                return data.user;
            }
        } catch (error) {
            console.warn('Backend auth check failed:', error);
        }

        // Fallback: Check localStorage for user data (demo/offline mode)
        try {
            const userFromStorage = localStorage.getItem('careersync_user');
            if (userFromStorage) {
                currentUser = JSON.parse(userFromStorage);
                console.log('Using localStorage user:', currentUser.email);
                return currentUser;
            }
        } catch (error) {
            console.error('Error parsing localStorage user:', error);
        }

        currentUser = null;
        return null;
    })()
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
    
    // Clear all auth data
    currentUser = null;
    localStorage.removeItem('careersync_user');
    localStorage.removeItem('careersync_token');
    localStorage.removeItem('careersync_auth');
    
    // Redirect to login
    const landingUrl = (typeof window.getModuleUrls === 'function')
        ? window.getModuleUrls().landing + '/auth.html'
        : '/auth.html';
    window.location.href = landingUrl;
}

// Redirect to login if not authenticated
export async function requireAuth() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        window.location.href = '/auth.html';
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
