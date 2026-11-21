import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { cn } from "@/lib/utils";
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

// The old page heading section: a large bold title centred across the content
// box, with 2.5rem below it, over an introduction in large grey text at most
// 65 characters wide. Under a hero it starts just below the hero's brushed
// edge (8px, the title 20px further down), since the hero's frame already
// holds the space; at the top of a page it starts 80px down. Its band ends
// 40px below the text (56px below the lg breakpoint).
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
      className={cn(
        sectionSceneClassName(resolveSectionTheme(theme), top, bottom),
        top === "edge" && "pt-2!",
        top === "outer" && "pt-20!",
        bottom !== "seam" && "pb-14! lg:pb-10!",
      )}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container">
        <header className="text-center">
          <h1
            className="mt-5 mb-10 text-[2.875rem] leading-none font-bold text-emphasis md:text-[3.8125rem]"
            data-sanity={dataAttribute?.("title")}
          >
            {title}
          </h1>
          {intro?.length ? (
            <div
              className="mx-auto max-w-[65ch] space-y-[1.2em] text-xl leading-[1.8] text-muted-foreground"
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
