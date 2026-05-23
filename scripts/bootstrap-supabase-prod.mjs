#!/usr/bin/env node
/**
 * Bootstrap a NEW Supabase project for Alma Lifestyle production.
 *
 * Prerequisites:
 *   1. Personal access token: https://supabase.com/dashboard/account/tokens
 *   2. Organization ID: npx supabase orgs list (with token set)
 *
 * Usage (create project + migrate + seed + update .env.local):
 *   export SUPABASE_ACCESS_TOKEN=sbp_xxxx
 *   export SUPABASE_ORG_ID=your-org-id
 *   export SUPABASE_DB_PASSWORD='strong-password-here'
 *   npm run bootstrap:supabase
 *
 * Usage (existing empty project — migrations only):
 *   export SUPABASE_ACCESS_TOKEN=sbp_xxxx
 *   export SUPABASE_PROJECT_REF=abcdefghijklmnop
 *   export SUPABASE_DB_PASSWORD='your-db-password'
 *   npm run bootstrap:supabase -- --skip-create
 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const skipCreate = process.argv.includes('--skip-create');
const projectName = process.env.SUPABASE_PROJECT_NAME ?? 'alma-lifestyle-prod';
const region = process.env.SUPABASE_REGION ?? 'ap-northeast-1';

const token = process.env.SUPABASE_ACCESS_TOKEN;
const orgId = process.env.SUPABASE_ORG_ID;
let dbPassword = process.env.SUPABASE_DB_PASSWORD;
let projectRef = process.env.SUPABASE_PROJECT_REF;

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}\n`);
  return execSync(cmd, {
    cwd: ROOT,
    stdio: 'inherit',
    encoding: 'utf8',
    ...opts,
  });
}

function runCapture(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function requireEnv(name, value) {
  if (!value) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
}

async function managementFetch(path, options = {}) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`Management API ${path}: ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function waitForProjectHealthy(ref, maxMinutes = 8) {
  const deadline = Date.now() + maxMinutes * 60_000;
  while (Date.now() < deadline) {
    const project = await managementFetch(`/projects/${ref}`);
    const status = project.status ?? project.database?.status;
    console.log(`  Project status: ${status ?? 'unknown'}`);
    if (status === 'ACTIVE_HEALTHY' || status === 'ACTIVE') return project;
    await new Promise((r) => setTimeout(r, 15_000));
  }
  throw new Error('Project did not become healthy in time');
}

async function createProject() {
  console.log(`\n=== Creating project "${projectName}" in ${region} ===\n`);
  requireEnv('SUPABASE_ACCESS_TOKEN', token);
  requireEnv('SUPABASE_ORG_ID', orgId);
  requireEnv('SUPABASE_DB_PASSWORD', dbPassword);

  const created = await managementFetch('/projects', {
    method: 'POST',
    body: JSON.stringify({
      organization_id: orgId,
      name: projectName,
      db_pass: dbPassword,
      region,
    }),
  });

  projectRef = created.id ?? created.ref ?? created.project_ref;
  if (!projectRef) {
    throw new Error(`Unexpected create response: ${JSON.stringify(created)}`);
  }
  console.log(`Created project ref: ${projectRef}`);
  await waitForProjectHealthy(projectRef);
}

function getDbUrl(ref, password) {
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.${ref}:${encoded}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
}

async function fetchApiKeys(ref) {
  try {
    const keys = await managementFetch(`/projects/${ref}/api-keys`);
    if (Array.isArray(keys)) {
      const anon = keys.find((k) => k.name === 'anon' || k.tag === 'anon')?.api_key;
      const service = keys.find(
        (k) => k.name === 'service_role' || k.tag === 'service_role'
      )?.api_key;
      if (anon && service) return { anon, service };
    }
  } catch {
    /* fall through to CLI */
  }

  const out = runCapture(
    `npx supabase projects api-keys --project-ref ${ref} -o json`
  );
  const parsed = JSON.parse(out);
  const list = Array.isArray(parsed) ? parsed : parsed.api_keys ?? [];
  const anon = list.find((k) => k.name === 'anon')?.api_key;
  const service = list.find((k) => k.name === 'service_role')?.api_key;
  if (!anon || !service) {
    throw new Error('Could not read anon/service_role keys from CLI');
  }
  return { anon, service };
}

async function ensureStorageBuckets(url, serviceKey) {
  const client = createClient(url, serviceKey);
  const { data: buckets } = await client.storage.listBuckets();
  const names = new Set((buckets ?? []).map((b) => b.name));
  for (const name of ['product-images', 'homepage-images']) {
    if (names.has(name)) {
      console.log(`  Bucket exists: ${name}`);
      continue;
    }
    const { error } = await client.storage.createBucket(name, {
      public: true,
      fileSizeLimit: 5242880,
    });
    if (error) throw new Error(`Bucket ${name}: ${error.message}`);
    console.log(`  Created bucket: ${name}`);
  }
}

function writeEnvLocal(url, anon, service) {
  const content = `# Generated by npm run bootstrap:supabase — do not commit
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}
SUPABASE_SERVICE_ROLE_KEY=${service}
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_SLUG=alma-lifestyle
`;
  const path = join(ROOT, '.env.local');
  writeFileSync(path, content, 'utf8');
  console.log(`\nWrote ${path}`);
}

async function main() {
  console.log('Alma Lifestyle — Supabase production bootstrap\n');

  requireEnv('SUPABASE_ACCESS_TOKEN', token);

  if (!skipCreate) {
    await createProject();
  } else {
    requireEnv('SUPABASE_PROJECT_REF', projectRef);
    requireEnv('SUPABASE_DB_PASSWORD', dbPassword);
  }

  const url = `https://${projectRef}.supabase.co`;
  const dbUrl = getDbUrl(projectRef, dbPassword);

  console.log('\n=== Applying migrations + seed ===\n');
  run(
    `npx supabase db push --db-url "${dbUrl}" --include-seed --yes`
  );

  console.log('\n=== API keys ===\n');
  const { anon, service } = await fetchApiKeys(projectRef);

  console.log('\n=== Storage buckets ===\n');
  await ensureStorageBuckets(url, service);

  writeEnvLocal(url, anon, service);

  console.log('\n=== Verification ===\n');
  const verify = spawnSync('npm', ['run', 'verify:production'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });

  if (verify.status !== 0) {
    process.exit(verify.status ?? 1);
  }

  console.log(`
SUCCESS — New project ready: ${url}
Next: npm run dev → test http://localhost:3000 and /admin/login
Update Vercel env vars with the same three Supabase keys + production APP_URL.
`);
}

main().catch((err) => {
  console.error('\nBootstrap failed:', err.message);
  process.exit(1);
});
