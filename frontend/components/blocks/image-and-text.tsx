// The renderer the eight image-and-text sections share (spec decision 12,
// issue #15): the old "big image" row. Each section passes its own design,
// the side its image sits on and how the image fills its frame; no field
// chooses them.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import type { PortableTextProps } from "@portabletext/react";
import { PortableText } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import RichTextContent from "@/components/rich-text-content";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { SiteButton, hasSiteButtonContent } from "@/components/site-button";
import { SiteIcon } from "@/components/site-icon";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { isSiteIconName } from "../../../shared/site-design";
import { youTubeVideoId } from "../../../shared/youtube";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";
import VideoPoster from "./video-poster";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

export type ImageAndTextType =
  | "photoLeftAndText"
  | "photoRightAndText"
  | "cutoutLeftAndText"
  | "cutoutRightAndText"
  | "badgeAndText"
  | "videoLeftAndText"
  | "videoRightAndText"
  | "imageAndIconList";

export type ImageAndTextBlock = Extract<PageBlock, { _type: ImageAndTextType }>;

export type ImageAndTextProps<T extends ImageAndTextType> = Extract<
  PageBlock,
  { _type: T }
> & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

/**
 * How a section draws its image: `photo` fills its frame and is cropped,
 * `cutout` is shown whole, `badge` is shown whole at a smaller size, `video`
 * fills its frame as the poster of a YouTube video.
 */
export type ImageAndTextDesign = {
  media: "photo" | "cutout" | "badge" | "video";
  side: "left" | "right";
};

type IconListItem = NonNullable<
  Extract<ImageAndTextBlock, { _type: "imageAndIconList" }>["items"]
>[number];

function hasItemContent(item: IconListItem) {
  return Boolean(isSiteIconName(stegaClean(item.icon)) && stegaClean(item.heading)?.trim());
}

function hasTextContent(block: Pick<ImageAndTextBlock, "eyebrow" | "title" | "richText">) {
  return Boolean(
    stegaClean(block.eyebrow)?.trim() ||
      stegaClean(block.title)?.trim() ||
      block.richText?.length,
  );
}

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below: the image,
// plus the text (or, for the icon list, an item), plus a video's link.
export function hasImageAndTextContent(block: ImageAndTextBlock) {
  if (!block.image?.asset?.url) return false;
  if (block._type === "imageAndIconList") {
    return (block.items ?? []).some(hasItemContent);
  }
  if (block._type === "videoLeftAndText" || block._type === "videoRightAndText") {
    if (!youTubeVideoId(stegaClean(block.youTubeUrl))) return false;
  }
  return hasTextContent(block);
}

type Crop = { top?: number | null; bottom?: number | null; left?: number | null; right?: number | null };

/** The crop saved in Studio, with every side set, or undefined when there is none. */
export function savedCrop(crop: Crop | null | undefined) {
  if (!crop) return undefined;
  return { top: crop.top ?? 0, bottom: crop.bottom ?? 0, left: crop.left ?? 0, right: crop.right ?? 0 };
}

/**
 * The hotspot as a CSS object position. Studio stores the hotspot against the
 * whole image, so it is moved into the cropped area the URL serves.
 */
export function objectPosition(
  hotspot: { x?: number | null; y?: number | null } | null | undefined,
  crop: ReturnType<typeof savedCrop>,
  fallback = "50% 50%",
) {
  if (hotspot?.x == null || hotspot?.y == null) return fallback;
  const { top = 0, bottom = 0, left = 0, right = 0 } = crop ?? {};
  const within = (value: number, start: number, end: number) => {
    const size = 1 - start - end;
    return size > 0 ? Math.min(1, Math.max(0, (value - start) / size)) : 0.5;
  };
  return `${Math.round(within(hotspot.x, left, right) * 100)}% ${Math.round(within(hotspot.y, top, bottom) * 100)}%`;
}

