const state = {
  overview: null,
  platforms: [],
  reports: null,
  selectedPlatform: null,
  search: ''
};

const els = {
  systemStatus: document.getElementById('systemStatus'),
  marketingScore: document.getElementById('marketingScore'),
  scoreNarrative: document.getElementById('scoreNarrative'),
  lastUpdated: document.getElementById('lastUpdated'),
  nextRefresh: document.getElementById('nextRefresh'),
  approvalMode: document.getElementById('approvalMode'),
  socialKpis: document.getElementById('socialKpis'),
  websiteKpis: document.getElementById('websiteKpis'),
  rankingsList: document.getElementById('rankingsList'),
  insightsPanel: document.getElementById('insightsPanel'),
  actionQueue: document.getElementById('actionQueue'),
  platformTabs: document.getElementById('platformTabs'),
  platformDetail: document.getElementById('platformDetail'),
  reportsPanel: document.getElementById('reportsPanel'),
  competitorPanel: document.getElementById('competitorPanel'),
  draftPanel: document.getElementById('draftPanel'),
  refreshButton: document.getElementById('refreshButton'),
  searchInput: document.getElementById('searchInput'),
  commandButton: document.getElementById('commandButton'),
  commandPalette: document.getElementById('commandPalette'),
  closePalette: document.getElementById('closePalette'),
  commandInput: document.getElementById('commandInput'),
  runCommand: document.getElementById('runCommand'),
  commandResult: document.getElementById('commandResult')
};

function formatNumber(value) {
  return new Intl.NumberFormat('en-GB').format(value);
}

function formatPct(value) {
  return `${value}%`;
}

function formatDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function metricCard(label, value, suffix = '') {
  return `<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-number">${formatNumber(value)}${suffix}</div></div>`;
}

function listBlock(title, items) {
  return `
    <div class="insight-block">
      <h4>${title}</h4>
      <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
    </div>
  `;
}

