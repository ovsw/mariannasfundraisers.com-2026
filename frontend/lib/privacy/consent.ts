// The consent rule (spec decision 17): whether analytics may run, from the
// visitor's privacy choice in the iubenda consent widget. Ported from the old
// site's public/privacy-controls.js and utils/privacy.js. Analytics code asks
// `analyticsAllowed`, and nothing else decides.

/** The US privacy purposes iubenda reports: sale, sharing, targeted ads. */
const US_PURPOSES = ["s", "sh", "adv"] as const;

export type IubendaPreferences = {
  uspr?: Partial<Record<(typeof US_PURPOSES)[number], boolean>> | null;
} & Record<string, unknown>;

export type ConsentState = {
  /** The widget has finished loading (its `onReady` callback ran). */
  ready: boolean;
  /** What the widget's `getPreferences()` returned, or null. */
  preferences: IubendaPreferences | null | undefined;
  /** The browser sends Global Privacy Control. */
  globalPrivacyControl: boolean;
};

/**
 * Analytics may run only when the widget is ready, has preferences, the
 * browser does not send Global Privacy Control, and no US purpose is refused.
 * The US flags describe permission, not opt-out: an empty result on a first
 * visit permits tracking once the widget is ready.
 */
export function analyticsAllowed({
  ready,
  preferences,
  globalPrivacyControl,
}: ConsentState): boolean {
  if (!ready || globalPrivacyControl) return false;
  if (!preferences || typeof preferences !== "object") return false;
  const uspr = preferences.uspr;
  return US_PURPOSES.every((purpose) => !uspr || uspr[purpose] !== false);
}

type IubendaWindow = Window & {
  _iub?: { cs?: { api?: { getPreferences?: () => unknown } } };
  mariannaPrivacy?: { ready?: boolean };
};

/** Reads the consent state from the page: the widget's API and the bootstrap's ready flag. */
export function readConsentState(
  win: Window = window,
): ConsentState {
  const page = win as IubendaWindow;
  const globalPrivacyControl = Boolean(
    (win.navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl,
  );
  const ready = page.mariannaPrivacy?.ready === true;
  let preferences: IubendaPreferences | null = null;
  const getPreferences = page._iub?.cs?.api?.getPreferences;
  if (ready && typeof getPreferences === "function") {
    try {
      preferences = (getPreferences.call(page._iub?.cs?.api) ??
        null) as IubendaPreferences | null;
    } catch {
      preferences = null;
    }
  }
  return { ready, preferences, globalPrivacyControl };
}

/** The event the bootstrap script (public/privacy-controls.js) fires when the choice may have changed. */
export const PRIVACY_EVENT = "marianna:privacy";
