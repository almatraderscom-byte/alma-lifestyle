'use client';

import { useEffect } from 'react';
import { installFbqDevInterceptor } from '@/lib/pixel-dev';
import { PixelDebugOverlay } from '@/components/analytics/PixelDebugOverlay';

/** Development-only Meta Pixel debugger — not rendered in production builds. */
export function PixelDevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    return installFbqDevInterceptor();
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return <PixelDebugOverlay />;
}
