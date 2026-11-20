// The renderer the Hoagie, Pizza and Salsa menus share (spec decision 12):
// one menu card per product, in the editor's order, each with a Details
// button to the product's page. The card's content lives on the product.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import { SiteButton } from "@/components/site-button";
import { urlFor } from "@/sanity/lib/image";
import { productPath } from "../../../shared/content-routes";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

export type ProductMenuType = "hoagieMenu" | "pizzaMenu" | "salsaMenu";
export type ProductMenuBlock = Extract<PageBlock, { _type: ProductMenuType }>;
export type ProductMenuProps = ProductMenuBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

type ProductCard = NonNullable<NonNullable<ProductMenuBlock["products"]>[number]>;

const DRESSINGS: Record<string, string> = {
  italian: "Italian Dressing",
  mayo: "Sweet & Sassy Mayo",
};

/** The card's heading: the short name, then the kind for hoagies and pizzas. */
const KIND_WORD: Record<ProductMenuType, string | null> = {
  hoagieMenu: "Hoagie",
  pizzaMenu: "Pizza",
  salsaMenu: null,
};

/** The Details button's icon: the kind's own icon before the label, or a chevron after it. */
const DETAILS_ICON: Record<ProductMenuType, string> = {
  hoagieMenu: "hoagie",
  pizzaMenu: "pizza",
  salsaMenu: "chevron-right",
};

/** A card draws when its product has a page address, a short name and a card photo. */
export function hasProductCardContent(card: ProductCard | null | undefined): card is ProductCard {
  return Boolean(
    card &&
      productPath(stegaClean(card.kind), stegaClean(card.slug)) &&
      stegaClean(card.shortName)?.trim() &&
      card.image?.asset?.url,
  );
}

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below.
export function hasProductMenuContent(block: Pick<ProductMenuBlock, "products">) {
  return (block.products ?? []).some(hasProductCardContent);
}

export function ProductMenu({ block }: { block: ProductMenuProps }) {
  const { _key, _type, bottom = "outer", dataAttribute, theme, top = "outer" } = block;
  const cards = (block.products ?? []).filter(hasProductCardContent);
  if (!cards.length) return null;
  const kindWord = KIND_WORD[_type];

  return (
    <section
      aria-label={`${kindWord ?? "Salsa"} menu`}
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <ul className="container space-y-16 lg:space-y-20" data-sanity={dataAttribute?.("products")}>
        {cards.map((card) => {
          const dressing = DRESSINGS[stegaClean(card.dressing) ?? ""];
          const asset = card.image?.asset;
          const href = productPath(stegaClean(card.kind), stegaClean(card.slug));
          return (
            <li
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-split"
              key={`${_key}-${card._id}`}
            >
              <div className="relative order-first aspect-[3/2] w-full lg:order-last">
                {asset?.url ? (
                  <Image
                    alt={stegaClean(card.image?.alt)?.trim() || ""}
                    blurDataURL={asset.metadata?.lqip || undefined}
                    className="object-contain"
                    fill
                    placeholder={asset.metadata?.lqip ? "blur" : undefined}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src={urlFor({ asset }).width(1400).fit("max").url()}
                  />
                ) : null}
              </div>
              <div className="mx-auto w-full max-w-prose space-y-8 lg:mx-0 lg:max-w-lg">
                <div className="space-y-3">
                  <h2 className="text-3xl leading-tight text-emphasis sm:text-4xl">
                    <span className="font-bold">{card.shortName}</span>
                    {kindWord ? ` ${kindWord}` : null}
                  </h2>
                  {_type === "hoagieMenu" && dressing ? (
                    <p className="font-semibold tracking-wide uppercase">
                      with Marianna’s <span className="text-link">{dressing}</span>
                    </p>
                  ) : null}
                </div>
                {stegaClean(card.shortDescription)?.trim() ? (
                  <p className="text-xl leading-relaxed text-muted-foreground">{card.shortDescription}</p>
                ) : null}
                <SiteButton
                  button={{
                    text: "Details",
                    href,
                    colour: "accent",
                    icon: DETAILS_ICON[_type],
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
