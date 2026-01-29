import './style.css';
import { getCurrentUser, signOut } from './supabase-auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Point to YOUR ORIGINAL modules on their respective ports
    const defaultModuleLinks = {
        course: 'http://localhost:3005',      // Next.js Course Generation (was 3000)
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
});

    // Check Auth State
    await checkAuthState();

    async function checkAuthState() {
        // Check Supabase auth first
        const { user, userData } = await getCurrentUser();
        
        // Also check localStorage for backward compatibility
        const localUser = localStorage.getItem('careeros_user');

        if (user || localUser) {
            // User is LOGGED IN
            const displayUser = user || JSON.parse(localUser);
            const userEmail = displayUser.email || '';
            const userInitial = userEmail.charAt(0).toUpperCase() || 'U';

            // Update Nav
            if (navAuthContainer) {
                navAuthContainer.innerHTML = `
                    <div class="user-menu">
                        <div class="user-avatar" title="${userEmail}">${userInitial}</div>
                        <button id="btn-logout" class="logout-btn">Sign Out</button>
                    </div>
                `;

                // Attach Logout Listener
                document.getElementById('btn-logout').addEventListener('click', handleLogout);
            }

// Navbar active state on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
    }
});

// Mobile menu toggle (if needed)
const navLinks = document.querySelector('.nav-links');

// Add animation on scroll for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

    async function handleLogout() {
        if (confirm('Are you sure you want to sign out?')) {
            // Sign out from Supabase
            await signOut();
            
            // Clear localStorage
            localStorage.removeItem('careeros_user');
            
            // Refresh state
            await checkAuthState();
            
            // Optional: Reload page to clear any other state
            window.location.reload();
        }
    });
}, observerOptions);

// Observe feature cards and module cards
document.querySelectorAll('.feature-card, .module-card, .step').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Log module status
console.log('CareerOS Landing Page loaded successfully');
console.log('Available modules:');
console.log('- Course Generator: http://localhost:3000');
console.log('- Skill Evaluator: http://localhost:3001');
console.log('- Roadmap Generator: http://localhost:5173');
