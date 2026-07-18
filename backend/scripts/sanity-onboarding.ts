/**
 * Curl-style sanity for onboarding → generate (AUTH_DEV_BYPASS=true).
 * Run with backend up: npx ts-node scripts/sanity-onboarding.ts
 */
const BASE = process.env.API_BASE ?? 'http://localhost:3000';
const USER = 'sanity-user';

async function req(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-user-id': USER,
      ...(init?.headers as Record<string, string>),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  const health = await fetch(`${BASE}/health`).then((r) => r.json());
  if (!health.ok) throw new Error('health failed');

  await req('/api/v1/auth/bootstrap', { method: 'POST' });
  const cat = await req('/api/v1/catalogue');
  const topicIds = cat.topics.slice(0, 2).map((t: { id: string }) => t.id);
  const interestIds = cat.interests.slice(0, 2).map((i: { id: string }) => i.id);

  await req('/api/v1/profiles/onboarding', {
    method: 'PUT',
    body: JSON.stringify({
      role: 'student',
      displayName: 'Sanity',
      ageGroup: '11-13',
      topicIds,
      interestIds,
    }),
  });

  const video = await req('/api/v1/videos', { method: 'POST', body: '{}' });
  if (!video.hlsUrl) throw new Error('missing hlsUrl');

  // Teacher path
  const teacher = 'sanity-teacher';
  const theaders = { 'x-user-id': teacher };
  await req('/api/v1/auth/bootstrap', { method: 'POST', headers: theaders });
  await req('/api/v1/profiles/onboarding', {
    method: 'PUT',
    headers: theaders,
    body: JSON.stringify({
      role: 'teacher',
      displayName: 'Teach',
      subjectIds: [cat.topics[0].id],
      gradeBands: ['11-13'],
    }),
  });
  const tv = await req('/api/v1/videos', {
    method: 'POST',
    headers: theaders,
    body: JSON.stringify({ includeLessonPack: true }),
  });
  if (!tv.lessonPackId) throw new Error('teacher missing lessonPackId');
  const pack = await req(`/api/v1/lesson-packs/${tv.lessonPackId}`, { headers: theaders });
  if (!pack.payload?.quiz?.length) throw new Error('empty lesson pack');

  process.stdout.write('SANITY_OK\n');
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
