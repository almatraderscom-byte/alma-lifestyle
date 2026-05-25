export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  // eslint-disable-next-line no-console
  console.warn('[CSP violation]', body);
  // TODO(OBS-001): Sentry.captureMessage('CSP violation', { extra: body });
  return new Response(null, { status: 204 });
}
