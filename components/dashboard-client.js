'use client';

import { useEffect, useMemo, useState } from 'react';

const NAV_ITEMS = [
  'Overview',
  'Rankings',
  'Platform Drill-down',
  'Reports',
  'Competitors',
  'Content Studio'
];

const OPENCLAW_URL = 'https://lightsteelblue-pheasant-697323.hostingersite.com';

function formatNumber(value) {
  return new Intl.NumberFormat('en-GB').format(value || 0);
}

function formatPct(value) {
  return `${value || 0}%`;
}

function formatDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });
}

function formatSigned(value, suffix = '') {
  if (!value) return `0${suffix}`;
  return `${value > 0 ? '+' : ''}${value}${suffix}`;
}

function medal(rank) {
  return rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`;
}

function MetricCard({ label, value, suffix = '', tone = 'default' }) {
  return (
    <div className={`metric-card ${tone !== 'default' ? `metric-card-${tone}` : ''}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-number">{formatNumber(value)}{suffix}</div>
    </div>
  );
}

function InsightBlock({ title, items }) {
  return (
    <div className="insight-block">
      <h4>{title}</h4>
      <ul>
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export default function DashboardClient() {
  const [overview, setOverview] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [commandResult, setCommandResult] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [actionUpdating, setActionUpdating] = useState('');

  async function loadOverview() {
    const response = await fetch('/api/overview', { cache: 'no-store' });
    const data = await response.json();
    setOverview(data);
    setSelectedPlatform(prev => prev || data.rankings?.[0]?.slug || '');
  }

  useEffect(() => {
    loadOverview();
  }, []);

  const filteredRankings = useMemo(() => {
    if (!overview) return [];
    const q = search.trim().toLowerCase();
    if (!q) return overview.rankings;
    return overview.rankings.filter(platform => (
      platform.name.toLowerCase().includes(q) || platform.slug.toLowerCase().includes(q)
    ));
  }, [overview, search]);

  const selected = overview?.rankings.find(item => item.slug === selectedPlatform) || overview?.rankings?.[0];

  async function handleRefresh() {
    setRefreshing(true);
    await fetch('/api/refresh', { method: 'POST' });
    await loadOverview();
    setRefreshing(false);
  }

  async function handleCommand() {
    if (!command.trim()) return;
    const response = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    const data = await response.json();
    setCommandResult(data.answer || 'No answer available.');
  }

  async function handleCopy(key, value) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(current => current === key ? '' : current), 1800);
  }

  async function handleActionStatus(actionId, status) {
    setActionUpdating(actionId);
    await fetch(`/api/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await loadOverview();
    setActionUpdating('');
  }

  if (!overview) {
    return (
      <main className="loading-shell">
        <div className="loading-card">
          <div className="eyebrow">EP Golf Studios</div>
          <h1>Loading Marketing Command Centre…</h1>
        </div>
      </main>
    );
  }

  const socialPlatforms = overview.rankings.filter(platform => platform.slug !== 'ga4');
  const actionTop = overview.actionQueue?.[0];
  const website = overview.website;
  const history = overview.history;
  const weeklyFocus = overview.weeklyFocus;
  const sundaySummary = overview.sundaySummary;
  const sundayPack = sundaySummary.pack;
  const executivePack = overview.executivePack;

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <div>
            <div className="eyebrow">EP Golf Studios</div>
            <h1>Marketing Command Centre</h1>
            <p className="muted">AI-led marketing intelligence, reporting, and approval-first execution.</p>
          </div>

          <div className="sidebar-cta">
            <div className="section-title">Primary objective</div>
            <strong>Drive fitting bookings with high-trust, data-led marketing.</strong>
            <p className="muted">Every recommendation stays in draft until approved.</p>
          </div>

          <nav className="nav-list">
            {NAV_ITEMS.map((item, index) => (
              <button key={item} className={`nav-item ${index === 0 ? 'active' : ''}`}>{item}</button>
            ))}
          </nav>

          <div className="status-card">
            <div className="section-title">System status</div>
            <div className="metric-value">{overview.system.health}</div>
            <div className="muted">{overview.system.refreshSchedule}</div>
            <div className="muted">Last updated {formatDate(overview.system.lastUpdated)}</div>
          </div>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <div>
              <div className="eyebrow">Premium marketing intelligence platform</div>
              <h2>Command view</h2>
            </div>
            <div className="topbar-actions">
              <input
                className="search"
                placeholder="Search platforms, drafts, reports..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <a className="secondary-btn" href={OPENCLAW_URL} target="_blank" rel="noreferrer">Open OpenClaw ↗</a>
              <button className="secondary-btn" onClick={() => setPaletteOpen(true)}>⌘ Command</button>
              <button className="primary-btn" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? 'Refreshing…' : 'Refresh now'}
              </button>
            </div>
          </header>

          <section className="hero-grid">
            <div className="hero-card hero-card-large">
              <div className="section-title">Marketing score</div>
              <div className="score-display">{overview.insights.marketingScore}</div>
              <div className="muted">{overview.insights.keyWins[0]}</div>
            </div>

            <div className="hero-card">
              <div className="section-title">Last updated</div>
              <div className="metric-value">{formatDate(overview.system.lastUpdated)}</div>
              <div className="muted">Next scheduled refresh: {formatDate(overview.system.nextScheduledRefresh)}</div>
            </div>

            <div className="hero-card accent-card">
              <div className="section-title">Priority action</div>
              <div className="metric-value action-title">{actionTop?.title}</div>
              <div className="muted">Impact: {actionTop?.estimatedImpact}</div>
              <div className="soft-gap">
                <span className={`badge ${actionTop?.status === 'Approved' ? 'green' : 'red'}`}>{actionTop?.status || 'Draft'}</span>
              </div>
            </div>
          </section>

          <section className="cta-banner">
            <div>
              <div className="eyebrow">Primary conversion</div>
              <h3>Build the week around fitting-booking demand.</h3>
              <p className="muted">The UX and reporting are tuned toward premium fitting trust, measurable performance, and booking intent.</p>
              <p className="muted">Managed OpenClaw now sits alongside this dashboard as a separate tool — launch it in a new tab when you want the full control workspace.</p>
            </div>
            <div className="topbar-actions">
              <a className="secondary-btn" href={OPENCLAW_URL} target="_blank" rel="noreferrer">Open OpenClaw ↗</a>
              <button className="primary-btn">Review booking CTAs</button>
            </div>
          </section>

          <section className="content-grid">
            <div className="panel span-3">
              <div className="panel-head">
                <h3>Weekly command centre</h3>
                <span className="badge gold">Sunday summary ready</span>
              </div>
              <div className="detail-list sunday-summary-card soft-gap">
                <h4>{sundaySummary.title}</h4>
                <p className="soft-gap"><strong>{sundaySummary.headline}</strong></p>
                <p className="muted soft-gap">{sundaySummary.executiveSummary}</p>
              </div>
              <div className="detail-grid weekly-grid">
                <div className="detail-list">
                  <h4>Weekly summary</h4>
                  <p className="muted soft-gap">{weeklyFocus.summary}</p>
                  <ul>
                    <li><strong>Coverage:</strong> {weeklyFocus.coverageDays} captured day(s)</li>
                    <li><strong>Latest snapshot:</strong> {history.latestSnapshotAt ? formatDate(history.latestSnapshotAt) : 'Not captured yet'}</li>
                    <li><strong>Marketing score move:</strong> {formatSigned(history.marketingScoreDelta)}</li>
                    <li><strong>Visitor move:</strong> {formatSigned(history.visitorDelta)}</li>
                  </ul>
                </div>

                <div className="detail-list">
                  <h4>Website trend</h4>
                  <ul>
                    <li><strong>Current visitors:</strong> {formatNumber(weeklyFocus.websiteTrend.currentVisitors)}</li>
                    <li><strong>Peak visitors:</strong> {formatNumber(weeklyFocus.websiteTrend.peakVisitors)}</li>
                    <li><strong>Average visitors:</strong> {formatNumber(weeklyFocus.websiteTrend.averageVisitors)}</li>
                  </ul>
                </div>

                <div className="detail-list">
                  <h4>Social trend</h4>
                  <ul>
                    <li><strong>Latest growth:</strong> {formatPct(weeklyFocus.socialTrend.latestGrowthPct)}</li>
                    <li><strong>Average growth:</strong> {formatPct(weeklyFocus.socialTrend.averageGrowthPct)}</li>
                    {weeklyFocus.trendNarrative.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>

                <div className="detail-list">
                  <h4>Action plan</h4>
                  <ul>
                    {weeklyFocus.actionPlan.slice(0, 3).map(action => (
                      <li key={action.title}><strong>{action.title}</strong> — {action.estimatedImpact}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel span-2">
              <div className="panel-head">
                <h3>Snapshot timeline</h3>
                <span className="badge">History-backed</span>
              </div>
              <div className="timeline-grid">
                {history.timeline.map(item => (
                  <div key={item.capturedAt} className="report-card timeline-card">
                    <div className="inline-between">
                      <strong>{formatShortDate(item.capturedAt)}</strong>
                      <span className="badge">Score {item.marketingScore}</span>
                    </div>
                    <div className="rank-meta soft-gap">Leader: {item.leader}</div>
                    <div className="timeline-metrics soft-gap">
                      <span>Visitors {formatNumber(item.visitors)}</span>
                      <span>Social growth {formatPct(item.socialGrowthPct)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Score movement</h3>
                <span className="badge purple">Week-on-week</span>
              </div>
              <div className="report-stack">
                {weeklyFocus.scoreChanges.length > 0 ? weeklyFocus.scoreChanges.map(item => (
                  <div key={item.name} className="action-card">
                    <div className="inline-between">
                      <strong>{item.name}</strong>
                      <span className="badge">{formatSigned(item.scoreDelta)}</span>
                    </div>
                    <div className="rank-meta soft-gap">Score {item.startScore} → {item.endScore}</div>
                    <p className="muted soft-gap">Growth move: {formatSigned(item.growthDelta, '%')}</p>
                  </div>
                )) : (
                  <div className="detail-list">
                    <p className="muted">More snapshots will unlock proper week-on-week movement here.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="panel span-2">
              <div className="panel-head">
                <h3>Social</h3>
                <span className="badge">Visible defaults</span>
              </div>
              <div className="metric-grid">
                <MetricCard label="Followers" value={overview.social.followers} tone="brand" />
                <MetricCard label="Views" value={overview.social.views} />
                <MetricCard label="Likes" value={overview.social.likes} />
                <MetricCard label="Comments" value={overview.social.comments} />
                <MetricCard label="Followers gained this week" value={overview.social.followersGained} />
                <MetricCard label="Growth %" value={overview.social.growthPct} suffix="%" />
              </div>
              <div className="channel-chip-row">
                {socialPlatforms.map(platform => (
                  <span key={platform.slug} className="channel-chip">{platform.name}</span>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Website</h3>
                <span className="badge gold">GA4</span>
              </div>
              <div className="metric-grid single-column">
                <MetricCard label="Website visitors" value={website.visitors} />
                <MetricCard label="Email signups" value={website.emailSignups} />
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Platform rankings</h3>
                <span className="badge">Weighted score</span>
              </div>
              <div className="ranking-list">
                {filteredRankings.map(platform => (
                  <div key={platform.slug} className="ranking-item">
                    <div className="ranking-row">
                      <div>
                        <strong>{medal(platform.rank)} {platform.name}</strong>
                        <div className="rank-meta">Trend: {platform.trend.direction} · Growth {formatPct(platform.metrics.growthPct)}</div>
                      </div>
                      <div className="rank-score">{platform.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel span-2">
              <div className="panel-head">
                <h3>AI Chief Marketing Officer</h3>
                <span className="badge purple">Insight engine</span>
              </div>
              <div className="insight-columns">
                <InsightBlock title="Key wins" items={overview.insights.keyWins} />
                <InsightBlock title="Problems" items={overview.insights.problems} />
                <InsightBlock title="Opportunities" items={overview.insights.opportunities} />
                <InsightBlock title="Risks & forecast" items={[...overview.insights.risks, ...overview.insights.forecast]} />
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Recommended actions</h3>
                <span className="badge red">Approval required</span>
              </div>
              <div className="report-stack">
                {overview.actionQueue.map(action => (
                  <div key={action.id} className="action-card">
                    <div className="inline-between">
                      <strong>{action.title}</strong>
                      <span className={`badge ${action.status === 'Approved' ? 'green' : 'red'}`}>{action.status}</span>
                    </div>
                    <p className="muted soft-gap">{action.why}</p>
                    <div className="rank-meta soft-gap">Confidence: {Math.round(action.confidence.score * 100)}% · Impact: {action.estimatedImpact}</div>
                    {action.approvedAt && (
                      <div className="rank-meta soft-gap">Approved at {formatDate(action.approvedAt)}</div>
                    )}
                    <div className="action-controls soft-gap">
                      {action.status !== 'Approved' ? (
                        <button
                          className="primary-btn"
                          onClick={() => handleActionStatus(action.id, 'Approved')}
                          disabled={actionUpdating === action.id}
                        >
                          {actionUpdating === action.id ? 'Updating…' : 'Approve action'}
                        </button>
                      ) : (
                        <button
                          className="secondary-btn"
                          onClick={() => handleActionStatus(action.id, 'Draft')}
                          disabled={actionUpdating === action.id}
                        >
                          {actionUpdating === action.id ? 'Updating…' : 'Move back to draft'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel span-3">
              <div className="panel-head">
                <h3>Platform drill-down</h3>
                <span className="badge">Interactive</span>
              </div>
              <div className="platform-tabs">
                {overview.rankings.map(platform => (
                  <button
                    key={platform.slug}
                    className={`tab-pill ${selected?.slug === platform.slug ? 'active' : ''}`}
                    onClick={() => setSelectedPlatform(platform.slug)}
                  >
                    {platform.name}
                  </button>
                ))}
              </div>

              {selected && (
                <div className="platform-detail">
                  <div className="detail-grid">
                    {[
                      ['Followers', selected.metrics.followers || 0],
                      ['Views', selected.metrics.views || selected.metrics.visitors || 0],
                      ['Likes', selected.metrics.likes || 0],
                      ['Comments', selected.metrics.comments || 0],
                      ['Followers gained', selected.metrics.followersGained || 0],
                      ['Growth %', selected.metrics.growthPct || 0],
                      ['Engagement %', selected.metrics.engagementRate || 0],
                      ['Reach', selected.metrics.reach || 0],
                      ['Impressions', selected.metrics.impressions || 0],
                      ['CTR %', selected.metrics.ctr || 0],
                      ['Watch time hours', selected.metrics.watchTimeHours || 0],
                      ['Retention %', selected.metrics.retentionPct || 0],
                      ['Visitors', selected.metrics.visitors || 0],
                      ['Email signups', selected.metrics.emailSignups || 0]
                    ].filter(([, value]) => value !== 0).map(([label, value]) => (
                      <MetricCard key={label} label={label} value={value} />
                    ))}
                  </div>

                  <div className="detail-grid">
                    <div className="detail-list">
                      <h4>Best content</h4>
                      <ul>
                        {selected.topContent.map(item => (
                          <li key={`${item.title}-${item.publishedAt}`}>{item.title} — {formatNumber(item.views)} views</li>
                        ))}
                      </ul>
                    </div>

                    <div className="detail-list">
                      <h4>Worst content</h4>
                      <ul>
                        {selected.lowContent.map(item => (
                          <li key={`${item.title}-${item.publishedAt}`}>{item.title} — {formatNumber(item.views)} views</li>
                        ))}
                      </ul>
                    </div>

                    <div className="detail-list">
                      <h4>Audience insights</h4>
                      <ul>
                        {selected.audienceInsights.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </div>

                    <div className="detail-list">
                      <h4>Traffic & timing</h4>
                      <ul>
                        <li><strong>Traffic sources:</strong> {selected.trafficSources.join(', ') || 'N/A'}</li>
                        <li><strong>Search terms:</strong> {selected.searchTerms.join(', ') || 'N/A'}</li>
                        <li><strong>Best posting times:</strong> {selected.postingTimes.join(', ') || 'N/A'}</li>
                        <li><strong>Connector:</strong> {selected.connector.mode} / {selected.connector.health}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="panel span-2">
              <div className="panel-head">
                <h3>Reports</h3>
                <span className="badge">Daily / Weekly / Monthly</span>
              </div>
              <div className="report-stack">
                <div className="report-card">
                  <strong>{overview.reports.daily.title}</strong>
                  <ul>
                    <li><strong>Marketing score:</strong> {overview.reports.daily.marketingScore}</li>
                    <li><strong>Top win:</strong> {overview.reports.daily.keyWins[0]}</li>
                    <li><strong>Top problem:</strong> {overview.reports.daily.problems[0]}</li>
                    <li><strong>Recommended:</strong> {overview.reports.daily.recommendedActions[0]?.title}</li>
                  </ul>
                </div>

                <div className="report-card">
                  <strong>{overview.reports.weekly.title}</strong>
                  <ul>
                    <li><strong>Summary:</strong> {overview.reports.weekly.summary}</li>
                    <li><strong>Coverage:</strong> {overview.reports.weekly.coverageDays} day(s)</li>
                    <li><strong>Strongest mover:</strong> {overview.reports.weekly.trendNarrative[0]}</li>
                    <li><strong>Weakest mover:</strong> {overview.reports.weekly.trendNarrative[1]}</li>
                  </ul>
                </div>

                <div className="report-card">
                  <strong>{overview.reports.sunday.title}</strong>
                  <ul>
                    <li><strong>Headline:</strong> {overview.reports.sunday.headline}</li>
                    <li><strong>Industry:</strong> {overview.reports.sunday.industryBrief[0]}</li>
                    <li><strong>AI:</strong> {overview.reports.sunday.aiBrief[0]}</li>
                    <li><strong>Radar:</strong> {overview.reports.sunday.radarBrief[0]}</li>
                  </ul>
                </div>

                <div className="report-card">
                  <strong>{overview.reports.monthly.title}</strong>
                  <ul>
                    <li><strong>Executive view:</strong> {overview.reports.monthly.executiveView}</li>
                    <li><strong>Priority 1:</strong> {overview.reports.monthly.priorities[0]}</li>
                    <li><strong>Priority 2:</strong> {overview.reports.monthly.priorities[1]}</li>
                    <li><strong>History coverage:</strong> {overview.reports.monthly.historyCoverageDays} day(s)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Executive pack</h3>
                <span className="badge gold">Leadership-ready</span>
              </div>
              <div className="detail-list summary-pack-card">
                <div className="inline-between">
                  <h4>{executivePack.title}</h4>
                  <button className="ghost-btn" onClick={() => handleCopy('executive-pack', executivePack.combinedBrief)}>
                    {copiedKey === 'executive-pack' ? 'Copied' : 'Copy pack'}
                  </button>
                </div>
                <p className="soft-gap"><strong>{executivePack.headline}</strong></p>
                <p className="muted soft-gap">{executivePack.executiveSummary}</p>
                <ul className="soft-gap">
                  <li><strong>Approved actions:</strong> {executivePack.approvedActionCount}</li>
                  <li><strong>Pending actions:</strong> {executivePack.pendingActionCount}</li>
                  <li><strong>Generated:</strong> {formatDate(executivePack.generatedAt)}</li>
                </ul>
              </div>
              <div className="detail-list soft-gap-lg">
                <h4>Priority drafts</h4>
                <ul>
                  {executivePack.priorityDrafts.map(item => (
                    <li key={item.id}><strong>{item.platform}</strong> — {item.headline}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Sunday summary pack</h3>
                <span className="badge gold">Ready to reuse</span>
              </div>
              <div className="summary-pack-grid">
                <div className="detail-list summary-pack-card">
                  <div className="inline-between">
                    <h4>Email subject</h4>
                    <button className="ghost-btn" onClick={() => handleCopy('email-subject', sundayPack.emailSubject)}>
                      {copiedKey === 'email-subject' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="muted soft-gap">{sundayPack.emailSubject}</p>
                </div>

                <div className="detail-list summary-pack-card">
                  <div className="inline-between">
                    <h4>Executive email</h4>
                    <button className="ghost-btn" onClick={() => handleCopy('executive-email', sundayPack.executiveEmail)}>
                      {copiedKey === 'executive-email' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="summary-pack-copy soft-gap">{sundayPack.executiveEmail}</pre>
                </div>

                <div className="detail-list summary-pack-card">
                  <div className="inline-between">
                    <h4>WhatsApp summary</h4>
                    <button className="ghost-btn" onClick={() => handleCopy('whatsapp-summary', sundayPack.whatsappSummary)}>
                      {copiedKey === 'whatsapp-summary' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="muted soft-gap">{sundayPack.whatsappSummary}</p>
                </div>

                <div className="detail-list summary-pack-card">
                  <div className="inline-between">
                    <h4>Internal brief</h4>
                    <button className="ghost-btn" onClick={() => handleCopy('internal-brief', sundayPack.internalBrief)}>
                      {copiedKey === 'internal-brief' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="summary-pack-copy soft-gap">{sundayPack.internalBrief}</pre>
                </div>
              </div>
              <div className="detail-list soft-gap-lg">
                <h4>Next-week content focus</h4>
                <ul>
                  {sundayPack.nextWeekFocus.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Competitor intelligence</h3>
                <span className="badge">Watchlist</span>
              </div>
              <div className="detail-list">
                <h4>Tracked competitors</h4>
                <p className="muted">{overview.competitor.trackedCompetitors.join(' · ')}</p>
                <ul>
                  {overview.competitor.highlights.map(item => <li key={item}>{item}</li>)}
                </ul>
                <h4 className="soft-gap-lg">Content gaps</h4>
                <ul>
                  {overview.competitor.gaps.map(item => <li key={item}>{item}</li>)}
                </ul>
                <h4 className="soft-gap-lg">Trending topics</h4>
                <ul>
                  {overview.competitor.trendingTopics.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="panel span-3">
              <div className="panel-head">
                <h3>Content Studio</h3>
                <span className="badge purple">Drafts only</span>
              </div>
              <div className="draft-grid">
                {overview.drafts.map(draft => (
                  <div key={draft.id} className="draft-card">
                    <div className="inline-between">
                      <strong>{draft.type}</strong>
                      <span className="badge purple">{draft.status}</span>
                    </div>
                    <div className="rank-meta">{draft.platform}</div>
                    <p className="soft-gap"><strong>{draft.content}</strong></p>
                    <p className="muted soft-gap">{draft.body}</p>
                    <div className="detail-list draft-pack soft-gap">
                      <ul>
                        <li><strong>CTA:</strong> {draft.cta}</li>
                        <li><strong>Asset brief:</strong> {draft.assetBrief}</li>
                        <li><strong>Repurpose note:</strong> {draft.repurposeNote}</li>
                      </ul>
                    </div>
                    <p className="muted soft-gap">{draft.rationale}</p>
                    <div className="action-controls soft-gap">
                      <button className="secondary-btn" onClick={() => handleCopy(`${draft.id}-headline`, draft.content)}>
                        {copiedKey === `${draft.id}-headline` ? 'Copied' : 'Copy headline'}
                      </button>
                      <button className="secondary-btn" onClick={() => handleCopy(`${draft.id}-pack`, draft.copyPack.combined)}>
                        {copiedKey === `${draft.id}-pack` ? 'Copied' : 'Copy full pack'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      {paletteOpen && (
        <div className="command-palette">
          <div className="command-modal">
            <div className="panel-head">
              <h3>AI command assistant</h3>
              <button className="ghost-btn" onClick={() => setPaletteOpen(false)}>Close</button>
            </div>
            <input
              className="command-input"
              placeholder="Ask: Which platform is winning? What should we do next?"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
            />
            <button className="primary-btn full-width" onClick={handleCommand}>Run command</button>
            <div className="command-result muted">{commandResult}</div>
          </div>
        </div>
      )}
    </>
  );
}

