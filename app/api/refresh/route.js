import { NextResponse } from 'next/server';
import { refreshRuntimeState } from '@/lib/runtime-state';

export const dynamic = 'force-dynamic';

export async function POST() {
  const state = await refreshRuntimeState();
  return NextResponse.json({ ok: true, refreshedAt: state.system.lastUpdated }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

