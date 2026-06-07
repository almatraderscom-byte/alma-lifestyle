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
  Init: 'color:#059669;font-weight:bold',
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

/** @deprecated No longer wraps fbq — logging happens in pixel.ts and FacebookPixel.onLoad. */
export function installFbqDevInterceptor(): () => void {
  return () => {};
}
