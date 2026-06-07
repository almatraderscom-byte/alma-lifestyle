'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PIXEL_DEV_EVENT,
  type PixelDevEventDetail,
} from '@/lib/pixel-dev';
import { cn } from '@/lib/utils';

const EVENT_COLORS: Record<string, string> = {
  Purchase: 'text-green-600',
  AddToCart: 'text-blue-600',
  ViewContent: 'text-gray-600',
  Lead: 'text-orange-600',
  InitiateCheckout: 'text-purple-600',
  Search: 'text-yellow-700',
  PageView: 'text-gray-800',
  Init: 'text-emerald-700',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('bn-BD', { hour12: false });
  } catch {
    return iso;
  }
}

export function PixelDebugOverlay() {
  const [open, setOpen] = useState(true);
  const [events, setEvents] = useState<PixelDevEventDetail[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    function onPixelEvent(event: Event) {
      const detail = (event as CustomEvent<PixelDevEventDetail>).detail;
      if (!detail?.event) return;
      setEvents((prev) => [detail, ...prev].slice(0, 100));
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    window.addEventListener(PIXEL_DEV_EVENT, onPixelEvent);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener(PIXEL_DEV_EVENT, onPixelEvent);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  if (process.env.NODE_ENV !== 'development' || !open) {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-[100] rounded-full bg-charcoal px-3 py-2 font-mono text-[11px] text-cream shadow-lg"
        aria-label="Show Meta Pixel debug panel"
      >
        Pixel ({events.length})
      </button>
    );
  }

  return (
    <section
      className={cn(
        'fixed bottom-24 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col',
        'max-h-[min(24rem,50vh)] overflow-hidden rounded-lg border border-charcoal/15',
        'bg-cream/95 shadow-2xl backdrop-blur-md'
      )}
      aria-label="Meta Pixel debug log"
    >
      <header className="flex items-center justify-between gap-2 border-b border-charcoal/10 px-3 py-2">
        <div>
          <p className="font-mono text-xs font-semibold text-charcoal">Meta Pixel (dev)</p>
          <p className="font-mono text-[10px] text-charcoal/60">Ctrl+Shift+P to hide</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearEvents}
            className="rounded border border-charcoal/15 px-2 py-1 font-mono text-[10px] text-charcoal hover:bg-charcoal/5"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded border border-charcoal/15 px-2 py-1 font-mono text-[10px] text-charcoal hover:bg-charcoal/5"
            aria-label="Hide Meta Pixel debug panel"
          >
            Hide
          </button>
        </div>
      </header>

      <ul className="flex-1 overflow-y-auto px-2 py-2">
        {events.length === 0 ? (
          <li className="px-1 py-6 text-center font-mono text-[11px] text-charcoal/50">
            Waiting for fbq events…
          </li>
        ) : (
          events.map((entry) => (
            <li
              key={entry.id}
              className="mb-2 rounded border border-charcoal/10 bg-white/80 px-2 py-1.5 last:mb-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'font-mono text-xs font-semibold',
                    EVENT_COLORS[entry.event] ?? 'text-charcoal'
                  )}
                >
                  {entry.event}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-charcoal/50">
                  {formatTime(entry.timestamp)}
                </span>
              </div>
              {entry.params && Object.keys(entry.params).length > 0 ? (
                <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] text-charcoal/70">
                  {JSON.stringify(entry.params, null, 2)}
                </pre>
              ) : (
                <p className="mt-1 font-mono text-[10px] text-charcoal/40">(no params)</p>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
