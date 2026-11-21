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
    <section
      aria-labelledby={headingId}
      className={cn(sectionSceneClassName(resolveSectionTheme(theme), top, bottom), "overflow-hidden")}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container grid items-center gap-10 lg:grid-cols-2">
        <div className="max-w-xl space-y-6">
          <h2
            className="text-4xl leading-tight font-bold text-emphasis md:text-5xl"
            data-sanity={dataAttribute?.("title")}
            id={headingId}
          >
            {title}
          </h2>
          {richText?.length ? (
            <RichTextContent
              className="prose-lg"
              dataSanity={dataAttribute?.("richText")}
              value={richText as PortableTextProps["value"]}
            />
          ) : null}
          {visibleButtons.length ? (
            <div className="flex flex-wrap gap-4 pt-2" data-sanity={dataAttribute?.("buttons")}>
              {visibleButtons.map((button) => (
                <SiteButton button={button} className="max-w-full text-center whitespace-normal" key={button._key} />
              ))}
            </div>
          ) : null}
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md lg:mr-0">
          <Image
            alt={stegaClean(image?.alt)?.trim() || ""}
            className="object-contain object-bottom"
            data-sanity={dataAttribute?.("image")}
            fill
            sizes="(min-width: 1024px) 28rem, 100vw"
            src={urlFor({ asset, crop: savedCrop(image?.crop) }).width(900).fit("max").url()}
          />
        </div>
      </div>
    </section>
  );
}
