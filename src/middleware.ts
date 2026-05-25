import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-session/constants';
import { verifySessionEdge } from '@/lib/admin-session/edge';

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

function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  const verified = await verifySessionEdge(token);
  return verified.ok;
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/v1')) {
    const limited = applyApiRateLimit(request);
    if (limited) return limited;
    return applyFrameOptions(request, NextResponse.next());
  }

  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith('/admin/login')) {
      if (await isAdminAuthenticated(request)) {
        return applyFrameOptions(
          request,
          NextResponse.redirect(new URL('/admin', request.url))
        );
      }
      return applyFrameOptions(request, NextResponse.next());
    }

    if (!(await isAdminAuthenticated(request))) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const response = NextResponse.redirect(loginUrl);
      clearAdminSessionCookie(response);
      return applyFrameOptions(request, response);
    }

    return applyFrameOptions(request, NextResponse.next());
  }

  return applyFrameOptions(request, NextResponse.next());
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/v1/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
