# Credentials Checklist — Marketing Command Centre

Store all secrets in environment variables only. Do not hardcode credentials in source.

## Phase 1 — GA4 + YouTube

### GA4
Provide:

```text
GA4_PROPERTY_ID=
GA4_CLIENT_EMAIL=
GA4_PRIVATE_KEY=
GA4_PROJECT_ID=
```

Preferred format:
- either the full Google service account JSON
- or the four values above pasted individually

Notes:
- The service account must have access to the GA4 property.
- Fitting bookings should be the primary conversion weight.
- Secondary conversions should include enquiry forms and email signups.

### YouTube
Provide:

```text
YOUTUBE_CHANNEL_ID=
YOUTUBE_API_KEY=
```

Optional later for deeper analytics:

```text
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
```

## Phase 2 — Instagram + Facebook (Meta)

Provide:

```text
META_APP_ID=
META_APP_SECRET=
FACEBOOK_PAGE_ID=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
META_LONG_LIVED_TOKEN=
```

Notes:
- Instagram should be a Business or Creator account linked to the Facebook Page.
- This phase unlocks richer reach / impressions / account-level analytics.

## Phase 3 — LinkedIn

Provide:

```text
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_ORGANISATION_ID=
```

Optional later if needed:

```text
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_REFRESH_TOKEN=
```

## Phase 4 — X (optional / not connected by default)

Provide only when confirmed:

```text
X_HANDLE=
X_BEARER_TOKEN=
```

Optional later for publishing:

```text
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
```

## Confirmed defaults

### Visible platforms
- Website / GA4
- YouTube
- Instagram
- Facebook
- LinkedIn
- X left optional for now

### Primary conversion
- Fitting booking (highest weight)

### Secondary conversions
- Enquiry form
- Email signup

### Competitors
- Club Champion UK
- SGGT
- Precision Golf
- My Golf Matters
