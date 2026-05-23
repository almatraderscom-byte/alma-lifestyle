import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, parseSessionCookie } from '@/lib/admin-auth';
import { rateLimit } from '@/lib/rate-limit';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function applyApiRateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIp(request);
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const limit = isWrite ? 40 : 150;
  const windowMs = 60_000;
  const key = `api:v1:${ip}:${isWrite ? 'write' : 'read'}`;

  const result = rateLimit(key, limit, windowMs);
  if (!result.ok) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Too many requests. Please try again shortly.',
        code: 'RATE_LIMITED',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfterSec ?? 60),
        },
      }
    );
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/v1')) {
    const limited = applyApiRateLimit(request);
    if (limited) return limited;
    return NextResponse.next();
  }

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const session = parseSessionCookie(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );

  if (pathname.startsWith('/admin/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/v1/:path*'],
};
