import RichTextContent from "@/components/rich-text-content";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import type { PortableTextProps } from "@portabletext/react";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type TwoTextColumnsBlock = Extract<PageBlock, { _type: "twoTextColumns" }>;

type TwoTextColumnsProps = TwoTextColumnsBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below. Studio
// requires both texts, so one alone never turns the section into one column.
export function hasTwoTextColumnsContent(
  block: Pick<TwoTextColumnsBlock, "leftText" | "rightText">,
) {
  return Boolean(block.leftText?.length && block.rightText?.length);
}

export default function TwoTextColumns({
  bottom = "outer",
  dataAttribute,
  leftText,
  rightText,
  theme,
  top = "outer",
}: TwoTextColumnsProps) {
  if (!hasTwoTextColumnsContent({ leftText, rightText })) return null;

  return (
    <section
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2 md:gap-14">
          <RichTextContent
            dataSanity={dataAttribute?.("leftText")}
            value={leftText as PortableTextProps["value"]}
          />
          <RichTextContent
            dataSanity={dataAttribute?.("rightText")}
            value={rightText as PortableTextProps["value"]}
          />
        </div>
      </div>
    </section>
  );
}
