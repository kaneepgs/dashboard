function buildCopyPack(draft) {
  return {
    headline: draft.content,
    body: draft.body,
    cta: draft.cta,
    assetBrief: draft.assetBrief,
    repurposeNote: draft.repurposeNote,
    combined: [
      `${draft.type} — ${draft.platform}`,
      '',
      `Headline: ${draft.content}`,
      draft.body ? `Body: ${draft.body}` : null,
      `CTA: ${draft.cta}`,
      `Asset brief: ${draft.assetBrief}`,
      `Repurpose note: ${draft.repurposeNote}`
    ].filter(Boolean).join('\n')
  };
}

export const contentStudio = {
  draft(rankedPlatforms) {
    const leader = rankedPlatforms[0];

    const drafts = [
      {
        id: 'draft-yt-001',
        type: 'YouTube Title',
        status: 'Draft',
        platform: 'YouTube',
        content: 'The 3 Driver Fitting Mistakes Costing Golfers Distance',
        body: 'Open with a quick myth-bust, then show the measurable fitting changes that actually improved strike, launch, and confidence.',
        cta: 'Invite viewers to book a fitting or compare their current setup against a data-led baseline.',
        assetBrief: 'Use launch-monitor overlays, before/after club data, and one clear golfer outcome story.',
        repurposeNote: 'Cut the core mistakes into three short clips for Instagram and one trust-led carousel for LinkedIn.',
        rationale: `Recommended because ${leader.name} is proving educational, high-intent content is driving both reach and trust.`
      },
      {
        id: 'draft-ig-001',
        type: 'Instagram Caption',
        status: 'Draft',
        platform: 'Instagram',
        content: 'A better fitting doesn’t just change your clubs — it changes your confidence over the ball. Here’s what actually moved the needle this week…',
        body: 'Lead with one real transformation, show the proof, then explain why the result came from fit and not just new equipment hype.',
        cta: 'Prompt followers to message or book if they want to see where their own setup is costing them shots.',
        assetBrief: 'Pair with a premium reel or carousel: swing clip, numbers, club change, result, golfer reaction.',
        repurposeNote: 'Reuse the same proof angle in Stories with a question sticker around driver fitting myths.',
        rationale: 'Recommended because proof-led performance stories are outperforming generic promo content.'
      },
      {
        id: 'draft-li-001',
        type: 'LinkedIn Post',
        status: 'Draft',
        platform: 'LinkedIn',
        content: 'Premium golf marketing should not just shout louder. It should remove doubt. This week’s biggest lesson: instructional trust beats generic promotion.',
        body: 'Frame the post around what premium service brands can learn from fitting-led trust signals: proof, specificity, and outcome clarity.',
        cta: 'Close by inviting conversations about building premium demand through evidence rather than noise.',
        assetBrief: 'Use a clean single-image stat card or short text-led carousel with one core insight per slide.',
        repurposeNote: 'Lift the strongest line into the Sunday summary email and a website thought-leadership snippet.',
        rationale: 'Recommended because professional audiences are responding to expertise framing and strategic clarity.'
      }
    ];

    return drafts.map(draft => ({
      ...draft,
      copyPack: buildCopyPack(draft)
    }));
  },
  buildPack(drafts = []) {
    return drafts.map(draft => ({
      id: draft.id,
      platform: draft.platform,
      type: draft.type,
      headline: draft.copyPack.headline,
      body: draft.copyPack.body,
      cta: draft.copyPack.cta,
      assetBrief: draft.copyPack.assetBrief,
      repurposeNote: draft.copyPack.repurposeNote,
      combined: draft.copyPack.combined
    }));
  }
};
