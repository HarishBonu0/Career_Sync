import { getUser, clearAuth } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
});

function updateAuthUI() {
  const user = getUser();
  const navAuth = document.getElementById('nav-auth');

  if (user) {
    navAuth.innerHTML = `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <span style="color: var(--text-secondary);">${user.email}</span>
        <button class="btn btn-secondary" onclick="handleLogout()">Sign Out</button>
      </div>
    `;
  } else {
    navAuth.innerHTML = `<a href="/auth" class="btn btn-primary">Sign In</a>`;
  }
}

function navigateTo(path) {
  if (!getUser()) {
    alert('Please sign in first');
    window.location.href = '/auth';
    return;
  }
  
  // Map paths to module URLs
  const moduleUrls = {
    '/course': 'http://localhost:3005',  // Course Generation Module (Next.js)
    '/roadmap': 'http://localhost:5173', // Roadmap Module (Vite)
    '/skill-eval': 'http://localhost:3001' // Test Generation/Evaluator Module
  };
  
  // If it's a module, open in new tab
  if (moduleUrls[path]) {
    window.open(moduleUrls[path], '_blank');
  } else {
    window.location.href = path;
  }
}

function navigateToAuth() {
  const user = getUser();
  if (user) {
    // Open course module in new tab\n    window.open('http://localhost:3005', '_blank');
  } else {
    window.location.href = '/auth';
  }
}

function logout() {
  handleLogout();
}

function handleLogout() {
  if (confirm('Are you sure you want to sign out?')) {
    clearAuth();
    window.location.href = '/';
  }
}

// Export functions globally for onclick handlers
window.navigateTo = navigateTo;
window.navigateToAuth = navigateToAuth;
window.handleLogout = handleLogout;
window.logout = logout;

window.navigateTo = navigateTo;
window.navigateToAuth = navigateToAuth;
window.logout = logout;
window.handleLogout = handleLogout;
