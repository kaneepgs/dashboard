import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { orchestrator } from './src/core/orchestrator.js';
import { loadEnv } from './src/core/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
loadEnv();
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

let runtimeState = null;

async function ensureState() {
  if (!runtimeState) {
    runtimeState = await orchestrator.bootstrap();
  }
  return runtimeState;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(publicDir, urlPath);

  try {
    const body = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/overview' && req.method === 'GET') {
    const state = await ensureState();
    return sendJson(res, 200, orchestrator.getOverview(state));
  }

  if (url.pathname === '/api/platforms' && req.method === 'GET') {
    const state = await ensureState();
    return sendJson(res, 200, orchestrator.getPlatforms(state));
  }

  if (url.pathname.startsWith('/api/platforms/') && req.method === 'GET') {
    const state = await ensureState();
    const slug = url.pathname.split('/').pop();
    const platform = orchestrator.getPlatform(state, slug);
    if (!platform) {
      return sendJson(res, 404, { error: 'Platform not found' });
    }
    return sendJson(res, 200, platform);
  }

  if (url.pathname === '/api/system' && req.method === 'GET') {
    const state = await ensureState();
    return sendJson(res, 200, orchestrator.getSystem(state));
  }

  if (url.pathname === '/api/reports' && req.method === 'GET') {
    const state = await ensureState();
    return sendJson(res, 200, orchestrator.getReports(state));
  }

  if (url.pathname === '/api/content-drafts' && req.method === 'GET') {
    const state = await ensureState();
    return sendJson(res, 200, orchestrator.getDrafts(state));
  }

  if (url.pathname === '/api/refresh' && req.method === 'POST') {
    runtimeState = await orchestrator.refresh();
    return sendJson(res, 200, { ok: true, refreshedAt: runtimeState.system.lastUpdated });
  }

  if (url.pathname === '/api/command' && req.method === 'POST') {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        const payload = raw ? JSON.parse(raw) : {};
        ensureState().then(state => {
          const result = orchestrator.runCommand(state, payload.command || '');
          sendJson(res, 200, result);
        }).catch(error => {
          sendJson(res, 500, { error: error.message });
        });
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON payload' });
      }
    });
    return;
  }

  return serveStatic(req, res);
});

server.listen(port, () => {
  console.log(`Marketing Command Centre running at http://localhost:${port}`);
});
