// Shadcnblocks blogpost1: centered prose body.
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
  const headingId = displayTitle
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
        <div className="mx-auto max-w-3xl">
        {displayEyebrow || displayTitle ? (
          <header className="mb-8 space-y-4">
            {displayEyebrow ? (
              <p
                className="text-sm font-medium text-muted-foreground"
                data-sanity={dataAttribute?.("eyebrow")}
              >
                {eyebrow}
              </p>
            ) : null}
            {displayTitle ? (
              <h2
                className="text-3xl font-extrabold tracking-tight"
                data-sanity={dataAttribute?.("title")}
                id={headingId}
              >
                {title}
              </h2>
            ) : null}
          </header>
        ) : null}
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
              <SiteButton button={button} key={button._key} />
            ))}
          </div>
        ) : null}
        </div>
      </div>
    </section>
  );
}
