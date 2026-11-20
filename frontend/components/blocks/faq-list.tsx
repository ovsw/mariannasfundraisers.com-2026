import RichTextContent from "@/components/rich-text-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import type { PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type FaqListBlock = Extract<PageBlock, { _type: "faqList" }>;
type Faq = NonNullable<FaqListBlock["faqs"]>[number];

type FaqListProps = FaqListBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// Studio requires an FAQ's question and answer; an FAQ that is not
// published reaches the Website as nothing and is left out.
function isVisibleFaq(faq: Faq | null): faq is Faq {
  return Boolean(faq && stegaClean(faq.title)?.trim() && faq.body?.length);
}

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below.
export function hasFaqListContent(block: Pick<FaqListBlock, "faqs" | "title">) {
  return Boolean(
    stegaClean(block.title)?.trim() && (block.faqs ?? []).some(isVisibleFaq),
  );
}

export default function FaqList({
  _key,
  bottom = "outer",
  dataAttribute,
  faqs,
  theme,
  title,
  top = "outer",
}: FaqListProps) {
  if (!hasFaqListContent({ faqs, title })) return null;

  const headingId = `faq-list-${stegaClean(_key)}-title`;
  const visibleFaqs = (faqs ?? []).filter(isVisibleFaq);

  return (
    <section
      aria-labelledby={headingId}
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <h2
            className="typo-section-heading text-center text-foreground"
            data-sanity={dataAttribute?.("title")}
            id={headingId}
          >
            {title}
          </h2>
          <Accordion
            className="mt-10 border-t border-border"
            data-sanity={dataAttribute?.("faqs")}
            type="multiple"
          >
            {visibleFaqs.map((faq) => (
              <AccordionItem
                className="border-border"
                key={faq._id}
                value={faq._id}
              >
                <AccordionTrigger className="items-center py-5 text-lg font-semibold text-foreground hover:no-underline data-[state=open]:text-emphasis">
                  {faq.title}
                </AccordionTrigger>
                <AccordionContent className="pr-10">
                  <RichTextContent
                    className="prose-lg"
                    value={faq.body as PortableTextProps["value"]}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
