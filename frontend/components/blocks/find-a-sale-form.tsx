import { FindASaleFormFields } from "@/components/forms/find-a-sale-form-fields";
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

type FindASaleFormBlock = Extract<PageBlock, { _type: "findASaleForm" }>;

type FindASaleFormProps = FindASaleFormBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The form itself is code, so the section always has content. Keep this rule
// aligned with the renderer below.
export function hasFindASaleFormContent() {
  return true;
}

// The find a sale form (old Cognito form 173), under an optional
// introduction, in one centred column.
export default function FindASaleForm({
  bottom = "outer",
  dataAttribute,
  intro,
  theme,
  top = "outer",
}: FindASaleFormProps) {
  return (
    <section
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container">
        {intro?.length ? (
          <RichTextContent
            className="mx-auto mb-10 max-w-3xl"
            dataSanity={dataAttribute?.("intro")}
            value={intro as PortableTextProps["value"]}
          />
        ) : null}
        <div className="mx-auto max-w-3xl">
          <FindASaleFormFields />
        </div>
      </div>
    </section>
  );
}
