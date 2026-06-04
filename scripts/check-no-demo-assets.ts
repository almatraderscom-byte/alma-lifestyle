#!/usr/bin/env npx tsx
/**
 * CI guard: fail if demo/placeholder asset URLs sneak into src/.
 * Exceptions: central fallback registry and test files.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'src');

const BANNED_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: 'unsplash.com', regex: /unsplash\.com/i },
  { label: 'picsum.photos', regex: /picsum\.photos/i },
  { label: 'placehold.co', regex: /placehold\.co/i },
  { label: 'demo- asset ref', regex: /['"`][^'"`]*demo-[^'"`]*\.(jpg|jpeg|png|webp|gif|svg)/i },
  { label: 'test- asset ref', regex: /['"`][^'"`]*test-[^'"`]*\.(jpg|jpeg|png|webp|gif|svg)/i },
  { label: 'sample- asset ref', regex: /['"`][^'"`]*sample-[^'"`]*\.(jpg|jpeg|png|webp|gif|svg)/i },
];

const EXCEPTION_PATH_FRAGMENTS = [
  `${path.sep}lib${path.sep}default-images.ts`,
  `${path.sep}__tests__${path.sep}`,
  `${path.sep}tests${path.sep}`,
  '.test.',
  '.spec.',
];

function isException(filePath: string): boolean {
  return EXCEPTION_PATH_FRAGMENTS.some((frag) => filePath.includes(frag));
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules') continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?|mjs|cjs|css|md)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

type Violation = { file: string; line: number; label: string; snippet: string };

function scanFile(filePath: string): Violation[] {
  if (isException(filePath)) return [];

  const rel = path.relative(process.cwd(), filePath);
  const lines = readFileSync(filePath, 'utf8').split('\n');
  const violations: Violation[] = [];

  lines.forEach((line, index) => {
    for (const { label, regex } of BANNED_PATTERNS) {
      if (regex.test(line)) {
        violations.push({
          file: rel,
          line: index + 1,
          label,
          snippet: line.trim().slice(0, 120),
        });
      }
    }
  });

  return violations;
}

function main(): void {
  const files = walk(ROOT);
  const violations = files.flatMap(scanFile);

  if (violations.length === 0) {
    console.log(`check-no-demo-assets: OK (${files.length} files scanned)`);
    process.exit(0);
  }

  console.error(`check-no-demo-assets: found ${violations.length} banned reference(s)\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} [${v.label}]`);
    console.error(`    ${v.snippet}`);
  }
  console.error('\nUse src/lib/default-images.ts for intentional Alma SVG fallbacks only.');
  process.exit(1);
}

main();
