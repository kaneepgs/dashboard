export const DASHBOARD_AUTH_COOKIE = 'epg_dashboard_auth';

export function getDashboardAccessPassword() {
  return process.env.DASHBOARD_ACCESS_PASSWORD || '';
}

export function isDashboardAuthEnabled() {
  return Boolean(getDashboardAccessPassword());
}

export function createDashboardAuthToken(password) {
  return String(password || '');
}

export function getExpectedDashboardAuthToken() {
  return getDashboardAccessPassword();
}

export function isValidDashboardPassword(password) {
  if (!isDashboardAuthEnabled()) return true;
  return String(password || '') === getExpectedDashboardAuthToken();
}

export function isValidDashboardCookie(value) {
  if (!isDashboardAuthEnabled()) return true;
  return Boolean(value) && value === getExpectedDashboardAuthToken();
}