export function ImageAndText({
  block,
  design,
}: {
  block: ImageAndTextProps<ImageAndTextType>;
  design: ImageAndTextDesign;
}) {
  if (!hasImageAndTextContent(block)) return null;
  const {
    _key,
    anchorId,
    bottom = "outer",
    buttons,
    dataAttribute,
    eyebrow,
    image,
    richText,
    theme,
    title,
    top = "outer",
  } = block;
  const asset = image?.asset;
  if (!asset?.url) return null;

  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const displayTitle = stegaClean(title)?.trim();
  const headingId = displayEyebrow || displayTitle ? `image-and-text-${stegaClean(_key)}-title` : undefined;
  const anchor = stegaClean(anchorId)?.trim();
  const visibleButtons = (buttons ?? []).filter(hasSiteButtonContent);
  const items =
    block._type === "imageAndIconList" ? (block.items ?? []).filter(hasItemContent) : [];
  const videoId =
    block._type === "videoLeftAndText" || block._type === "videoRightAndText"
      ? youTubeVideoId(stegaClean(block.youTubeUrl))
      : null;
  const cover = design.media === "photo" || design.media === "video";
  const alt = stegaClean(image?.alt)?.trim() || "";
  const crop = savedCrop(image?.crop);

  const picture = (
    <Image
      alt={alt}
      blurDataURL={asset.metadata?.lqip || undefined}
      className={cn(cover ? "object-cover" : "object-contain", cover && "rounded-2xl")}
      data-sanity={dataAttribute?.("image")}
      fill
      placeholder={asset.metadata?.lqip ? "blur" : undefined}
      sizes="(min-width: 1024px) 50vw, 100vw"
      src={urlFor({ asset, crop }).width(1600).fit("max").url()}
      style={cover ? { objectPosition: objectPosition(image?.hotspot, crop) } : undefined}
    />
  );

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        sectionSceneClassName(resolveSectionTheme(theme), top, bottom),
        anchor && "scroll-mt-28",
      )}
      data-sanity={dataAttribute?.("theme")}
      id={anchor || undefined}
    >
      <div className="container">
        <div className="grid items-center gap-split lg:grid-cols-2">
          <div
            className={cn(
              "mx-auto w-full min-w-0 max-w-prose space-y-10 wrap-break-word lg:max-w-lg",
              design.side === "left" ? "lg:col-start-2 lg:ml-auto lg:mr-0" : "lg:col-start-1 lg:mr-auto lg:ml-0",
              "lg:row-start-1",
            )}
          >
            {headingId ? (
              <h2 className="text-emphasis" id={headingId}>
                {displayEyebrow ? (
                  <span
                    className="block font-condensed text-[2.25rem] leading-none font-bold text-link italic md:text-[2.625rem]"
                    data-sanity={dataAttribute?.("eyebrow")}
                  >
                    {eyebrow}
                  </span>
                ) : null}
                {displayTitle ? (
                  <span
                    className="block text-[2.875rem] leading-none font-bold md:text-[3.8125rem]"
                    data-sanity={dataAttribute?.("title")}
                  >
                    {title}
                  </span>
                ) : null}
              </h2>
            ) : null}
            {richText?.length ? (
              <RichTextContent
                className="prose-lg"
                dataSanity={dataAttribute?.("richText")}
                value={richText as PortableTextProps["value"]}
              />
            ) : null}
            {items.length ? (
              <ul className="space-y-10" data-sanity={dataAttribute?.("items")}>
                {items.map((item) => (
                  <li className="space-y-3" key={item._key}>
                    <h3 className="flex items-center gap-4 text-2xl font-bold text-emphasis">
                      <SiteIcon name={stegaClean(item.icon) as Parameters<typeof SiteIcon>[0]["name"]} />
                      {item.heading}
                    </h3>
                    {item.text?.length ? (
                      <div className="space-y-4 text-lg text-muted-foreground">
                        <PortableText
                          components={simpleRichTextComponents}
                          value={item.text as PortableTextProps["value"]}
                        />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {visibleButtons.length ? (
              <div className="flex flex-wrap gap-4" data-sanity={dataAttribute?.("buttons")}>
                {visibleButtons.map((button) => (
                  // A long label wraps instead of running past a phone's edge.
                  <SiteButton
                    button={button}
                    className="max-w-full text-center whitespace-normal"
                    key={button._key}
                  />
                ))}
              </div>
            ) : null}
          </div>
          <div
            className={cn(
              "relative w-full lg:row-start-1",
              design.side === "left" ? "lg:col-start-1" : "lg:col-start-2",
              design.media === "badge"
                ? "h-80 md:h-96"
                : "aspect-square lg:aspect-auto lg:h-full lg:min-h-[25rem]",
            )}
          >
            {design.media === "video" && videoId ? (
              <VideoPoster title={displayTitle || displayEyebrow || "Marianna’s Fundraisers video"} videoId={videoId}>
                {picture}
              </VideoPoster>
            ) : (
              picture
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
