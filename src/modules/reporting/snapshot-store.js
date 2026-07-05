import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..', '..');
const dataDir = path.join(rootDir, 'data');
const snapshotsPath = path.join(dataDir, 'weekly-snapshots.json');
const MAX_SNAPSHOTS = 120;

function dateKeyFromIso(isoString) {
  return new Date(isoString).toISOString().slice(0, 10);
}

function sumBy(items, selector) {
  return items.reduce((sum, item) => sum + (selector(item) || 0), 0);
}

function average(values = []) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function createSnapshot({ system, rankedPlatforms, insights }) {
  const socialPlatforms = rankedPlatforms.filter(platform => platform.slug !== 'ga4');
  const website = rankedPlatforms.find(platform => platform.slug === 'ga4');
  const leader = rankedPlatforms[0];
  const laggard = rankedPlatforms[rankedPlatforms.length - 1];

  return {
    dateKey: dateKeyFromIso(system.lastUpdated),
    capturedAt: system.lastUpdated,
    marketingScore: insights.marketingScore,
    leader: leader ? { slug: leader.slug, name: leader.name, score: leader.score } : null,
    laggard: laggard ? { slug: laggard.slug, name: laggard.name, score: laggard.score } : null,
    social: {
      followers: sumBy(socialPlatforms, platform => platform.metrics.followers),
      views: sumBy(socialPlatforms, platform => platform.metrics.views),
      likes: sumBy(socialPlatforms, platform => platform.metrics.likes),
      comments: sumBy(socialPlatforms, platform => platform.metrics.comments),
      followersGained: sumBy(socialPlatforms, platform => platform.metrics.followersGained),
      growthPct: average(socialPlatforms.map(platform => platform.metrics.growthPct || 0))
    },
    website: {
      visitors: website?.metrics.visitors || website?.metrics.views || 0,
      emailSignups: website?.metrics.emailSignups || 0,
      conversions: website?.metrics.followersGained || 0
    },
    platforms: rankedPlatforms.map(platform => ({
      slug: platform.slug,
      name: platform.name,
      rank: platform.rank,
      score: platform.score,
      trend: platform.trend,
      metrics: {
        followers: platform.metrics.followers || 0,
        visitors: platform.metrics.visitors || 0,
        views: platform.metrics.views || 0,
        likes: platform.metrics.likes || 0,
        comments: platform.metrics.comments || 0,
        followersGained: platform.metrics.followersGained || 0,
        growthPct: platform.metrics.growthPct || 0,
        engagementRate: platform.metrics.engagementRate || 0,
        emailSignups: platform.metrics.emailSignups || 0,
        engagementTotal: platform.metrics.engagementTotal || 0
      },
      connector: platform.connector
    }))
  };
}

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(snapshotsPath);
  } catch {
    await fs.writeFile(snapshotsPath, '[]\n', 'utf8');
  }
}

async function readSnapshots() {
  await ensureStore();
  try {
    const raw = await fs.readFile(snapshotsPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSnapshots(items) {
  await ensureStore();
  await fs.writeFile(snapshotsPath, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
}

function sortSnapshots(items) {
  return [...items].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
}

export async function persistDailySnapshot(input) {
  const snapshot = createSnapshot(input);
  const existing = await readSnapshots();
  const deduped = existing.filter(item => item.dateKey !== snapshot.dateKey);
  deduped.push(snapshot);
  const trimmed = sortSnapshots(deduped).slice(-MAX_SNAPSHOTS);
  await writeSnapshots(trimmed);
  return snapshot;
}

export async function loadSnapshotHistory() {
  return sortSnapshots(await readSnapshots());
}
