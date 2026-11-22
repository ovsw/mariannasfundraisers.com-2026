import { ContactFormFields } from "@/components/forms/contact-form-fields";
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

type ContactFormBlock = Extract<PageBlock, { _type: "contactForm" }>;

type ContactFormProps = ContactFormBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The form itself is code, so the section always has content. Keep this rule
// aligned with the renderer below.
export function hasContactFormContent() {
  return true;
}

// The contact form (old Cognito form 114), under an optional introduction,
// in one centred column.
export default function ContactForm({
  bottom = "outer",
  dataAttribute,
  intro,
  theme,
  top = "outer",
}: ContactFormProps) {
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
          <ContactFormFields />
        </div>
      </div>
    </section>
  );
}
