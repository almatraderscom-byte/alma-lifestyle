import { assertPixelEvent, attachPixelReport } from './helpers/pixel-assertions';
import { installPixelBrowserHook, waitForDevPixelEvent, readPixelDevEvents } from './helpers/pixel-browser-hook';
import { test, expect } from './helpers/pixel-fixture';
import {
  fillCheckoutForm,
  mockCheckoutOrderApi,
  MURDA_PRODUCT_SLUG,
  seedCart,
  seedPlacedOrder,
  TEST_PRODUCT_SLUG,
} from './helpers/seed-test-data';

test.describe.configure({ mode: 'serial' });

test.describe('Meta Pixel sequential E2E', () => {
  test.beforeEach(async ({ page, pixel }) => {
    pixel.clearEvents();
    await installPixelBrowserHook(page);
    await page.addInitScript(() => {
      sessionStorage.setItem('murda-overlay-seen', '1');
    });
    await page.route('**/*wa.me/**', (route) => route.abort());
    await page.addInitScript(() => {
      window.addEventListener('DOMContentLoaded', () => {
        const overlay = document.querySelector('[aria-label="Meta Pixel debug log"]');
        if (overlay instanceof HTMLElement) {
          overlay.style.pointerEvents = 'none';
        }
      });
    });
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('murda-overlay-seen', '1');
    });
  });

  test.afterEach(async ({ pixel, pixelConsoleLogs, page }, testInfo) => {
    await attachPixelReport(testInfo, pixel, pixelConsoleLogs, page);
  });

  test('1. Homepage visit fires PageView', async ({ page, pixel, pixelConsoleLogs }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'PageView',
    });
  });

  test('2. /api/pixel-test returns pixelIdConfigured true', async ({ request }) => {
    const response = await request.get('/api/pixel-test');
    expect(response.ok()).toBeTruthy();

    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.diagnostics.pixelIdConfigured).toBe(true);
  });

  test('3. Product PDP fires PageView and ViewContent', async ({ page, pixel, pixelConsoleLogs }) => {
    await page.goto(`/products/${TEST_PRODUCT_SLUG}`);
    await page.waitForLoadState('domcontentloaded');

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'ViewContent',
    });
  });

  test('4. Product card Add to Cart fires AddToCart', async ({ page, pixel, pixelConsoleLogs }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    const card = page.locator('article').first();
    await card.hover();
    await card.getByRole('button', { name: 'Add to Cart' }).click();

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'AddToCart',
    });
  });

  test('5. PDP Buy Now fires AddToCart', async ({ page, pixel, pixelConsoleLogs }) => {
    await page.goto(`/products/${TEST_PRODUCT_SLUG}`);
    await page.waitForLoadState('domcontentloaded');

    await page
      .locator('button.min-h-14')
      .filter({ hasText: 'এখনই কিনুন' })
      .click();
    await page.waitForURL('**/cart');

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'AddToCart',
    });
  });

  test('6. Checkout visit fires InitiateCheckout only once', async ({ page, pixel, pixelConsoleLogs }) => {
    await seedCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'InitiateCheckout',
    });

    const beforeReload = pixel.countEventsByName('InitiateCheckout');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect(pixel.countEventsByName('InitiateCheckout')).toBe(beforeReload);
  });

  test('7. Complete checkout fires Purchase on confirmation', async ({ page, pixel, pixelConsoleLogs }) => {
    await mockCheckoutOrderApi(page);
    await seedCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    pixel.clearEvents();
    pixelConsoleLogs.length = 0;

    await fillCheckoutForm(page);
    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.waitForURL('**/checkout/confirmation', { timeout: 60_000 });
    await page.waitForLoadState('domcontentloaded');

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'Purchase',
    });
  });

  test('8. Refresh confirmation does not fire second Purchase', async ({ page }) => {
    await seedPlacedOrder(page);
    await page.goto('/checkout/confirmation');
    await page.waitForLoadState('domcontentloaded');

    await waitForDevPixelEvent(page, 'Purchase', 20_000);
    const purchaseCountBeforeRefresh = (await readPixelDevEvents(page)).filter(
      (entry) => entry.event === 'Purchase'
    ).length;
    expect(purchaseCountBeforeRefresh).toBe(1);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const purchaseCountAfterRefresh = (await readPixelDevEvents(page)).filter(
      (entry) => entry.event === 'Purchase'
    ).length;
    expect(purchaseCountAfterRefresh).toBe(0);

    const deduped = await page.evaluate(() =>
      sessionStorage.getItem('alma-pixel-purchase-ALM-PLAYWRIGHT_TEST_ORDER-001')
    );
    expect(deduped).toBe('1');
  });

  test('9. Confirmation WhatsApp click fires Lead', async ({ page, pixel, pixelConsoleLogs }) => {
    await seedPlacedOrder(page);
    await page.goto('/checkout/confirmation');
    await page.waitForLoadState('domcontentloaded');
    pixel.clearEvents();
    pixelConsoleLogs.length = 0;

    await page.getByRole('link', { name: /Track Order on WhatsApp/i }).click({ noWaitAfter: true });

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'Lead',
    });
  });

  test('10. Cart WhatsApp order fires Lead only, not Purchase', async ({ page, pixel, pixelConsoleLogs }) => {
    await seedCart(page);
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    pixel.clearEvents();
    pixelConsoleLogs.length = 0;

    await page.getByRole('link', { name: /Order on WhatsApp/i }).click({ noWaitAfter: true });

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'Lead',
    });

    expect(pixel.countEventsByName('Purchase')).toBe(0);
  });

  test('11. Murda sticky CTA fires AddToCart then InitiateCheckout', async ({ page, pixel, pixelConsoleLogs }) => {
    await page.goto(`/products/${MURDA_PRODUCT_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
    pixel.clearEvents();
    pixelConsoleLogs.length = 0;

    const stickyButton = page.getByRole('button', { name: /অর্ডার করতে চাই/ }).last();
    await stickyButton.waitFor({ state: 'visible', timeout: 20_000 });
    await stickyButton.click();
    await page.waitForURL('**/checkout', { timeout: 20_000 });
    await page.waitForLoadState('domcontentloaded');

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'AddToCart',
    });

    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'InitiateCheckout',
    });
  });

  test('12. WhatsApp CTAs fire Lead on floating button, footer, and homepage CTA', async ({
    page,
    pixel,
    pixelConsoleLogs,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    pixel.clearEvents();
    pixelConsoleLogs.length = 0;
    await page.getByRole('link', { name: 'আমাদের মেসেজ করুন' }).click({ noWaitAfter: true });
    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'Lead',
    });

    pixel.clearEvents();
    pixelConsoleLogs.length = 0;
    await page.locator('footer a[href*="wa.me"]').first().click({ noWaitAfter: true });
    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'Lead',
    });

    pixel.clearEvents();
    pixelConsoleLogs.length = 0;
    await page.getByRole('link', { name: /WhatsApp এ মেসেজ করুন/i }).click({ noWaitAfter: true });
    await assertPixelEvent({
      page,
      interceptor: pixel,
      consoleLogs: pixelConsoleLogs,
      eventName: 'Lead',
    });
  });
});
