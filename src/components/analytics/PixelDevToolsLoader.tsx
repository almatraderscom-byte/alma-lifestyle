'use client';

import { PixelDevTools } from '@/components/analytics/PixelDevTools';

export function PixelDevToolsLoader() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <PixelDevTools />;
}
