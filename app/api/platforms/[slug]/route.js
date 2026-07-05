import { NextResponse } from 'next/server';
import { ensureRuntimeState } from '@/lib/runtime-state';
import { orchestrator } from '@/src/core/orchestrator';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const state = await ensureRuntimeState();
  const { slug } = params;
  const platform = orchestrator.getPlatform(state, slug);

  if (!platform) {
    return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
  }

  return NextResponse.json(platform, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

