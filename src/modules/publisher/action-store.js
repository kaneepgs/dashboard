import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'action-approvals.json');

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function loadActionApprovals() {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed?.items || {};
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function writeActionApprovals(items) {
  await ensureDir();
  await writeFile(STORE_PATH, JSON.stringify({ items }, null, 2), 'utf8');
}

export async function setActionApproval(actionId, status) {
  const items = await loadActionApprovals();
  if (status === 'Draft') {
    items[actionId] = {
      status: 'Draft',
      updatedAt: new Date().toISOString(),
      approvedAt: null
    };
  } else {
    items[actionId] = {
      status: 'Approved',
      updatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    };
  }
  await writeActionApprovals(items);
  return items[actionId];
}
