import { NextResponse } from 'next/server';
import { ensureRuntimeState } from '@/lib/runtime-state';
import { orchestrator } from '@/src/core/orchestrator';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = await ensureRuntimeState();
  return NextResponse.json(orchestrator.getHistory(state), {
    headers: { 'Cache-Control': 'no-store' }
  });
}
