import { SCORE_WEIGHTS } from './weights.js';

function normalise(value, max) {
  if (!max) return 0;
  return value / max;
}

function trendToScore(direction) {
  if (direction === 'up') return 1;
  if (direction === 'flat') return 0.55;
  return 0.2;
}

export function rankPlatforms(platforms) {
  const maxViews = Math.max(...platforms.map(p => p.metrics.views || p.metrics.visitors || 0), 1);
  const maxEngagement = Math.max(...platforms.map(p => p.metrics.engagementTotal || 0), 1);
  const maxFollowersGained = Math.max(...platforms.map(p => p.metrics.followersGained || 0), 1);
  const maxGrowthPct = Math.max(...platforms.map(p => p.metrics.growthPct || 0), 1);

  const ranked = platforms.map(platform => {
    const score = (
      normalise(platform.metrics.views || platform.metrics.visitors || 0, maxViews) * SCORE_WEIGHTS.views +
      normalise(platform.metrics.engagementTotal || 0, maxEngagement) * SCORE_WEIGHTS.engagement +
      normalise(platform.metrics.followersGained || 0, maxFollowersGained) * SCORE_WEIGHTS.followersGained +
      normalise(platform.metrics.growthPct || 0, maxGrowthPct) * SCORE_WEIGHTS.growthPct +
      trendToScore(platform.trend.direction) * SCORE_WEIGHTS.trendDirection
    ) * 100;

    return {
      ...platform,
      score: Number(score.toFixed(1))
    };
  });

  return ranked.sort((a, b) => b.score - a.score).map((platform, index) => ({
    ...platform,
    rank: index + 1
  }));
}
