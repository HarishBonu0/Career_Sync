import { register, login, getUser, setUser, setToken, getToken } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to home
  if (getUser()) {
    window.location.href = '/';
    return;
  }

  // Set initial form to signin
  document.getElementById('signin-form').classList.add('active');
});

function switchForm(formType) {
  document.getElementById('signin-form').classList.remove('active');
  document.getElementById('signup-form').classList.remove('active');
  document.getElementById(formType + '-form').classList.add('active');
  document.getElementById('auth-message').textContent = '';
  document.getElementById('auth-message').className = 'auth-message';
}

async function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;
  const messageEl = document.getElementById('auth-message');

  try {
    messageEl.textContent = 'Signing in...';
    messageEl.className = 'auth-message';

    const result = await login(email, password);

    if (result.token && result.user) {
      setToken(result.token);
      setUser(result.user);
      messageEl.textContent = 'Login successful! Redirecting...';
      messageEl.className = 'auth-message success';
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } else {
      messageEl.textContent = result.error || 'Login failed';
      messageEl.className = 'auth-message error';
    }
  } catch (error) {
    messageEl.textContent = 'Error: ' + error.message;
    messageEl.className = 'auth-message error';
  }
}

async function handleSignUp(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-password-confirm').value;
  const messageEl = document.getElementById('auth-message');

  if (password !== confirmPassword) {
    messageEl.textContent = 'Passwords do not match';
    messageEl.className = 'auth-message error';
    return;
  }

  if (password.length < 6) {
    messageEl.textContent = 'Password must be at least 6 characters';
    messageEl.className = 'auth-message error';
    return;
  }

  try {
    messageEl.textContent = 'Creating account...';
    messageEl.className = 'auth-message';

    const result = await register(email, password);

    if (result.token && result.user) {
      setToken(result.token);
      setUser(result.user);
      messageEl.textContent = 'Account created! Redirecting...';
      messageEl.className = 'auth-message success';
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } else {
      messageEl.textContent = result.error || 'Sign up failed';
      messageEl.className = 'auth-message error';
    }
  } catch (error) {
    messageEl.textContent = 'Error: ' + error.message;
    messageEl.className = 'auth-message error';
  }
}

window.switchForm = switchForm;
window.handleSignIn = handleSignIn;
window.handleSignUp = handleSignUp;
