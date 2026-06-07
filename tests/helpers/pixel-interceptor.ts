import type { Page, Request } from '@playwright/test';

export interface CapturedPixelEvent {
  eventName: string;
  params: Record<string, unknown>;
  timestamp: number;
  url: string;
}

const PIXEL_URL_PATTERN = /(?:www\.)?facebook\.com\/tr\/?/i;

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

function parsePixelRequest(request: Request): CapturedPixelEvent | null {
  const url = request.url();
  if (!PIXEL_URL_PATTERN.test(url)) return null;

  let searchParams: URLSearchParams;

  try {
    searchParams = new URL(url).searchParams;
  } catch {
    return null;
  }

  const eventName = searchParams.get('ev') ?? 'Unknown';
  const params = parseCdParams(searchParams);

  const postData = request.postData();
  if (postData) {
    try {
      const bodyParams = new URLSearchParams(postData);
      Object.assign(params, parseCdParams(bodyParams));
    } catch {
      /* ignore malformed POST bodies */
    }
  }

  return {
    eventName,
    params,
    timestamp: Date.now(),
    url,
  };
}

export class PixelInterceptor {
  private events: CapturedPixelEvent[] = [];
  private page: Page | null = null;

  attach(page: Page): void {
    this.page = page;
    page.on('request', (request) => {
      const captured = parsePixelRequest(request);
      if (captured) {
        this.events.push(captured);
      }
    });
  }

  getEvents(): CapturedPixelEvent[] {
    return [...this.events];
  }

  getEventsByName(name: string): CapturedPixelEvent[] {
    return this.events.filter((event) => event.eventName === name);
  }

  clearEvents(): void {
    this.events = [];
  }

  async waitForEvent(name: string, timeout = 15_000): Promise<CapturedPixelEvent> {
    const started = Date.now();

    while (Date.now() - started < timeout) {
      const match = this.getEventsByName(name).at(-1);
      if (match) return match;
      await this.page?.waitForTimeout(250);
    }

    const seen = this.events.map((event) => event.eventName).join(', ') || '(none)';
    throw new Error(
      `Timed out waiting for Meta Pixel event "${name}" after ${timeout}ms. Captured: ${seen}`
    );
  }

  countEventsByName(name: string): number {
    return this.getEventsByName(name).length;
  }

  snapshot(): CapturedPixelEvent[] {
    return this.getEvents();
  }
}

export function createPixelInterceptor(page: Page): PixelInterceptor {
  const interceptor = new PixelInterceptor();
  interceptor.attach(page);
  return interceptor;
}
