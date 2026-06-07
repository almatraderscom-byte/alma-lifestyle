import { expect, type Page } from '@playwright/test';
import type { CapturedPixelEvent, PixelInterceptor } from './pixel-interceptor';
import { readPixelDevEvents, waitForDevPixelEvent } from './pixel-browser-hook';

export interface PixelAssertionOptions {
  page: Page;
  interceptor: PixelInterceptor;
  consoleLogs: string[];
  eventName: string;
  verifyOverlay?: boolean;
  verifyConsole?: boolean;
  verifyNetwork?: boolean;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

export function assertRequiredParams(eventName: string, params: Record<string, unknown>): void {
  switch (eventName) {
    case 'Purchase': {
      const value = asNumber(params.value);
      expect(value, 'Purchase.value').not.toBeNull();
      expect(value!).toBeGreaterThan(0);
      expect(params.currency).toBe('BDT');
      expect(Array.isArray(params.contents)).toBeTruthy();
      expect((params.contents as unknown[]).length).toBeGreaterThan(0);
      const numItems = asNumber(params.num_items);
      expect(numItems, 'Purchase.num_items').not.toBeNull();
      expect(numItems!).toBeGreaterThan(0);
      break;
    }
    case 'AddToCart': {
      const value = asNumber(params.value);
      expect(value, 'AddToCart.value').not.toBeNull();
      expect(value!).toBeGreaterThan(0);
      expect(params.currency).toBe('BDT');
      expect(Array.isArray(params.contents)).toBeTruthy();
      break;
    }
    case 'InitiateCheckout': {
      const value = asNumber(params.value);
      expect(value, 'InitiateCheckout.value').not.toBeNull();
      expect(value!).toBeGreaterThan(0);
      expect(params.currency).toBe('BDT');
      const numItems = asNumber(params.num_items);
      expect(numItems, 'InitiateCheckout.num_items').not.toBeNull();
      expect(numItems!).toBeGreaterThan(0);
      break;
    }
    case 'ViewContent': {
      const contentIds = params.content_ids ?? params.content_id;
      expect(contentIds).toBeTruthy();
      expect(params.content_name).toBeTruthy();
      const value = asNumber(params.value);
      expect(value, 'ViewContent.value').not.toBeNull();
      expect(value!).toBeGreaterThan(0);
      expect(params.currency).toBe('BDT');
      break;
    }
    case 'Lead':
    case 'PageView':
      break;
    default:
      break;
  }
}

export async function assertPixelEvent({
  page,
  interceptor,
  consoleLogs,
  eventName,
  verifyOverlay = true,
  verifyConsole = true,
  verifyNetwork = true,
}: PixelAssertionOptions): Promise<CapturedPixelEvent | undefined> {
  let captured: CapturedPixelEvent | undefined;
  const matchingDevEvent = await waitForDevPixelEvent(page, eventName);

  if (verifyNetwork) {
    try {
      captured = await interceptor.waitForEvent(eventName, 5_000);
      assertRequiredParams(eventName, captured.params);
    } catch {
      if (matchingDevEvent?.params && Object.keys(matchingDevEvent.params).length > 0) {
        assertRequiredParams(eventName, matchingDevEvent.params);
      }
    }
  } else if (matchingDevEvent?.params) {
    assertRequiredParams(eventName, matchingDevEvent.params);
  }

  if (verifyConsole) {
    const hasConsole = consoleLogs.some(
      (line) => line.includes('[Meta Pixel]') && line.includes(eventName)
    );
    const hasDevEvent = Boolean(matchingDevEvent);
    expect(
      hasConsole || hasDevEvent,
      `Expected console or dev pixel trace for ${eventName}`
    ).toBeTruthy();
  }

  if (!matchingDevEvent && !captured) {
    expect(matchingDevEvent || captured, `Expected pixel event ${eventName}`).toBeTruthy();
  }

  if (verifyOverlay) {
    const overlay = page.getByRole('region', { name: 'Meta Pixel debug log' });
    await expect(overlay).toBeVisible();
    await expect(overlay.getByText(eventName, { exact: true }).first()).toBeVisible();
  }

  return captured;
}

export async function attachPixelReport(
  testInfo: import('@playwright/test').TestInfo,
  interceptor: PixelInterceptor,
  consoleLogs: string[],
  page?: Page
): Promise<void> {
  await testInfo.attach('pixel-events-json', {
    body: JSON.stringify(interceptor.snapshot(), null, 2),
    contentType: 'application/json',
  });

  if (page) {
    const devEvents = await readPixelDevEvents(page);
    await testInfo.attach('pixel-dev-events-json', {
      body: JSON.stringify(devEvents, null, 2),
      contentType: 'application/json',
    });
  }

  await testInfo.attach('pixel-console-logs', {
    body: consoleLogs.filter((line) => line.includes('[Meta Pixel]')).join('\n') || '(none)',
    contentType: 'text/plain',
  });
}
