#!/usr/bin/env tsx
/**
 * Production Meta Pixel smoke verification against the live site.
 * Read-only: no purchases, no form submissions.
 *
 * Usage:
 *   npm run verify:pixel:prod
 *   PIXEL_PROD_BASE_URL=https://www.almatraders.com npm run verify:pixel:prod
 */
import {
  formatProductionVerifyReport,
  runProductionPixelVerification,
} from './lib/pixel-production-verify';

async function main(): Promise<void> {
  const report = await runProductionPixelVerification({ headless: true });
  console.log(formatProductionVerifyReport(report));
  process.exit(report.allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
