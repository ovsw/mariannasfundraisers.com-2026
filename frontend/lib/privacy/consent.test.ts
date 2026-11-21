// The consent rule (spec testing seam 5): allowed, refused, not ready, and
// Global Privacy Control on.
import { describe, expect, it } from "vitest";
import { analyticsAllowed, readConsentState } from "./consent";

const allowedChoice = { uspr: { s: true, sh: true, adv: true } };

describe("analyticsAllowed", () => {
  it("allows analytics when the widget is ready and nothing is refused", () => {
    expect(
      analyticsAllowed({ ready: true, preferences: allowedChoice, globalPrivacyControl: false }),
    ).toBe(true);
    // A first visit: the widget is ready and no choice has been made yet.
    expect(
      analyticsAllowed({ ready: true, preferences: {}, globalPrivacyControl: false }),
    ).toBe(true);
  });

  it("refuses analytics when any US purpose is refused", () => {
    for (const purpose of ["s", "sh", "adv"] as const) {
      expect(
        analyticsAllowed({
          ready: true,
          preferences: { uspr: { ...allowedChoice.uspr, [purpose]: false } },
          globalPrivacyControl: false,
        }),
      ).toBe(false);
    }
  });

  it("refuses analytics until the widget is ready and has preferences", () => {
    expect(
      analyticsAllowed({ ready: false, preferences: allowedChoice, globalPrivacyControl: false }),
    ).toBe(false);
    for (const preferences of [null, undefined]) {
      expect(
        analyticsAllowed({ ready: true, preferences, globalPrivacyControl: false }),
      ).toBe(false);
    }
  });

  it("refuses analytics when the browser sends Global Privacy Control", () => {
    expect(
      analyticsAllowed({ ready: true, preferences: allowedChoice, globalPrivacyControl: true }),
    ).toBe(false);
  });
});

describe("readConsentState", () => {
  function page({
    ready,
    getPreferences,
    gpc = false,
  }: {
    ready?: boolean;
    getPreferences?: () => unknown;
    gpc?: boolean;
  }) {
    return {
      navigator: { globalPrivacyControl: gpc },
      mariannaPrivacy: ready === undefined ? undefined : { ready },
      _iub: getPreferences ? { cs: { api: { getPreferences } } } : undefined,
    } as unknown as Window;
  }

  it("reads the widget's preferences once the bootstrap marks it ready", () => {
    expect(readConsentState(page({ ready: true, getPreferences: () => allowedChoice }))).toEqual({
      ready: true,
      preferences: allowedChoice,
      globalPrivacyControl: false,
    });
  });

  it("is not ready before the bootstrap or the widget run", () => {
    expect(readConsentState(page({})).ready).toBe(false);
    expect(readConsentState(page({ ready: false, getPreferences: () => ({}) })).preferences).toBeNull();
  });

  it("treats a widget error as no preferences", () => {
    const state = readConsentState(
      page({
        ready: true,
        getPreferences: () => {
          throw new Error("not ready");
        },
      }),
    );
    expect(analyticsAllowed(state)).toBe(false);
  });

  it("reads Global Privacy Control from the browser", () => {
    const state = readConsentState(page({ ready: true, getPreferences: () => ({}), gpc: true }));
    expect(state.globalPrivacyControl).toBe(true);
    expect(analyticsAllowed(state)).toBe(false);
  });
});
