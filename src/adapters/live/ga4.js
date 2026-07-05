import crypto from 'node:crypto';
import { getEnv, getMultilineEnv } from '../../core/env.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA4_API_BASE = 'https://analyticsdata.googleapis.com/v1beta';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseRowsToMap(rows = []) {
  const out = {};
  for (const row of rows) {
    const key = row.dimensionValues?.[0]?.value;
    const value = row.metricValues?.[0]?.value;
    if (key) out[key] = toNumber(value);
  }
  return out;
}

async function getAccessToken() {
  const clientEmail = getEnv('GA4_CLIENT_EMAIL');
  const privateKey = getMultilineEnv('GA4_PRIVATE_KEY');

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  };

  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claimSet))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const assertion = `${unsigned}.${signature}`;
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GA4 token request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function runReport(propertyId, accessToken, body) {
  const response = await fetch(`${GA4_API_BASE}/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GA4 runReport failed (${response.status}): ${detail}`);
  }

  return response.json();
}

export async function collectGa4Snapshot() {
  const propertyId = getEnv('GA4_PROPERTY_ID');
  const clientEmail = getEnv('GA4_CLIENT_EMAIL');
  const privateKey = getMultilineEnv('GA4_PRIVATE_KEY');
  const projectId = getEnv('GA4_PROJECT_ID');

  if (!propertyId || !clientEmail || !privateKey || !projectId) {
    return null;
  }

  const accessToken = await getAccessToken();

  const totals = await runReport(propertyId, accessToken, {
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'screenPageViews' }
    ]
  });

  const primaryConversion = getEnv('PRIMARY_CONVERSION', '').trim();
  const secondaryConversions = getEnv('SECONDARY_CONVERSIONS', '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
  const eventNames = [primaryConversion, ...secondaryConversions].filter(Boolean);

  const events = eventNames.length
    ? await runReport(propertyId, accessToken, {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: { values: eventNames }
          }
        }
      })
    : { rows: [] };

  const row = totals.rows?.[0];
  const metricValues = row?.metricValues || [];
  const eventCounts = parseRowsToMap(events.rows || []);
  const primaryConversionCount = primaryConversion ? (eventCounts[primaryConversion] || 0) : 0;
  const emailSignups = eventCounts.email_signup || 0;
  const enquiryForms = eventCounts.enquiry_form || 0;

  return {
    slug: 'ga4',
    name: 'Website / GA4',
    accent: '#f59e0b',
    metrics: {
      followers: 0,
      visitors: toNumber(metricValues[0]?.value),
      views: toNumber(metricValues[4]?.value),
      likes: 0,
      comments: 0,
      followersGained: primaryConversionCount,
      growthPct: 0,
      engagementRate: Number((toNumber(metricValues[3]?.value) * 100).toFixed(1)),
      impressions: 0,
      ctr: 0,
      engagementTotal: toNumber(metricValues[2]?.value),
      emailSignups
    },
    trend: { direction: 'flat', deltaPct: 0 },
    audienceInsights: [
      'Live GA4 totals are connected. Trend direction and growth % will improve once previous-period comparisons are persisted.',
      ...(primaryConversion
        ? [`Primary conversion (${primaryConversion}) captured this week: ${primaryConversionCount}.`]
        : ['Primary conversion mapping is intentionally deferred until Kane confirms the final GA4 event names.']),
      ...(secondaryConversions.length
        ? [`Secondary conversions this week — enquiry_form: ${enquiryForms}, email_signup: ${emailSignups}.`]
        : ['Secondary conversion mapping is also deferred for now.'])
    ],
    trafficSources: ['GA4 live report connected'],
    searchTerms: [],
    postingTimes: ['N/A'],
    topContent: [],
    lowContent: [],
    connector: { mode: 'live', health: 'ok', detail: 'Live GA4 Data API report for last 7 days.' }
  };
}
