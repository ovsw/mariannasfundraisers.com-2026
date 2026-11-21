// The home page's food teaser (spec decision 12, issue #18): a heading and an
// introduction over two parts, each a large cut-out photo beside its text.
// The first part has its photo on the right, the second on the left; the
// order is the design.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
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
      className={cn(sectionSceneClassName(resolveSectionTheme(theme), top, bottom), "overflow-hidden")}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container space-y-10">
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
          <div
            className="max-w-3xl space-y-4 text-lg text-muted-foreground [&_strong]:text-soft-foreground"
            data-sanity={dataAttribute?.("intro")}
          >
            <PortableText
              components={simpleRichTextComponents}
              value={intro as PortableTextProps["value"]}
            />
          </div>
        ) : null}
      </div>
      <div className="container mt-14 space-y-16 lg:mt-24 lg:space-y-28">
        {items.map((item, index) => {
          const asset = item.image?.asset;
          if (!asset?.url) return null;
          const photoLeft = index === 1;
          const visibleButtons = (item.buttons ?? []).filter(hasSiteButtonContent);
          const width = asset.metadata?.dimensions?.width ?? 1600;
          const height = asset.metadata?.dimensions?.height ?? 1000;
          return (
            <div
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              data-sanity={dataAttribute?.(`items[_key=="${item._key}"]`)}
              key={item._key}
            >
              <div
                className={cn(
                  "relative lg:row-start-1",
                  photoLeft ? "lg:col-start-1 lg:-ml-[12vw]" : "lg:col-start-2 lg:-mr-[12vw]",
                )}
              >
                <Image
                  alt={stegaClean(item.image?.alt)?.trim() || ""}
                  className="h-auto w-full"
                  height={height}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  src={urlFor({ asset }).width(1800).fit("max").url()}
                  width={width}
                />
              </div>
              <div
                className={cn(
                  "mx-auto w-full max-w-prose space-y-8 lg:row-start-1 lg:max-w-lg",
                  photoLeft ? "lg:col-start-2 lg:mr-0 lg:ml-auto" : "lg:col-start-1 lg:mr-auto lg:ml-0",
                )}
              >
                <h3 className="text-4xl leading-tight font-bold text-emphasis">{item.heading}</h3>
                {item.text?.length ? (
                  <RichTextContent value={item.text as PortableTextProps["value"]} />
                ) : null}
                {visibleButtons.length ? (
                  <div className="flex flex-wrap gap-4">
                    {visibleButtons.map((button) => (
                      <SiteButton button={button} className="max-w-full text-center whitespace-normal" key={button._key} />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
