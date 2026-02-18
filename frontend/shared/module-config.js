/**
 * Module Configuration - Dynamically handles localhost vs Render URLs
 * This file detects the environment and provides appropriate URLs for navigation
 */

export function getModuleUrls() {
  // Check if running on Render (production)
  const isProduction = window.location.hostname.includes('onrender.com');
  
  if (isProduction) {
    // Get the service name from the hostname
    const hostname = window.location.hostname;
    const baseUrl = hostname.replace(/^[^.]+/, '').substring(1); // Get 'onrender.com' part
    
    return {
      course: `https://careersync-course-gen.${baseUrl}`,
      roadmap: `https://careersync-roadmap.${baseUrl}`,
      skillEval: `https://careersync-evaluator.${baseUrl}`,
      backend: `https://careersync-backend.${baseUrl}`
    };
  } else {
    // Development/localhost
    return {
      course: 'http://localhost:3002',
      roadmap: 'http://localhost:5173',
      skillEval: 'http://localhost:3001',
      backend: 'http://localhost:5000'
    };
  }
}

export function getBackendUrl() {
  const urls = getModuleUrls();
  return urls.backend;
}

export function getCourseUrl() {
  const urls = getModuleUrls();
  return urls.course;
}

export function getRoadmapUrl() {
  const urls = getModuleUrls();
  return urls.roadmap;
}

export function getEvaluatorUrl() {
  const urls = getModuleUrls();
  return urls.skillEval;
}

// Log current environment for debugging
console.log('[Module Config] Environment:', {
  hostname: window.location.hostname,
  isProduction: window.location.hostname.includes('onrender.com'),
  moduleUrls: getModuleUrls()
});
