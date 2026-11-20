import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type PageHeadingBlock = Extract<PageBlock, { _type: "pageHeading" }>;

type PageHeadingProps = PageHeadingBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below.
export function hasPageHeadingContent(block: Pick<PageHeadingBlock, "title">) {
  return Boolean(stegaClean(block.title)?.trim());
}

export default function PageHeading({
  bottom = "outer",
  dataAttribute,
  intro,
  theme,
  title,
  top = "outer",
}: PageHeadingProps) {
  if (!hasPageHeadingContent({ title })) return null;

  return (
    <section
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container">
        <header className="mx-auto max-w-3xl text-center">
          <h1
            className="typo-feature-heading text-emphasis"
            data-sanity={dataAttribute?.("title")}
          >
            {title}
          </h1>
          {intro?.length ? (
            <div
              className="mt-6 space-y-4 text-lg text-muted-foreground"
              data-sanity={dataAttribute?.("intro")}
            >
              <PortableText
                components={simpleRichTextComponents}
                value={intro as PortableTextProps["value"]}
              />
            </div>
          ) : null}
        </header>
      </div>
    </section>
  );
}
