import { register, login, requestOtp, loginWithOtp } from './api-auth.js';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '844001953688-5r9hfnp15akd17ouu20h2hgv8s4jbprm.apps.googleusercontent.com'; // Replace with your actual Google Client ID

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Google Sign-In
    initializeGoogleSignIn();

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
            
            // Force immediate redirect
            console.log('Login successful, redirecting...');
            setTimeout(() => {
                window.location.href = 'http://localhost:4173/';
            }, 100);
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
            console.log('Registration successful:', result);
            
            // Store user data and token
            localStorage.setItem('careeros_user', JSON.stringify({ 
                email: result.user.email,
                id: result.user.id,
                name: result.user.name || name || result.user.email.split('@')[0]
            }));
            localStorage.setItem('careeros_token', result.token);
            
            setButtonLoading(submitBtn, false);
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.style.cssText = 'color: #10b981; background: #d1fae5; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 14px;';
            successDiv.textContent = 'Account created successfully! Redirecting...';
            forms.signup.insertBefore(successDiv, forms.signup.firstChild);
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'http://localhost:4173/';
            }, 1000);
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

// ===== GOOGLE SIGN-IN INTEGRATION =====

function initializeGoogleSignIn() {
    // Wait for Google SDK to load
    const initGoogle = () => {
        if (typeof google !== 'undefined' && google.accounts) {
            try {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleSignIn,
                    auto_select: false,
                });
                console.log('✅ Google Sign-In initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing Google Sign-In:', error);
            }
        } else {
            console.log('⏳ Waiting for Google SDK to load...');
            setTimeout(initGoogle, 500);
        }
    };

    // Start initialization
    setTimeout(initGoogle, 100);

    // Attach click handlers to Google buttons
    const googleSignInBtn = document.getElementById('google-signin-btn');
    const googleSignUpBtn = document.getElementById('google-signup-btn');

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Google Sign-In button clicked');
            triggerGoogleSignIn();
        });
    }

    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Google Sign-Up button clicked');
            triggerGoogleSignIn();
        });
    }
}

function triggerGoogleSignIn() {
    console.log('Triggering Google Sign-In...');
    
    if (typeof google === 'undefined' || !google.accounts) {
        console.error('❌ Google Sign-In SDK not loaded');
        alert('Google Sign-In is loading. Please wait a moment and try again.');
        
        // Try to reinitialize
        setTimeout(() => {
            initializeGoogleSignIn();
        }, 1000);
        return;
    }
    
    try {
        google.accounts.id.prompt((notification) => {
            console.log('Google prompt notification:', notification);
            
            if (notification.isNotDisplayed()) {
                console.log('Prompt not displayed, using alternative flow');
                // Show a message to user
                alert('Please enable pop-ups or click the button again to sign in with Google.');
            } else if (notification.isSkippedMoment()) {
                console.log('User skipped the moment');
            }
        });
    } catch (error) {
        console.error('Error triggering Google Sign-In:', error);
        alert('Unable to start Google Sign-In. Please try using email/password instead.');
    }
}

async function handleGoogleSignIn(response) {
    try {
        // Decode the JWT credential
        const credential = response.credential;
        const payload = parseJwt(credential);
        
        console.log('Google Sign-In successful:', payload);

        // Create user object from Google data
        const user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            email_verified: payload.email_verified,
            google_id: payload.sub,
        };

        // Store user data in localStorage
        localStorage.setItem('careeros_user', JSON.stringify({
            email: user.email,
            id: user.google_id,
            name: user.name,
            picture: user.picture,
            google_id: user.google_id,
            email_verified: user.email_verified
        }));
        
        // Generate a simple token (in production, you should get this from your backend)
        localStorage.setItem('careeros_token', `google_${credential}`);
        
        // Optional: Send to backend to register/verify user
        try {
            await fetch('http://localhost:5000/api/auth/google-signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    credential,
                    user: user
                })
            });
        } catch (backendError) {
            console.warn('Backend registration skipped:', backendError);
        }

        // Redirect to home
        console.log('Google Sign-In successful, redirecting...');
        setTimeout(() => {
            window.location.href = 'http://localhost:4173/';
        }, 100);
    } catch (error) {
        console.error('Error handling Google Sign-In:', error);
        alert('Failed to sign in with Google. Please try again.');
    }
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}
