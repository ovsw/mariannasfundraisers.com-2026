// The home page's food teaser (spec decision 12, issue #18): a heading and an
// introduction over two parts, each a large cut-out photo beside its text.
// The first part has its photo on the right, the second on the left; the
// order is the design.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import type { CSSProperties } from "react";
import RichTextContent from "@/components/rich-text-content";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { SiteButton, hasSiteButtonContent } from "@/components/site-button";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type MenuTeaserBlock = Extract<PageBlock, { _type: "menuTeaser" }>;

type MenuTeaserItem = NonNullable<MenuTeaserBlock["items"]>[number];

type MenuTeaserProps = MenuTeaserBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

function hasItemContent(item: MenuTeaserItem | undefined) {
  return Boolean(item?.image?.asset?.url && stegaClean(item.heading)?.trim());
}

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below. Studio
// requires the heading and both parts, each with its photo and heading, so the
// section never draws one part alone.
export function hasMenuTeaserContent(block: Pick<MenuTeaserBlock, "title" | "items">) {
  const items = block.items ?? [];
  return Boolean(
    stegaClean(block.title)?.trim() && items.length === 2 && items.every(hasItemContent),
  );
}

export default function MenuTeaser({
  _key,
  bottom = "outer",
  dataAttribute,
  eyebrow,
  intro,
  items,
  theme,
  title,
  top = "outer",
}: MenuTeaserProps) {
  if (!items || !hasMenuTeaserContent({ title, items })) return null;

  const headingId = `menu-teaser-${stegaClean(_key)}-title`;
  const displayEyebrow = stegaClean(eyebrow)?.trim();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        sectionSceneClassName(resolveSectionTheme(theme), top, bottom),
        // The old section padding, 2.5rem (5rem from sm); a seam keeps its own.
        top !== "seam" && "pt-10! sm:pt-20!",
        bottom !== "seam" && "pb-10! sm:pb-20!",
        "overflow-hidden",
      )}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="relative z-30 container space-y-10">
        <h2 className="text-emphasis" id={headingId}>
          {displayEyebrow ? (
            <span
              className="block font-condensed text-[2.25rem] leading-none font-bold text-link italic md:text-[2.625rem]"
              data-sanity={dataAttribute?.("eyebrow")}
            >
              {eyebrow}
            </span>
          ) : null}
          <span
            className="block text-[2.875rem] leading-none font-bold md:text-[3.8125rem]"
            data-sanity={dataAttribute?.("title")}
          >
            {title}
          </span>
        </h2>
        {intro?.length ? (
          <div className="max-w-3xl" data-sanity={dataAttribute?.("intro")}>
            <div className="prose mx-auto prose-base xl:prose-xl prose-p:text-muted-foreground [&_strong]:text-soft-foreground">
              <PortableText
                components={simpleRichTextComponents}
                value={intro as PortableTextProps["value"]}
              />
            </div>
          </div>
        ) : null}
      </div>
      {items.map((item, index) => {
        const asset = item.image?.asset;
        if (!asset?.url) return null;
        const photoLeft = index === 1;
        const visibleButtons = (item.buttons ?? []).filter(hasSiteButtonContent);
        const width = asset.metadata?.dimensions?.width ?? 1600;
        const height = asset.metadata?.dimensions?.height ?? 1000;
        // The old teaser drew each photo at its own pixel width (at most the
        // page width) from the middle of the page outwards, cut off by the
        // page edge.
        const image = (
          <Image
            alt={stegaClean(item.image?.alt)?.trim() || ""}
            className="h-auto w-full max-w-[100vw] lg:w-(--menu-teaser-image-width)"
            height={height}
            sizes={`(min-width: 1024px) ${width}px, 100vw`}
            src={urlFor({ asset }).width(Math.min(width, 2400)).fit("max").url()}
            style={{ "--menu-teaser-image-width": `${width}px` } as CSSProperties}
            width={width}
          />
        );
        const text = (
          <div
            className={cn(
              "relative z-30 mx-auto max-w-prose space-y-10 lg:max-w-lg",
              photoLeft ? "lg:mr-0 lg:ml-auto" : "lg:mr-auto lg:ml-0",
            )}
          >
            <h3 className="text-5xl font-bold text-emphasis">{item.heading}</h3>
            {item.text?.length ? (
              <RichTextContent className="prose-base xl:prose-xl" value={item.text as PortableTextProps["value"]} />
            ) : null}
            {visibleButtons.length ? (
              <div className="flex flex-wrap gap-4">
                {visibleButtons.map((button) => (
                  <SiteButton button={button} className="max-w-full text-center whitespace-normal" key={button._key} />
                ))}
              </div>
            ) : null}
          </div>
        );
        // The old content box of each part: 80rem wide with 1rem, 1.5rem
        // (sm) and 2rem (lg) inside.
        const box = "mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:grid lg:grid-cols-2 lg:px-8";
        return photoLeft ? (
          // The second part, with 15rem below it: the photo starts 25rem above
          // its heading and runs from the middle of the page to the left.
          <div
            className="relative lg:pt-60 lg:pb-60"
            data-sanity={dataAttribute?.(`items[_key=="${item._key}"]`)}
            key={item._key}
          >
            <div className={cn(box, "lg:py-40")}>
              <div className="relative lg:-top-40 lg:col-start-1">
                <div className="px-10 lg:absolute lg:right-0 lg:-top-60 lg:px-0">{image}</div>
              </div>
              <div className="lg:col-start-2 lg:pl-8">{text}</div>
            </div>
          </div>
        ) : (
          // The first part: the photo starts 6rem above its heading and runs
          // from the middle of the page to the right.
          <div
            className="relative pt-14 lg:pt-32"
            data-sanity={dataAttribute?.(`items[_key=="${item._key}"]`)}
            key={item._key}
          >
            <div className="lg:absolute lg:-top-40 lg:left-1/2">{image}</div>
            <div className={box}>
              <div className="lg:pr-8">{text}</div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
