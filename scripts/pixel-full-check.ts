#!/usr/bin/env tsx
/**
 * Full Meta Pixel verification pipeline with CI-friendly exit codes.
 *
 * Exit codes:
 *   0 — All green, safe to launch ads
 *   1 — Critical failures, do not launch
 *   2 — Automated checks passed; manual review still required
 */
import { spawnSync } from 'node:child_process';
import { generatePixelStatusReport, writePixelStatusOutputs } from './pixel-status-report';

function runStep(label: string, command: string, args: string[]): number {
  console.log(`\n=== ${label} ===\n`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
  return result.status ?? 1;
}

async function main(): Promise<void> {
  console.log('ALMA Lifestyle — Meta Pixel Full Check');
  console.log('======================================');

  const localStatus = runStep('Local Playwright (12 tests)', 'npm', ['run', 'test:pixel']);
  const prodStatus = runStep('Production smoke test', 'npm', ['run', 'verify:pixel:prod']);

  console.log('\n=== Generating status report ===\n');
  const report = await generatePixelStatusReport();
  const paths = writePixelStatusOutputs(report);
  console.log(report.markdown);
  console.log(`\nSaved: ${paths.latestPath}`);
  console.log(`Archived: ${paths.archivePath}`);

  const localFailed = localStatus !== 0;
  const prodFailed = prodStatus !== 0;

  if (localFailed || prodFailed) {
    console.log('\nRESULT: Exit code 1 — critical failures. Do not launch ads.');
    process.exit(1);
  }

  if (report.exitCode === 2) {
    console.log('\nRESULT: Exit code 2 — automated checks passed; complete manual verification.');
    process.exit(2);
  }

  console.log('\nRESULT: Exit code 0 — all checks green. Safe to proceed with ad campaign setup.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
