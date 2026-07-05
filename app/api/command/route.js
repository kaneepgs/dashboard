import { NextResponse } from 'next/server';
import { ensureRuntimeState } from '@/lib/runtime-state';
import { orchestrator } from '@/src/core/orchestrator';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const state = await ensureRuntimeState();
  const result = orchestrator.runCommand(state, body.command || '');
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

