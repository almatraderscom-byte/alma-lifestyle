import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function maskPixelId(id: string): string {
  if (id.length <= 8) return '****';
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { ok: false, error: 'Pixel test endpoint is only available in development.' },
      { status: 404 }
    );
  }

  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID?.trim() ?? '';
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';

  return NextResponse.json({
    ok: true,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    diagnostics: {
      pixelIdConfigured: pixelId.length > 0,
      pixelIdPreview: pixelId ? maskPixelId(pixelId) : null,
      pixelIdLength: pixelId.length,
      gaMeasurementConfigured: gaId.length > 0,
    },
    clientChecks: {
      pixelScriptUrl: 'https://connect.facebook.net/en_US/fbevents.js',
      verifyInBrowser: [
        'DevTools → Network → filter "fbevents" — script should load with status 200',
        'DevTools → Console — look for color-coded [Meta Pixel] logs',
        'Press Ctrl+Shift+P to toggle the on-screen pixel debug overlay',
        'Install Meta Pixel Helper and confirm green checkmarks per event',
      ],
      overlayShortcut: 'Ctrl+Shift+P',
    },
    eventsManager: pixelId
      ? {
          testEventsUrl: `https://business.facebook.com/events_manager2/list/pixel/${pixelId}/test_events`,
          overviewUrl: `https://business.facebook.com/events_manager2/list/pixel/${pixelId}/overview`,
        }
      : {
          testEventsUrl: null,
          overviewUrl: null,
          hint: 'Set NEXT_PUBLIC_FB_PIXEL_ID in .env.local and restart npm run dev',
        },
    documentation: '/docs/pixel-testing.md',
  });
}
