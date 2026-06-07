import type { Page } from '@playwright/test';

export async function installPixelBrowserHook(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__pixelDevEvents = [];

    window.addEventListener('alma-pixel-dev-event', (event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.event) {
        window.__pixelDevEvents?.push(detail);
      }
    });
  });
}

export async function readPixelDevEvents(page: Page): Promise<
  Array<{ event: string; params?: Record<string, unknown> }>
> {
  return page.evaluate(() => window.__pixelDevEvents ?? []);
}

export async function waitForDevPixelEvent(
  page: Page,
  eventName: string,
  timeout = 15_000
): Promise<{ event: string; params?: Record<string, unknown> } | null> {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const events = await readPixelDevEvents(page);
    const match = events.filter((entry) => entry.event === eventName).at(-1);
    if (match) return match;
    await page.waitForTimeout(250);
  }
  return null;
}

declare global {
  interface Window {
    __pixelDevEvents?: Array<{ event: string; params?: Record<string, unknown> }>;
  }
}
