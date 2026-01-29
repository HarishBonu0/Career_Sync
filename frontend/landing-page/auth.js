import { register, login, requestOtp, loginWithOtp } from './api-auth.js';

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

    // Login Handler via backend API
    forms.login.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = forms.login.querySelector('button[type="submit"]');

        setButtonLoading(submitBtn, true);
        const result = await login(email, password);

        if (result.success) {
            localStorage.setItem('careeros_user', JSON.stringify({ 
                email: result.user.email,
                id: result.user.id,
                name: result.user.name || result.user.email.split('@')[0]
            }));
            localStorage.setItem('careeros_token', result.token);
            window.location.href = '/';
        } else {
            setButtonLoading(submitBtn, false);
            showError(forms.login, result.error || 'Invalid email or password');
        }
    });

    // Signup Handler via backend API with OTP verification
    forms.signup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const name = document.getElementById('signup-name')?.value || '';
        const submitBtn = forms.signup.querySelector('button[type="submit"]');

        // Basic validation
        if (password.length < 6) {
            showError(forms.signup, 'Password must be at least 6 characters');
            return;
        }

        if (!email) {
            showError(forms.signup, 'Please enter an email address');
            return;
        }

        setButtonLoading(submitBtn, true);

        // First, register the user
        const result = await register(email, password, name);

        if (result.success) {
            // User created successfully, now send OTP for verification
            const otpResult = await requestOtp(email);
            setButtonLoading(submitBtn, false);
            
            if (otpResult.success) {
                // Redirect to OTP verification page
                window.location.href = `/verify-otp.html?email=${encodeURIComponent(email)}`;
            } else {
                showError(forms.signup, 'Account created, but failed to send OTP. Please sign in.');
            }
        } else {
            setButtonLoading(submitBtn, false);
            showError(forms.signup, result.error || 'Failed to create account');
        }
    });

    // Request OTP (Email) Handler
    forms.forgot.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const btn = forms.forgot.querySelector('button[type="submit"]');
        if (!email) return showError(forms.forgot, 'Please enter your email');
        setButtonLoading(btn, true);
        const result = await requestOtp(email);
        setButtonLoading(btn, false);
        if (result.success) {
            // Redirect to dedicated OTP verification page with reset=true flag
            window.location.href = `/verify-otp.html?email=${encodeURIComponent(email)}&reset=true`;
        } else {
            showError(forms.forgot, result.error || 'Failed to send OTP');
        }
    });

    // Verify OTP Handler via backend API
    forms.verify.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('verify-email').value;
        const otp = document.getElementById('verify-otp').value;
        const btn = forms.verify.querySelector('button[type="submit"]');
        if (!otp) return showError(forms.verify, 'Please enter the OTP from your email');
        setButtonLoading(btn, true);
        const result = await loginWithOtp(email, otp);
        setButtonLoading(btn, false);
        if (result.success) {
            localStorage.setItem('careeros_user', JSON.stringify({ 
                email: result.user.email,
                id: result.user.id,
                name: result.user.name || result.user.email.split('@')[0]
            }));
            localStorage.setItem('careeros_token', result.token);
            window.location.href = '/';
        } else {
            showError(forms.verify, result.error || 'Invalid OTP');
        }
    });
});
