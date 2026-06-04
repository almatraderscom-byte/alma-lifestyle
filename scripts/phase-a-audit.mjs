#!/usr/bin/env node
/**
 * Phase A production audit — report only.
 * Usage: node scripts/phase-a-audit.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.AUDIT_BASE_URL || 'https://almatraders.com';
const ROOT = join(import.meta.dirname, '..');

const STATIC_ROUTES = [
  '/',
  '/products',
  '/products?category=panjabi',
  '/products?category=electronics',
  '/products?category=accessories',
  '/products?category=home-decor',
  '/products?category=islamic',
  '/products?type=family-set',
  '/products?type=men_panjabi',
  '/products?type=women_three_piece',
  '/products?type=boy_panjabi',
  '/products?type=girl_two_piece',
  '/collections',
  '/cart',
  '/track',
  '/faq',
  '/delivery',
  '/refund',
  '/size-guide',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/login',
  '/signup',
  '/checkout',
  '/checkout/confirmation',
  '/admin',
  '/admin/login',
  '/admin/homepage',
  '/admin/products',
  '/admin/orders',
  '/admin/settings',
  '/admin/landing',
  '/wishlist',
  '/api/health',
  '/api/v1/products?published=true&limit=5',
];

const STATIC_CATALOG_SLUGS = [
  'royal-navy-panjabi',
  'classic-white-panjabi',
  'premium-cotton-panjabi',
  'silk-premium-panjabi',
  'maroon-festive-panjabi',
  'green-casual-panjabi',
  'bluetooth-speaker-mini',
  'wireless-earbuds-pro',
  'smart-watch-elite',
  'usb-led-desk-lamp',
  'leather-belt-classic',
  'leather-wallet',
  'handmade-jute-bag',
  'sunglasses-classic',
  'ceramic-flower-vase',
  'cotton-cushion-set',
  'smart-murda-moshari',
  'premium-jaynamaz-j2',
  'premium-jaynamaz-j4',
  'premium-jaynamaz-j5',
  'islamic-seven-books-bundle',
  'solid-jaynamaz-black',
  'solid-jaynamaz-ash',
  'solid-jaynamaz-green',
  'solid-jaynamaz-cream',
  'solid-jaynamaz-white',
];

async function fetchPage(path, opts = {}) {
  const url = `${BASE}${path}`;
  const t0 = performance.now();
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'AlmaPhaseAAudit/1.0',
      'Cache-Control': 'no-cache',
      ...opts.headers,
    },
    redirect: opts.followRedirect === false ? 'manual' : 'follow',
  });
  const ms = performance.now() - t0;
  const text = await res.text();
  return { url, status: res.status, ms, text, headers: Object.fromEntries(res.headers) };
}

function analyzeHtml(path, text) {
  const issues = [];
  const title = text.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const genericPdp = title === 'পণ্য | Alma Lifestyle';
  const hasPdp =
    text.includes('ProductDetailView') ||
    text.includes('MurdaMoshari') ||
    text.includes('murda-moshari-landing') ||
    text.includes('ProductMatchingSetPDP');
  const notFound =
    text.includes('could not be found') ||
    text.includes('This page could not be found') ||
    genericPdp;
  const err500 = text.includes('Internal Server Error') || text.includes('Application error');
  const comingSoon = /coming soon|শীঘ্রই আসছে/i.test(text);
  const zeroProducts = /০\s*টি\s*পণ্য|0\s*products/i.test(text);
  const blurStuck = text.includes('blur(8px)') && path.includes('/products');

  if (path.startsWith('/products/') && path !== '/products') {
    if (!hasPdp && notFound) issues.push('soft-404/no-pdp');
    if (genericPdp) issues.push('generic-title');
  }
  if (err500) issues.push('error-page-content');
  if (comingSoon) issues.push('coming-soon');
  if (zeroProducts && path.includes('category=')) issues.push('zero-products-filter');
  if (blurStuck) issues.push('old-template-blur');

  return { title: title.slice(0, 60), issues, hasPdp, notFound };
}

async function fetchAllDbSlugs() {
  const slugs = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${BASE}/api/v1/products?published=true&limit=100&page=${page}`,
      { headers: { 'User-Agent': 'AlmaPhaseAAudit/1.0' } }
    );
    const json = await res.json();
    const inner = json.data;
    const rows = inner?.data ?? [];
    for (const r of rows) slugs.push({ slug: r.slug, categorySlug: r.categorySlug, title: r.title });
    if (page >= (inner?.totalPages ?? 1)) break;
    page++;
  }
  return slugs;
}

function collectHrefs() {
  const hrefs = new Set();
  const dirs = [join(ROOT, 'src/components'), join(ROOT, 'src/app')];
  const re = /href=\{?["'`]([^"'`$]+)["'`]\}?/g;

  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
        const text = readFileSync(p, 'utf8');
        let m;
        while ((m = re.exec(text))) {
          let h = m[1].trim();
          if (h.startsWith('http') || h.startsWith('#') || h.startsWith('mailto') || h.startsWith('tel'))
            continue;
          if (h.includes('${') || h.includes('`')) continue;
          hrefs.add(h.split('#')[0]);
        }
      }
    }
  }
  for (const d of dirs) walk(d);
  return [...hrefs].sort();
}

async function main() {
  console.log('# Phase A Audit Report');
  console.log(`Base URL: ${BASE}`);
  console.log(`Generated: ${new Date().toISOString()}\n`);

  // Step 1 — routes
  console.log('## STEP 1 — Page audit\n');
  console.log('| Route | Status | Load (ms) | Issues | Title/notes |');
  console.log('|-------|--------|-----------|--------|-------------|');

  const routeResults = [];
  for (const path of STATIC_ROUTES) {
    try {
      const r = await fetchPage(path);
      const a = analyzeHtml(path, r.text);
      const issueStr = a.issues.length ? a.issues.join(', ') : '—';
      const slow = r.ms > 3000 ? 'slow' : '';
      const flags = [issueStr !== '—' ? issueStr : '', slow].filter(Boolean).join('; ') || '—';
      routeResults.push({ path, status: r.status, ms: r.ms, flags, title: a.title });
      console.log(
        `| \`${path}\` | ${r.status} | ${r.ms.toFixed(0)} | ${flags} | ${(a.title || '—').replace(/\|/g, '/')} |`
      );
    } catch (e) {
      routeResults.push({ path, status: 0, ms: 0, flags: String(e), title: '' });
      console.log(`| \`${path}\` | ERR | — | ${e.message} | — |`);
    }
  }

  // DB slugs
  console.log('\n### All published DB product PDPs\n');
  const dbSlugs = await fetchAllDbSlugs();
  console.log(`Total DB products: ${dbSlugs.length}\n`);

  const pdpFails = [];
  const pdpSlow = [];
  for (const { slug, categorySlug } of dbSlugs) {
    const path = `/products/${slug}`;
    try {
      const r = await fetchPage(path);
      const a = analyzeHtml(path, r.text);
      if (r.status !== 200 || a.issues.length) {
        pdpFails.push({ slug, categorySlug, status: r.status, issues: a.issues });
      }
      if (r.ms > 3000) pdpSlow.push({ slug, ms: r.ms });
    } catch (e) {
      pdpFails.push({ slug, categorySlug, status: 0, issues: [e.message] });
    }
  }
  console.log(`DB PDP failures: ${pdpFails.length}`);
  for (const f of pdpFails.slice(0, 30)) {
    console.log(`  - ${f.slug} (${f.categorySlug}) HTTP ${f.status} [${f.issues.join(', ')}]`);
  }
  if (pdpFails.length > 30) console.log(`  ... +${pdpFails.length - 30} more`);

  console.log(`\nDB PDP slow (>3s): ${pdpSlow.length}`);
  for (const s of pdpSlow.sort((a, b) => b.ms - a.ms).slice(0, 10)) {
    console.log(`  - ${s.slug}: ${s.ms.toFixed(0)}ms`);
  }

  // Static catalog slugs not necessarily in DB
  console.log('\n### Static catalog slugs (may not be in DB)\n');
  const staticFails = [];
  for (const slug of STATIC_CATALOG_SLUGS) {
    const path = `/products/${slug}`;
    const r = await fetchPage(path);
    const a = analyzeHtml(path, r.text);
    const ok = r.status === 200 && !a.issues.includes('soft-404/no-pdp') && !a.issues.includes('generic-title');
    if (!ok) staticFails.push({ slug, status: r.status, issues: a.issues, title: a.title });
    console.log(`| \`${slug}\` | ${r.status} | ${r.ms.toFixed(0)} | ${ok ? 'OK' : a.issues.join(', ')} |`);
  }

  // Step 2 — links
  console.log('\n## STEP 2 — Link audit\n');
  const hrefs = collectHrefs();
  const staticHrefs = hrefs.filter((h) => h.startsWith('/') && !h.includes('['));
  console.log(`Static internal hrefs in source: ${staticHrefs.length}\n`);
  console.log('| href | Status |');
  console.log('|------|--------|');
  const brokenLinks = [];
  for (const h of staticHrefs) {
    const path = h.split('?')[0];
    try {
      const r = await fetchPage(path);
      const bad = r.status >= 400;
      if (bad) brokenLinks.push({ h, status: r.status });
      console.log(`| \`${h}\` | ${r.status}${bad ? ' ⚠️' : ''} |`);
    } catch (e) {
      brokenLinks.push({ h, status: 'ERR' });
      console.log(`| \`${h}\` | ERR |`);
    }
  }
  console.log(`\nBroken static links: ${brokenLinks.length}`);
  const dynamic = hrefs.filter((h) => h.includes('['));
  console.log(`Dynamic href patterns: ${dynamic.length}`);

  // Step 3 — data integrity (homepage + listing)
  console.log('\n## STEP 3 — Data integrity (heuristic)\n');
  const home = await fetchPage('/');
  const homeChecks = {
    hasComingSoon: /coming soon|শীঘ্রই আসছে/i.test(home.text),
    svgGradientFallback: /pattern-overlay|bg-gradient-to/i.test(home.text),
    zeroCategoryCount: /০\s*টি\s*পণ্য/.test(home.text),
    blurOldTemplate: home.text.includes('blur(8px)'),
  };
  for (const [k, v] of Object.entries(homeChecks)) {
    console.log(`- Homepage ${k}: ${v}`);
  }

  const islamic = await fetchPage('/products?category=islamic');
  const islamicCount = (islamic.text.match(/categorySlug":"islamic"/g) || []).length;
  console.log(`- Islamic listing categorySlug=islamic blobs: ~${islamicCount}`);

  // Step 4 — admin
  console.log('\n## STEP 4 — Admin sync\n');
  console.log('- **Not automated**: requires authenticated admin session.');
  console.log('- Admin shell routes return 200 without login; save/sync must be verified manually.');

  // Step 5 — mobile heuristics
  console.log('\n## STEP 5 — Mobile rendering (HTML heuristics)\n');
  const mobileRoutes = ['/', '/products?category=islamic', '/products/premium-jaynamaz-j2', '/cart'];
  console.log('| Route | viewport | overflow-x-hidden | min-h-12 buttons |');
  console.log('|-------|----------|-------------------|------------------|');
  for (const path of mobileRoutes) {
    const r = await fetchPage(path);
    const vp = r.text.includes('width=device-width');
    const ox = /overflow-x-hidden|overflow-x:\s*hidden/.test(r.text);
    const btn = (r.text.match(/min-h-12/g) || []).length;
    console.log(`| \`${path}\` | ${vp} | ${ox} | ~${btn} min-h-12 |`);
  }

  console.log('\n## Summary counts\n');
  const brokenRoutes = routeResults.filter(
    (r) => r.status >= 400 || r.status === 0 || (r.flags && r.flags !== '—' && r.flags !== 'slow')
  );
  console.log(`- Static routes with issues: ${brokenRoutes.length}`);
  console.log(`- DB PDP failures: ${pdpFails.length}`);
  console.log(`- Static catalog PDP failures: ${staticFails.length}`);
  console.log(`- Broken static links: ${brokenLinks.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
