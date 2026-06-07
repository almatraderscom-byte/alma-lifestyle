#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ENV_LOCAL = path.join(ROOT, '.env.local');

function fail(message) {
  console.error(`\n[pretest-pixel] ${message}\n`);
  process.exit(1);
}

function readEnvLocal() {
  if (!fs.existsSync(ENV_LOCAL)) {
    fail('Missing .env.local. Copy .env.example and set NEXT_PUBLIC_FB_PIXEL_ID before running pixel tests.');
  }

  const env = {};
  const content = fs.readFileSync(ENV_LOCAL, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function main() {
  const env = readEnvLocal();
  const pixelId = env.NEXT_PUBLIC_FB_PIXEL_ID?.trim();

  if (!pixelId) {
    fail('NEXT_PUBLIC_FB_PIXEL_ID is missing or empty in .env.local.');
  }

  console.log('[pretest-pixel] NEXT_PUBLIC_FB_PIXEL_ID is set.');
  console.log('[pretest-pixel] Playwright will start or reuse the dev server on http://localhost:3000.');
  console.log('[pretest-pixel] Test 2 validates /api/pixel-test once the server is ready.');
}

main();
