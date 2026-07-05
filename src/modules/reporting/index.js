function formatChange(value) {
  if (!Number.isFinite(value) || value === 0) return '0';
  return value > 0 ? `+${value}` : `${value}`;
}

function buildHistoryWindow(snapshotHistory = [], days = 7) {
  return snapshotHistory.slice(-days);
}

function buildPlatformScoreChanges(window = [], rankedPlatforms = []) {
  if (window.length < 2) return [];
  const first = window[0];
  const last = window[window.length - 1];

  return rankedPlatforms.map(platform => {
    const start = first.platforms?.find(item => item.slug === platform.slug);
    const end = last.platforms?.find(item => item.slug === platform.slug);
    const scoreDelta = Number(((end?.score || platform.score) - (start?.score || platform.score)).toFixed(1));
    const growthDelta = Number((((end?.metrics?.growthPct || platform.metrics.growthPct || 0) - (start?.metrics?.growthPct || platform.metrics.growthPct || 0))).toFixed(1));

    return {
      slug: platform.slug,
      name: platform.name,
      startScore: start?.score || platform.score,
      endScore: end?.score || platform.score,
      scoreDelta,
      growthDelta
    };
  });
}

export const reporting = {
  build({ system, rankedPlatforms, insights, competitor, drafts, snapshotHistory = [] }) {
    const leader = rankedPlatforms[0];
    const laggard = rankedPlatforms[rankedPlatforms.length - 1];
    const weeklyWindow = buildHistoryWindow(snapshotHistory, 7);
    const monthlyWindow = buildHistoryWindow(snapshotHistory, 30);
    const scoreChanges = buildPlatformScoreChanges(weeklyWindow, rankedPlatforms);
    const websiteSnapshots = weeklyWindow.map(item => item.website?.visitors || 0);
    const socialGrowthSnapshots = weeklyWindow.map(item => item.social?.growthPct || 0);
    const bestScoreMove = [...scoreChanges].sort((a, b) => b.scoreDelta - a.scoreDelta)[0];
    const worstScoreMove = [...scoreChanges].sort((a, b) => a.scoreDelta - b.scoreDelta)[0];

    return {
      daily: {
        title: 'Daily Executive Brief',
        marketingScore: insights.marketingScore,
        platformRankings: rankedPlatforms.map(p => `${p.rank}. ${p.name} (${p.score})`),
        keyWins: insights.keyWins,
        problems: insights.problems,
        opportunities: insights.opportunities,
        recommendedActions: insights.recommendedActions,
        estimatedImpact: insights.recommendedActions.map(action => action.estimatedImpact)
      },
      weekly: {
        title: 'Weekly Report',
        summary: weeklyWindow.length > 1
          ? `Across ${weeklyWindow.length} captured day(s), ${leader.name} finished strongest overall, while ${laggard.name} remains the clearest optimisation opportunity.`
          : `This week ${leader.name} led overall performance, while ${laggard.name} needs attention or reduced effort.`,
        coverageDays: weeklyWindow.length,
        dateRange: weeklyWindow.length
          ? { start: weeklyWindow[0].capturedAt, end: weeklyWindow[weeklyWindow.length - 1].capturedAt }
          : null,
        growth: rankedPlatforms.filter(p => p.trend.direction === 'up').map(p => `${p.name}: +${p.trend.deltaPct}% trend`),
        decline: rankedPlatforms.filter(p => p.trend.direction === 'down').map(p => `${p.name}: ${p.trend.deltaPct}% trend`),
        crossPlatformPerformance: rankedPlatforms.map(p => ({ name: p.name, score: p.score })),
        scoreChanges: scoreChanges.map(item => ({
          name: item.name,
          startScore: item.startScore,
          endScore: item.endScore,
          scoreDelta: item.scoreDelta,
          growthDelta: item.growthDelta,
          label: `${item.name}: ${formatChange(item.scoreDelta)} score, ${formatChange(item.growthDelta)}% growth`
        })),
        trendNarrative: [
          bestScoreMove ? `${bestScoreMove.name} made the strongest score move this week (${formatChange(bestScoreMove.scoreDelta)}).` : 'Waiting for enough history to calculate weekly score movement.',
          worstScoreMove ? `${worstScoreMove.name} was the weakest score mover (${formatChange(worstScoreMove.scoreDelta)}), so it deserves a review.` : 'Weekly underperformer tracking will sharpen once more snapshots are captured.'
        ],
        websiteTrend: {
          currentVisitors: weeklyWindow[weeklyWindow.length - 1]?.website?.visitors || 0,
          peakVisitors: websiteSnapshots.length ? Math.max(...websiteSnapshots) : 0,
          averageVisitors: websiteSnapshots.length ? Number((websiteSnapshots.reduce((sum, value) => sum + value, 0) / websiteSnapshots.length).toFixed(0)) : 0
        },
        socialTrend: {
          averageGrowthPct: socialGrowthSnapshots.length ? Number((socialGrowthSnapshots.reduce((sum, value) => sum + value, 0) / socialGrowthSnapshots.length).toFixed(1)) : 0,
          latestGrowthPct: weeklyWindow[weeklyWindow.length - 1]?.social?.growthPct || 0
        },
        competitorHighlights: competitor.highlights,
        actionPlan: insights.recommendedActions
      },
      monthly: {
        title: 'Monthly Planning Report',
        executiveView: 'Use this layer for budgeting, channel prioritisation, content investment, and pipeline planning.',
        priorities: [
          `Protect momentum on ${leader.name}.`,
          'Lift conversion efficiency on website traffic.',
          'Avoid over-investing in channels with weak weekly leverage.'
        ],
        historyCoverageDays: monthlyWindow.length,
        draftQueue: drafts.map(d => ({ id: d.id, type: d.type, status: d.status }))
      },
      history: {
        totalSnapshots: snapshotHistory.length,
        latestSnapshotAt: snapshotHistory[snapshotHistory.length - 1]?.capturedAt || null
      },
      refreshedAt: system.lastUpdated
    };
  }
};
