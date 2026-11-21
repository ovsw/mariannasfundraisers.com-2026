// A heading group over a centred prose body and buttons; each part is optional.
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
        {/* The old site's heading group: a red condensed eyebrow over a large
            green title, at the left edge of the content. */}
        {displayEyebrow || displayTitle ? (
          <h2 className={cn("text-emphasis", richText?.length && "mb-10")} id={headingId}>
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
        <div className="mx-auto max-w-3xl">
        {richText?.length ? (
          <RichTextContent
            dataSanity={dataAttribute?.("richText")}
            value={richText as PortableTextProps["value"]}
          />
        ) : null}
        {visibleButtons.length ? (
          <div
            className="mt-8 flex flex-wrap gap-4"
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
