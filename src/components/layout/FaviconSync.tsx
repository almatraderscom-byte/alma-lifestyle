'use client';

import { useEffect } from 'react';
import { buildFaviconHref } from '@/lib/favicon-url';

export function FaviconSync({
  faviconUrl,
  version,
}: {
  faviconUrl?: string;
  version?: string;
}) {
  useEffect(() => {
    const href = buildFaviconHref(faviconUrl, version ?? String(Date.now()));

    document.querySelectorAll('link[rel*="icon"]').forEach((el) => el.remove());

    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.href = href;
    document.head.appendChild(icon);

    const apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    apple.href = href;
    document.head.appendChild(apple);
  }, [faviconUrl, version]);

  return null;
}
