import { collectMockSnapshots } from '../../adapters/mock/index.js';
import { collectYouTubeSnapshot } from '../../adapters/live/youtube.js';
import { collectGa4Snapshot } from '../../adapters/live/ga4.js';
import { loadEnv } from '../../core/env.js';

async function withFallback(slug, liveFn, fallbackMap) {
  const fallback = fallbackMap.get(slug);
  try {
    const live = await liveFn();
    return live || fallback;
  } catch (error) {
    return {
      ...fallback,
      connector: {
        mode: fallback?.connector?.mode || 'mock',
        health: 'degraded',
        detail: `Live connector failed: ${error.message}`
      },
      audienceInsights: [
        ...(fallback?.audienceInsights || []),
        `Live connector fallback active: ${error.message}`
      ]
    };
  }
}

export const dataCollector = {
  async collectAll() {
    loadEnv();
    const snapshots = collectMockSnapshots();
    const fallbackMap = new Map(snapshots.map(item => [item.slug, item]));

    const youtube = await withFallback('youtube', collectYouTubeSnapshot, fallbackMap);
    const ga4 = await withFallback('ga4', collectGa4Snapshot, fallbackMap);

    return snapshots.map(snapshot => {
      if (snapshot.slug === 'youtube') return youtube;
      if (snapshot.slug === 'ga4') return ga4;
      return snapshot;
    });
  }
};
