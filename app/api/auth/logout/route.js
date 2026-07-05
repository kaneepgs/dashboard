import { NextResponse } from 'next/server';
import { DASHBOARD_AUTH_COOKIE } from '@/lib/dashboard-auth';

export async function POST(request) {
  const response = NextResponse.json({ ok: true });
  const isHttps = new URL(request.url).protocol === 'https:';
  response.cookies.set({
    name: DASHBOARD_AUTH_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: 0
  });
  return response;
}
