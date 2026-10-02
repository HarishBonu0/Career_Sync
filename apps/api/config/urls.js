/**
 * CORS origin allowlist for the unified Career Sync deployment.
 *
 * - Dev origins are fixed (Next.js dev server on :3002, fallback :3000)
 * - Production origins are read from the CORS_ORIGINS env var as a comma-separated list,
 *   e.g. CORS_ORIGINS="https://careersync.vercel.app,https://app.careersync.com"
 */

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
];

export function getCorsOrigins() {
  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...DEV_ORIGINS, ...envOrigins])];
}
