#!/usr/bin/env tsx
/**
 * Pre-ad-launch gate: automated production pixel smoke test + manual checklist summary.
 *
 * Usage: npm run pre-launch-check
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  formatProductionVerifyReport,
  runProductionPixelVerification,
} from './lib/pixel-production-verify';

const ANSI = {
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
};

function readManualChecklistStatus(): {
  purchaseActive: boolean | null;
  mobileCheckoutVerified: boolean | null;
  testOrdersPlaced: number | null;
} {
  const flagPath = join(process.cwd(), '.pixel-prelaunch-manual.json');
  if (!existsSync(flagPath)) {
    return { purchaseActive: null, mobileCheckoutVerified: null, testOrdersPlaced: null };
  }

  try {
    const parsed = JSON.parse(readFileSync(flagPath, 'utf8')) as {
      purchaseActive?: boolean;
      mobileCheckoutVerified?: boolean;
      testOrdersPlaced?: number;
    };
    return {
      purchaseActive: typeof parsed.purchaseActive === 'boolean' ? parsed.purchaseActive : null,
      mobileCheckoutVerified:
        typeof parsed.mobileCheckoutVerified === 'boolean'
          ? parsed.mobileCheckoutVerified
          : null,
      testOrdersPlaced:
        typeof parsed.testOrdersPlaced === 'number' ? parsed.testOrdersPlaced : null,
    };
  } catch {
    return { purchaseActive: null, mobileCheckoutVerified: null, testOrdersPlaced: null };
  }
}

async function main(): Promise<void> {
  console.log('\nALMA Lifestyle - Pre-Ad-Launch Check');
  console.log('====================================\n');

  const report = await runProductionPixelVerification({ headless: true });
  console.log(formatProductionVerifyReport(report));

  const manual = readManualChecklistStatus();
  const pixelInstalled = report.checks.some(
    (check) => check.label === 'Homepage' && check.pass
  );
  const eventsFiring = report.checks.filter(
    (check) =>
      ['Homepage', 'PDP', 'Checkout', 'Murda landing'].includes(check.label) && check.pass
  ).length;

  const lines: string[] = ['Pre-Launch Summary', '------------------'];

  lines.push(
    pixelInstalled
      ? ANSI.green('✅ Pixel installed: yes')
      : ANSI.red('❌ Pixel installed: no')
  );

  lines.push(
    eventsFiring >= 3
      ? ANSI.green('✅ Production events firing: yes')
      : ANSI.red('❌ Production events firing: no')
  );

  if (manual.purchaseActive === true) {
    lines.push(ANSI.green('✅ Purchase event: ACTIVE (manual check confirmed)'));
  } else if (manual.purchaseActive === false) {
    lines.push(ANSI.red('❌ Purchase event: not confirmed in Events Manager'));
  } else {
    lines.push(
      ANSI.yellow(
        '⚠️  Purchase event: needs manual Events Manager check (see docs/pixel-fb-verify-checklist.md)'
      )
    );
  }

  if (manual.mobileCheckoutVerified === true) {
    lines.push(ANSI.green('✅ Mobile checkout: manually verified'));
  } else {
    lines.push(ANSI.yellow('⚠️  Mobile checkout: needs manual verification'));
  }

  const testOrders = manual.testOrdersPlaced ?? 0;
  if (testOrders >= 5) {
    lines.push(ANSI.green(`✅ Test orders placed: ${testOrders}`));
  } else {
    lines.push(
      ANSI.yellow(`⚠️  Test orders placed: ${testOrders} (recommend 5–10 before launch)`)
    );
  }

  lines.push('');
  lines.push('Manual checklist file (optional): .pixel-prelaunch-manual.json');
  lines.push(
    'Example: {"purchaseActive":true,"mobileCheckoutVerified":true,"testOrdersPlaced":7}'
  );
  lines.push('');

  const automatedReady = report.allPassed;
  const manualReady =
    manual.purchaseActive === true &&
    manual.mobileCheckoutVerified === true &&
    (manual.testOrdersPlaced ?? 0) >= 5;

  if (automatedReady && manualReady) {
    lines.push(ANSI.green('STATUS: READY — automated checks passed and manual gate cleared'));
  } else if (automatedReady) {
    lines.push(
      ANSI.yellow(
        'STATUS: NOT READY — Complete manual Events Manager checklist and place test orders first'
      )
    );
  } else {
    lines.push(ANSI.red('STATUS: NOT READY — Fix failing production pixel checks first'));
  }

  lines.push('');
  console.log(lines.join('\n'));

  process.exit(automatedReady ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
