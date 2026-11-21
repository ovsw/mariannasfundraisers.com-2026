// A heading group over a centred prose body and buttons; each part is optional.
// The old site's text section: a 64rem box with the heading group and buttons
// at its left edge and the running text in a centred 65-character column. A
// heading with nothing under it heads the sections that follow it, so it
// stands at the full content width, as the old site's heading rows did.
import RichTextContent from "@/components/rich-text-content";
import { SiteButton, hasSiteButtonContent } from "@/components/site-button";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import type { PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import { cn } from "@/lib/utils";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionBoundary,
} from "./section-boundaries";

type RichTextBlockData = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "richTextBlock" }
>;

// Under the section's title the text's own headings start at h3, but the old
// site drew them at its h2 size (the typography plugin's h2 at prose-base and
// prose-xl), so a titled block draws its h3s that large.
const titledTextHeadingClassName =
  "prose-h3:mt-[2em] prose-h3:mb-[1em] prose-h3:text-[1.5em] prose-h3:leading-[1.3333333] prose-h3:font-bold xl:prose-h3:mt-[1.5555556em] xl:prose-h3:mb-[0.8888889em] xl:prose-h3:text-[1.8em] xl:prose-h3:leading-[1.1111111] [&>h3:first-child]:mt-0";

type RichTextBlockProps = RichTextBlockData & {
  dataAttribute?: (path: string) => string | undefined;
  top?: SectionBoundary;
  bottom?: SectionBoundary;
};

export default function RichTextBlock({
  _key,
  anchorId,
  buttons,
  dataAttribute,
  eyebrow,
  richText,
  title,
  top = "outer",
  bottom = "outer",
  theme,
}: RichTextBlockProps) {
  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const displayTitle = stegaClean(title)?.trim();
  const headingId =
    displayEyebrow || displayTitle
      ? `rich-text-${stegaClean(_key)}-title`
      : undefined;

  if (!(displayEyebrow || displayTitle || richText?.length)) return null;

  const visibleButtons = (buttons ?? []).filter(hasSiteButtonContent);
  const hasBody = Boolean(richText?.length || visibleButtons.length);
  const anchor = stegaClean(anchorId)?.trim();

  return (
    <section
      data-sanity={dataAttribute?.("theme")}
      aria-labelledby={headingId}
      className={cn(
        sectionSceneClassName(resolveSectionTheme(theme), top, bottom),
        anchor && "scroll-mt-28",
      )}
      id={anchor || undefined}
    >
      <div className="container">
        <div className={cn(hasBody && "mx-auto max-w-5xl")}>
          {/* The old site's heading group: a red condensed eyebrow over a
              large green title, at the left edge of the box. */}
          {displayEyebrow || displayTitle ? (
            <h2 className={cn("text-emphasis", hasBody && "mb-20")} id={headingId}>
              {displayEyebrow ? (
                <span
                  className="block font-condensed text-[2.25rem] leading-none font-bold text-link italic md:text-[2.625rem]"
                  data-sanity={dataAttribute?.("eyebrow")}
                >
                  {eyebrow}
                </span>
              ) : null}
              {displayTitle ? (
                <span
                  className="block text-[2.875rem] leading-none font-bold md:text-[3.8125rem]"
                  data-sanity={dataAttribute?.("title")}
                >
                  {title}
                </span>
              ) : null}
            </h2>
          ) : null}
          {richText?.length ? (
            <RichTextContent
              className={cn(
                "mx-auto max-w-[65ch] prose-base xl:prose-xl",
                headingId && titledTextHeadingClassName,
              )}
              dataSanity={dataAttribute?.("richText")}
              value={richText as PortableTextProps["value"]}
            />
          ) : null}
          {visibleButtons.length ? (
            <div
              className={cn(
                "flex flex-wrap gap-x-4 gap-y-6",
                richText?.length && "mt-20",
              )}
              data-sanity={dataAttribute?.("buttons")}
            >
              {visibleButtons.map((button) => (
                // A long label wraps instead of running past a phone's edge.
                <SiteButton
                  button={button}
                  className="max-w-full text-center whitespace-normal"
                  key={button._key}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
