import { PLATFORM_META } from '../../core/platforms.js';

const sampleContent = {
  youtube: {
    top: [
      { title: 'Driver Fitting Myths Most Golfers Still Believe', views: 18240, engagementRate: 7.1, publishedAt: '2026-06-28' },
      { title: 'TrackMan Lesson: Add 12 Yards Without Swinging Harder', views: 14120, engagementRate: 6.4, publishedAt: '2026-06-24' }
    ],
    low: [
      { title: 'Quick Update From The Studio', views: 1420, engagementRate: 1.3, publishedAt: '2026-06-26' }
    ]
  },
  instagram: {
    top: [
      { title: 'Before / After Fitting Carousel', views: 9840, engagementRate: 8.9, publishedAt: '2026-06-29' },
      { title: 'Coach POV Reel', views: 7750, engagementRate: 7.5, publishedAt: '2026-06-27' }
    ],
    low: [
      { title: 'Promo Graphic', views: 1330, engagementRate: 1.8, publishedAt: '2026-06-25' }
    ]
  },
  linkedin: {
    top: [
      { title: 'Why premium fitting wins long-term trust', views: 3880, engagementRate: 6.8, publishedAt: '2026-06-30' }
    ],
    low: [
      { title: 'Generic business update', views: 420, engagementRate: 1.1, publishedAt: '2026-06-26' }
    ]
  },
  facebook: {
    top: [
      { title: 'Weekend fitting slots now open', views: 5140, engagementRate: 4.6, publishedAt: '2026-06-29' }
    ],
    low: [
      { title: 'Studio reminder', views: 690, engagementRate: 0.9, publishedAt: '2026-06-24' }
    ]
  },
  x: {
    top: [
      { title: 'Short swing tip thread', views: 2740, engagementRate: 3.8, publishedAt: '2026-06-28' }
    ],
    low: [
      { title: 'Link-only post', views: 330, engagementRate: 0.7, publishedAt: '2026-06-25' }
    ]
  },
  ga4: {
    top: [
      { title: 'Club fitting landing page', views: 3210, conversionRate: 4.8, publishedAt: '2026-06-30' },
      { title: 'Lessons page', views: 2085, conversionRate: 3.2, publishedAt: '2026-06-29' }
    ],
    low: [
      { title: 'General contact page', views: 410, conversionRate: 0.6, publishedAt: '2026-06-27' }
    ]
  }
};

export function collectMockSnapshots() {
  const base = {
    youtube: {
      metrics: { followers: 12480, views: 68400, likes: 3120, comments: 248, followersGained: 290, growthPct: 2.4, engagementRate: 4.9, impressions: 102400, ctr: 5.2, watchTimeHours: 940, retentionPct: 43, engagementTotal: 3368 },
      trend: { direction: 'up', deltaPct: 18.4 },
      audienceInsights: ['Long-form fitting explainers are outperforming short studio updates.', 'Search-led discovery remains strong for fitting myth content.'],
      trafficSources: ['YouTube Search', 'Suggested Videos', 'External'],
      searchTerms: ['driver fitting', 'golf fitting near me', 'trackman lesson'],
      postingTimes: ['Tue 18:00', 'Thu 18:30', 'Sun 10:00']
    },
    instagram: {
      metrics: { followers: 8420, views: 42100, likes: 4180, comments: 310, followersGained: 240, growthPct: 2.9, engagementRate: 10.7, reach: 29800, impressions: 50600, engagementTotal: 4490 },
      trend: { direction: 'up', deltaPct: 21.2 },
      audienceInsights: ['Carousels and reels with visible shot outcomes are driving saves.', 'Warm instructional hooks outperform polished promo graphics.'],
      trafficSources: ['Explore', 'Followers', 'Profile visits'],
      searchTerms: ['golf tips', 'club fitting', 'surrey golf'],
      postingTimes: ['Mon 19:00', 'Wed 12:00', 'Sat 09:30']
    },
    linkedin: {
      metrics: { followers: 1940, views: 12800, likes: 760, comments: 66, followersGained: 88, growthPct: 4.8, engagementRate: 6.5, impressions: 17600, engagementTotal: 826 },
      trend: { direction: 'up', deltaPct: 12.1 },
      audienceInsights: ['Trust and expertise positioning is resonating with professionals.', 'Educational business framing outperforms studio announcements.'],
      trafficSources: ['Feed', 'Profile network', 'Reshares'],
      searchTerms: ['golf performance', 'premium coaching', 'club fitting'],
      postingTimes: ['Tue 08:00', 'Thu 08:30']
    },
    facebook: {
      metrics: { followers: 5120, views: 16400, likes: 980, comments: 74, followersGained: 62, growthPct: 1.2, engagementRate: 6.4, reach: 11800, impressions: 21200, engagementTotal: 1054 },
      trend: { direction: 'flat', deltaPct: 2.5 },
      audienceInsights: ['Availability posts convert attention into enquiries.', 'Pure awareness posts underperform compared with offer-driven content.'],
      trafficSources: ['Feed', 'Page visits', 'Shares'],
      searchTerms: ['golf lessons', 'club fitting near me'],
      postingTimes: ['Fri 17:30', 'Sun 08:30']
    },
    x: {
      metrics: { followers: 2280, views: 8700, likes: 310, comments: 28, followersGained: 16, growthPct: 0.7, engagementRate: 3.9, impressions: 12200, engagementTotal: 338 },
      trend: { direction: 'down', deltaPct: -6.8 },
      audienceInsights: ['Advice threads get attention, but link-only posts die quickly.', 'Conversation velocity is too low to drive meaningful weekly gains right now.'],
      trafficSources: ['Timeline', 'Search', 'Profile'],
      searchTerms: ['golf swing tips', 'driver fitting'],
      postingTimes: ['Mon 08:30', 'Wed 17:00']
    },
    ga4: {
      metrics: { followers: 0, visitors: 6420, views: 6420, likes: 0, comments: 0, followersGained: 124, growthPct: 3.1, engagementRate: 58, emailSignups: 74, impressions: 0, ctr: 4.1, engagementTotal: 3724 },
      trend: { direction: 'up', deltaPct: 9.6 },
      audienceInsights: ['Fitting pages are converting better than generic service pages.', 'Organic search is improving, but email signup visibility could be stronger.'],
      trafficSources: ['Organic Search', 'Direct', 'Social'],
      searchTerms: ['golf club fitting surrey', 'trackman golf lesson', 'ep golf studios'],
      postingTimes: ['N/A']
    }
  };

  return PLATFORM_META.map(meta => ({
    slug: meta.slug,
    name: meta.name,
    accent: meta.accent,
    ...base[meta.slug],
    topContent: sampleContent[meta.slug].top,
    lowContent: sampleContent[meta.slug].low,
    connector: { mode: 'mock', health: 'ok', detail: 'Mock adapter ready to swap for official API connector.' }
  }));
}
