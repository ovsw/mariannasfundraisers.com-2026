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

type CognitoFormAndTextBlock = Extract<PageBlock, { _type: "cognitoFormAndText" }>;

type CognitoFormAndTextProps = CognitoFormAndTextBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below. Studio
// requires all three.
export function hasCognitoFormAndTextContent(
  block: Pick<CognitoFormAndTextBlock, "formId" | "richText" | "title">,
) {
  return Boolean(
    cognitoFormId(stegaClean(block.formId)) &&
      stegaClean(block.title)?.trim() &&
      block.richText?.length,
  );
}

// The old site's form beside a text (its free tasting page): two halves of
// the content box, 3.5rem apart from the md breakpoint, the running text on
// the left and Cognito's iframe on the right. Below md the text comes first
// and the form follows it, 1.5rem lower. Cognito's iframe script sizes the
// iframe to the form, as in the Cognito form section.
export default function CognitoFormAndText({
  bottom = "outer",
  dataAttribute,
  formId,
  richText,
  theme,
  title,
  top = "outer",
}: CognitoFormAndTextProps) {
  if (!hasCognitoFormAndTextContent({ formId, richText, title })) return null;

  const id = cognitoFormId(stegaClean(formId)) as string;
  const label = stegaClean(title)?.trim();

  return (
    <section
      aria-label={label}
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container flex flex-col gap-6 md:flex-row md:gap-14">
        <RichTextContent
          className="w-full prose-base md:w-1/2 xl:prose-xl"
          dataSanity={dataAttribute?.("richText")}
          value={richText as PortableTextProps["value"]}
        />
        <div className="w-full md:w-1/2" data-sanity={dataAttribute?.("formId")}>
          <iframe
            allow="payment"
            className="block w-full border-0"
            height={600}
            src={cognitoFormUrl(id)}
            title={label}
          />
        </div>
      </div>
      <Script src={COGNITO_IFRAME_SCRIPT_SRC} strategy="afterInteractive" />
    </section>
  );
}
