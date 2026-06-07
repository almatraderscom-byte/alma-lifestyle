import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  archiveReport,
  buildEnvironmentInfo,
  checkbox,
  fetchDevPixelTestApi,
  inferExpectedEvent,
  LATEST_REPORT_PATH,
  readLocalResults,
  readManualChecklist,
  readProductionResults,
  statusIcon,
  type LocalPixelResultsFile,
  type ProductionPixelResultsFile,
} from './lib/pixel-status-data';

type OutputFormat = 'markdown' | 'slack' | 'email';

export interface PixelStatusReport {
  generatedAt: Date;
  markdown: string;
  slack: string;
  emailHtml: string;
  goNoGo: 'GO' | 'NO-GO' | 'REVIEW';
  exitCode: 0 | 1 | 2;
  blockers: string[];
  recommendations: string[];
}

function parseFormatArg(argv: string[]): OutputFormat {
  const formatArg = argv.find((arg) => arg.startsWith('--format='));
  const value = formatArg?.split('=')[1]?.toLowerCase();
  if (value === 'slack' || value === 'email' || value === 'markdown') return value;
  return 'markdown';
}

function buildLocalRows(local: LocalPixelResultsFile | null): string {
  if (!local?.tests?.length) {
    return '| - | No local test results found | ⚠️ | - | Run `npm run test:pixel` first |';
  }

  return local.tests
    .map((test) => {
      const ok = test.status === 'passed';
      const lower = test.title.toLowerCase();
      let eventCaptured = inferExpectedEvent(test.title);
      if (eventCaptured === '-' && lower.includes('addtocart') && lower.includes('initiatecheckout')) {
        eventCaptured = 'AddToCart + InitiateCheckout';
      }
      if (eventCaptured === '-') {
        eventCaptured = '-';
      }
      return `| ${test.step || '-'} | ${test.shortName} | ${statusIcon(ok)} | ${eventCaptured} | ${test.notes || '-'} |`;
    })
    .join('\n');
}

function buildProductionRows(production: ProductionPixelResultsFile | null): string {
  if (!production?.checks?.length) {
    return '| - | - | - | - | ⚠️ No production results — run `npm run verify:pixel:prod` |';
  }

  return production.checks
    .map((check) => {
      const pageView = /pageview/i.test(check.detail) ? statusIcon(check.pass) : '-';
      const viewContent = /viewcontent/i.test(check.detail) ? statusIcon(check.pass) : '-';
      let other = '-';
      if (/initiatecheckout/i.test(check.detail)) other = `InitiateCheckout ${statusIcon(check.pass)}`;
      else if (/404|legacy/i.test(check.detail)) other = 'Legacy URL ⚠️';
      else if (!/pageview|viewcontent/i.test(check.detail) && check.detail !== '-') {
        other = check.detail.slice(0, 40);
      }

      const status =
        check.required === false && !check.pass
          ? '⚠️'
          : check.pass
            ? '✅'
            : '❌';

      return `| ${check.label} | ${pageView} | ${viewContent} | ${other} | ${status} |`;
    })
    .join('\n');
}

function evaluateGoNoGo(input: {
  local: LocalPixelResultsFile | null;
  production: ProductionPixelResultsFile | null;
  manual: ReturnType<typeof readManualChecklist>;
  envMatch: boolean | null;
}): Pick<PixelStatusReport, 'goNoGo' | 'exitCode' | 'blockers' | 'recommendations'> {
  const blockers: string[] = [];
  const recommendations: string[] = [];

  if (!input.local) {
    blockers.push('Local Playwright suite has not been run (`npm run test:pixel`).');
  } else if (input.local.failed > 0) {
    blockers.push(
      `${input.local.failed} local Playwright test(s) failed — fix before launching ads.`
    );
  }

  if (!input.production) {
    blockers.push('Production smoke test has not been run (`npm run verify:pixel:prod`).');
  } else if (!input.production.allPassed) {
    blockers.push('Production smoke test has required failures on almatraders.com.');
  }

  if (input.envMatch === false) {
    blockers.push('Development and production pixel IDs do not match.');
  }

  const manual = input.manual;
  if (!manual?.purchaseActive) {
    recommendations.push('Confirm Purchase is ACTIVE in Facebook Events Manager.');
  }
  if (!manual?.mobileCheckoutVerified) {
    recommendations.push('Complete a real mobile checkout test.');
  }
  if ((manual?.testOrdersPlaced ?? 0) < 5) {
    recommendations.push('Place 5–10 test orders on production before ad spend.');
  }

  const prodWarnings =
    input.production?.checks.filter((check) => check.required === false && !check.pass) ?? [];
  for (const warning of prodWarnings) {
    recommendations.push(`${warning.label}: ${warning.detail}`);
  }

  if (blockers.length > 0) {
    return { goNoGo: 'NO-GO', exitCode: 1, blockers, recommendations };
  }

  const manualIncomplete =
    !manual?.purchaseActive ||
    !manual?.mobileCheckoutVerified ||
    (manual?.testOrdersPlaced ?? 0) < 5;

  if (manualIncomplete || recommendations.length > 0) {
    return { goNoGo: 'REVIEW', exitCode: 2, blockers, recommendations };
  }

  return { goNoGo: 'GO', exitCode: 0, blockers, recommendations };
}

