// Numbered steps side by side, joined by a dotted path (spec decision 12,
// issue #18): the old "How it Works" steps of the home page.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import { CustomLinkMarkRenderer } from "@/components/portable-text/custom-link-mark";
import { urlFor } from "@/sanity/lib/image";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type StepsBlock = Extract<PageBlock, { _type: "steps" }>;

type StepItem = NonNullable<StepsBlock["items"]>[number];

type StepsProps = StepsBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The old step text: a short list of small grey lines, each after a red
// bullet that hangs in the margin, with bold keywords.
const stepTextComponents: PortableTextProps["components"] = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-4">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="py-1 before:-ml-4 before:inline-block before:w-4 before:text-mark before:content-['•']">
        {children}
      </li>
    ),
    number: ({ children }) => <li className="py-1">{children}</li>,
  },
  marks: {
    customLink: CustomLinkMarkRenderer,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  },
};

function hasStepContent(item: StepItem) {
  return Boolean(item.image?.asset?.url && stegaClean(item.title)?.trim());
}

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below. Studio
// requires each step's picture and title.
export function hasStepsContent(block: Pick<StepsBlock, "items">) {
  return (block.items ?? []).some(hasStepContent);
}

export default function Steps({
  bottom = "outer",
  dataAttribute,
  items,
  theme,
  top = "outer",
}: StepsProps) {
  if (!hasStepsContent({ items })) return null;
  const steps = (items ?? []).filter(hasStepContent);

  return (
    <section
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container">
        <div className="relative">
          {steps.length > 1 ? (
            <svg
              aria-hidden="true"
              className="absolute inset-x-0 top-16 hidden h-24 w-full text-border-strong md:block"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 1200 100"
            >
              <path
                d="M0 70 C 200 20, 400 10, 600 60 S 1000 90, 1200 10"
                stroke="currentColor"
                strokeDasharray="10 12"
                strokeLinecap="round"
                strokeWidth="5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : null}
          <ol className="relative grid gap-10 sm:gap-14 md:grid-cols-3 md:gap-5 lg:gap-20">
            {steps.map((step, index) => {
              const asset = step.image?.asset;
              if (!asset?.url) return null;
              return (
              <li
                className="min-w-0"
                data-sanity={dataAttribute?.(`items[_key=="${step._key}"]`)}
                key={step._key}
              >
                {/* The picture shows from md up, as on the old site. */}
                <div className="relative mx-auto mb-8 hidden size-40 md:block">
                  <Image
                    alt={stegaClean(step.image?.alt)?.trim() || ""}
                    className="object-contain"
                    fill
                    sizes="10rem"
                    src={urlFor({ asset }).width(400).fit("max").url()}
                  />
                </div>
                <h3 className="flex items-start text-3xl font-normal text-foreground">
                  <span
                    aria-hidden="true"
                    className="mr-4 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground"
                  >
                    {index + 1}
                  </span>
                  <span className="py-1 text-2xl lg:font-semibold">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </span>
                </h3>
                {step.text?.length ? (
                  <div className="pt-2 pl-8 text-base text-muted-foreground">
                    <PortableText
                      components={stepTextComponents}
                      value={step.text as PortableTextProps["value"]}
                    />
                  </div>
                ) : null}
              </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
