/**
 * CORS origin allowlist for the unified Career Sync deployment.
 *
 * - Dev origins are fixed (Next.js dev server on :3002, fallback :3000)
 * - Production origins are read from the CORS_ORIGINS env var as a comma-separated list,
 *   e.g. CORS_ORIGINS="https://careersync.vercel.app,https://app.careersync.com"
 */

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
];

export function getCorsOrigins() {
  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (process.env.FRONTEND_URL) {
    const frontend = process.env.FRONTEND_URL.trim().replace(/\/$/, '');
    if (frontend && !envOrigins.includes(frontend)) {
      envOrigins.push(frontend);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return envOrigins;
  }
  return [...new Set([...DEV_ORIGINS, ...envOrigins])];
}
