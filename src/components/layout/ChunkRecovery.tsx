'use client';

import { useEffect } from 'react';

const RELOAD_SESSION_KEY = 'alma-chunk-reload-v1';

function isChunkLoadFailure(message: string): boolean {
  return /Loading chunk \d+ failed|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    message
  );
}

function tryRecoverFromChunkFailure(): void {
  if (typeof window === 'undefined') return;
  if (sessionStorage.getItem(RELOAD_SESSION_KEY)) return;

  sessionStorage.setItem(RELOAD_SESSION_KEY, '1');
  const url = new URL(window.location.href);
  url.searchParams.set('_cb', String(Date.now()));
  window.location.replace(url.toString());
}

/** Reload once when a deploy leaves WiFi/router caches pointing at stale JS chunks. */
export function ChunkRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || '';
      if (isChunkLoadFailure(message)) tryRecoverFromChunkFailure();
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === 'string' ? reason : reason?.message ? String(reason.message) : '';
      if (isChunkLoadFailure(message)) tryRecoverFromChunkFailure();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    const clearTimer = window.setTimeout(() => {
      sessionStorage.removeItem(RELOAD_SESSION_KEY);
    }, 60_000);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      window.clearTimeout(clearTimer);
    };
  }, []);

  return null;
}
