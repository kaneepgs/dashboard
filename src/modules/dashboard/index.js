function buildHistorySummary(snapshotHistory = []) {
  const lastSeven = snapshotHistory.slice(-7);
  const latest = lastSeven[lastSeven.length - 1];
  const previous = lastSeven[lastSeven.length - 2];

  return {
    totalSnapshots: snapshotHistory.length,
    coverageDays: lastSeven.length,
    latestSnapshotAt: latest?.capturedAt || null,
    dateRange: lastSeven.length ? {
      start: lastSeven[0].capturedAt,
      end: latest.capturedAt
    } : null,
    marketingScoreDelta: latest && previous ? Number((latest.marketingScore - previous.marketingScore).toFixed(1)) : 0,
    visitorDelta: latest && previous ? (latest.website?.visitors || 0) - (previous.website?.visitors || 0) : 0,
    timeline: lastSeven.map(snapshot => ({
      dateKey: snapshot.dateKey,
      capturedAt: snapshot.capturedAt,
      marketingScore: snapshot.marketingScore,
      visitors: snapshot.website?.visitors || 0,
      socialGrowthPct: snapshot.social?.growthPct || 0,
      leader: snapshot.leader?.name || 'N/A'
    }))
  };
}

function buildExecutivePack(system, reports, actionQueue = [], drafts = []) {
  const approvedActions = actionQueue.filter(action => action.status === 'Approved');
  const priorityDrafts = drafts.slice(0, 3).map(draft => ({
    id: draft.id,
    platform: draft.platform,
    type: draft.type,
    headline: draft.content,
    cta: draft.cta,
    repurposeNote: draft.repurposeNote
  }));

  return {
    title: 'Executive Pack',
    generatedAt: system.lastUpdated,
    headline: reports.sunday.headline,
    executiveSummary: reports.sunday.executiveSummary,
    approvedActionCount: approvedActions.length,
    pendingActionCount: actionQueue.length - approvedActions.length,
    approvedActions,
    priorityDrafts,
    sundaySummaryPack: reports.sunday.pack,
    combinedBrief: [
      'EP GOLF STUDIOS EXECUTIVE PACK',
      `Generated: ${system.lastUpdated}`,
      '',
      `Headline: ${reports.sunday.headline}`,
      reports.sunday.executiveSummary,
      '',
      `Approved actions: ${approvedActions.length}`,
      ...approvedActions.map(action => `- ${action.title} (${action.estimatedImpact})`),
      '',
      'Priority drafts:',
      ...priorityDrafts.map(draft => `- ${draft.platform} / ${draft.type}: ${draft.headline}`)
    ].join('\n')
  };
}

export const dashboard = {
  buildOverview(system, rankedPlatforms, insights, competitor, reports, drafts, actionQueue, snapshotHistory = []) {
    const socialPlatforms = rankedPlatforms.filter(p => p.slug !== 'ga4');
    const website = rankedPlatforms.find(p => p.slug === 'ga4');
    const history = buildHistorySummary(snapshotHistory);

    return {
      brand: 'EP Golf Studios',
      system,
      social: {
        followers: socialPlatforms.reduce((sum, p) => sum + (p.metrics.followers || 0), 0),
        views: socialPlatforms.reduce((sum, p) => sum + (p.metrics.views || 0), 0),
        likes: socialPlatforms.reduce((sum, p) => sum + (p.metrics.likes || 0), 0),
        comments: socialPlatforms.reduce((sum, p) => sum + (p.metrics.comments || 0), 0),
        followersGained: socialPlatforms.reduce((sum, p) => sum + (p.metrics.followersGained || 0), 0),
        growthPct: Number((socialPlatforms.reduce((sum, p) => sum + (p.metrics.growthPct || 0), 0) / socialPlatforms.length).toFixed(1))
      },
      website: {
        visitors: website.metrics.visitors || website.metrics.views,
        emailSignups: website.metrics.emailSignups || 0
      },
      history,
      weeklyFocus: {
        summary: reports.weekly.summary,
        coverageDays: reports.weekly.coverageDays,
        websiteTrend: reports.weekly.websiteTrend,
        socialTrend: reports.weekly.socialTrend,
        trendNarrative: reports.weekly.trendNarrative,
        scoreChanges: reports.weekly.scoreChanges,
        actionPlan: reports.weekly.actionPlan
      },
      sundaySummary: reports.sunday,
      executivePack: buildExecutivePack(system, reports, actionQueue, drafts),
      rankings: rankedPlatforms,
      insights,
      competitor,
      reports,
      drafts,
      actionQueue
    };
  }
};
