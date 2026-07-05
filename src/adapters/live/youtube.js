import { getEnv } from '../../core/env.js';

const API_BASE = 'https://www.googleapis.com/youtube/v3';

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`YouTube API ${response.status}: ${detail}`);
  }
  return response.json();
}

export async function collectYouTubeSnapshot() {
  const channelId = getEnv('YOUTUBE_CHANNEL_ID');
  const apiKey = getEnv('YOUTUBE_API_KEY');

  if (!channelId || !apiKey) {
    return null;
  }

  const channelUrl = new URL(`${API_BASE}/channels`);
  channelUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
  channelUrl.searchParams.set('id', channelId);
  channelUrl.searchParams.set('key', apiKey);

  const channelData = await fetchJson(channelUrl);
  const channel = channelData.items?.[0];
  if (!channel) {
    throw new Error('YouTube channel not found for configured channel ID.');
  }

  const uploadsId = channel.contentDetails?.relatedPlaylists?.uploads;
  let topContent = [];
  let lowContent = [];

  if (uploadsId) {
    const uploadsUrl = new URL(`${API_BASE}/playlistItems`);
    uploadsUrl.searchParams.set('part', 'snippet,contentDetails');
    uploadsUrl.searchParams.set('playlistId', uploadsId);
    uploadsUrl.searchParams.set('maxResults', '8');
    uploadsUrl.searchParams.set('key', apiKey);

    const uploads = await fetchJson(uploadsUrl);
    const videoIds = (uploads.items || [])
      .map(item => item.contentDetails?.videoId)
      .filter(Boolean);

    if (videoIds.length) {
      const videosUrl = new URL(`${API_BASE}/videos`);
      videosUrl.searchParams.set('part', 'snippet,statistics');
      videosUrl.searchParams.set('id', videoIds.join(','));
      videosUrl.searchParams.set('key', apiKey);

      const videos = await fetchJson(videosUrl);
      const mapped = (videos.items || []).map(item => ({
        title: item.snippet?.title || 'Untitled video',
        views: toNumber(item.statistics?.viewCount),
        likes: toNumber(item.statistics?.likeCount),
        comments: toNumber(item.statistics?.commentCount),
        engagementRate: 0,
        publishedAt: item.snippet?.publishedAt || null
      })).map(item => ({
        ...item,
        engagementRate: item.views ? Number((((item.likes + item.comments) / item.views) * 100).toFixed(1)) : 0
      }));

      const byViews = [...mapped].sort((a, b) => b.views - a.views);
      topContent = byViews.slice(0, 3);
      lowContent = [...byViews].reverse().slice(0, Math.min(2, byViews.length));
    }
  }

  const subscribers = toNumber(channel.statistics?.subscriberCount);
  const views = toNumber(channel.statistics?.viewCount);
  const videos = toNumber(channel.statistics?.videoCount);

  return {
    slug: 'youtube',
    name: 'YouTube',
    accent: '#ff4d6d',
    metrics: {
      followers: subscribers,
      views,
      likes: topContent.reduce((sum, item) => sum + (item.likes || 0), 0),
      comments: topContent.reduce((sum, item) => sum + (item.comments || 0), 0),
      followersGained: 0,
      growthPct: 0,
      engagementRate: topContent.length ? Number((topContent.reduce((sum, item) => sum + (item.engagementRate || 0), 0) / topContent.length).toFixed(1)) : 0,
      impressions: 0,
      ctr: 0,
      watchTimeHours: 0,
      retentionPct: 0,
      engagementTotal: topContent.reduce((sum, item) => sum + (item.likes || 0) + (item.comments || 0), 0)
    },
    trend: { direction: 'flat', deltaPct: 0 },
    audienceInsights: [
      'Live YouTube channel totals are connected. Deeper growth and trend calculations will improve once historical snapshots are persisted.',
      `Current uploaded video count: ${videos}.`
    ],
    trafficSources: ['YouTube API connection active'],
    searchTerms: [],
    postingTimes: ['Pending historical analysis'],
    topContent,
    lowContent,
    connector: { mode: 'live', health: 'ok', detail: 'Live YouTube Data API channel + uploads data.' }
  };
}

