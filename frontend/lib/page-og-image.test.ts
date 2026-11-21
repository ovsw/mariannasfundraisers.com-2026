import { describe, expect, it } from "vitest";
import {
  buildPageOgImageUrl,
  createPageOgImageRevision,
  getPageOgImageKey,
  getPageOgImageTitle,
  parsePageOgImageTarget,
  type PageOgImageTarget,
} from "./page-og-image";
import { verifyOgImageSignature } from "./post-og-image";

describe("page OG image URLs", () => {
  it.each<[PageOgImageTarget, string]>([
    [{ kind: "home" }, "/api/og/page/home"],
    [{ kind: "page", slug: "about/jordan" }, "/api/og/page/page/about/jordan"],
    [{ kind: "news" }, "/api/og/page/news"],
    [{ kind: "news", page: 2 }, "/api/og/page/news/2"],
  ])("builds a signed, finite URL for %j", (target, pathname) => {
    const title = "Useful guidance";
    const url = new URL(
      buildPageOgImageUrl({
        origin: "https://example.com",
        secret: "secret",
        target,
        title,
      }),
    );

    expect(url.pathname).toBe(pathname);
    expect(
      verifyOgImageSignature({
        identity: {
          key: getPageOgImageKey(target),
          revision: createPageOgImageRevision(title),
          version: url.searchParams.get("v") || "",
        },
        secret: "secret",
        signature: url.searchParams.get("sig") || "",
      }),
    ).toBe(true);
  });

  it("rejects malformed or unbounded targets", () => {
    expect(parsePageOgImageTarget(["unknown", "thing"])).toBeNull();
    expect(parsePageOgImageTarget(["category", "news"])).toBeNull();
    expect(parsePageOgImageTarget(["blog"])).toBeNull();
    expect(parsePageOgImageTarget(["news", "0"])).toBeNull();
    expect(parsePageOgImageTarget(["news", "01"])).toBeNull();
    expect(parsePageOgImageTarget(["news", "1.0"])).toBeNull();
    expect(parsePageOgImageTarget(["news", "1e0"])).toBeNull();
    expect(parsePageOgImageTarget(["news", "2", "extra"])).toBeNull();
    expect(parsePageOgImageTarget(["page", "../private"])).toBeNull();
    expect(() =>
      buildPageOgImageUrl({
        origin: "https://example.com",
        secret: "secret",
        target: { kind: "page", slug: "../private" },
        title: "Private",
      }),
    ).toThrow("invalid page target");
    expect(() =>
      buildPageOgImageUrl({
        origin: "https://example.com",
        secret: "secret",
        target: { kind: "news", page: 0 },
        title: "News",
      }),
    ).toThrow("invalid page target");
  });

  it("removes a redundant brand suffix from the card title", () => {
    expect(
      getPageOgImageTitle(
        "Example services | Next.js + Sanity Starter",
      ),
    ).toBe("Example services");
    expect(getPageOgImageTitle("Service Planning")).toBe(
      "Service Planning",
    );
  });
});
