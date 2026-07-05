import { dataCollector } from '../modules/data-collector/index.js';
import { aiCmo } from '../modules/ai-cmo/index.js';
import { competitorIntelligence } from '../modules/competitor-intelligence/index.js';
import { contentStudio } from '../modules/content-studio/index.js';
import { reporting } from '../modules/reporting/index.js';
import { persistDailySnapshot, loadSnapshotHistory } from '../modules/reporting/snapshot-store.js';
import { publisher } from '../modules/publisher/index.js';
import { dashboard } from '../modules/dashboard/index.js';
import { rankPlatforms } from './scoring.js';

function computeNextRefresh(date = new Date()) {
  const next = new Date(date);
  next.setHours(8, 0, 0, 0);
  if (next <= date) next.setDate(next.getDate() + 1);
  return next.toISOString();
}

function buildSystem(now = new Date().toISOString()) {
  return {
    lastUpdated: now,
    nextScheduledRefresh: computeNextRefresh(new Date(now)),
    approvalMode: process.env.APPROVAL_MODE || 'manual',
    refreshSchedule: 'Every morning at 08:00',
    health: 'healthy'
  };
}

async function buildState(now = new Date().toISOString()) {
  const rawPlatforms = await dataCollector.collectAll();
  const rankedPlatforms = rankPlatforms(rawPlatforms);
  const insights = aiCmo.explain(rankedPlatforms);
  const competitor = competitorIntelligence.build();
  const drafts = contentStudio.draft(rankedPlatforms);
  const actionQueue = await publisher.buildDraftQueue(insights.recommendedActions);
  const system = buildSystem(now);

  await persistDailySnapshot({ system, rankedPlatforms, insights });
  const snapshotHistory = await loadSnapshotHistory();

  const reports = reporting.build({ system, rankedPlatforms, insights, competitor, drafts, snapshotHistory });
  const overview = dashboard.buildOverview(system, rankedPlatforms, insights, competitor, reports, drafts, actionQueue, snapshotHistory);

  return {
    system,
    rankedPlatforms,
    insights,
    competitor,
    drafts,
    contentPack: contentStudio.buildPack(drafts),
    reports,
    actionQueue,
    overview,
    snapshotHistory
  };
}

export const orchestrator = {
  async bootstrap() {
    return buildState();
  },
  async refresh() {
    return buildState();
  },
  getOverview(state) {
    return state.overview;
  },
  getPlatforms(state) {
    return state.rankedPlatforms;
  },
  getPlatform(state, slug) {
    return state.rankedPlatforms.find(platform => platform.slug === slug);
  },
  getReports(state) {
    return state.reports;
  },
  getHistory(state) {
    return {
      history: state.snapshotHistory,
      summary: state.overview.history,
      weeklyFocus: state.overview.weeklyFocus
    };
  },
  getSundaySummary(state) {
    return state.reports.sunday;
  },
  getExecutivePack(state) {
    return state.overview.executivePack;
  },
  getDrafts(state) {
    return {
      contentDrafts: state.drafts,
      contentPack: state.contentPack,
      actionQueue: state.actionQueue
    };
  },
  getSystem(state) {
    return state.system;
  },
  runCommand(state, command) {
    const q = command.toLowerCase();

    if (q.includes('best platform') || q.includes('leader')) {
      const leader = state.rankedPlatforms[0];
      return {
        answer: `${leader.name} is currently ranked #1 with a score of ${leader.score}.`,
        context: leader
      };
    }

    if (q.includes('biggest risk')) {
      return {
        answer: state.insights.risks[0],
        context: state.insights.risks
      };
    }

    if (q.includes('what should we do next') || q.includes('recommended')) {
      return {
        answer: state.insights.recommendedActions[0].title,
        context: state.insights.recommendedActions
      };
    }

    if (q.includes('sunday summary') || q.includes('weekly summary')) {
      return {
        answer: state.reports.sunday.headline,
        context: state.reports.sunday
      };
    }

    if (q.includes('executive pack') || q.includes('executive summary pack')) {
      return {
        answer: state.overview.executivePack.headline,
        context: state.overview.executivePack
      };
    }

    return {
      answer: 'I can answer questions about rankings, risks, recommended actions, and platform performance.',
      context: null
    };
  }
};
