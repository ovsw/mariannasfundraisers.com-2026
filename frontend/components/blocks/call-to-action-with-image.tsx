// A closing call to action beside a cut-out photo (spec decision 12, issue
// #18). The product page template draws its shared call to action with this
// renderer too, so the design lives in one place.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import type { PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import RichTextContent from "@/components/rich-text-content";
import { SiteButton, hasSiteButtonContent } from "@/components/site-button";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { savedCrop } from "./image-and-text";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

export type CallToActionWithImageBlock = Extract<PageBlock, { _type: "callToActionWithImage" }>;

export type CallToActionWithImageProps = CallToActionWithImageBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below. Studio
// requires the heading and the photo.
export function hasCallToActionWithImageContent(
  block: Pick<CallToActionWithImageBlock, "title" | "image">,
) {
  return Boolean(stegaClean(block.title)?.trim() && block.image?.asset?.url);
}

export default function CallToActionWithImage({
  _key,
  bottom = "outer",
  buttons,
  dataAttribute,
  image,
  richText,
  theme,
  title,
  top = "outer",
}: CallToActionWithImageProps) {
  const asset = image?.asset;
  if (!asset?.url || !hasCallToActionWithImageContent({ title, image })) return null;

  const visibleButtons = (buttons ?? []).filter(hasSiteButtonContent);
  const headingId = `call-to-action-${stegaClean(_key)}-title`;

  return (
    // The old site's design: 5rem above and below the text, straight edges,
    // and from the lg breakpoint a square photo that stands on the section's
    // bottom edge and rises 6rem above its top one. Below lg the photo is
    // left out, as it was there.
    <section
      aria-labelledby={headingId}
      className={cn(
        sectionSceneClassName(resolveSectionTheme(theme), top, bottom),
        "z-10 py-10! sm:py-20!",
      )}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="relative container flex min-h-[290px] items-center justify-center lg:justify-start">
        <div className="space-y-8 px-[4%] lg:max-w-[33rem] lg:px-1 xl:max-w-[39rem] min-[84rem]:max-w-[42rem] min-[84rem]:px-7">
          <div className="space-y-4 text-center lg:text-left">
            <h2
              className="text-4xl leading-none font-bold text-emphasis md:text-5xl"
              data-sanity={dataAttribute?.("title")}
              id={headingId}
            >
              {title}
            </h2>
            {richText?.length ? (
              <RichTextContent
                className="prose-base xl:prose-xl"
                dataSanity={dataAttribute?.("richText")}
                value={richText as PortableTextProps["value"]}
              />
            ) : null}
          </div>
          {visibleButtons.length ? (
            <div
              className="flex flex-wrap justify-center gap-4 lg:justify-start"
              data-sanity={dataAttribute?.("buttons")}
            >
              {visibleButtons.map((button) => (
                <SiteButton button={button} className="max-w-full text-center whitespace-normal" key={button._key} />
              ))}
            </div>
          ) : null}
        </div>
        <div className="absolute -top-44 right-6 -bottom-10 hidden aspect-square sm:-bottom-20 lg:block min-[1344px]:right-0">
          <Image
            alt={stegaClean(image?.alt)?.trim() || ""}
            className="object-contain object-bottom"
            data-sanity={dataAttribute?.("image")}
            fill
            sizes="(min-width: 1024px) 36rem, 100vw"
            src={urlFor({ asset, crop: savedCrop(image?.crop) }).width(1200).fit("max").url()}
          />
        </div>
      </div>
    </section>
  );
}