export async function generatePixelStatusReport(): Promise<PixelStatusReport> {
  const generatedAt = new Date();
  const local = readLocalResults();
  const production = readProductionResults();
  const manual = readManualChecklist();
  const liveApi = local ? null : await fetchDevPixelTestApi();
  const env = buildEnvironmentInfo(local, production, liveApi);

  const go = evaluateGoNoGo({
    local,
    production,
    manual,
    envMatch: env.idsMatch,
  });

  const goLine =
    go.goNoGo === 'GO'
      ? 'Status: **GO ✅**'
      : go.goNoGo === 'NO-GO'
        ? 'Status: **NO-GO ❌**'
        : 'Status: **REVIEW ⚠️** (automated checks passed — manual steps remain)';

  const blockersSection =
    go.blockers.length > 0
      ? go.blockers.map((item) => `- ${item}`).join('\n')
      : '- None';

  const recommendationsSection =
    go.recommendations.length > 0
      ? go.recommendations.map((item) => `- ${item}`).join('\n')
      : '- All automated and manual checks complete. Safe to proceed with ad campaign setup.';

  const envMatchLine =
    env.idsMatch === null
      ? 'Match: ⚠️ (unable to verify — run production smoke test)'
      : env.idsMatch
        ? 'Match: ✅'
        : 'Match: ❌';

  const markdown = `# Meta Pixel Status Report

Generated: ${generatedAt.toISOString()}

## Environment

- Development pixel: ${env.developmentPixelMasked ?? 'not configured'}
- Production pixel: ${env.productionPixelMasked ?? 'unknown'}
- ${envMatchLine}
- Dev API \`/api/pixel-test\`: ${
    env.apiPixelTest?.ok
      ? `✅ configured (${env.apiPixelTest.pixelIdPreview ?? 'masked'})`
      : local
        ? local.apiPixelTest?.ok
          ? `✅ (${local.apiPixelTest.pixelIdPreview ?? 'masked'})`
          : '⚠️ not captured in last local run'
        : '⚠️ dev server not reachable'
  }

## Local Test Results (Playwright)

| Step | Test | Status | Event Captured | Notes |
|------|------|--------|----------------|-------|
${buildLocalRows(local)}

${
  local
    ? `**Summary:** ${local.passed}/${local.total} passed · last run ${local.generatedAt}`
    : '**Summary:** No results file at `test-results/pixel-local-results.json`'
}

## Production Smoke Test Results

| Page | PageView | ViewContent | Other | Status |
|------|----------|-------------|-------|--------|
${buildProductionRows(production)}

${
  production
    ? `**Summary:** ${production.allPassed ? 'All required checks passed ✅' : 'Required failures detected ❌'} · ${production.baseUrl} · ${production.generatedAt}`
    : '**Summary:** No results file at `test-results/pixel-production-results.json`'
}

## Manual Verification Required

- ${checkbox(Boolean(manual?.purchaseActive))} FB Events Manager check — Purchase ACTIVE ([checklist](./pixel-fb-verify-checklist.md))
- ${checkbox((manual?.testOrdersPlaced ?? 0) >= 5)} 5–10 test orders placed (${manual?.testOrdersPlaced ?? 0}/5 minimum)
- ${checkbox(Boolean(manual?.mobileCheckoutVerified))} Mobile checkout tested

Optional gate file: \`.pixel-prelaunch-manual.json\`

## Go/No-Go for Ad Launch

${goLine}

**Blockers:**

${blockersSection}

**Recommendations:**

${recommendationsSection}

---

*Generated by \`npm run pixel:report\`. Full workflow: \`npm run pixel:full-check\`.*
`;

  const slack = [
    `*Meta Pixel Status* · ${generatedAt.toISOString()}`,
    `Dev pixel: ${env.developmentPixelMasked ?? 'n/a'} · Prod: ${env.productionPixelMasked ?? 'n/a'} · ${env.idsMatch ? 'IDs match ✅' : 'ID mismatch ⚠️'}`,
    `Local: ${local ? `${local.passed}/${local.total} passed` : 'not run'} · Prod: ${production ? (production.allPassed ? 'PASS ✅' : 'FAIL ❌') : 'not run'}`,
    `*${go.goNoGo}* ${go.goNoGo === 'GO' ? '✅' : go.goNoGo === 'NO-GO' ? '❌' : '⚠️'}`,
    go.blockers.length ? `Blockers: ${go.blockers.join('; ')}` : 'Blockers: none',
    go.recommendations.length
      ? `Next: ${go.recommendations.slice(0, 3).join('; ')}`
      : 'Next: ready for Purchase conversion in Ads Manager',
  ].join('\n');

  const emailHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>Meta Pixel Status</title></head>
<body style="font-family:Arial,sans-serif;line-height:1.5;color:#222;max-width:720px;margin:24px auto;">
  <h1 style="color:#1a1a1a;">Meta Pixel Status Report</h1>
  <p><strong>Generated:</strong> ${generatedAt.toISOString()}</p>
  <h2>Environment</h2>
  <ul>
    <li>Development pixel: <code>${env.developmentPixelMasked ?? 'not configured'}</code></li>
    <li>Production pixel: <code>${env.productionPixelMasked ?? 'unknown'}</code></li>
    <li>Match: ${env.idsMatch ? '✅' : '❌ / unknown'}</li>
  </ul>
  <h2>Automated Tests</h2>
  <ul>
    <li>Local Playwright: ${local ? `${local.passed}/${local.total} passed` : 'Not run'}</li>
    <li>Production smoke: ${production ? (production.allPassed ? 'PASS' : 'FAIL') : 'Not run'}</li>
  </ul>
  <h2>Go/No-Go</h2>
  <p style="font-size:18px;"><strong>${go.goNoGo}</strong></p>
  <h3>Blockers</h3>
  <ul>${(go.blockers.length ? go.blockers : ['None']).map((b) => `<li>${b}</li>`).join('')}</ul>
  <h3>Recommendations</h3>
  <ul>${go.recommendations.map((r) => `<li>${r}</li>`).join('') || '<li>All checks complete</li>'}</ul>
  <hr>
  <p style="color:#666;font-size:12px;">ALMA Lifestyle · npm run pixel:full-check</p>
</body></html>`;

  return {
    generatedAt,
    markdown,
    slack,
    emailHtml,
    ...go,
  };
}

export function writePixelStatusOutputs(report: PixelStatusReport): {
  latestPath: string;
  archivePath: string;
} {
  mkdirSync(dirname(LATEST_REPORT_PATH), { recursive: true });
  writeFileSync(LATEST_REPORT_PATH, report.markdown, 'utf8');
  const archivePath = archiveReport(report.markdown, report.generatedAt);
  return { latestPath: LATEST_REPORT_PATH, archivePath };
}

async function main(): Promise<void> {
  const format = parseFormatArg(process.argv.slice(2));
  const report = await generatePixelStatusReport();
  const paths = writePixelStatusOutputs(report);

  if (format === 'markdown') {
    console.log(report.markdown);
    console.log(`\nSaved: ${paths.latestPath}`);
    console.log(`Archived: ${paths.archivePath}`);
  } else if (format === 'slack') {
    console.log(report.slack);
  } else {
    console.log(report.emailHtml);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
