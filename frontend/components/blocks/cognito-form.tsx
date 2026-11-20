import RichTextContent from "@/components/rich-text-content";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import type { PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Script from "next/script";
import {
  COGNITO_IFRAME_SCRIPT_SRC,
  cognitoFormId,
  cognitoFormUrl,
} from "../../../shared/cognito";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type CognitoFormBlock = Extract<PageBlock, { _type: "cognitoForm" }>;

type CognitoFormProps = CognitoFormBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below.
export function hasCognitoFormContent(
  block: Pick<CognitoFormBlock, "formId" | "title">,
) {
  return Boolean(
    cognitoFormId(stegaClean(block.formId)) && stegaClean(block.title)?.trim(),
  );
}

// The form is Cognito's own iframe (spec decision 15); Cognito's iframe script
// sizes it to the form. These are the only third-party scripts the section
// loads, and only on a page that holds a form.
export default function CognitoForm({
  bottom = "outer",
  dataAttribute,
  formId,
  intro,
  theme,
  title,
  top = "outer",
}: CognitoFormProps) {
  if (!hasCognitoFormContent({ formId, title })) return null;

  const id = cognitoFormId(stegaClean(formId)) as string;
  const label = stegaClean(title)?.trim();

  return (
    <section
      aria-label={label}
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container">
        <div className="mx-auto max-w-3xl">
          {intro?.length ? (
            <RichTextContent
              className="mb-10"
              dataSanity={dataAttribute?.("intro")}
              value={intro as PortableTextProps["value"]}
            />
          ) : null}
          <div data-sanity={dataAttribute?.("formId")}>
            <iframe
              allow="payment"
              className="block w-full border-0"
              height={600}
              src={cognitoFormUrl(id)}
              title={label}
            />
          </div>
        </div>
      </div>
      <Script src={COGNITO_IFRAME_SCRIPT_SRC} strategy="afterInteractive" />
    </section>
  );
}
