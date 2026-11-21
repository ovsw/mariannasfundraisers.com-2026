// Customer quotes beside a photo (spec decision 12, issue #18). The quotes are
// `testimonial` records; a visitor steps through them one at a time.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";
import TestimonialCarousel from "./testimonial-carousel";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type TestimonialsBlock = Extract<PageBlock, { _type: "testimonials" }>;

type Testimonial = NonNullable<NonNullable<TestimonialsBlock["testimonials"]>[number]>;

type TestimonialsProps = TestimonialsBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// A reference to an unpublished testimonial resolves to null. A testimonial
// needs its name and its quote, which Studio requires.
function isShownTestimonial(testimonial: Testimonial | null | undefined): testimonial is Testimonial {
  return Boolean(testimonial && stegaClean(testimonial.name)?.trim() && testimonial.body?.length);
}

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below. Studio
// requires the heading, the photo and one testimonial; a testimonial that is
// not published is not the editor's to fix here, so with none the section
// draws nothing.
export function hasTestimonialsContent(
  block: Pick<TestimonialsBlock, "title" | "image" | "testimonials">,
) {
  return Boolean(
    stegaClean(block.title)?.trim() &&
      block.image?.asset?.url &&
      (block.testimonials ?? []).some(isShownTestimonial),
  );
}

function QuoteMark() {
  return (
    <svg aria-hidden="true" className="h-7 w-6" fill="currentColor" viewBox="0 0 26 27">
      <path d="M25.258 14.33h-5.961c.102-4.772 1.334-5.314 2.881-5.468l.597-.081V3.532l-.688.04c-2.02.126-4.255.526-5.745 2.548-1.307 1.772-1.883 4.667-1.883 9.112v8.235h10.799v-9.136ZM11.48 23.467v-9.136H5.599C5.7 9.558 6.893 9.016 8.44 8.86l.557-.08V3.532l-.677.04c-2.02.126-4.276.526-5.766 2.548C1.248 7.892.66 10.787.66 15.232v8.235h10.82Z" />
    </svg>
  );
}

export default function Testimonials({
  _key,
  bottom = "outer",
  dataAttribute,
  eyebrow,
  image,
  testimonials,
  theme,
  title,
  top = "outer",
}: TestimonialsProps) {
  const asset = image?.asset;
  if (!asset?.url || !hasTestimonialsContent({ title, image, testimonials })) return null;

  const headingId = `testimonials-${stegaClean(_key)}-title`;
  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const shown = (testimonials ?? []).filter(isShownTestimonial);

  const heading = (
    <h2 className="text-foreground" id={headingId}>
      {displayEyebrow ? (
        <span
          className="block font-condensed text-[2.25rem] leading-none font-bold text-soft-foreground italic md:text-[2.625rem]"
          data-sanity={dataAttribute?.("eyebrow")}
        >
          {eyebrow}
        </span>
      ) : null}
      <span
        className="block text-[2.875rem] leading-none font-bold md:text-[3.8125rem]"
        data-sanity={dataAttribute?.("title")}
      >
        {title}
      </span>
    </h2>
  );

  const slides = shown.map((testimonial) => ({
    key: testimonial._id,
    content: (
      <figure className="space-y-8 px-6 pt-6 pb-10">
        <blockquote className="max-w-xl space-y-4 text-xl text-foreground italic">
          <QuoteMark />
          <PortableText
            components={simpleRichTextComponents}
            value={testimonial.body as PortableTextProps["value"]}
          />
        </blockquote>
        <figcaption className="tracking-wider">
          <span className="block font-semibold text-mark">{testimonial.name}</span>
          {stegaClean(testimonial.title)?.trim() ? (
            <span className="block text-muted-foreground">{testimonial.title}</span>
          ) : null}
        </figcaption>
      </figure>
    ),
  }));

  return (
    <section
      aria-labelledby={headingId}
      className={cn(sectionSceneClassName(resolveSectionTheme(theme), top, bottom), "py-10! sm:py-20!")}
      data-sanity={dataAttribute?.("theme")}
    >
      {/* The old site's design: from the xl breakpoint the photo stands on the
          section's bottom edge and rises a little above its top one, over the
          brush stroke there. Below xl it is left out, as it was there. */}
      <div className="relative container">
        <div className="pt-10 sm:pt-20 xl:w-1/2" data-sanity={dataAttribute?.("testimonials")}>
          <TestimonialCarousel heading={heading} slides={slides} />
        </div>
        <div className="absolute -top-24 right-6 -bottom-10 z-10 hidden aspect-[668/872] sm:-bottom-20 xl:block min-[1344px]:right-0">
          <Image
            alt={stegaClean(image?.alt)?.trim() || ""}
            className="object-contain object-bottom"
            data-sanity={dataAttribute?.("image")}
            fill
            sizes="(min-width: 1280px) 36rem, 100vw"
            src={urlFor({ asset }).width(900).fit("max").url()}
          />
        </div>
      </div>
    </section>
  );
}
