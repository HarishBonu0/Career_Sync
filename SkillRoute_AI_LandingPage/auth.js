import './style.css';

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

    // Login Handler
    forms.login.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Simple mock auth
        if (email && password) {
            // Check localstorage for existing user if we were doing real matching, 
            // but for this demo verify "any" login or just save.
            localStorage.setItem('careeros_user', JSON.stringify({ email }));
            window.location.href = 'index.html';
        }
    });

    // Signup Handler
    forms.signup.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (email && password) {
            localStorage.setItem('careeros_user', JSON.stringify({ email }));
            // In reality, we'd save credentials to a DB.
            alert('Account created! Redirecting...');
            window.location.href = 'index.html';
        }
    });

    // Forgot Password Handler
    forms.forgot.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const btn = forms.forgot.querySelector('button');

        if (email) {
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            // SERVICE ID: service_itdedgy (Provided by User)
            // TEMPLATE ID: template_qqg9udy
            const serviceID = 'service_itdedgy';
            const templateID = 'template_qqg9udy';

            const date = new Date().toLocaleString();
            const templateParams = {
                from: 'AI Skill Evaluator',
                email: email,
                to_email: email, // Valid fallback
                passcode: Math.floor(1000 + Math.random() * 9000),
                time: date
            };

            emailjs.send(serviceID, templateID, templateParams)
                .then(() => {
                    alert(`OTP sent to ${email}`);
                    switchView('verify');
                })
                .catch((err) => {
                    console.error('Email send failed:', err);
                    alert('Failed to send OTP. Please check console/credentials.');
                })
                .finally(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                });
        }
    });

    // Verify OTP Handler
    forms.verify.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Password reset successful. Please login.');
        switchView('login');
    });
});
