// The top of the home page (spec decision 12, issue #18): the photo with a
// large title, a short text and buttons on its left, as on the old site.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { SiteButton, hasSiteButtonContent } from "@/components/site-button";
import { urlFor } from "@/sanity/lib/image";
import { youTubeVideoId, youTubeWatchUrl } from "../../../shared/youtube";
import { objectPosition, savedCrop } from "./image-and-text";
import { resolveSectionTheme } from "./section-boundaries";
import { SectionBrush } from "./section-brush";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type HomeHeroBlock = Extract<PageBlock, { _type: "homeHero" }>;

type HomeHeroProps = HomeHeroBlock & {
  dataAttribute?: (path: string) => string | undefined;
};

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below. Studio
// requires the photo and the title.
export function hasHomeHeroContent(block: Pick<HomeHeroBlock, "image" | "title">) {
  return Boolean(block.image?.asset?.url && stegaClean(block.title)?.trim());
}

/** The button the YouTube link adds: it opens the video on YouTube. */
export function homeHeroVideoButton(youTubeUrl: string | null | undefined) {
  const videoId = youTubeVideoId(stegaClean(youTubeUrl));
  if (!videoId) return null;
  return {
    _key: "youtube",
    text: "Watch the video",
    href: youTubeWatchUrl(videoId),
    openInNewTab: true,
    colour: "light-accent",
    icon: null,
  };
}

// A hero: the Page Builder treats it as themeless, so it never shares a band
// and nothing is drawn next to it. It draws its own brushed edge at its foot,
// rising into the photo in the colour of its theme (the section below it).
export default function HomeHero({
  buttons,
  dataAttribute,
  heading,
  image,
  text,
  theme,
  title,
  youTubeUrl,
}: HomeHeroProps) {
  if (!image?.asset?.url || !hasHomeHeroContent({ image, title })) return null;

  const crop = savedCrop(image.crop);
  const position = objectPosition(image.hotspot, crop, "70% 50%");
  const displayHeading = stegaClean(heading)?.trim();
  const videoButton = homeHeroVideoButton(youTubeUrl);
  const visibleButtons = [
    ...(buttons ?? []).filter(hasSiteButtonContent),
    ...(videoButton ? [videoButton] : []),
  ];

  return (
    <section
      className="relative isolate flex min-h-[clamp(26rem,52vw,43rem)] items-center overflow-hidden bg-scrim pt-12 pb-24 md:pb-28"
      data-sanity={dataAttribute?.("theme")}
    >
      <Image
        alt={stegaClean(image.alt) || ""}
        blurDataURL={image.asset.metadata?.lqip || undefined}
        className="-z-10 object-cover opacity-60 md:opacity-100"
        data-sanity={dataAttribute?.("image")}
        fill
        placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
        preload
        sizes="100vw"
        src={urlFor({ asset: image.asset, crop }).width(2400).fit("max").url()}
        style={{ objectPosition: position }}
      />
      <div className="container">
        <div className="max-w-xl space-y-6 text-primary-foreground lg:max-w-2xl">
          <h1
            className="max-w-[12em] text-5xl leading-none font-extrabold tracking-tight drop-shadow-lg md:text-6xl xl:text-7xl"
            data-sanity={dataAttribute?.("title")}
          >
            {title}
          </h1>
          {displayHeading ? (
            <p
              className="text-2xl font-bold drop-shadow-md md:text-3xl"
              data-sanity={dataAttribute?.("heading")}
            >
              {heading}
            </p>
          ) : null}
          {text?.length ? (
            <div
              className="max-w-md space-y-4 text-lg leading-relaxed drop-shadow-md lg:text-xl"
              data-sanity={dataAttribute?.("text")}
            >
              <PortableText
                components={simpleRichTextComponents}
                value={text as PortableTextProps["value"]}
              />
            </div>
          ) : null}
          {visibleButtons.length ? (
            <div className="flex flex-wrap gap-4 pt-4" data-sanity={dataAttribute?.("buttons")}>
              {visibleButtons.map((button) => (
                <SiteButton button={button} className="max-w-full text-center whitespace-normal" key={button._key} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <SectionBrush edge="top" theme={resolveSectionTheme(theme)} />
      </div>
    </section>
  );
}
