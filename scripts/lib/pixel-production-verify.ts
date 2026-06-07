import { chromium, type Browser, type Page } from 'playwright';
import {
  buildTestCartItem,
  CART_STORAGE_KEY,
  seedCart,
} from '../../tests/helpers/seed-test-data';
import {
  fetchSampleProductPath,
  loadPixelIdFromEnv,
  MURDA_CANONICAL_PATH,
  MURDA_LEGACY_PATH,
  PRODUCTION_BASE_URL,
} from '../../tests/helpers/pixel-production-env';
import {
  createProductionPixelMonitor,
  type ProductionPixelMonitor,
  PRODUCTION_PIXEL_USER_AGENT,
  waitForFbeventsScript,
} from '../../tests/helpers/pixel-production-monitor';

export interface PixelCheckResult {
  label: string;
  pass: boolean;
  detail: string;
  errors?: string[];
  /** When false, failure does not fail the overall smoke test (informational). */
  required?: boolean;
}

export interface ProductionVerifyReport {
  baseUrl: string;
  pixelId: string;
  checks: PixelCheckResult[];
  allPassed: boolean;
}

const ANSI = {
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`,
};

function pass(label: string, detail: string, required = true): PixelCheckResult {
  return { label, pass: true, detail, required };
}

function fail(label: string, detail: string, errors: string[] = [], required = true): PixelCheckResult {
  return { label, pass: false, detail, errors, required };
}

function warn(label: string, detail: string): PixelCheckResult {
  return { label, pass: false, detail, required: false };
}

function formatValueBdt(params: Record<string, unknown>): string {
  const value = params.value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value} BDT`;
  }
  if (typeof value === 'string' && value.trim()) {
    return `${value} BDT`;
  }
  return 'value unknown';
}

async function verifyEvent(
  monitor: ProductionPixelMonitor,
  pixelId: string,
  eventName: string,
  timeout = 20_000
): Promise<{ event: Awaited<ReturnType<ProductionPixelMonitor['waitForVerifiedEvent']>>; errors: string[] }> {
  const event = await monitor.waitForVerifiedEvent(eventName, timeout);
  const errors = monitor.assertEventNetwork(event, eventName, pixelId);
  return { event, errors };
}

async function prepareMurdaOverlay(page: Page): Promise<void> {
  await page.addInitScript(() => {
    sessionStorage.setItem('murda-overlay-seen', '1');
  });
}

