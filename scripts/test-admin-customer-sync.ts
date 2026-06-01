/**
 * Smoke test: admin product API ↔ public catalog API.
 *
 * Usage (requires running dev server and admin cookie):
 *   ADMIN_SESSION_COOKIE=authenticated BASE_URL=http://localhost:3000 npx tsx scripts/test-admin-customer-sync.ts
 *
 * Without admin cookie, only runs public catalog read checks.
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const ADMIN_COOKIE = process.env.ADMIN_SESSION_COOKIE;

async function fetchJson(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(ADMIN_COOKIE ? { Cookie: `alma_admin_session=${ADMIN_COOKIE}` } : {}),
      ...init?.headers,
    },
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  let passed = 0;
  let failed = 0;

  function pass(msg: string) {
    passed += 1;
    console.log(`✅ ${msg}`);
  }

  function fail(msg: string) {
    failed += 1;
    console.error(`❌ ${msg}`);
  }

  console.log('--- Public catalog ---');
  const list = await fetchJson('/api/v1/products?limit=5');
  if (list.ok && list.json.status === 'success') {
    pass(`Public products API (${list.json.data?.length ?? 0} items)`);
  } else {
    fail(`Public products API: ${list.status}`);
  }

  const home = await fetchJson('/api/v1/homepage-config');
  if (home.ok && home.json.data?.sections) {
    pass('Homepage config API');
  } else {
    fail('Homepage config API');
  }

  const settings = await fetchJson('/api/v1/settings');
  if (settings.ok && settings.json.data?.storeName) {
    pass(`Settings API (store: ${settings.json.data.storeName})`);
  } else {
    fail('Settings API');
  }

  if (!ADMIN_COOKIE) {
    console.log('\n⚠️  Set ADMIN_SESSION_COOKIE=authenticated to run admin mutation tests.');
    console.log(`\nResult: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  }

  console.log('\n--- Admin revalidate ---');
  const reval = await fetchJson('/api/v1/admin/revalidate-all', { method: 'POST' });
  if (reval.ok && reval.json.data?.revalidated) {
    pass('Force revalidate-all');
  } else {
    fail(`revalidate-all: ${reval.status}`);
  }

  const sync = await fetchJson('/api/v1/admin/sync-status');
  if (sync.ok && sync.json.data?.homepageLastSaved) {
    pass('Sync status endpoint');
  } else {
    fail('Sync status endpoint');
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
