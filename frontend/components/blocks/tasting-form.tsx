import { TastingFormFields } from "@/components/forms/tasting-form-fields";
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

type TastingFormBlock = Extract<PageBlock, { _type: "tastingForm" }>;

type TastingFormProps = TastingFormBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below. Studio
// requires the text.
export function hasTastingFormContent(block: Pick<TastingFormBlock, "richText">) {
  return Boolean(block.richText?.length);
}

// The free tasting form (old Cognito form 168) beside a text: the design of
// the old free tasting page. Two halves of the content box, 3.5rem apart from
// the md breakpoint, the text on the left and the form on the right. Below md
// the text comes first and the form follows it, 1.5rem lower.
export default function TastingForm({
  bottom = "outer",
  dataAttribute,
  richText,
  theme,
  top = "outer",
}: TastingFormProps) {
  if (!hasTastingFormContent({ richText })) return null;

  return (
    <section
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container flex flex-col gap-6 md:flex-row md:gap-14">
        <RichTextContent
          className="w-full prose-base md:w-1/2 xl:prose-xl"
          dataSanity={dataAttribute?.("richText")}
          value={richText as PortableTextProps["value"]}
        />
        <div className="w-full md:w-1/2">
          <TastingFormFields />
        </div>
      </div>
    </section>
  );
}
