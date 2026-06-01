'use client';

import { useEffect } from 'react';
import { buildFaviconHref } from '@/lib/favicon-url';

/**
 * Updates document favicon links client-side when settings change.
 * Must return null — never render favicon URL as visible text.
 */
export function FaviconSync({
  faviconUrl,
  version,
}: {
  faviconUrl?: string;
  version?: string;
}) {
  useEffect(() => {
    const href = buildFaviconHref(faviconUrl, version ?? String(Date.now()));
    if (!href) return;

    document.querySelectorAll('link[rel*="icon"]').forEach((el) => el.remove());

    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/png';
    icon.href = href;
    document.head.appendChild(icon);

    const shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    shortcut.href = href;
    document.head.appendChild(shortcut);

    const apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    apple.href = href;
    document.head.appendChild(apple);
  }, [faviconUrl, version]);

  return null;
}
