// The product page's data rules (spec decision 8), kept apart from the
// markup so they can be tested: which buttons a product's kind gets, and the
// anchor the "full ingredients list" button lands on.
import type { SiteButtonData } from "@/components/site-button";
import type { PRODUCT_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import { headingAnchorId } from "../../../shared/heading-anchor";
import { isProductKind } from "../../../shared/content-routes";

export type Product = NonNullable<PRODUCT_QUERY_RESULT>;
export type ProductPageSettings = NonNullable<Product["settings"]>;
export type NutritionValues = NonNullable<Product["nutritionFacts"]>;
export type ProductButton = SiteButtonData & { _key?: string | null };
type KindLinks = {
  heroButtons?: ProductButton[] | null;
  ingredientsListButton?: ProductButton | null;
} | null;

/** The hero buttons and the ingredients list button of the product's kind. */
export function kindLinks(
  settings: { hoagie?: KindLinks; pizza?: KindLinks; salsa?: KindLinks } | null | undefined,
  kind: string | null | undefined,
): { heroButtons: ProductButton[]; ingredientsListButton: ProductButton | null } {
  const clean = stegaClean(kind);
  const links = settings && isProductKind(clean) ? settings[clean] : null;
  return {
    heroButtons: links?.heroButtons ?? [],
    ingredientsListButton: links?.ingredientsListButton ?? null,
  };
}

/**
 * The "full ingredients list" button's link for one product: the page the
 * settings name, with the product's own anchor in place of any anchor there.
 * The ingredients list page has a heading with each product's name, and a
 * heading's anchor is its text in hyphenated words (shared/heading-anchor.ts).
 */
export function ingredientsListHref(href: string | null | undefined, productName: string | null | undefined) {
  const base = stegaClean(href)?.trim();
  const anchor = headingAnchorId(stegaClean(productName) ?? "");
  if (!base) return null;
  const withoutAnchor = base.split("#")[0];
  if (!withoutAnchor.startsWith("/") || withoutAnchor.startsWith("//")) return base;
  return anchor ? `${withoutAnchor}#${anchor}` : withoutAnchor;
}

/** True when rich text holds something a visitor can see, as Studio's rule for required rich text. */
export function hasVisibleRichText(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.some((member: { _type?: string; children?: Array<{ text?: unknown }> } | null) => {
    if (!member || typeof member !== "object") return false;
    if (member._type !== "block") return true;
    return (member.children ?? []).some(
      (child) => typeof child?.text === "string" && stegaClean(child.text).trim() !== "",
    );
  });
}
