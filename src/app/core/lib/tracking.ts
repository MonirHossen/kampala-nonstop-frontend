/** Default `?source=` when Join CTAs have no campaign param. */
export const DEFAULT_WAITLIST_SOURCE = 'unaa_denver_2026';

export type TrackingPayload = {
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  landing_page: string | null;
  referrer: string | null;
};

const EMPTY: TrackingPayload = {
  source: null,
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_term: null,
  utm_content: null,
  landing_page: null,
  referrer: null,
};

/** Raw `?source=` value from the URL (e.g. unaa_denver_2026). */
export function querySourceParam(): string | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('source');
  return value?.trim() || null;
}

const SOURCE_KEY = 'kn_waitlist_source';

/**
 * Stores the first `?source=` a visitor arrived with, so attribution survives
 * navigation that drops the query string. Later sources never overwrite it.
 */
export function rememberSource(raw: string): void {
  if (typeof sessionStorage === 'undefined') return;
  const value = raw.trim();
  if (!value || sessionStorage.getItem(SOURCE_KEY)) return;
  sessionStorage.setItem(SOURCE_KEY, value);
}

export function readRememberedSource(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(SOURCE_KEY)?.trim() || null;
}

/** Source to carry into `/waitlist/join`: current URL, then session, then default. */
export function resolveWaitlistSource(): string {
  return querySourceParam() || readRememberedSource() || DEFAULT_WAITLIST_SOURCE;
}

/** Normalise a campaign/source slug for the API acquisition_source_code field. */
export function normaliseSourceCode(raw: string): string {
  return (
    raw
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'DIRECT'
  );
}

/**
 * Reads acquisition context from the current browser session.
 * `source` prefers the explicit `?source=` query param, then utm_source, then referrer.
 */
export function collectTracking(): TrackingPayload {
  if (typeof window === 'undefined') return EMPTY;

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || null;
  const utmSource = params.get('utm_source');
  const querySource = querySourceParam();

  let source = querySource ?? utmSource;
  if (!source) {
    if (!referrer) source = 'direct';
    else {
      try {
        source = new URL(referrer).hostname.replace(/^www\./, '');
      } catch {
        source = 'referral';
      }
    }
  }

  return {
    source,
    utm_source: utmSource,
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    landing_page: window.location.pathname + window.location.search,
    referrer,
  };
}
