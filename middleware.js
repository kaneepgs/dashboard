import { NextResponse } from 'next/server';
import { DASHBOARD_AUTH_COOKIE, isDashboardAuthEnabled, isValidDashboardCookie } from './lib/dashboard-auth.js';

export function middleware(request) {
  if (!isDashboardAuthEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(DASHBOARD_AUTH_COOKIE)?.value;
  if (isValidDashboardCookie(cookie)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