function renderOverview() {
  const { overview } = state;
  els.marketingScore.textContent = overview.insights.marketingScore;
  els.scoreNarrative.textContent = overview.insights.keyWins[0];
  els.lastUpdated.textContent = formatDate(overview.system.lastUpdated);
  els.nextRefresh.textContent = `Next scheduled refresh: ${formatDate(overview.system.nextScheduledRefresh)}`;
  els.approvalMode.textContent = overview.system.approvalMode === 'manual' ? 'Draft only' : overview.system.approvalMode;

  els.systemStatus.innerHTML = `
    <div class="section-title">System status</div>
    <div class="metric-value">${overview.system.health}</div>
    <div class="muted">${overview.system.refreshSchedule}</div>
  `;

  els.socialKpis.innerHTML = [
    metricCard('Followers', overview.social.followers),
    metricCard('Views', overview.social.views),
    metricCard('Likes', overview.social.likes),
    metricCard('Comments', overview.social.comments),
    metricCard('Followers gained this week', overview.social.followersGained),
    metricCard('Growth %', overview.social.growthPct, '%')
  ].join('');

  els.websiteKpis.innerHTML = [
    metricCard('Website visitors', overview.website.visitors),
    metricCard('Email signups', overview.website.emailSignups)
  ].join('');

  const filteredRankings = overview.rankings.filter(platform => {
    const q = state.search.trim().toLowerCase();
    if (!q) return true;
    return platform.name.toLowerCase().includes(q) || platform.slug.toLowerCase().includes(q);
  });

  els.rankingsList.innerHTML = filteredRankings.map(platform => `
    <div class="ranking-item">
      <div class="ranking-row">
        <div>
          <strong>${platform.rank <= 3 ? ['🥇','🥈','🥉'][platform.rank - 1] : `#${platform.rank}`} ${platform.name}</strong>
          <div class="rank-meta">Trend: ${platform.trend.direction} · Growth ${formatPct(platform.metrics.growthPct || 0)}</div>
        </div>
        <div class="rank-score">${platform.score}</div>
      </div>
    </div>
  `).join('');

  els.insightsPanel.innerHTML = [
    listBlock('Key wins', overview.insights.keyWins),
    listBlock('Problems', overview.insights.problems),
    listBlock('Opportunities', overview.insights.opportunities),
    listBlock('Risks & forecast', [...overview.insights.risks, ...overview.insights.forecast])
  ].join('');

  els.actionQueue.innerHTML = overview.actionQueue.map(action => `
    <div class="action-card">
      <div class="inline-between">
        <strong>${action.title}</strong>
        <span class="badge red">${action.status}</span>
      </div>
      <p class="muted" style="margin-top:8px;">${action.why}</p>
      <div class="rank-meta" style="margin-top:10px;">Confidence: ${Math.round(action.confidence.score * 100)}% · Impact: ${action.estimatedImpact}</div>
    </div>
  `).join('');

  renderPlatformTabs();
  renderReports();
  renderCompetitors();
  renderDrafts();
}

function renderPlatformTabs() {
  const platforms = state.overview.rankings;
  if (!state.selectedPlatform) state.selectedPlatform = platforms[0]?.slug;

  els.platformTabs.innerHTML = platforms.map(platform => `
    <button class="tab-pill ${state.selectedPlatform === platform.slug ? 'active' : ''}" data-platform="${platform.slug}">${platform.name}</button>
  `).join('');

  els.platformTabs.querySelectorAll('[data-platform]').forEach(button => {
    button.addEventListener('click', () => {
      state.selectedPlatform = button.dataset.platform;
      renderPlatformTabs();
      renderPlatformDetail();
    });
  });

  renderPlatformDetail();
}

function renderPlatformDetail() {
  const platform = state.overview.rankings.find(item => item.slug === state.selectedPlatform);
  if (!platform) return;

  const metrics = platform.metrics;
  const pairs = [
    ['Followers', metrics.followers || 0],
    ['Views', metrics.views || metrics.visitors || 0],
    ['Likes', metrics.likes || 0],
    ['Comments', metrics.comments || 0],
    ['Followers gained', metrics.followersGained || 0],
    ['Growth %', metrics.growthPct || 0],
    ['Engagement %', metrics.engagementRate || 0],
    ['Reach', metrics.reach || 0],
    ['Impressions', metrics.impressions || 0],
    ['CTR %', metrics.ctr || 0],
    ['Watch time hours', metrics.watchTimeHours || 0],
    ['Retention %', metrics.retentionPct || 0],
    ['Visitors', metrics.visitors || 0],
    ['Email signups', metrics.emailSignups || 0]
  ].filter(([, value]) => value !== 0);

  els.platformDetail.innerHTML = `
    <div class="detail-grid">
      ${pairs.map(([label, value]) => metricCard(label, value)).join('')}
    </div>
    <div class="detail-grid">
      <div class="detail-list">
        <h4>Best content</h4>
        <ul>${platform.topContent.map(item => `<li>${item.title} — ${formatNumber(item.views)} views</li>`).join('')}</ul>
      </div>
      <div class="detail-list">
        <h4>Worst content</h4>
        <ul>${platform.lowContent.map(item => `<li>${item.title} — ${formatNumber(item.views)} views</li>`).join('')}</ul>
      </div>
      <div class="detail-list">
        <h4>Audience insights</h4>
        <ul>${platform.audienceInsights.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
      <div class="detail-list">
        <h4>Traffic & timing</h4>
        <ul>
          <li><strong>Traffic sources:</strong> ${platform.trafficSources.join(', ')}</li>
          <li><strong>Search terms:</strong> ${platform.searchTerms.join(', ')}</li>
          <li><strong>Best posting times:</strong> ${platform.postingTimes.join(', ')}</li>
          <li><strong>Trend:</strong> ${platform.trend.direction} (${platform.trend.deltaPct}%)</li>
        </ul>
      </div>
    </div>
  `;
}

function renderReports() {
  const { reports } = state.overview;
  els.reportsPanel.innerHTML = Object.values(reports).filter(item => typeof item === 'object' && item.title).map(report => `
    <div class="report-card">
      <strong>${report.title}</strong>
      <ul>
        ${Object.entries(report).filter(([key]) => key !== 'title').slice(0, 4).map(([key, value]) => {
          const text = Array.isArray(value) ? value[0] : typeof value === 'string' ? value : JSON.stringify(value[0] || value);
          return `<li><strong>${key}:</strong> ${text}</li>`;
        }).join('')}
      </ul>
    </div>
  `).join('');
}

function renderCompetitors() {
  const competitor = state.overview.competitor;
  els.competitorPanel.innerHTML = `
    <div class="detail-list">
      <h4>Tracked competitors</h4>
      <p class="muted">${competitor.trackedCompetitors.join(' · ')}</p>
      <ul>${competitor.highlights.map(item => `<li>${item}</li>`).join('')}</ul>
      <h4 style="margin-top:16px;">Content gaps</h4>
      <ul>${competitor.gaps.map(item => `<li>${item}</li>`).join('')}</ul>
      <h4 style="margin-top:16px;">Trending topics</h4>
      <ul>${competitor.trendingTopics.map(item => `<li>${item}</li>`).join('')}</ul>
    </div>
  `;
}

function renderDrafts() {
  els.draftPanel.innerHTML = state.overview.drafts.map(draft => `
    <div class="draft-card">
      <div class="inline-between">
        <strong>${draft.type}</strong>
        <span class="badge purple">${draft.status}</span>
      </div>
      <div class="rank-meta">${draft.platform}</div>
      <p style="margin-top:10px;">${draft.content}</p>
      <p class="muted" style="margin-top:10px;">${draft.rationale}</p>
    </div>
  `).join('');
}

async function loadData() {
  const overview = await fetch('/api/overview').then(r => r.json());
  state.overview = overview;
  renderOverview();
}

els.refreshButton.addEventListener('click', async () => {
  els.refreshButton.disabled = true;
  els.refreshButton.textContent = 'Refreshing...';
  await fetch('/api/refresh', { method: 'POST' });
  await loadData();
  els.refreshButton.disabled = false;
  els.refreshButton.textContent = 'Refresh now';
});

els.searchInput.addEventListener('input', event => {
  state.search = event.target.value;
  renderOverview();
});

els.commandButton.addEventListener('click', () => {
  els.commandPalette.classList.remove('hidden');
  els.commandInput.focus();
});

els.closePalette.addEventListener('click', () => {
  els.commandPalette.classList.add('hidden');
});

els.runCommand.addEventListener('click', async () => {
  const command = els.commandInput.value.trim();
  if (!command) return;
  const result = await fetch('/api/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  }).then(r => r.json());
  els.commandResult.textContent = result.answer || 'No answer available.';
});

loadData();
