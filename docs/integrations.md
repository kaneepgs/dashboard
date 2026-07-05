# Integrations Guide

## Current mode

The project currently runs with **mock adapters** so the full UX and orchestration can be explored before live credentials are connected.

## Recommended adapter order

### Phase 1
- GA4
- YouTube

### Phase 2
- Instagram
- Facebook

### Phase 3
- LinkedIn

### Phase 4
- X (optional / not connected by default)

### Future phases
- Search Console
- Mailchimp
- Google Ads
- TikTok
- Reddit
- Bluesky
- Pinterest
- CRM / email platforms

## Connector rules

1. Prefer official APIs first.
2. If the API lacks needed fields, add a browser automation adapter.
3. Keep raw fetch logic inside adapters.
4. Return normalised internal shapes only.
5. Track connector health and last successful sync.

## Environment approach

Use environment variables only.

Never hardcode credentials into source.

For this project, fitting bookings are the primary conversion and should be weighted above enquiry forms and email signups in scoring.

## Confirmed visible defaults

- Website / GA4
- YouTube
- Instagram
- Facebook
- LinkedIn
- X remains optional until confirmed

## Confirmed competitor watchlist

- Club Champion UK
- SGGT
- Precision Golf
- My Golf Matters

## Adding a new integration

1. Create a new connector under `src/adapters/`
2. Export it from `src/adapters/index.js`
3. Add it to the collector registry
4. Map platform-specific fields into the internal schema
5. Update the dashboard field registry if new metrics are surfaced
6. Add tests when moving beyond the mock phase
