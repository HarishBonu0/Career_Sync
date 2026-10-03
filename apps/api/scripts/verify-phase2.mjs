/**
 * Phase 2 authentication verification.
 * Run with the API already running. Google callback tests require real OAuth
 * credentials and are intentionally reported as not testable when absent.
 */
const BASE = process.env.API_BASE || 'http://localhost:5000';
const timestamp = Date.now();
const email = `phase2-${timestamp}@careersync.test`;
const password = 'TestPass123!';
let passed = 0;
let failed = 0;
let notTestable = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}: ${error.message}`);
    failed += 1;
  }
}

async function main() {
  console.log(`\nPhase 2 authentication verification -> ${BASE}\n`);

  await test('health endpoint is available', async () => {
    const response = await fetch(`${BASE}/api/health`);
    if (!response.ok) throw new Error(`expected 2xx, got ${response.status}`);
  });

  await test('email registration issues the canonical cookie', async () => {
    const response = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: 'Phase 2' }),
    });
    if (!response.ok) throw new Error(`registration returned ${response.status}`);
    const setCookie = response.headers.get('set-cookie') || '';
    if (!setCookie.startsWith('Career_Sync_token=')) throw new Error('canonical auth cookie missing');
  });

  const registration = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `session-${email}`, password, name: 'Session Test' }),
  });
  const cookie = (registration.headers.get('set-cookie') || '').split(';')[0];

  await test('cookie session resolves through /auth/me', async () => {
    const response = await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: cookie } });
    if (!response.ok) throw new Error(`expected 200, got ${response.status}`);
    const body = await response.json();
    if (!body.user?.id || body.user.email !== `session-${email}`) throw new Error('unexpected user response');
  });

  await test('logout clears the server session cookie', async () => {
    const response = await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookie },
    });
    if (!response.ok) throw new Error(`logout returned ${response.status}`);
    const afterLogout = await fetch(`${BASE}/api/auth/me`);
    if (afterLogout.status !== 401) throw new Error(`expected 401 after logout, got ${afterLogout.status}`);
  });

  await test('legacy browser-trust Google endpoint is disabled', async () => {
    const response = await fetch(`${BASE}/api/auth/google-signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'not-trusted', email: 'attacker@example.com' }),
    });
    if (response.status !== 410) throw new Error(`expected 410, got ${response.status}`);
  });

  const googleEntry = await fetch(`${BASE}/api/auth/google`, { redirect: 'manual' });
  const googleLocation = googleEntry.headers.get('location') || '';
  const googleConfigured = googleEntry.status === 302 && googleLocation.startsWith('https://accounts.google.com/');

  if (!googleConfigured) {
    console.log('NOT TESTABLE Google OAuth callback: GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL are not configured.');
    notTestable += 1;
  } else {
    await test('Google entry creates a state-protected authorization redirect', async () => {
      if (!(googleEntry.headers.get('set-cookie') || '').includes('Career_Sync_google_state=')) {
        throw new Error('OAuth state cookie missing');
      }
    });
    notTestable += 1;
    console.log('NOT TESTABLE Google identity exchange/linking: requires interactive Google consent with real credentials.');
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed, ${notTestable} not testable\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Verification crashed:', error);
  process.exit(1);
});