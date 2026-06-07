/** Development-only Meta Pixel debugging — stripped from production bundles via NODE_ENV checks. */

export const PIXEL_DEV_EVENT = 'alma-pixel-dev-event';

export interface PixelDevEventDetail {
  id: string;
  event: string;
  params?: Record<string, unknown>;
  timestamp: string;
  source: 'pixel.ts' | 'fbq';
}

const CONSOLE_STYLES: Record<string, string> = {
  Purchase: 'color:#16a34a;font-weight:bold',
  AddToCart: 'color:#2563eb;font-weight:bold',
  ViewContent: 'color:#6b7280;font-weight:bold',
  Lead: 'color:#ea580c;font-weight:bold',
  InitiateCheckout: 'color:#9333ea;font-weight:bold',
  Search: 'color:#ca8a04;font-weight:bold',
  PageView: 'color:#374151;font-weight:bold',
};

function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

function createEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordPixelEvent(
  event: string,
  params?: Record<string, unknown>,
  source: PixelDevEventDetail['source'] = 'pixel.ts'
): void {
  if (!isDev() || typeof window === 'undefined') return;

  const detail: PixelDevEventDetail = {
    id: createEventId(),
    event,
    params,
    timestamp: new Date().toISOString(),
    source,
  };

  const style = CONSOLE_STYLES[event] ?? 'color:#111827;font-weight:bold';
  console.log(
    `%c[Meta Pixel] ${event}`,
    style,
    {
      params: params ?? {},
      timestamp: detail.timestamp,
      source,
    }
  );

  window.dispatchEvent(new CustomEvent<PixelDevEventDetail>(PIXEL_DEV_EVENT, { detail }));
}

export function parseFbqCall(args: unknown[]): { event: string; params?: Record<string, unknown> } | null {
  const command = typeof args[0] === 'string' ? args[0] : null;
  if (!command) return null;

  if (command === 'init') {
    const pixelId = typeof args[1] === 'string' ? args[1] : undefined;
    return { event: 'Init', params: pixelId ? { pixel_id: pixelId } : undefined };
  }

  if (command === 'track') {
    const event = typeof args[1] === 'string' ? args[1] : 'Unknown';
    const params = args[2] && typeof args[2] === 'object' ? (args[2] as Record<string, unknown>) : undefined;
    return { event, params };
  }

  if (command === 'trackCustom') {
    const event = typeof args[1] === 'string' ? args[1] : 'Custom';
    const params = args[2] && typeof args[2] === 'object' ? (args[2] as Record<string, unknown>) : undefined;
    return { event: `Custom:${event}`, params };
  }

  return { event: command, params: { raw: args.slice(1) } };
}

type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    __almaFbqDevWrapped?: boolean;
  }
}

export function installFbqDevInterceptor(): () => void {
  if (!isDev() || typeof window === 'undefined') return () => {};

  let attempts = 0;
  const maxAttempts = 40;

  const wrap = () => {
    const fbq = window.fbq as FbqFn | undefined;
    if (!fbq || window.__almaFbqDevWrapped) return true;

    const original = fbq;
    const wrapped: FbqFn = (...args: unknown[]) => {
      const parsed = parseFbqCall(args);
      // E-commerce events are logged from pixel.ts; interceptor catches bootstrap events only.
      if (parsed && (parsed.event === 'Init' || parsed.event === 'PageView')) {
        recordPixelEvent(parsed.event, parsed.params, 'fbq');
      }
      return original(...args);
    };

    Object.assign(wrapped, original);
    window.fbq = wrapped as typeof window.fbq;
    window.__almaFbqDevWrapped = true;
    return true;
  };

  if (wrap()) return () => {};

  const timer = window.setInterval(() => {
    attempts += 1;
    if (wrap() || attempts >= maxAttempts) {
      window.clearInterval(timer);
    }
  }, 250);

  return () => window.clearInterval(timer);
}
