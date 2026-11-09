/**
 * Phase 3 persistence journey. Uses the live API and MongoDB; no direct DB
 * writes or mock records are used.
 */
const BASE = process.env.API_BASE || 'http://localhost:5000';
let passed = 0;
let failed = 0;

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

async function request(path, options = {}, cookie = '') {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  if (cookie) headers.Cookie = cookie;
  const response = await fetch(`${BASE}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  return { response, body, cookie: (response.headers.get('set-cookie') || '').split(';')[0] };
}

async function register(label) {
  const email = `phase3-${label}-${Date.now()}@careersync.test`;
  const result = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'TestPass123!', name: `Phase 3 ${label}` }),
  });
  if (!result.response.ok || !result.cookie) throw new Error(`registration failed: ${result.response.status}`);
  return { email, password: 'TestPass123!', cookie: result.cookie, userId: result.body.user.id };
}

async function main() {
  console.log(`\nPhase 3 persistence verification -> ${BASE}\n`);
  const userA = await register('a');
  let courseId;
  let roadmapId;
  let evaluationId;

  await test('profile self endpoint resolves the authenticated user', async () => {
    const result = await request('/api/profile/me', {}, userA.cookie);
    if (!result.response.ok || result.body.profile?.userId !== userA.userId) throw new Error(`unexpected profile response: ${result.response.status}`);
  });

  await test('course save and durable retrieval', async () => {
    const saved = await request('/api/courses/save', {
      method: 'POST',
      body: JSON.stringify({
        title: `Phase 3 Course ${Date.now()}`,
        description: 'Persistence verification course',
        modules: [{ title: 'Module 1' }, { title: 'Module 2' }],
      }),
    }, userA.cookie);
    if (!saved.response.ok || !saved.body.courseId) throw new Error(`save failed: ${saved.response.status}`);
    courseId = saved.body.courseId;
    const retrieved = await request(`/api/courses/${courseId}`, {}, userA.cookie);
    if (!retrieved.response.ok || retrieved.body.data?._id?.toString() !== courseId.toString()) throw new Error('course retrieval failed');
  });

  await test('course enrollment is durable and idempotent', async () => {
    const payload = { courseId, courseTitle: 'Phase 3 Course', courseModuleCount: 2 };
    const first = await request('/api/profile/enroll/course', { method: 'POST', body: JSON.stringify(payload) }, userA.cookie);
    const second = await request('/api/profile/enroll/course', { method: 'POST', body: JSON.stringify(payload) }, userA.cookie);
    if (!first.response.ok || !second.response.ok) throw new Error(`enrollment failed: ${first.response.status}/${second.response.status}`);
    if (first.body.enrollment?._id?.toString() !== second.body.enrollment?._id?.toString()) throw new Error('duplicate enrollment created');
    const list = await request('/api/courses/enrollments/my', {}, userA.cookie);
    if (!list.response.ok || !list.body.data?.some((item) => item.courseId?.toString() === courseId.toString())) throw new Error('enrollment list missing course');
  });

  await test('course progress survives through the course API', async () => {
    const update = await request(`/api/courses/${courseId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress: 50, currentModule: 1, completedModules: [1] }),
    }, userA.cookie);
    if (!update.response.ok || update.body.data?.course?.progress !== 50) throw new Error(`progress update failed: ${update.response.status}`);
    const profile = await request('/api/profile/me', {}, userA.cookie);
    const course = profile.body.profile?.courses?.find((item) => item.id?.toString() === courseId.toString());
    if (course?.progress !== 50) throw new Error('profile did not return persisted course progress');
  });

  await test('roadmap creation and progress are durable', async () => {
    const created = await request('/api/roadmaps', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Phase 3 Roadmap',
        currentRole: 'Student',
        targetRole: 'Engineer',
        stages: 2,
        milestones: [{ title: 'Foundation' }, { title: 'Project' }],
      }),
    }, userA.cookie);
    if (!created.response.ok || !created.body.roadmapId) throw new Error(`roadmap create failed: ${created.response.status}`);
    roadmapId = created.body.roadmapId;
    const update = await request(`/api/roadmaps/${roadmapId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress: 50, completedStages: [0] }),
    }, userA.cookie);
    if (!update.response.ok || update.body.data?.progress !== 50) throw new Error('roadmap progress failed');
    const retrieved = await request(`/api/roadmaps/${roadmapId}`, {}, userA.cookie);
    if (!retrieved.response.ok || retrieved.body.data?.progress !== 50) throw new Error('roadmap retrieval lost progress');
  });

  await test('skill evaluation submission updates history and skill profile', async () => {
    const created = await request('/api/skills/', {
      method: 'POST',
      body: JSON.stringify({
        skillName: 'Phase 3 Testing',
        difficulty: 'beginner',
        questions: [{ question: 'One?', options: ['yes', 'no'], correctAnswer: 'yes' }],
        status: 'in-progress',
      }),
    }, userA.cookie);
    if (!created.response.ok || !created.body.evaluationId) throw new Error(`evaluation create failed: ${created.response.status}`);
    evaluationId = created.body.evaluationId;
    const submitted = await request('/api/skills/submit', {
      method: 'POST',
      body: JSON.stringify({ evaluationId, answers: { 0: 'yes' } }),
    }, userA.cookie);
    if (!submitted.response.ok || submitted.body.status !== 'completed') throw new Error('evaluation submission failed');
    const profile = await request('/api/skills/profile/me', {}, userA.cookie);
    if (!profile.response.ok || !profile.body.data?.skills?.some((skill) => skill.name === 'Phase 3 Testing')) throw new Error('skill profile not updated');
    const history = await request('/api/skills', {}, userA.cookie);
    if (!history.response.ok || !history.body.evaluations?.some((item) => item._id?.toString() === evaluationId.toString())) throw new Error('evaluation history missing');
  });

  const userB = await register('b');
  await test('second user cannot access the first user data', async () => {
    for (const path of [`/api/courses/${courseId}`, `/api/roadmaps/${roadmapId}`, `/api/skills/${evaluationId}`, `/api/profile/${userA.userId}`]) {
      const result = await request(path, {}, userB.cookie);
      if (![403, 404].includes(result.response.status)) throw new Error(`${path} returned ${result.response.status}`);
    }
  });

  await test('logout and login preserve the first user data', async () => {
    await request('/api/auth/logout', { method: 'POST' }, userA.cookie);
    const login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: userA.email, password: userA.password }),
    });
    if (!login.response.ok || !login.cookie) throw new Error('re-login failed');
    const profile = await request('/api/profile/me', {}, login.cookie);
    if (!profile.response.ok || !profile.body.profile?.courses?.length || !profile.body.profile?.roadmaps?.length || !profile.body.profile?.evaluations?.length) {
      throw new Error('data did not survive logout/login');
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Verification crashed:', error);
  process.exit(1);
});