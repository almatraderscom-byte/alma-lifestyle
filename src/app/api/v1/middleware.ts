// API middleware for v1 endpoints
// Handles authentication, rate limiting, logging

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Placeholder - authentication, rate limiting, logging will be implemented
  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*',
};