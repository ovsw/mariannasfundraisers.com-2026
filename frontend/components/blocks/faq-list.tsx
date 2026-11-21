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
        {/* The old site's FAQ: a bold centred heading over a 48rem list of
            questions, a 2px rule above the list and hairlines between the
            questions; an open question turns red and its answer is large
            running text. */}
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-center text-3xl font-bold text-foreground sm:text-5xl sm:leading-none"
            data-sanity={dataAttribute?.("title")}
            id={headingId}
          >
            {title}
          </h2>
          <Accordion
            className="mt-12 border-t-2 border-border"
            data-sanity={dataAttribute?.("faqs")}
            type="multiple"
          >
            {visibleFaqs.map((faq) => (
              <AccordionItem
                className="border-border pb-6"
                key={faq._id}
                value={faq._id}
              >
                <AccordionTrigger className="items-center gap-6 pt-6 pb-0 text-2xl font-semibold text-foreground hover:no-underline data-[state=open]:text-link/70 [&>svg]:size-6 [&>svg]:translate-y-0">
                  {faq.title}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pr-12 pb-0">
                  <RichTextContent
                    className="max-w-[65ch] prose-xl"
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
