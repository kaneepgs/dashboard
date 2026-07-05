# Architecture

## Core principle

This project is an **orchestrated marketing intelligence platform**.

It does **not** use one monolithic skill or one giant dashboard service.

Instead, the `MarketingCommandCentreOrchestrator` delegates work to specialist modules.

## Modules

### 1. Marketing Command Centre (orchestrator)
Responsible for:
- coordinating data refreshes
- aggregating platform snapshots
- building rankings
- invoking AI insight generation
- generating executive briefings
- preparing draft actions

### 2. Data Collector
Responsible for:
- calling official APIs where available
- normalising disparate metrics
- tracking connector health
- exposing a stable internal schema
- allowing browser automation fallback later

### 3. Dashboard
Responsible for:
- homepage KPI cards
- platform ranking visualisation
- drill-down analytics pages
- notifications
- search/filter UX
- command palette interactions

### 4. AI CMO
Responsible for:
- explaining what changed
- inferring likely causes
- forecasting performance direction
- identifying opportunities and risks
- scoring recommendation confidence

### 5. Competitor Intelligence
Responsible for:
- watchlists
- publishing frequency analysis
- trending topic discovery
- content gap analysis
- opportunity spotting

### 6. Content Studio
Responsible for:
- generating content drafts
- explaining rationale for each draft
- producing reusable multi-platform assets
- keeping outputs in draft status

### 7. Reporting
Responsible for:
- daily brief
- weekly report
- monthly report
- structured executive summaries

### 8. Publisher
Responsible for:
- holding actions in draft state
- validating explicit approval
- executing later via adapters
- supporting a future switch from manual approval to auto-execute

## Data flow

1. Dashboard or schedule requests refresh
2. Orchestrator calls Data Collector
3. Data Collector fetches adapter results and normalises them
4. Ranking engine scores each platform
5. AI CMO generates explanations, opportunities, risks, and recommendations
6. Reporting module assembles daily/weekly/monthly briefings
7. Content Studio prepares draft assets
8. Publisher keeps all actions in draft until approval

## Internal schemas

### PlatformSnapshot

```ts
{
  slug: string,
  name: string,
  metrics: {
    followers: number,
    views: number,
    likes: number,
    comments: number,
    followersGained: number,
    growthPct: number,
    engagementRate: number,
    impressions?: number,
    reach?: number,
    ctr?: number,
    watchTimeHours?: number,
    retentionPct?: number,
    visitors?: number,
    emailSignups?: number
  },
  trend: {
    direction: 'up' | 'flat' | 'down',
    deltaPct: number
  },
  topContent: Array<...>,
  lowContent: Array<...>,
  insights: Array<string>
}
```

## Integration strategy

Each platform connector should eventually expose a common interface:

```ts
interface MarketingConnector {
  slug: string;
  kind: 'api' | 'browser';
  collect(): Promise<PlatformSnapshot>;
  health(): Promise<{ status: 'ok' | 'degraded' | 'error'; detail: string }>;
}
```

This keeps API connectors and browser-automation fallbacks interchangeable.

## Future commercial SaaS path

The current scaffold is local-first, but the architecture can later support:

- multi-tenant auth
- per-brand workspaces
- background workers
- persistent databases
- audit logging
- team approvals
- automated publishing modes
