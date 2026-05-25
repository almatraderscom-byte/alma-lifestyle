#!/usr/bin/env node
/**
 * Create product-images + homepage-images buckets if missing.
 * Run: node scripts/ensure-storage-buckets.mjs
 * Requires .env.local with SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = join(import.meta.dirname, '..');

function loadEnv() {
  const path = join(ROOT, '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local');
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

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const client = createClient(url, key);
const { data: buckets } = await client.storage.listBuckets();
const names = new Set((buckets ?? []).map((b) => b.name));

for (const name of ['product-images', 'homepage-images']) {
  if (names.has(name)) {
    console.log(`✓ ${name}`);
    continue;
  }
  const { error } = await client.storage.createBucket(name, {
    public: true,
    fileSizeLimit: 4 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });
  if (error) {
    console.error(`✗ ${name}:`, error.message);
    process.exit(1);
  }
  console.log(`Created ${name}`);
}

console.log('\nDone.');
