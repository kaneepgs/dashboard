import { NextResponse } from 'next/server';
import { DASHBOARD_AUTH_COOKIE, createDashboardAuthToken, getDashboardAccessPassword, isValidDashboardPassword } from '@/lib/dashboard-auth';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const password = body?.password || '';
  const next = body?.next || '/';
  const isHttps = new URL(request.url).protocol === 'https:';

  if (!getDashboardAccessPassword()) {
    return NextResponse.json({ ok: true, next });
  }

  if (!isValidDashboardPassword(password)) {
    return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, next });
  response.cookies.set({
    name: DASHBOARD_AUTH_COOKIE,
    value: createDashboardAuthToken(password),
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: 60 * 60 * 24 * 14
  });
  return response;
}
