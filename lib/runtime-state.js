import { orchestrator } from '../src/core/orchestrator.js';

let runtimeStatePromise = null;

export async function ensureRuntimeState() {
  if (!runtimeStatePromise) {
    runtimeStatePromise = orchestrator.bootstrap();
  }
  return runtimeStatePromise;
}

export async function refreshRuntimeState() {
  runtimeStatePromise = orchestrator.refresh();
  return runtimeStatePromise;
}

