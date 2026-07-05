function confidence(label, score) {
  return { label, score };
}

export const aiCmo = {
  explain(rankedPlatforms) {
    const leader = rankedPlatforms[0];
    const laggard = rankedPlatforms[rankedPlatforms.length - 1];
    const website = rankedPlatforms.find(p => p.slug === 'ga4');

    return {
      marketingScore: Math.round(rankedPlatforms.reduce((sum, p) => sum + p.score, 0) / rankedPlatforms.length),
      keyWins: [
        `${leader.name} leads because it is combining reach with above-average growth and clear upward trend momentum.`,
        `${website.name} is translating traffic into signups, which matters more than vanity reach.`
      ],
      problems: [
        `${laggard.name} is underperforming because engagement is shallow and trend direction is negative.`,
        'Lower-performing promotional posts are dragging average engagement where educational framing is absent.'
      ],
      opportunities: [
        'Double down on instructional content that shows visible improvement or measurable fitting outcomes.',
        'Repurpose the week’s best YouTube and Instagram themes into LinkedIn trust-building posts and website landing page updates.'
      ],
      risks: [
        'If short-form creative stays too promotional, audience fatigue will cap follower growth.',
        'Without tighter CTA placement, website traffic gains may not fully convert into enquiries or signups.'
      ],
      forecast: [
        'If current content mix holds, Instagram and YouTube should remain the strongest growth channels next week.',
        'Website traffic is likely to rise modestly if search-led landing pages keep aligning with fitting-intent topics.'
      ],
      recommendedActions: [
        {
          title: 'Create one premium fitting proof piece per week',
          why: 'The strongest performers are outcome-led, educational, and trust-building.',
          confidence: confidence('high', 0.86),
          estimatedImpact: 'Higher reach, stronger saves/shares, and improved lead quality.'
        },
        {
          title: 'Improve website CTA prominence on fitting pages',
          why: 'Traffic is healthy enough to justify conversion optimisation work now.',
          confidence: confidence('medium-high', 0.79),
          estimatedImpact: 'More enquiry and email capture without needing more traffic.'
        },
        {
          title: 'Reduce effort on X unless a sharper conversation strategy is tested',
          why: 'The platform is currently the weakest rank with low leverage.',
          confidence: confidence('medium', 0.68),
          estimatedImpact: 'Better time allocation toward channels already compounding.'
        }
      ]
    };
  }
};
