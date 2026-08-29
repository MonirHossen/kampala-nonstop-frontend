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

/**
 * Reads acquisition context from the current browser session.
 * Never rendered to public visitors — only stored with the registration.
 */
export function collectTracking(): TrackingPayload {
  if (typeof window === "undefined") return EMPTY;

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || null;
  const utmSource = params.get("utm_source");

  let source = params.get("source") ?? utmSource;
  if (!source) {
    if (!referrer) source = "direct";
    else {
      try {
        source = new URL(referrer).hostname.replace(/^www\./, "");
      } catch {
        source = "referral";
      }
    }
  }

  return {
    source,
    utm_source: utmSource,
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    landing_page: window.location.pathname + window.location.search,
    referrer,
  };
}
