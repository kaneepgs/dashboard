export const dashboard = {
  buildOverview(system, rankedPlatforms, insights, competitor, reports, drafts, actionQueue) {
    const socialPlatforms = rankedPlatforms.filter(p => p.slug !== 'ga4');
    const website = rankedPlatforms.find(p => p.slug === 'ga4');

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
      rankings: rankedPlatforms,
      insights,
      competitor,
      reports,
      drafts,
      actionQueue
    };
  }
};
