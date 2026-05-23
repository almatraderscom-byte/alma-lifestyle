#!/usr/bin/env node
/**
 * Pre-deploy verification for Alma Lifestyle.
 * Run: node scripts/verify-production-readiness.mjs
 * Requires .env.local with Supabase credentials (not committed).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const EXPECTED_TABLES = [
  'audit_logs',
  'brands',
  'cart_sessions',
  'categories',
  'collections',
  'collection_products',
  'customers',
  'customer_addresses',
  'import_logs',
  'order_items',
  'orders',
  'product_images',
  'product_variants',
  'products',
];

const REQUIRED_BUCKETS = ['product-images', 'homepage-images'];
const SITE_CONFIG_KEYS = ['homepage', 'settings'];

function loadEnvLocal() {
  const path = join(process.cwd(), '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local — copy from .env.example');
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) env[t.slice(0, i)] = t.slice(i + 1);
  }
  return env;
}

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}
function fail(msg) {
  console.log(`  ✗ ${msg}`);
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL, keys in .env.local');
  process.exit(1);
}

console.log('\n=== STEP 1: Supabase database ===\n');

const openApiRes = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
});
const openApiText = await openApiRes.text();
const tables = [
  ...new Set(
    [...openApiText.matchAll(/"\/([a-z_]+)"/g)]
      .map((m) => m[1])
      .filter((t) => !t.includes('{'))
  ),
].sort();

const missing = EXPECTED_TABLES.filter((t) => !tables.includes(t));
if (missing.length === 0) pass(`All ${EXPECTED_TABLES.length} expected tables present`);
else fail(`Missing tables: ${missing.join(', ')}`);

const client = createClient(url, serviceKey);

const { data: siteRows, error: siteErr } = await client.from('site_config').select('key');
if (siteErr) fail(`site_config: ${siteErr.message}`);
else {
  const keys = (siteRows ?? []).map((r) => r.key);
  for (const k of SITE_CONFIG_KEYS) {
    if (keys.includes(k)) pass(`site_config key "${k}"`);
    else fail(`site_config missing "${k}" — run supabase/seed.sql`);
  }
}

const { data: buckets, error: bErr } = await client.storage.listBuckets();
if (bErr) fail(`Storage: ${bErr.message}`);
else {
  for (const name of REQUIRED_BUCKETS) {
    const b = buckets?.find((x) => x.name === name);
    if (b?.public) pass(`Bucket ${name} (public)`);
    else fail(`Bucket ${name} missing or not public`);
  }
}

console.log('\n=== Ready for Vercel? ===\n');
if (missing.length > 0 || siteErr) {
  console.log('BLOCKED: Apply migrations before deploy (see README / docs/DEPLOYMENT.md)\n');
  process.exit(1);
}
console.log('Database checks passed. Continue with Vercel deploy and smoke tests.\n');
