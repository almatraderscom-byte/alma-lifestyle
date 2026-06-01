import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  authLimiter,
  isUpstashEnabled,
  readLimiter,
  writeLimiter,
} from '@/lib/rate-limit-redis';
import { checkRateLimit as memCheckRateLimit } from '@/lib/rate-limit';
import { ADMIN_SESSION_COOKIE, parseSessionCookie } from '@/lib/admin-auth';
import { buildContentSecurityPolicy, cspHeaderName } from '@/lib/security/csp';

const RATE_LIMITS = {
  read: 150,
  write: 40,
  auth: 5,
} as const;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

function rateLimitKind(request: NextRequest): 'read' | 'write' | 'auth' {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/v1/admin/session')) return 'auth';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return 'write';
  return 'read';
}

function getRateLimitIdentifier(request: NextRequest, ip: string): string {
  const session = parseSessionCookie(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );
  if (session?.user?.email) {
    return `${session.user.email}:${ip}`;
  }
  return ip;
}

async function checkRequestRateLimit(
  request: NextRequest,
  ip: string,
  kind: 'read' | 'write' | 'auth'
): Promise<{
  ok: boolean;
  reset: number;
  remaining: number;
  limit: number;
  retryAfterSec?: number;
}> {
  const identifier = getRateLimitIdentifier(request, ip);

  if (isUpstashEnabled) {
    const limiter =
      kind === 'write' ? writeLimiter! : kind === 'auth' ? authLimiter! : readLimiter!;
    const result = await limiter.limit(identifier);
    const resetUnixSec = Math.ceil(result.reset / 1000);
    const retryAfterSec = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return {
      ok: result.success,
      reset: resetUnixSec,
      remaining: result.remaining,
      limit: result.limit,
      retryAfterSec: result.success ? undefined : retryAfterSec,
    };
  }

  const r = memCheckRateLimit(identifier, kind);
  return {
    ok: r.ok,
    reset: r.reset,
    remaining: r.remaining,
    limit: r.limit,
    retryAfterSec: r.retryAfterSec,
  };
}

function rateLimitResponse(
  kind: keyof typeof RATE_LIMITS,
  result: { reset: number; retryAfterSec?: number }
): NextResponse {
  const retryAfter =
    result.retryAfterSec ?? Math.max(1, result.reset - Math.floor(Date.now() / 1000));

  return NextResponse.json(
    {
      status: 'error',
      error: 'Too many requests. Please try again shortly.',
      code: 'RATE_LIMITED',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(RATE_LIMITS[kind]),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.reset),
      },
    }
  );
}

async function applyApiRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const kind = rateLimitKind(request);
  const result = await checkRequestRateLimit(request, ip, kind);

  if (!result.ok) {
    return rateLimitResponse(kind, result);
  }

  return null;
}

function isAdminAuthenticated(request: NextRequest): boolean {
  return parseSessionCookie(request.cookies.get(ADMIN_SESSION_COOKIE)?.value) !== null;
}

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  const headerName = cspHeaderName();
  response.headers.set(headerName, buildContentSecurityPolicy(nonce));
  response.headers.set('x-nonce', nonce);
  response.headers.set(
    'Report-To',
    JSON.stringify({
      group: 'csp-endpoint',
      max_age: 10886400,
      endpoints: [{ url: '/api/v1/csp-report' }],
    })
  );
  return response;
}

function continueWithSecurity(request: NextRequest, base?: NextResponse): NextResponse {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response =
    base ??
    NextResponse.next({
      request: { headers: requestHeaders },
    });

  if (base) {
    response.headers.set('x-nonce', nonce);
  }

  return applySecurityHeaders(response, nonce);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/v1')) {
    if (pathname === '/api/v1/csp-report') {
      return continueWithSecurity(request);
    }
    const limited = await applyApiRateLimit(request);
    if (limited) return limited;
    return continueWithSecurity(request);
  }

  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith('/admin/login')) {
      if (isAdminAuthenticated(request)) {
        return continueWithSecurity(
          request,
          NextResponse.redirect(new URL('/admin', request.url))
        );
      }
      return continueWithSecurity(request);
    }

    if (!isAdminAuthenticated(request)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return continueWithSecurity(request, NextResponse.redirect(loginUrl));
    }

    return continueWithSecurity(request);
  }

  return continueWithSecurity(request);
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/v1/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
