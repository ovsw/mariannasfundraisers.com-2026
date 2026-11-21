import { beforeEach, describe, expect, it, vi } from "vitest";

const sanityFetchMetadata = vi.hoisted(() => vi.fn());
const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

vi.mock("@/components/root-content", () => ({ RootContentView: vi.fn() }));
vi.mock("@/components/product/product-page", () => ({ ProductPage: vi.fn() }));
vi.mock("@/sanity/lib/fetch", () => ({
  fetchSanityPageBySlug: vi.fn(),
  fetchSanityProduct: vi.fn(),
  PAGES_SLUGS_QUERY: "pages",
  PRODUCTS_SLUGS_QUERY: "products",
}));
vi.mock("@/sanity/lib/live", () => ({
  getDynamicFetchOptions: vi.fn(),
  sanityFetchMetadata,
  sanityFetchStaticParams: vi.fn(),
}));
vi.mock("@/sanity/lib/metadata", () => ({
  generatePageMetadata: vi.fn(),
}));
vi.mock("@/sanity/queries/page", () => ({ PAGE_QUERY: "page" }));
vi.mock("@/sanity/queries/product", () => ({ PRODUCT_QUERY: "product" }));
vi.mock("next/headers", () => ({ draftMode: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound }));

import { generateMetadata, generateStaticParams } from "./page";
import { sanityFetchStaticParams } from "@/sanity/lib/live";
import { generatePageMetadata } from "@/sanity/lib/metadata";

describe("root content metadata", () => {
  beforeEach(() => {
    sanityFetchMetadata.mockReset();
    notFound.mockClear();
  });

  it("does not turn a draft-only route into a 404", async () => {
    sanityFetchMetadata.mockResolvedValue({ data: null });

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: ["draft-post"] }) }),
    ).resolves.toEqual({});
    expect(notFound).not.toHaveBeenCalled();
  });

  it("loads nested page metadata with the complete slug", async () => {
    sanityFetchMetadata.mockResolvedValue({ data: null });
    await generateMetadata({ params: Promise.resolve({ slug: ["about", "team"] }) });
    expect(sanityFetchMetadata).toHaveBeenCalledWith(expect.objectContaining({
      params: { slug: "about/team" },
    }));
  });

  it.each([["news", "post"], ["api", "test"], ["about", "Bad"], ["about", ""]])(
    "rejects reserved or malformed page segments %s/%s",
    async (...slug) => {
      await expect(generateMetadata({ params: Promise.resolve({ slug }) })).resolves.toEqual({});
      expect(sanityFetchMetadata).not.toHaveBeenCalled();
    },
  );

  it("splits nested static params and excludes reserved routes", async () => {
    vi.mocked(sanityFetchStaticParams).mockImplementation(async ({ query }) => ({
      data: query === "pages"
        ? [
            { slug: { current: "/about/team/" } },
            { slug: { current: "news/post" } },
            { slug: { current: "bad//slug" } },
            { slug: { current: "contact" } },
          ]
        : [],
    }));
    await expect(generateStaticParams()).resolves.toEqual([
      { slug: ["about", "team"] },
      { slug: ["contact"] },
    ]);
  });

  it("adds product addresses to the static params", async () => {
    vi.mocked(sanityFetchStaticParams).mockImplementation(async ({ query }) => ({
      data: query === "pages"
        ? [{ slug: { current: "flavored-salsas/menu" } }]
        : [
            { path: "/products/italian-hoagie" },
            { path: "/flavored-salsas/mph-salsa" },
            { path: null },
          ],
    }));
    await expect(generateStaticParams()).resolves.toEqual([
      { slug: ["flavored-salsas", "menu"] },
      { slug: ["products", "italian-hoagie"] },
      { slug: ["flavored-salsas", "mph-salsa"] },
    ]);
  });

  it("reads a product's metadata when no page owns a product address", async () => {
    const product = { _type: "product", name: "MPH Salsa" };
    sanityFetchMetadata.mockImplementation(async ({ query }) => ({
      data: query === "product" ? product : null,
    }));
    await generateMetadata({ params: Promise.resolve({ slug: ["flavored-salsas", "mph-salsa"] }) });
    expect(sanityFetchMetadata).toHaveBeenCalledWith(expect.objectContaining({
      query: "product",
      params: { kinds: ["salsa"], slug: "mph-salsa" },
    }));
    expect(generatePageMetadata).toHaveBeenCalledWith({ page: product, path: "/flavored-salsas/mph-salsa" });
  });

  it("does not look for a product outside the product prefixes", async () => {
    sanityFetchMetadata.mockResolvedValue({ data: null });
    await generateMetadata({ params: Promise.resolve({ slug: ["about", "team"] }) });
    expect(sanityFetchMetadata).toHaveBeenCalledTimes(1);
  });
});
