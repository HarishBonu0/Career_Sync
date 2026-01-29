import './style.css';
import { signUp, signIn, resetPassword } from './supabase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const views = {
        login: document.getElementById('view-login'),
        signup: document.getElementById('view-signup'),
        forgot: document.getElementById('view-forgot'),
        verify: document.getElementById('view-verify')
    };

    const forms = {
        login: document.getElementById('form-login'),
        signup: document.getElementById('form-signup'),
        forgot: document.getElementById('form-forgot'),
        verify: document.getElementById('form-verify')
    };

    // Navigation Switchers
    document.querySelectorAll('[data-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = e.target.getAttribute('data-target');
            switchView(targetView);
        });
    });

    function switchView(viewName) {
        Object.values(views).forEach(el => el.classList.add('hidden'));
        if (views[viewName]) {
            views[viewName].classList.remove('hidden');
        }
    }

    function showError(form, message) {
        // Remove existing error message if any
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #ef4444; background: #fee2e2; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 14px;';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);
    }

    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }

    // Login Handler with Supabase
    forms.login.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = forms.login.querySelector('button[type="submit"]');

        setButtonLoading(submitBtn, true);

        const result = await signIn(email, password);

        if (result.success) {
            // Store user info in localStorage for cross-module compatibility
            localStorage.setItem('careeros_user', JSON.stringify({ 
                email: result.user.email,
                id: result.user.id,
                userData: result.userData
            }));
            window.location.href = 'index.html';
        } else {
            setButtonLoading(submitBtn, false);
            showError(forms.login, result.error || 'Invalid email or password');
        }
    });

    // Signup Handler with Supabase
    forms.signup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const submitBtn = forms.signup.querySelector('button[type="submit"]');

        // Basic validation
        if (password.length < 6) {
            showError(forms.signup, 'Password must be at least 6 characters');
            return;
        }

        setButtonLoading(submitBtn, true);

        const result = await signUp(email, password);

        if (result.success) {
            // Store user info in localStorage
            localStorage.setItem('careeros_user', JSON.stringify({ 
                email: result.user.email,
                id: result.user.id,
                userData: result.userData
            }));
            alert('Account created successfully! Welcome to CareerOS.');
            window.location.href = 'index.html';
        } else {
            setButtonLoading(submitBtn, false);
            showError(forms.signup, result.error || 'Failed to create account');
        }
    });

    // Forgot Password Handler with Supabase
    forms.forgot.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const btn = forms.forgot.querySelector('button[type="submit"]');

        if (email) {
            setButtonLoading(btn, true);

            const result = await resetPassword(email);

            if (result.success) {
                alert(`Password reset link sent to ${email}. Please check your email.`);
                switchView('login');
            } else {
                showError(forms.forgot, result.error || 'Failed to send reset email');
            }

            setButtonLoading(btn, false);
        }
    });

    // Verify OTP Handler
    forms.verify.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Password reset successful. Please login.');
        switchView('login');
    });
});
