// Analytics goes through the consent rule: it does not load when the choice
// refuses it, loads once when allowed, and stops when consent is withdrawn.
import { afterEach, describe, expect, it } from "vitest";
import { cleanMeasurementId, pageview, syncAnalytics } from "./analytics";

const ID = "G-TEST123456";
type Page = Window & Record<string, unknown> & { dataLayer?: unknown[]; gtag?: unknown };
const page = window as unknown as Page;

function gaScripts() {
  return document.querySelectorAll('script[src^="https://www.googletagmanager.com/"]');
}

afterEach(() => {
  document.getElementById("marianna-ga")?.remove();
  delete page.gtag;
  delete page.dataLayer;
  delete page.__mariannaGaInitialized;
  delete page[`ga-disable-${ID}`];
  document.cookie = "_ga=; Max-Age=0; path=/";
});

describe("syncAnalytics", () => {
  it("loads nothing when the choice refuses analytics", () => {
    syncAnalytics(ID, false);
    expect(gaScripts()).toHaveLength(0);
    expect(page.gtag).toBeUndefined();
    expect(page[`ga-disable-${ID}`]).toBe(true);
  });

  it("loads nothing while the consent widget has not answered", () => {
    // No widget on the page: the consent rule reads "not ready".
    syncAnalytics(ID);
    expect(gaScripts()).toHaveLength(0);
  });

  it("loads the library once when the choice allows analytics", () => {
    syncAnalytics(ID, true);
    syncAnalytics(ID, true);
    expect(gaScripts()).toHaveLength(1);
    expect(page[`ga-disable-${ID}`]).toBe(false);
    expect(page.dataLayer?.length).toBe(2);
  });

  it("retries the library after a failed request without repeating its start commands", () => {
    syncAnalytics(ID, true);
    gaScripts()[0].dispatchEvent(new Event("error"));
    expect(gaScripts()).toHaveLength(0);
    syncAnalytics(ID, true);
    expect(gaScripts()).toHaveLength(1);
    expect(page.dataLayer?.length).toBe(2);
  });

  it("stops analytics and clears its cookies when consent is withdrawn", () => {
    syncAnalytics(ID, true);
    document.cookie = "_ga=GA1.1.123; path=/";
    syncAnalytics(ID, false);
    expect(page[`ga-disable-${ID}`]).toBe(true);
    expect(document.cookie).not.toMatch(/_ga=/);
  });
});

describe("pageview", () => {
  it("records a navigation only when analytics runs", () => {
    pageview(ID, "/pricing-info", true);
    expect(page.dataLayer).toBeUndefined();
    syncAnalytics(ID, true);
    pageview(ID, "/pricing-info", false);
    expect(page.dataLayer).toHaveLength(2);
    pageview(ID, "/pricing-info", true);
    expect(page.dataLayer).toHaveLength(3);
  });
});

describe("cleanMeasurementId", () => {
  it("accepts a web stream ID and rejects anything else", () => {
    expect(cleanMeasurementId(" G-ABC123XYZ9 ")).toBe("G-ABC123XYZ9");
    for (const value of [null, undefined, "", "UA-1234-1", "G-<script>", "g-abc123"]) {
      expect(cleanMeasurementId(value)).toBeNull();
    }
  });
});
