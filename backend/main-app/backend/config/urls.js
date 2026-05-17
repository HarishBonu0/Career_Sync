/**
 * Canonical deployment URLs for CareerSync services.
 */
export const PRODUCTION_URLS = {
  landing: 'https://careersync-landing.onrender.com',
  course: 'https://careersync-course-gen.onrender.com',
  roadmap: 'https://careersync-roadmap.onrender.com',
  skillEval: 'https://careersync-evaluator.onrender.com',
  backend: 'https://careersync-backend.onrender.com',
};

export const DEVELOPMENT_URLS = {
  landing: 'http://localhost:4173',
  course: 'http://localhost:3002',
  roadmap: 'http://localhost:5173',
  skillEval: 'http://localhost:3001',
  backend: 'http://localhost:5000',
};

export function getCorsOrigins() {
  const dev = Object.values(DEVELOPMENT_URLS);
  const prod = Object.values(PRODUCTION_URLS);
  // Legacy Render hostnames still in use
  const legacy = [
    'https://careersync-landing-oldo.onrender.com',
    'https://careersync-course-gen-oldo.onrender.com',
    'https://careersync-roadmap-oldo.onrender.com',
    'https://careersync-backend-oldo.onrender.com',
    'https://career-sync-skill-evalutor.onrender.com',
  ];
  return [...new Set([...dev, ...prod, ...legacy])];
}
