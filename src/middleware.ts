import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionCookie,
  parseAdminSessionCookie,
} from '@/lib/admin-session';
import { canAccessAdminPath } from '@/lib/admin-roles';

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

function getAdminSession(request: NextRequest) {
  return parseAdminSessionCookie(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function isAdminAuthenticated(request: NextRequest): boolean {
  return isAdminSessionCookie(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

/** Allow admin live-preview iframe on same origin; deny embedding elsewhere. */
function applyFrameOptions(request: NextRequest, response: NextResponse): NextResponse {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname.startsWith('/api')) return response;

  const isPreview = searchParams.get('preview') === 'true';
  if (isPreview) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  } else {
    response.headers.set('X-Frame-Options', 'DENY');
  }
  return response;
}

function applyCacheHeaders(pathname: string, response: NextResponse): NextResponse {
  if (pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  // Storefront HTML: browsers must revalidate (fixes WiFi/router stale page cache after deploys).
  response.headers.set(
    'Cache-Control',
    'no-cache, must-revalidate, s-maxage=60, stale-while-revalidate=300'
  );

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/v1')) {
    const limited = applyApiRateLimit(request);
    if (limited) return limited;
    const apiRes = NextResponse.next();
    apiRes.headers.set('Cache-Control', 'no-store');
    return applyFrameOptions(request, apiRes);
  }

  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith('/admin/login')) {
      if (isAdminAuthenticated(request)) {
        return applyFrameOptions(
          request,
          NextResponse.redirect(new URL('/admin', request.url))
        );
      }
      return applyFrameOptions(request, NextResponse.next());
    }

    if (!isAdminAuthenticated(request)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return applyCacheHeaders(
        pathname,
        applyFrameOptions(request, NextResponse.redirect(loginUrl))
      );
    }

    const session = getAdminSession(request);
    if (session && !canAccessAdminPath(pathname, session.role)) {
      return applyCacheHeaders(
        pathname,
        applyFrameOptions(
          request,
          NextResponse.redirect(new URL('/admin?forbidden=1', request.url))
        )
      );
    }

    return applyCacheHeaders(
      pathname,
      applyFrameOptions(request, NextResponse.next())
    );
  }

  return applyCacheHeaders(pathname, applyFrameOptions(request, NextResponse.next()));
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/v1/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
