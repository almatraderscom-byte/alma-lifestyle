// TODO(OBS-001): remove after verification — temporary Sentry smoke test (non-production only).
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'disabled in production' }, { status: 404 });
  }
  Sentry.captureMessage('OBS-001 verification ping', 'info');
  throw new Error('OBS-001 verification error');
}
