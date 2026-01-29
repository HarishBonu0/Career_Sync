import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    // Point to YOUR ORIGINAL modules on their respective ports
    const defaultModuleLinks = {
        course: 'http://localhost:3000',      // Next.js Course Generation
        roadmap: 'http://localhost:5173',     // Vite Roadmap Module
        skillEval: 'http://localhost:3001'    // React Test Generation
    };

    // Allow overrides via global config for flexibility across environments
    const MODULE_LINKS = { ...defaultModuleLinks, ...(window.CAREEROS_MODULE_URLS || {}) };

    // UI Elements
    const navAuthContainer = document.getElementById('nav-auth-container');
    const heroBtn = document.getElementById('hero-cta-btn');

    // Wire module launch buttons/links
    document.querySelectorAll('[data-module-target]').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const targetKey = el.getAttribute('data-module-target');
            const directUrl = el.getAttribute('data-module-url');
            const url = (targetKey && MODULE_LINKS[targetKey]) || directUrl;

            if (url) {
                window.location.href = url;
            } else {
                console.warn(`No module URL configured for target: ${targetKey}`);
            }
        });
    });

    // Check Auth State
    checkAuthState();

    function checkAuthState() {
        const userJSON = localStorage.getItem('careeros_user');

        if (userJSON) {
            // User is LOGGED IN
            const user = JSON.parse(userJSON);
            const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

            // Update Nav
            if (navAuthContainer) {
                navAuthContainer.innerHTML = `
                    <div class="user-menu">
                        <div class="user-avatar" title="${user.email}">${userInitial}</div>
                        <button id="btn-logout" class="logout-btn">Sign Out</button>
                    </div>
                `;

                // Attach Logout Listener
                document.getElementById('btn-logout').addEventListener('click', handleLogout);
            }

            // Update Hero CTA label only; click stays bound to module navigation
            if (heroBtn) {
                heroBtn.textContent = 'Launch Course Generator';
            }

        } else {
            // User is LOGGED OUT
            if (navAuthContainer) {
                navAuthContainer.innerHTML = `
                    <a href="/auth.html" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">Sign In</a>
                `;
            }

            if (heroBtn) {
                heroBtn.textContent = 'Start Intelligence Engine';
            }
        }
    }

    function handleLogout() {
        if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('careeros_user');
            // Refresh state
            checkAuthState();
            // Optional: Reload page to clear any other state
            // window.location.reload(); 
        }
    }

    console.log('CareerOS: Auth State Checked.');
});
