# Next.js Migration Plan

## Goal

Move the current local Node scaffold to a richer Next.js application so the Marketing Command Centre feels closer to a premium SaaS product.

## Planned direction

### App layer
- Next.js App Router
- Server components where useful
- API routes / route handlers for platform refresh and reporting
- Componentised UI for cards, rankings, charts, drill-down panels, and approval queues

### Styling
- Derive base colours from the current EP Golf Studios website
- Premium dark mode default
- Bold uppercase section headers
- Strong CTA emphasis around booking fittings

### Data layer
- Keep the current orchestrator / specialist-module shape
- Move adapters and business logic into `/src`
- Keep secrets in environment variables only
- Add connector health states and last-sync records

### Initial live phases
1. GA4
2. YouTube
3. Instagram + Facebook
4. LinkedIn
5. X optional later

### Suggested package additions later
- charting library
- schema validation
- env validation
- date utilities
- optional database layer when persistence is needed

## Current status

The migration has now started in practice:

- package/scripts now target Next.js App Router
- `app/` route handlers are serving overview/platform/report refresh endpoints
- the first dashboard UI has been rebuilt as a client component
- secure env loading is live
- YouTube and GA4 Phase 1 connectors are already wired

## Remaining phases

1. Wire Meta connectors
2. Bring LinkedIn online when organisation details are available
3. Upgrade more UI sections from mock to live state
4. Add persistence for historical trend calculations
