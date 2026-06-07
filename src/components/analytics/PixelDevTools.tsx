'use client';

import { PixelDebugOverlay } from '@/components/analytics/PixelDebugOverlay';

/** Development-only Meta Pixel debugger — not rendered in production builds. */
export function PixelDevTools() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <PixelDebugOverlay />;
}
