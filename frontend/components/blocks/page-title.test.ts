import { describe, expect, it } from "vitest";
import { blocksDrawPageTitle } from "./page-title";

// Which sections draw the page's h1, so the template adds a hidden one only
// when none does: every page has exactly one h1.

const photo = { asset: { url: "https://cdn.sanity.io/images/p/d/a.jpg" } };

describe("blocksDrawPageTitle", () => {
  it("is true for a Page heading, and a Page banner or Home hero with a title and a photo", () => {
    expect(blocksDrawPageTitle([{ _type: "pageHeading", title: "About" }])).toBe(true);
    expect(blocksDrawPageTitle([{ _type: "pageBanner", title: "About", image: photo }])).toBe(true);
    expect(blocksDrawPageTitle([{ _type: "homeHero", title: "The Fundraiser That Sells Itself", image: photo }])).toBe(true);
  });

  it("is false without a title or photo, or for another section", () => {
    expect(blocksDrawPageTitle([])).toBe(false);
    expect(blocksDrawPageTitle([{ _type: "homeHero", title: "  ", image: photo }])).toBe(false);
    expect(blocksDrawPageTitle([{ _type: "homeHero", title: "Hello", image: null }])).toBe(false);
    expect(blocksDrawPageTitle([{ _type: "richTextBlock", title: "Hello" }])).toBe(false);
  });
});
