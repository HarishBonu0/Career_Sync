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
  window.location.href = path;
}

function navigateToAuth() {
  const user = getUser();
  if (user) {
    window.location.href = '/course';
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

window.navigateTo = navigateTo;
window.navigateToAuth = navigateToAuth;
window.logout = logout;
window.handleLogout = handleLogout;
