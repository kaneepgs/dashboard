import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { orchestrator } from '../src/core/orchestrator.js';

const OPENCLAW_URL = 'https://lightsteelblue-pheasant-697323.hostingersite.com';
const CANVAS_ROOT = '/data/.openclaw/canvas';
const PREVIEW_DIR = path.join(CANVAS_ROOT, 'dashboard-preview');
const DOCUMENT_DIR = path.join(CANVAS_ROOT, 'documents', 'cv_dashboard-preview');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-GB').format(Number(value || 0));
}

function formatPct(value) {
  return `${Number(value || 0)}%`;
}

function formatDate(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatShortDate(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatSigned(value, suffix = '') {
  const numeric = Number(value || 0);
  if (!numeric) return `0${suffix}`;
  return `${numeric > 0 ? '+' : ''}${numeric}${suffix}`;
}

function badgeClass(tone = '') {
  return tone ? `badge ${tone}` : 'badge';
}

function cardMetric(label, value) {
  return `<div class="metric"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(value)}</div></div>`;
}

function renderList(items = []) {
  return items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderPlatformDetail(platform) {
  const metrics = [
    ['Followers', platform.metrics.followers],
    ['Views', platform.metrics.views || platform.metrics.visitors],
    ['Likes', platform.metrics.likes],
    ['Comments', platform.metrics.comments],
    ['Followers gained', platform.metrics.followersGained],
    ['Growth %', platform.metrics.growthPct],
    ['Engagement %', platform.metrics.engagementRate],
    ['Reach', platform.metrics.reach],
    ['Impressions', platform.metrics.impressions],
    ['CTR %', platform.metrics.ctr],
    ['Watch time hours', platform.metrics.watchTimeHours],
    ['Retention %', platform.metrics.retentionPct],
    ['Visitors', platform.metrics.visitors],
    ['Email signups', platform.metrics.emailSignups]
  ].filter(([, value]) => Number(value || 0) !== 0);

  const topContent = (platform.topContent || []).slice(0, 3).map(item => `<li>${escapeHtml(item.title)} — ${escapeHtml(formatNumber(item.views))} views</li>`).join('');
  const lowContent = (platform.lowContent || []).slice(0, 3).map(item => `<li>${escapeHtml(item.title)} — ${escapeHtml(formatNumber(item.views))} views</li>`).join('');

  return `
    <div class="panel span-3">
      <div class="panel-head">
        <h3>Platform drill-down</h3>
        <span class="badge">${escapeHtml(platform.name)}</span>
      </div>
      <div class="metric-grid detail-metric-grid">
        ${metrics.map(([label, value]) => cardMetric(label, typeof value === 'number' ? formatNumber(value) : value)).join('')}
      </div>
      <div class="columns-4 soft-gap-lg">
        <div class="detail-list">
          <h4>Best content</h4>
          <ul>${topContent || '<li>No content surfaced yet.</li>'}</ul>
        </div>
        <div class="detail-list">
          <h4>Worst content</h4>
          <ul>${lowContent || '<li>No underperformers surfaced yet.</li>'}</ul>
        </div>
        <div class="detail-list">
          <h4>Audience insights</h4>
          <ul>${renderList(platform.audienceInsights || ['No audience insights yet.'])}</ul>
        </div>
        <div class="detail-list">
          <h4>Connector</h4>
          <ul>
            <li><strong>Mode:</strong> ${escapeHtml(platform.connector?.mode || 'unknown')}</li>
            <li><strong>Health:</strong> ${escapeHtml(platform.connector?.health || 'unknown')}</li>
            <li><strong>Traffic sources:</strong> ${escapeHtml((platform.trafficSources || []).join(', ') || 'N/A')}</li>
            <li><strong>Posting times:</strong> ${escapeHtml((platform.postingTimes || []).join(', ') || 'N/A')}</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function buildHtml(overview) {
  const socialPlatforms = overview.rankings.filter(platform => platform.slug !== 'ga4');
  const website = overview.website;
  const history = overview.history;
  const weeklyFocus = overview.weeklyFocus;
  const sundaySummary = overview.sundaySummary;
  const topAction = overview.actionQueue?.[0];
  const selected = overview.rankings[0];

  const platformCards = overview.rankings.map(platform => `
    <div class="report-card">
      <div class="inline-between">
        <strong>${escapeHtml(platform.rank)}. ${escapeHtml(platform.name)}</strong>
        <span class="badge">Score ${escapeHtml(platform.score)}</span>
      </div>
      <div class="rank-meta soft-gap">Trend: ${escapeHtml(platform.trend.direction)} · Growth ${escapeHtml(formatPct(platform.metrics.growthPct))}</div>
      <div class="muted soft-gap">Connector: ${escapeHtml(platform.connector.mode)} / ${escapeHtml(platform.connector.health)}</div>
    </div>
  `).join('');

  const timelineCards = (history.timeline || []).map(item => `
    <div class="report-card timeline-card">
      <div class="inline-between">
        <strong>${escapeHtml(formatShortDate(item.capturedAt))}</strong>
        <span class="badge">Score ${escapeHtml(item.marketingScore)}</span>
      </div>
      <div class="rank-meta soft-gap">Leader: ${escapeHtml(item.leader)}</div>
      <div class="timeline-metrics soft-gap">
        <span>Visitors ${escapeHtml(formatNumber(item.visitors))}</span>
        <span>Social growth ${escapeHtml(formatPct(item.socialGrowthPct))}</span>
      </div>
    </div>
  `).join('');

  const scoreMovement = (weeklyFocus.scoreChanges || []).length
    ? weeklyFocus.scoreChanges.map(item => `
      <div class="action-card">
        <div class="inline-between">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="badge">${escapeHtml(formatSigned(item.scoreDelta))}</span>
        </div>
        <div class="rank-meta soft-gap">Score ${escapeHtml(item.startScore)} → ${escapeHtml(item.endScore)}</div>
        <p class="muted soft-gap">Growth move: ${escapeHtml(formatSigned(item.growthDelta, '%'))}</p>
      </div>`).join('')
    : '<p class="muted">More snapshots will unlock proper week-on-week movement here.</p>';

  const reports = [
    overview.reports.daily,
    overview.reports.weekly,
    overview.reports.sunday,
    overview.reports.monthly
  ];

  const reportCards = reports.map(report => `
    <div class="report-card">
      <strong>${escapeHtml(report.title)}</strong>
      <ul>
        ${Object.entries(report).slice(1, 5).map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(typeof value === 'object' ? JSON.stringify(value) : value)}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const builtAt = new Date().toISOString();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(overview.brand)} — Marketing Command Centre Preview</title>
  <style>
    :root {
      --bg: #07111f;
      --bg-soft: #0e1b2c;
      --panel: rgba(16, 28, 46, 0.92);
      --panel-2: rgba(20, 35, 58, 0.98);
      --border: rgba(148, 163, 184, 0.18);
      --text: #e5eefb;
      --muted: #93a4bd;
      --accent: #d6b25e;
      --accent-2: #7dd3fc;
      --danger: #f87171;
      --purple: #b794f4;
      --shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: radial-gradient(circle at top, #13233d 0%, var(--bg) 52%); color: var(--text); font: 14px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    a { color: inherit; text-decoration: none; }
    .wrap { max-width: 1440px; margin: 0 auto; padding: 28px; }
    h1,h2,h3,h4,p,ul { margin: 0; }
    ul { padding-left: 18px; }
    .eyebrow, .badge, .channel-chip { text-transform: uppercase; letter-spacing: .18em; }
    .eyebrow { font-size: 11px; color: var(--accent-2); margin-bottom: 10px; }
    .muted { color: var(--muted); }
    .soft-gap { margin-top: 10px; }
    .soft-gap-lg { margin-top: 18px; }
    .topbar, .panel-head, .inline-between { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    .topbar { align-items: flex-start; margin-bottom: 24px; }
    .topbar-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .app-shell { display: grid; gap: 18px; }
    .hero-grid { display: grid; grid-template-columns: 1.8fr 1fr 1fr; gap: 18px; }
    .content-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
    .span-2 { grid-column: span 2; }
    .span-3 { grid-column: span 3; }
    .panel, .hero-card, .cta-banner { background: linear-gradient(180deg, var(--panel), var(--panel-2)); border: 1px solid var(--border); border-radius: 22px; box-shadow: var(--shadow); padding: 20px; }
    .hero-card-large { background: linear-gradient(135deg, rgba(214, 178, 94, 0.2), rgba(125, 211, 252, 0.16), rgba(16, 28, 46, 0.92)); }
    .accent-card { background: linear-gradient(135deg, rgba(214, 178, 94, 0.2), rgba(16, 28, 46, 0.92)); }
    .cta-banner { display:flex; justify-content: space-between; gap: 20px; align-items: center; }
    .metric-grid { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .detail-metric-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .metric { border: 1px solid var(--border); background: rgba(255,255,255,0.03); border-radius: 16px; padding: 14px; }
    .metric-label { color: var(--muted); font-size: 12px; margin-bottom: 6px; }
    .metric-value { font-size: 24px; font-weight: 700; }
    .score-display { font-size: 60px; font-weight: 800; line-height: 1; margin-bottom: 8px; }
    .action-title { font-size: 20px; line-height: 1.15; }
    .badge { border: 1px solid var(--border); border-radius: 999px; padding: 6px 10px; font-size: 12px; color: var(--muted); }
    .badge.gold { background: linear-gradient(135deg, #d6b25e, #b78628); border-color: transparent; color: #091220; }
    .badge.red { background: rgba(248,113,113,0.12); color: #ffd9d9; }
    .badge.green { background: rgba(34,197,94,0.15); color: #bbf7d0; }
    .badge.purple { background: rgba(183,148,244,0.12); color: #f2e8ff; }
    .secondary-btn, .primary-btn { border: 1px solid var(--border); border-radius: 14px; padding: 12px 14px; font-weight: 700; }
    .secondary-btn { background: rgba(255,255,255,0.03); }
    .primary-btn { background: linear-gradient(135deg, #d6b25e, #b78628); color: #091220; border-color: transparent; }
    .report-stack, .ranking-list, .draft-grid, .timeline-grid { display: grid; gap: 12px; }
    .timeline-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .ranking-item, .action-card, .draft-card, .report-card { border: 1px solid var(--border); background: rgba(255,255,255,0.03); border-radius: 16px; padding: 14px; }
    .rank-meta { color: var(--muted); font-size: 13px; }
    .channel-chip-row { display:flex; gap:10px; flex-wrap:wrap; margin-top: 14px; }
    .channel-chip { border: 1px solid var(--border); border-radius: 999px; padding: 8px 10px; font-size: 11px; color: var(--muted); }
    .detail-list ul { display:grid; gap:8px; margin-top: 10px; }
    .columns-4 { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .weekly-grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .sunday-summary-card { border: 1px solid var(--border); background: rgba(255,255,255,0.03); border-radius: 16px; padding: 16px; }
    .timeline-metrics { display:flex; gap:10px; flex-wrap:wrap; color: var(--muted); font-size: 13px; }
    .summary-pack-copy { white-space: pre-wrap; word-break: break-word; font: inherit; color: var(--text); margin: 0; }
    .footer-note { margin-top: 20px; color: var(--muted); font-size: 12px; }
    @media (max-width: 1100px) {
      .hero-grid, .content-grid, .weekly-grid, .columns-4, .timeline-grid, .detail-metric-grid { grid-template-columns: 1fr; }
      .span-2, .span-3 { grid-column: span 1; }
    }
    @media (max-width: 700px) {
      .wrap { padding: 16px; }
      .topbar, .cta-banner { flex-direction: column; align-items: flex-start; }
      .metric-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div>
        <div class="eyebrow">${escapeHtml(overview.brand)}</div>
        <h1>Marketing Command Centre</h1>
        <p class="muted soft-gap">Hosted review preview of the current dashboard state, including weekly history, Sunday summary, and the external Managed OpenClaw launch path.</p>
      </div>
      <div class="topbar-actions">
        <a class="secondary-btn" href="${OPENCLAW_URL}" target="_blank" rel="noreferrer">Open OpenClaw ↗</a>
        <span class="badge">Preview built ${escapeHtml(formatDate(builtAt))}</span>
      </div>
    </div>

    <div class="hero-grid">
      <div class="hero-card hero-card-large">
        <div class="eyebrow">Marketing score</div>
        <div class="score-display">${escapeHtml(overview.insights.marketingScore)}</div>
        <div class="muted">${escapeHtml(overview.insights.keyWins?.[0] || '')}</div>
      </div>
      <div class="hero-card">
        <div class="eyebrow">Last updated</div>
        <div class="metric-value">${escapeHtml(formatDate(overview.system.lastUpdated))}</div>
        <div class="muted soft-gap">Next refresh: ${escapeHtml(formatDate(overview.system.nextScheduledRefresh))}</div>
      </div>
      <div class="hero-card accent-card">
        <div class="eyebrow">Priority action</div>
        <div class="metric-value action-title">${escapeHtml(topAction?.title || 'No action')}</div>
        <div class="muted soft-gap">Impact: ${escapeHtml(topAction?.estimatedImpact || 'N/A')}</div>
        <div class="soft-gap"><span class="badge ${topAction?.status === 'Approved' ? 'green' : 'red'}">${escapeHtml(topAction?.status || 'Draft')}</span></div>
      </div>
    </div>

    <section class="cta-banner soft-gap-lg">
      <div>
        <div class="eyebrow">Managed OpenClaw</div>
        <h3>Keep the dashboard and the control workspace separate.</h3>
        <p class="muted soft-gap">This product now treats Managed OpenClaw as an external tool. Open it in a new tab when you want the full workspace.</p>
      </div>
      <div class="topbar-actions">
        <a class="secondary-btn" href="${OPENCLAW_URL}" target="_blank" rel="noreferrer">Open OpenClaw ↗</a>
      </div>
    </section>

    <div class="content-grid soft-gap-lg">
      <div class="panel span-3">
        <div class="panel-head">
          <h3>Weekly command centre</h3>
          <span class="badge gold">Sunday summary ready</span>
        </div>
        <div class="sunday-summary-card">
          <h4>${escapeHtml(sundaySummary.title)}</h4>
          <p class="soft-gap"><strong>${escapeHtml(sundaySummary.headline)}</strong></p>
          <p class="muted soft-gap">${escapeHtml(sundaySummary.executiveSummary)}</p>
        </div>
        <div class="weekly-grid soft-gap-lg">
          <div class="detail-list">
            <h4>Weekly summary</h4>
            <ul>
              <li><strong>Coverage:</strong> ${escapeHtml(weeklyFocus.coverageDays)} captured day(s)</li>
              <li><strong>Latest snapshot:</strong> ${escapeHtml(history.latestSnapshotAt ? formatDate(history.latestSnapshotAt) : 'Not captured yet')}</li>
              <li><strong>Marketing score move:</strong> ${escapeHtml(formatSigned(history.marketingScoreDelta))}</li>
              <li><strong>Visitor move:</strong> ${escapeHtml(formatSigned(history.visitorDelta))}</li>
            </ul>
            <p class="muted soft-gap">${escapeHtml(weeklyFocus.summary)}</p>
          </div>
          <div class="detail-list">
            <h4>Website trend</h4>
            <ul>
              <li><strong>Current visitors:</strong> ${escapeHtml(formatNumber(weeklyFocus.websiteTrend.currentVisitors))}</li>
              <li><strong>Peak visitors:</strong> ${escapeHtml(formatNumber(weeklyFocus.websiteTrend.peakVisitors))}</li>
              <li><strong>Average visitors:</strong> ${escapeHtml(formatNumber(weeklyFocus.websiteTrend.averageVisitors))}</li>
            </ul>
          </div>
          <div class="detail-list">
            <h4>Social trend</h4>
            <ul>
              <li><strong>Latest growth:</strong> ${escapeHtml(formatPct(weeklyFocus.socialTrend.latestGrowthPct))}</li>
              <li><strong>Average growth:</strong> ${escapeHtml(formatPct(weeklyFocus.socialTrend.averageGrowthPct))}</li>
              ${renderList(weeklyFocus.trendNarrative || [])}
            </ul>
          </div>
          <div class="detail-list">
            <h4>Action plan</h4>
            <ul>
              ${(weeklyFocus.actionPlan || []).slice(0, 3).map(action => `<li><strong>${escapeHtml(action.title)}</strong> — ${escapeHtml(action.estimatedImpact)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="panel span-2">
        <div class="panel-head">
          <h3>Snapshot timeline</h3>
          <span class="badge">History-backed</span>
        </div>
        <div class="timeline-grid">${timelineCards || '<p class="muted">No timeline yet.</p>'}</div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Score movement</h3>
          <span class="badge purple">Week-on-week</span>
        </div>
        <div class="report-stack">${scoreMovement}</div>
      </div>

      <div class="panel span-2">
        <div class="panel-head">
          <h3>Social</h3>
          <span class="badge">Visible defaults</span>
        </div>
        <div class="metric-grid">
          ${cardMetric('Followers', formatNumber(overview.social.followers))}
          ${cardMetric('Views', formatNumber(overview.social.views))}
          ${cardMetric('Likes', formatNumber(overview.social.likes))}
          ${cardMetric('Comments', formatNumber(overview.social.comments))}
          ${cardMetric('Followers gained this week', formatNumber(overview.social.followersGained))}
          ${cardMetric('Growth %', formatPct(overview.social.growthPct))}
        </div>
        <div class="channel-chip-row">${socialPlatforms.map(platform => `<span class="channel-chip">${escapeHtml(platform.name)}</span>`).join('')}</div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Website</h3>
          <span class="badge gold">GA4</span>
        </div>
        <div class="metric-grid">
          ${cardMetric('Website visitors', formatNumber(website.visitors))}
          ${cardMetric('Email signups', formatNumber(website.emailSignups))}
          ${cardMetric('System health', escapeHtml(overview.system.health))}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Platform rankings</h3>
          <span class="badge">Weighted score</span>
        </div>
        <div class="ranking-list">${platformCards}</div>
      </div>

      <div class="panel span-2">
        <div class="panel-head">
          <h3>AI Chief Marketing Officer</h3>
          <span class="badge purple">Insight engine</span>
        </div>
        <div class="columns-4">
          <div class="detail-list"><h4>Key wins</h4><ul>${renderList(overview.insights.keyWins || [])}</ul></div>
          <div class="detail-list"><h4>Problems</h4><ul>${renderList(overview.insights.problems || [])}</ul></div>
          <div class="detail-list"><h4>Opportunities</h4><ul>${renderList(overview.insights.opportunities || [])}</ul></div>
          <div class="detail-list"><h4>Risks & forecast</h4><ul>${renderList([...(overview.insights.risks || []), ...(overview.insights.forecast || [])])}</ul></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Recommended actions</h3>
          <span class="badge red">Approval required</span>
        </div>
        <div class="report-stack">
          ${(overview.actionQueue || []).map(action => `
            <div class="action-card">
              <div class="inline-between">
                <strong>${escapeHtml(action.title)}</strong>
                <span class="badge ${action.status === 'Approved' ? 'green' : 'red'}">${escapeHtml(action.status)}</span>
              </div>
              <p class="muted soft-gap">${escapeHtml(action.why)}</p>
              <div class="rank-meta soft-gap">Confidence: ${escapeHtml(Math.round((action.confidence?.score || 0) * 100))}% · Impact: ${escapeHtml(action.estimatedImpact)}</div>
              ${action.approvedAt ? `<div class="rank-meta soft-gap">Approved at ${escapeHtml(formatDate(action.approvedAt))}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      ${renderPlatformDetail(selected)}

      <div class="panel span-2">
        <div class="panel-head">
          <h3>Reports</h3>
          <span class="badge">Daily / Weekly / Sunday / Monthly</span>
        </div>
        <div class="report-stack">${reportCards}</div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Sunday summary pack</h3>
          <span class="badge gold">Ready to reuse</span>
        </div>
        <div class="detail-list">
          <h4>Email subject</h4>
          <p class="muted soft-gap">${escapeHtml(sundaySummary.pack.emailSubject)}</p>
          <h4 class="soft-gap-lg">Executive email</h4>
          <pre class="summary-pack-copy soft-gap">${escapeHtml(sundaySummary.pack.executiveEmail)}</pre>
          <h4 class="soft-gap-lg">WhatsApp summary</h4>
          <p class="muted soft-gap">${escapeHtml(sundaySummary.pack.whatsappSummary)}</p>
          <h4 class="soft-gap-lg">Next-week content focus</h4>
          <ul>${renderList(sundaySummary.pack.nextWeekFocus || [])}</ul>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Competitor intelligence</h3>
          <span class="badge">Watchlist</span>
        </div>
        <div class="detail-list">
          <p class="muted"><strong>Tracked competitors:</strong> ${escapeHtml((overview.competitor.trackedCompetitors || []).join(' · '))}</p>
          <h4 class="soft-gap-lg">Highlights</h4>
          <ul>${renderList(overview.competitor.highlights || [])}</ul>
          <h4 class="soft-gap-lg">Content gaps</h4>
          <ul>${renderList(overview.competitor.gaps || [])}</ul>
          <h4 class="soft-gap-lg">Trending topics</h4>
          <ul>${renderList(overview.competitor.trendingTopics || [])}</ul>
        </div>
      </div>

      <div class="panel span-3">
        <div class="panel-head">
          <h3>Content Studio</h3>
          <span class="badge purple">Drafts only</span>
        </div>
        <div class="draft-grid">
          ${(overview.drafts || []).map(draft => `
            <div class="draft-card">
              <div class="inline-between">
                <strong>${escapeHtml(draft.type)}</strong>
                <span class="badge purple">${escapeHtml(draft.status)}</span>
              </div>
              <div class="rank-meta">${escapeHtml(draft.platform)}</div>
              <p class="soft-gap">${escapeHtml(draft.content)}</p>
              <p class="muted soft-gap">${escapeHtml(draft.rationale)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="footer-note">Hosted preview generated from the current local runtime state. Managed OpenClaw opens separately at ${escapeHtml(OPENCLAW_URL)}.</div>
  </div>
</body>
</html>`;
}

const state = await orchestrator.bootstrap();
const overview = orchestrator.getOverview(state);
const html = buildHtml(overview);

await mkdir(PREVIEW_DIR, { recursive: true });
await mkdir(DOCUMENT_DIR, { recursive: true });
await writeFile(path.join(PREVIEW_DIR, 'index.html'), html, 'utf8');
await writeFile(path.join(DOCUMENT_DIR, 'index.html'), html, 'utf8');

console.log(`Hosted preview updated at ${path.join(DOCUMENT_DIR, 'index.html')}`);
