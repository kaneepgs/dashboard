import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

let loaded = false;

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return null;
  const idx = trimmed.indexOf('=');
  const key = trimmed.slice(0, idx).trim();
  const value = trimmed.slice(idx + 1).trim();
  return { key, value };
}

export function loadEnv() {
  if (loaded) return process.env;

  for (const name of ['.env', '.env.local']) {
    const filePath = path.join(rootDir, name);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      process.env[parsed.key] = parsed.value;
    }
  }

  loaded = true;
  return process.env;
}

export function getEnv(name, fallback = '') {
  loadEnv();
  return process.env[name] || fallback;
}

export function getMultilineEnv(name, fallback = '') {
  const value = getEnv(name, fallback);
  return value.replace(/\\n/g, '\n');
}

