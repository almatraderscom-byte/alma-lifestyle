import { test, expect } from '@playwright/test';
import {
  loadPixelIdFromEnv,
  fetchSampleProductPath,
  PRODUCTION_BASE_URL,
  MURDA_CANONICAL_PATH,
} from './helpers/pixel-production-env';
import {
  createProductionPixelMonitor,
  waitForFbeventsScript,
} from './helpers/pixel-production-monitor';
import { buildTestCartItem, seedCart } from './helpers/seed-test-data';

test.describe.configure({ mode: 'serial' });

const pixelId = loadPixelIdFromEnv();
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? PRODUCTION_BASE_URL;

test.describe('Meta Pixel production smoke (read-only)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('murda-overlay-seen', '1');
    });
  });

  test('Meta Pixel script loads on production homepage', async ({ page }) => {
    const monitor = createProductionPixelMonitor(page);

    const response = await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), 'Homepage should load').toBeTruthy();

    const fbeventsRequest = page.waitForResponse(
      (res) => res.url().includes('connect.facebook.net') && res.url().includes('fbevents.js'),
      { timeout: 20_000 }
    );

    await waitForFbeventsScript(page);
    const scriptResponse = await fbeventsRequest.catch(() => null);
    if (scriptResponse) {
      expect(scriptResponse.status()).toBe(200);
    }

    const pageView = await monitor.waitForVerifiedEvent('PageView');
    const errors = monitor.assertEventNetwork(pageView, 'PageView', pixelId);
    expect(errors, errors.join('; ')).toEqual([]);
  });

  test('ViewContent fires when a product page is opened', async ({ page }) => {
    const monitor = createProductionPixelMonitor(page);
    const productPath = await fetchSampleProductPath(baseURL);

    await page.goto(`${baseURL}${productPath}`, { waitUntil: 'domcontentloaded' });
    await waitForFbeventsScript(page);

    const viewContent = await monitor.waitForVerifiedEvent('ViewContent');
    const errors = monitor.assertEventNetwork(viewContent, 'ViewContent', pixelId);
    expect(errors, errors.join('; ')).toEqual([]);

    const value = viewContent.params.value;
    expect(typeof value === 'number' || typeof value === 'string').toBeTruthy();
    expect(viewContent.params.currency ?? 'BDT').toBe('BDT');
  });

  test('Murda landing fires ViewContent on canonical URL', async ({ page }) => {
    const monitor = createProductionPixelMonitor(page);

    await page.goto(`${baseURL}${MURDA_CANONICAL_PATH}`, { waitUntil: 'domcontentloaded' });
    await waitForFbeventsScript(page);

    const viewContent = await monitor.waitForVerifiedEvent('ViewContent');
    const errors = monitor.assertEventNetwork(viewContent, 'ViewContent', pixelId);
    expect(errors, errors.join('; ')).toEqual([]);
  });

  test('InitiateCheckout fires on checkout page with mock cart items only', async ({ page }) => {
    const monitor = createProductionPixelMonitor(page);
    const productPath = await fetchSampleProductPath(baseURL);
    const slug = productPath.replace(/^\/products\//, '');

    await seedCart(page, [
      buildTestCartItem({
        productId: slug,
        slug,
        title: `Production smoke test ${slug}`,
      }),
    ]);
    await page.goto(`${baseURL}/checkout`, { waitUntil: 'domcontentloaded' });
    await waitForFbeventsScript(page);

    const initiateCheckout = await monitor.waitForVerifiedEvent('InitiateCheckout', 25_000);
    const errors = monitor.assertEventNetwork(initiateCheckout, 'InitiateCheckout', pixelId);
    expect(errors, errors.join('; ')).toEqual([]);
  });
});
