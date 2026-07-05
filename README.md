# Marketing Command Centre

A modular, local-first marketing intelligence platform for **EP Golf Studios**.

This is designed as an **extensible Marketing Command Centre**, not a one-off dashboard.

## What is included

- Modular orchestrator architecture
- Specialist modules for:
  - Marketing Command Centre orchestration
  - Data Collector
  - Dashboard
  - AI CMO
  - Competitor Intelligence
  - Content Studio
  - Reporting
  - Publisher
- Premium dark-mode local web app
- Weighted platform ranking engine
- Approval-first action workflow
- Mock/live-ready adapter pattern for future API integrations
- Daily / weekly / monthly briefing generators

## Current status

This scaffold is production-minded but intentionally starts with **mock adapters** so the UI and orchestration can be built before credentials are added.

Confirmed integration order:

1. GA4
2. YouTube
3. Instagram
4. Facebook
5. LinkedIn
6. X (optional later)

Browser automation fallbacks can be added where APIs cannot provide the required data.

Confirmed conversion weighting:

- Primary: fitting booking
- Secondary: enquiry form
- Secondary: email signup

Historical reporting status:

- Daily snapshots now persist locally in `data/weekly-snapshots.json`
- Weekly reports can now build from captured history instead of only the current state

## Quick start

```bash
cd marketing-command-centre
npm install
npm run dev
```

Then open:

```bash
http://localhost:3000
```

## Scripts

- `npm run dev` — start the Next.js local app
- `npm run build` — production build check
- `npm run start` — start the production server

## Environment

Copy `.env.example` to `.env` and add credentials when ready.

See `CREDENTIALS-CHECKLIST.md` for the phased credential format.

## Architecture

See:

- `docs/architecture.md`
- `docs/integrations.md`

## Notes

- Publishing is **draft-only by default**.
- Approval mode is isolated so it can later be switched to auto-execute with minimal refactoring.
- Visible dashboard defaults should be Website / GA4, YouTube, Instagram, Facebook, and LinkedIn.
- The frontend now targets a Next.js App Router structure so the dashboard can evolve more cleanly into a premium SaaS-style product.
- Weekly reporting now has a lightweight persistence layer for Sunday summaries and trend comparisons.
