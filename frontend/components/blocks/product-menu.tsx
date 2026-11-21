// The renderer the Hoagie, Pizza and Salsa menus share (spec decision 12):
// one menu card per product, in the editor's order, each with a Details
// button to the product's page. The card's content lives on the product.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import { SiteButton } from "@/components/site-button";
import { cn } from "@/lib/utils";
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

/** The old site's row spacing and photo size for each menu. */
const NARROW_PHOTO_ROW = "mt-20 first:mt-10 lg:mt-28 lg:first:mt-[4.5rem]";
const LAYOUT: Record<
  ProductMenuType,
  { row: string; photoTop: string; photo: string; content: string; sizes: string; sourceWidth: number }
> = {
  hoagieMenu: {
    row: "mt-20 first:mt-10 md:mt-24 md:first:mt-14",
    photoTop: "lg:top-20",
    photo: "-mr-32 -ml-40 -rotate-3 md:ml-10 lg:m-0 lg:w-[1200px] lg:max-w-[100vw] lg:rotate-0",
    content: "sm:pt-5",
    sizes: "(min-width: 1024px) 1200px, 150vw",
    sourceWidth: 1717,
  },
  pizzaMenu: {
    row: NARROW_PHOTO_ROW,
    photoTop: "",
    photo: "w-[800px] max-w-[100vw] px-10 md:w-[600px] lg:px-0",
    content: "",
    sizes: "(min-width: 768px) 600px, 100vw",
    sourceWidth: 1200,
  },
  salsaMenu: {
    row: NARROW_PHOTO_ROW,
    photoTop: "",
    photo: "w-[800px] max-w-[100vw] px-10 md:w-[400px] lg:px-0",
    content: "",
    sizes: "(min-width: 768px) 400px, 100vw",
    sourceWidth: 800,
  },
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
  const layout = LAYOUT[_type];

  return (
    // The old site's menu listing: the text sits in the left half of the
    // content box and the product photo starts at the middle of the page. A
    // hoagie photo is 1200px wide and runs off the right edge; below lg it
    // comes first, tilted and wider than the page. Pizza and salsa photos are
    // narrower and stand a little taller than their row.
    <section
      aria-label={`${kindWord ?? "Salsa"} menu`}
      className={cn(sectionSceneClassName(resolveSectionTheme(theme), top, bottom), "overflow-x-clip")}
      data-sanity={dataAttribute?.("theme")}
    >
      <ul data-sanity={dataAttribute?.("products")}>
        {cards.map((card) => {
          const dressing = DRESSINGS[stegaClean(card.dressing) ?? ""];
          const asset = card.image?.asset;
          const href = productPath(stegaClean(card.kind), stegaClean(card.slug));
          const dimensions = asset?.metadata?.dimensions;
          return (
            // The first row's gap is 2.5rem less: the seam above the menu
            // already holds the section that far from the row before it.
            <li className={cn("relative", layout.row)} key={`${_key}-${card._id}`}>
              <div className={cn("lg:absolute lg:left-1/2", layout.photoTop)}>
                <div className={layout.photo}>
                  {asset?.url ? (
                    <Image
                      alt={stegaClean(card.image?.alt)?.trim() || ""}
                      blurDataURL={asset.metadata?.lqip || undefined}
                      className="h-auto w-full"
                      height={dimensions?.height ?? 784}
                      placeholder={asset.metadata?.lqip ? "blur" : undefined}
                      sizes={layout.sizes}
                      src={urlFor({ asset }).width(layout.sourceWidth).fit("max").url()}
                      width={dimensions?.width ?? 1717}
                    />
                  ) : null}
                </div>
              </div>
              <div className={cn("relative container pb-16 lg:grid lg:min-h-[400px] lg:grid-cols-2", layout.content)}>
                <div className="lg:flex lg:items-center lg:px-10 lg:pb-12">
                  <div className="max-w-prose space-y-8 px-6 lg:max-w-lg lg:px-0">
                    <div>
                      <h2 className="mt-2 text-3xl leading-8 tracking-tight text-foreground sm:text-4xl sm:leading-10">
                        <span className="font-bold">{card.shortName}</span>
                        {kindWord ? ` ${kindWord}` : null}
                      </h2>
                      {_type === "hoagieMenu" && dressing ? (
                        <p className="mt-3 leading-6 font-semibold tracking-wide text-muted-foreground uppercase">
                          with Marianna’s <span className="text-link">{dressing}</span>
                        </p>
                      ) : null}
                    </div>
                    {stegaClean(card.shortDescription)?.trim() ? (
                      <p className="text-xl leading-9 text-muted-foreground">{card.shortDescription}</p>
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
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
