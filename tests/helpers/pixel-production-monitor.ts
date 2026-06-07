import type { Page, Request, Response } from '@playwright/test';
import type { CapturedPixelEvent } from './pixel-interceptor';

export const PIXEL_TR_URL_PATTERN = /^https:\/\/www\.facebook\.com\/tr\/?/i;

export interface VerifiedPixelEvent extends CapturedPixelEvent {
  pixelId: string | null;
  responseStatus: number | null;
}

function parseCdParams(searchParams: URLSearchParams): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  for (const [key, value] of searchParams.entries()) {
    if (key === 'ev') continue;
    if (key === 'id') {
      params.pixel_id = value;
      continue;
    }

    const cdMatch = key.match(/^cd\[(.+)\]$/);
    const paramKey = cdMatch ? cdMatch[1] : key;

    if (paramKey === 'contents' || paramKey === 'content_ids') {
      try {
        params[paramKey] = JSON.parse(value);
      } catch {
        params[paramKey] = value;
      }
      continue;
    }

    if (paramKey === 'value' || paramKey === 'num_items') {
      const num = Number(value);
      params[paramKey] = Number.isFinite(num) ? num : value;
      continue;
    }

    params[paramKey] = value;
  }

  return params;
}

function parseMultipartForm(postData: string): URLSearchParams {
  const params = new URLSearchParams();
  const boundaryMatch = postData.match(/^------WebKitFormBoundary[^\r\n]+/);
  if (!boundaryMatch) return params;

  const boundary = boundaryMatch[0];
  const parts = postData.split(boundary).slice(1);

  for (const part of parts) {
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch) continue;

    const valueMatch = part.match(/\r\n\r\n([\s\S]*?)(?:\r\n------|$)/);
    if (!valueMatch) continue;

    params.append(nameMatch[1], valueMatch[1].trim());
  }

  return params;
}

function parseRequestFields(request: Request): URLSearchParams {
  const url = request.url();
  const merged = new URL(url).searchParams;

  const postData = request.postData();
  if (!postData) return merged;

  if (postData.includes('Content-Disposition: form-data')) {
    const multipart = parseMultipartForm(postData);
    for (const [key, value] of multipart.entries()) {
      merged.set(key, value);
    }
    return merged;
  }

  try {
    const urlEncoded = new URLSearchParams(postData);
    for (const [key, value] of urlEncoded.entries()) {
      merged.set(key, value);
    }
  } catch {
    /* ignore malformed POST bodies */
  }

  return merged;
}

export function extractPixelIdFromUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get('id');
  } catch {
    return null;
  }
}

function parsePixelRequest(request: Request): VerifiedPixelEvent | null {
  const url = request.url();
  if (!PIXEL_TR_URL_PATTERN.test(url)) return null;

  let fields: URLSearchParams;
  try {
    fields = parseRequestFields(request);
  } catch {
    return null;
  }

  const eventName = fields.get('ev') ?? 'Unknown';
  const params = parseCdParams(fields);
  const pixelId = fields.get('id') ?? extractPixelIdFromUrl(url);

  return {
    eventName,
    params,
    timestamp: Date.now(),
    url,
    pixelId,
    responseStatus: null,
  };
}

export class ProductionPixelMonitor {
  private events: VerifiedPixelEvent[] = [];
  private page: Page | null = null;

  attach(page: Page): void {
    this.page = page;

    page.on('request', (request) => {
      const captured = parsePixelRequest(request);
      if (captured) this.events.push(captured);
    });

    page.on('response', (response: Response) => {
      const url = response.url();
      if (!PIXEL_TR_URL_PATTERN.test(url)) return;

      const status = response.status();

      for (let i = 0; i < this.events.length; i += 1) {
        const event = this.events[i];
        if (event.responseStatus !== null) continue;
        event.responseStatus = status;
        return;
      }
    });
  }

  clearEvents(): void {
    this.events = [];
  }

  getEvents(): VerifiedPixelEvent[] {
    return [...this.events];
  }

  getEventsByName(name: string): VerifiedPixelEvent[] {
    return this.events.filter((event) => event.eventName === name);
  }

  async waitForVerifiedEvent(name: string, timeout = 20_000): Promise<VerifiedPixelEvent> {
    const started = Date.now();

    while (Date.now() - started < timeout) {
      const candidates = this.getEventsByName(name);
      const verified = candidates.find((event) => this.isEventVerified(event));
      if (verified) return verified;
      await this.page?.waitForTimeout(250);
    }

    const seen = this.events.map((event) => event.eventName).join(', ') || '(none)';
    throw new Error(
      `Timed out waiting for verified Meta Pixel event "${name}" after ${timeout}ms. Captured: ${seen}`
    );
  }

  isEventVerified(event: VerifiedPixelEvent, expectedPixelId?: string): boolean {
    if (!PIXEL_TR_URL_PATTERN.test(event.url)) return false;
    if (event.responseStatus !== 200) return false;
    if (expectedPixelId && event.pixelId !== expectedPixelId) return false;
    return true;
  }

  assertEventNetwork(
    event: VerifiedPixelEvent,
    expectedEventName: string,
    expectedPixelId: string
  ): string[] {
    const errors: string[] = [];

    if (!PIXEL_TR_URL_PATTERN.test(event.url)) {
      errors.push(`Expected facebook.com/tr/ request, got ${event.url}`);
    }

    if (event.pixelId !== expectedPixelId) {
      errors.push(
        `Pixel ID mismatch: expected ${expectedPixelId}, got ${event.pixelId ?? '(missing)'}`
      );
    }

    if (event.eventName !== expectedEventName) {
      errors.push(
        `Event name mismatch: expected ${expectedEventName}, got ${event.eventName}`
      );
    }

    if (event.responseStatus !== 200) {
      errors.push(
        `Expected HTTP 200 from facebook.com/tr/, got ${event.responseStatus ?? '(pending)'}`
      );
    }

    return errors;
  }
}

export function createProductionPixelMonitor(page: Page): ProductionPixelMonitor {
  const monitor = new ProductionPixelMonitor();
  monitor.attach(page);
  return monitor;
}

export async function waitForFbeventsScript(page: Page, timeout = 20_000): Promise<void> {
  const started = Date.now();

  while (Date.now() - started < timeout) {
    const loaded = await page.evaluate(() => {
      return Boolean(
        typeof window !== 'undefined' &&
          typeof window.fbq === 'function' &&
          (window.fbq as { loaded?: boolean }).loaded
      );
    });

    if (loaded) return;
    await page.waitForTimeout(250);
  }

  throw new Error('Meta Pixel script (fbevents.js / fbq) did not load within timeout.');
}

export const PRODUCTION_PIXEL_USER_AGENT =
  'Mozilla/5.0 (compatible; AlmaPixelSmokeTest/1.0; +https://almatraders.com)';
