/**
 * Module Configuration - Dynamically handles localhost vs Render URLs
 * This file detects the environment and provides appropriate URLs for navigation
 */

export function getModuleUrls() {
  // Check if running on Render (production)
  const isProduction = window.location.hostname.includes('onrender.com');
  
  if (isProduction) {
    return {
      landing: 'https://careersync-landing.onrender.com',
      course: 'https://careersync-course-gen.onrender.com',
      roadmap: 'https://careersync-roadmap.onrender.com',
      skillEval: 'https://careersync-evaluator.onrender.com',
      backend: 'https://careersync-backend.onrender.com',
    };
  }

  return {
    landing: 'http://localhost:4173',
    course: 'http://localhost:3002',
    roadmap: 'http://localhost:5173',
    skillEval: 'http://localhost:3001',
    backend: 'http://localhost:5000',
  };
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
  return getModuleUrls().skillEval;
}

export function getLandingUrl() {
  const urls = getModuleUrls();
  return urls.landing;
}

// Log current environment for debugging
console.log('[Module Config] Environment:', {
  hostname: window.location.hostname,
  isProduction: window.location.hostname.includes('onrender.com'),
  moduleUrls: getModuleUrls()
});
