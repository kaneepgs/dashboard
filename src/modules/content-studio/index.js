export const contentStudio = {
  draft(rankedPlatforms) {
    const leader = rankedPlatforms[0];

    return [
      {
        id: 'draft-yt-001',
        type: 'YouTube Title',
        status: 'Draft',
        platform: 'YouTube',
        content: 'The 3 Driver Fitting Mistakes Costing Golfers Distance',
        rationale: `Recommended because ${leader.name} is proving educational, high-intent content is driving both reach and trust.`
      },
      {
        id: 'draft-ig-001',
        type: 'Instagram Caption',
        status: 'Draft',
        platform: 'Instagram',
        content: 'A better fitting doesn’t just change your clubs — it changes your confidence over the ball. Here’s what actually moved the needle this week…',
        rationale: 'Recommended because proof-led performance stories are outperforming generic promo content.'
      },
      {
        id: 'draft-li-001',
        type: 'LinkedIn Post',
        status: 'Draft',
        platform: 'LinkedIn',
        content: 'Premium golf marketing should not just shout louder. It should remove doubt. This week’s biggest lesson: instructional trust beats generic promotion.',
        rationale: 'Recommended because professional audiences are responding to expertise framing and strategic clarity.'
      }
    ];
  }
};
