// Shared Navigation Handler for All CareerOS Modules
(function() {
    // Module routes mapping
    const moduleRoutes = {
        'course': 'http://localhost:3000',
        'roadmap': 'http://localhost:5173',
        'skillEval': 'http://localhost:3001'
    };

    // Handle navigation for data-module-target links
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-module-target]').forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                const module = this.getAttribute('data-module-target');
                const url = moduleRoutes[module];
                if (url) {
                    window.location.href = url;
                } else {
                    console.warn('Module route not found:', module);
                }
            });
        });
    });
})();
