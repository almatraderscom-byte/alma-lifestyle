/** Build Content-Security-Policy (report-only or enforcing) for middleware. */
export function buildContentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';

  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io ws: wss: https://vitals.vercel-insights.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self' https://wa.me",
    "object-src 'none'",
    'upgrade-insecure-requests',
    'report-uri /api/v1/csp-report',
    'report-to csp-endpoint',
  ];

  return directives.join('; ');
}

export function cspHeaderName(): 'Content-Security-Policy' | 'Content-Security-Policy-Report-Only' {
  return process.env.CSP_ENFORCE === 'true'
    ? 'Content-Security-Policy'
    : 'Content-Security-Policy-Report-Only';
}
