// Google Analytics, loaded only through the consent rule (spec decision 17).
// Ported from the old site's utils/gtag.js. The measurement ID comes from the
// `settings` document.

import { analyticsAllowed, readConsentState } from "./consent";

const MEASUREMENT_ID = /^G-[A-Z0-9]{4,}$/;
const SCRIPT_ID = "marianna-ga";

/** The measurement ID when it has the shape of one, otherwise null. */
export function cleanMeasurementId(value: string | null | undefined): string | null {
  const id = value?.trim();
  return id && MEASUREMENT_ID.test(id) ? id : null;
}

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
} & Record<string, unknown>;

function clearAnalyticsCookies(win: Window) {
  const domains = win.location.hostname.split(".");
  for (const cookie of win.document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) continue;
    const expired = `${name}=; Max-Age=0; path=/`;
    win.document.cookie = expired;
    for (let index = 0; index < domains.length - 1; index++) {
      win.document.cookie = `${expired}; domain=${domains.slice(index).join(".")}`;
    }
  }
}

/**
 * Starts or stops Google Analytics to match the visitor's privacy choice.
 * Refused: the disable flag is set, the analytics cookies are cleared and no
 * script loads. Allowed: the library loads once. The disable flag also stops
 * automatic events after the library has loaded, so withdrawing consent
 * works without a reload.
 */
export function syncAnalytics(
  measurementId: string,
  allowed = analyticsAllowed(readConsentState()),
  win: Window = window,
) {
  const page = win as AnalyticsWindow;
  page[`ga-disable-${measurementId}`] = !allowed;
  if (!allowed) {
    clearAnalyticsCookies(win);
    return;
  }
  if (win.document.getElementById(SCRIPT_ID)) return;
  page.dataLayer = page.dataLayer || [];
  page.gtag =
    page.gtag ||
    function gtag() {
      // gtag.js reads the arguments object itself.
      // eslint-disable-next-line prefer-rest-params
      page.dataLayer!.push(arguments);
    };
  page.gtag("js", new Date());
  page.gtag("config", measurementId, {
    page_path: win.location.pathname + win.location.search,
  });
  const script = win.document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  // Gated here, including withdrawal, instead of by iubenda's autoblocking.
  script.setAttribute("data-cmp-ab", "1");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  win.document.head.appendChild(script);
}

/** Records a client-side navigation, when analytics runs. */
export function pageview(
  measurementId: string,
  path: string,
  allowed = analyticsAllowed(readConsentState()),
  win: Window = window,
) {
  const page = win as AnalyticsWindow;
  if (!allowed || typeof page.gtag !== "function") return;
  page.gtag("config", measurementId, { page_path: path });
}