export async function runProductionPixelVerification(options?: {
  baseUrl?: string;
  headless?: boolean;
}): Promise<ProductionVerifyReport> {
  const baseUrl = options?.baseUrl ?? PRODUCTION_BASE_URL;
  const pixelId = loadPixelIdFromEnv();
  const sampleProductPath = await fetchSampleProductPath(baseUrl);
  const checks: PixelCheckResult[] = [];

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: options?.headless ?? true });
    const context = await browser.newContext({
      userAgent: PRODUCTION_PIXEL_USER_AGENT,
    });
    const page = await context.newPage();
    const monitor = createProductionPixelMonitor(page);

    await prepareMurdaOverlay(page);

    // Homepage — pixel script + PageView
    monitor.clearEvents();
    const homepageResponse = await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    if (!homepageResponse?.ok()) {
      checks.push(fail('Homepage', `HTTP ${homepageResponse?.status() ?? 'error'} loading homepage`));
    } else {
      try {
        await waitForFbeventsScript(page);
        const { errors } = await verifyEvent(monitor, pixelId, 'PageView');
        checks.push(
          errors.length === 0
            ? pass('Homepage', 'PageView fired')
            : fail('Homepage', 'PageView network verification failed', errors)
        );
      } catch (error) {
        checks.push(
          fail('Homepage', error instanceof Error ? error.message : 'PageView not captured')
        );
      }
    }

    // Product list — PageView
    monitor.clearEvents();
    await page.goto(`${baseUrl}/products`, { waitUntil: 'domcontentloaded' });
    try {
      const { errors } = await verifyEvent(monitor, pixelId, 'PageView');
      checks.push(
        errors.length === 0
          ? pass('Product list', 'PageView fired')
          : fail('Product list', 'PageView network verification failed', errors)
      );
    } catch (error) {
      checks.push(
        fail('Product list', error instanceof Error ? error.message : 'PageView not captured')
      );
    }

    // Sample PDP — PageView + ViewContent
    monitor.clearEvents();
    await page.goto(`${baseUrl}${sampleProductPath}`, { waitUntil: 'domcontentloaded' });
    try {
      await verifyEvent(monitor, pixelId, 'PageView', 15_000);
      const { event, errors } = await verifyEvent(monitor, pixelId, 'ViewContent');
      const valueLabel = formatValueBdt(event.params);
      checks.push(
        errors.length === 0
          ? pass('PDP', `PageView + ViewContent fired (value: ${valueLabel})`)
          : fail('PDP', `ViewContent network verification failed (${valueLabel})`, errors)
      );
    } catch (error) {
      checks.push(
        fail('PDP', error instanceof Error ? error.message : 'ViewContent not captured')
      );
    }

    // Murda canonical landing — PageView + ViewContent
    monitor.clearEvents();
    await prepareMurdaOverlay(page);
    await page.goto(`${baseUrl}${MURDA_CANONICAL_PATH}`, { waitUntil: 'domcontentloaded' });
    try {
      await verifyEvent(monitor, pixelId, 'PageView', 15_000);
      const { event, errors } = await verifyEvent(monitor, pixelId, 'ViewContent');
      const valueLabel = formatValueBdt(event.params);
      checks.push(
        errors.length === 0
          ? pass('Murda landing', `PageView + ViewContent fired (value: ${valueLabel})`)
          : fail('Murda landing', `ViewContent missing or invalid (${valueLabel})`, errors)
      );
    } catch (error) {
      checks.push(
        fail(
          'Murda landing',
          error instanceof Error ? error.message : 'ViewContent missing'
        )
      );
    }

    // Legacy /murda-moshari URL (informational — often 404)
    monitor.clearEvents();
    const legacyResponse = await page.goto(`${baseUrl}${MURDA_LEGACY_PATH}`, {
      waitUntil: 'domcontentloaded',
    });
    if (!legacyResponse || legacyResponse.status() >= 400) {
      checks.push(
        warn(
          'Murda legacy URL',
          `${MURDA_LEGACY_PATH} returns HTTP ${legacyResponse?.status() ?? 'error'} — use ${MURDA_CANONICAL_PATH}`
        )
      );
    } else {
      try {
        const { errors } = await verifyEvent(monitor, pixelId, 'ViewContent', 10_000);
        checks.push(
          errors.length === 0
            ? pass('Murda legacy URL', 'ViewContent fired')
            : fail('Murda legacy URL', 'ViewContent missing', errors)
        );
      } catch {
        checks.push(fail('Murda legacy URL', 'ViewContent missing'));
      }
    }

    // Checkout — InitiateCheckout with seeded cart (no form submit), isolated page
    const checkoutPage = await context.newPage();
    const checkoutMonitor = createProductionPixelMonitor(checkoutPage);
    const cartSlug = sampleProductPath.replace(/^\/products\//, '');

    checkoutMonitor.clearEvents();
    await seedCart(checkoutPage, [
      buildTestCartItem({
        productId: cartSlug,
        slug: cartSlug,
        title: `Production smoke test ${cartSlug}`,
      }),
    ]);
    await checkoutPage.goto(`${baseUrl}/checkout`, { waitUntil: 'domcontentloaded' });

    const cartReady = await checkoutPage.evaluate(
      ({ storageKey }) => Boolean(localStorage.getItem(storageKey)),
      { storageKey: CART_STORAGE_KEY }
    );

    if (!cartReady) {
      checks.push(fail('Checkout', 'Mock cart was not seeded in localStorage'));
    } else {
      try {
        const { event, errors } = await verifyEvent(
          checkoutMonitor,
          pixelId,
          'InitiateCheckout',
          25_000
        );
        const valueLabel = formatValueBdt(event.params);
        checks.push(
          errors.length === 0
            ? pass('Checkout', `InitiateCheckout fired (value: ${valueLabel}, mock cart only)`)
            : fail('Checkout', 'InitiateCheckout network verification failed', errors)
        );
      } catch (error) {
        checks.push(
          fail(
            'Checkout',
            error instanceof Error ? error.message : 'InitiateCheckout not captured'
          )
        );
      }
    }

    await checkoutPage.close();

    await context.close();
  } finally {
    await browser?.close();
  }

  return {
    baseUrl,
    pixelId,
    checks,
    allPassed: checks.filter((check) => check.required !== false).every((check) => check.pass),
  };
}

export function formatProductionVerifyReport(report: ProductionVerifyReport): string {
  const lines: string[] = [
    '',
    'Meta Pixel — Production Smoke Test',
    '==================================',
    `Site: ${report.baseUrl}`,
    `Expected pixel ID: ${report.pixelId}`,
    '',
  ];

  for (const check of report.checks) {
    const icon = check.pass ? '✅' : check.required === false ? '⚠️' : '❌';
    const colored = check.pass
      ? ANSI.green(`${icon} ${check.label}: ${check.detail}`)
      : check.required === false
        ? ANSI.yellow(`${icon} ${check.label}: ${check.detail}`)
        : ANSI.red(`${icon} ${check.label}: ${check.detail}`);
    lines.push(colored);
    if (check.errors?.length) {
      for (const error of check.errors) {
        lines.push(ANSI.dim(`   ↳ ${error}`));
      }
    }
  }

  lines.push('');
  lines.push(
    report.allPassed
      ? ANSI.green('RESULT: PASS — all automated production checks passed')
      : ANSI.red('RESULT: FAIL — one or more checks failed')
  );
  lines.push('');

  return lines.join('\n');
}
