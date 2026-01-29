/**
 * CareerOS Authentication Debug Tool
 * Run this in browser console to diagnose authentication issues
 */

console.log('🔍 CareerOS Authentication Debug Tool');
console.log('=====================================\n');

// Check localStorage
console.log('📦 LocalStorage Data:');
console.log('--------------------');
const user = localStorage.getItem('careeros_user');
const token = localStorage.getItem('careeros_token');
const profileData = localStorage.getItem('careeros_profile_data');
const visits = localStorage.getItem('careeros_profile_visits');

if (user) {
    try {
        const userData = JSON.parse(user);
        console.log('✅ User Data Found:');
        console.log('   ID:', userData.id);
        console.log('   Email:', userData.email);
        console.log('   Name:', userData.name);
        console.log('   Google ID:', userData.google_id || 'N/A');
        console.log('   Email Verified:', userData.email_verified || 'N/A');
    } catch (e) {
        console.error('❌ Invalid user data in localStorage:', e);
    }
} else {
    console.log('❌ No user data found in localStorage');
}

if (token) {
    console.log('✅ Token Found:', token.substring(0, 50) + '...');
} else {
    console.log('❌ No token found in localStorage');
}

if (profileData) {
    try {
        const profile = JSON.parse(profileData);
        console.log('✅ Profile Data:');
        console.log('   Last Accessed:', profile.lastAccessed);
        console.log('   Visit Count:', profile.visitCount);
    } catch (e) {
        console.error('❌ Invalid profile data:', e);
    }
} else {
    console.log('⚠️ No profile data (this is normal on first login)');
}

console.log('   Total Visits:', visits || '0');

// Check Google Sign-In
console.log('\n🔐 Google Sign-In Status:');
console.log('-------------------------');
if (typeof google !== 'undefined' && google.accounts) {
    console.log('✅ Google Sign-In SDK loaded');
    console.log('   API Version: Available');
} else {
    console.log('❌ Google Sign-In SDK not loaded');
    console.log('   Make sure the script is included in <head>:');
    console.log('   <script src="https://accounts.google.com/gsi/client" async defer></script>');
}

// Check current page
console.log('\n🌐 Current Page:');
console.log('----------------');
console.log('   URL:', window.location.href);
console.log('   Hostname:', window.location.hostname);
console.log('   Port:', window.location.port);

// Check auth containers
console.log('\n🎨 UI Elements:');
console.log('---------------');
const authContainer = document.getElementById('careeros-nav-auth') || document.querySelector('.careeros-nav-auth');
if (authContainer) {
    console.log('✅ Auth container found');
    console.log('   Content:', authContainer.innerHTML.substring(0, 100) + '...');
} else {
    console.log('❌ Auth container not found on this page');
}

// Check if shared header is loaded
if (typeof window.careeroHeader !== 'undefined') {
    console.log('✅ Shared header script loaded');
} else {
    console.log('⚠️ Shared header script not detected (may be using different implementation)');
}

// Test authentication function
console.log('\n🧪 Testing Authentication:');
console.log('-------------------------');
if (user && token) {
    console.log('✅ User is authenticated');
    console.log('   You should see your profile in the header');
} else {
    console.log('❌ User is NOT authenticated');
    console.log('   You should see a "Sign In" button');
}

// Recommendations
console.log('\n💡 Recommendations:');
console.log('------------------');
if (!user || !token) {
    console.log('1. Try signing in at: http://localhost:4173/auth.html');
    console.log('2. Use Google Sign-In or email/password');
    console.log('3. Check browser console for any errors during sign-in');
}

if (user && token && !authContainer) {
    console.log('1. Refresh the page');
    console.log('2. Check if shared-header.js is included in this page');
    console.log('3. Verify auth container element exists in HTML');
}

// Helper functions
console.log('\n🛠️ Helper Functions:');
console.log('-------------------');
console.log('Run these commands to test:');
console.log('');
console.log('// Clear all auth data:');
console.log('clearAuth()');
console.log('');
console.log('// Force auth check:');
console.log('forceAuthCheck()');
console.log('');
console.log('// Show current user:');
console.log('showCurrentUser()');

// Define helper functions
window.clearAuth = function() {
    localStorage.removeItem('careeros_user');
    localStorage.removeItem('careeros_token');
    localStorage.removeItem('careeros_auth');
    localStorage.removeItem('careeros_profile_data');
    localStorage.removeItem('careeros_profile_visits');
    console.log('✅ All authentication data cleared');
    console.log('   Refresh the page to see changes');
};

window.forceAuthCheck = function() {
    console.log('🔄 Forcing authentication check...');
    if (typeof checkAuthenticationStatus === 'function') {
        checkAuthenticationStatus();
        console.log('✅ Landing page auth check triggered');
    } else if (typeof checkEvaluatorAuth === 'function') {
        checkEvaluatorAuth();
        console.log('✅ Evaluator page auth check triggered');
    } else if (typeof window.careeroHeader !== 'undefined') {
        window.careeroHeader.checkAuthStatus();
        console.log('✅ Shared header auth check triggered');
    } else {
        console.log('⚠️ No auth check function found on this page');
    }
};

window.showCurrentUser = function() {
    const user = localStorage.getItem('careeros_user');
    if (user) {
        console.log('Current user:', JSON.parse(user));
    } else {
        console.log('No user logged in');
    }
};

console.log('\n✅ Debug tool loaded successfully!');
console.log('=====================================');
