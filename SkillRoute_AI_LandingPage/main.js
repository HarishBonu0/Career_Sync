// Module navigation mapping
const moduleRoutes = {
    'course': 'http://localhost:3000',      // Course Generation (Next.js)
    'roadmap': 'http://localhost:5173',     // Roadmap Module (Vite)
    'skillEval': 'http://localhost:3001'    // Test Generation/Skill Evaluator
};

// Handle module navigation
document.querySelectorAll('[data-module-target]').forEach(element => {
    element.addEventListener('click', function(e) {
        e.preventDefault();
        const module = this.getAttribute('data-module-target');
        const url = moduleRoutes[module];
        if (url) {
            window.open(url, '_blank');
        } else {
            console.warn('Module route not found:', module);
        }
    });
});

// Smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

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

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
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
