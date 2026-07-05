import { NextResponse } from 'next/server';
import { ensureRuntimeState, refreshRuntimeState } from '@/lib/runtime-state';
import { orchestrator } from '@/src/core/orchestrator';
import { publisher } from '@/src/modules/publisher/index.js';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const { actionId } = await params;
  const body = await request.json().catch(() => ({}));
  const status = body?.status === 'Draft' ? 'Draft' : 'Approved';

  const state = await ensureRuntimeState();
  const action = state.actionQueue.find(item => item.id === actionId);

  if (!action) {
    return NextResponse.json({ ok: false, error: 'Action not found' }, { status: 404 });
  }

  const result = await publisher.approve(actionId, status);
  const refreshed = await refreshRuntimeState();
  const updatedAction = refreshed.actionQueue.find(item => item.id === actionId);

  return NextResponse.json({
    ok: true,
    result,
    action: updatedAction
  }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
