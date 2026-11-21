// The top of the home page (spec decision 12, issue #18): the photo with a
// large title, a short text and buttons on its left, as on the old site.
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { SiteButton, hasSiteButtonContent } from "@/components/site-button";
import { youTubeVideoId, youTubeWatchUrl } from "../../../shared/youtube";
import { HeroPanel, heroTextClassName, heroTitleClassName } from "./page-banner";

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
// and nothing is drawn next to it. It draws the old hero frame (`HeroPanel`):
// a band in the colour of its theme (the section below it), the photo in a
// panel at most 1600px wide, the brushed edge rising into its foot. The old
// home hero stood 35vh tall on a phone and 60vh from the md breakpoint.
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

  const displayHeading = stegaClean(heading)?.trim();
  const videoButton = homeHeroVideoButton(youTubeUrl);
  const visibleButtons = [
    ...(buttons ?? []).filter(hasSiteButtonContent),
    ...(videoButton ? [videoButton] : []),
  ];

  return (
    <HeroPanel
      contentClassName="min-h-[35vh] py-12 md:min-h-[60vh]"
      dataAttribute={dataAttribute}
      image={image}
      // A phone shows the text over the photo, so the photo is dimmed there.
      imageClassName="opacity-60 md:opacity-100"
      theme={theme}
    >
      <h1 className={heroTitleClassName} data-sanity={dataAttribute?.("title")}>
        {title}
      </h1>
      {displayHeading ? (
        <p
          className="mt-6 text-2xl font-bold md:text-3xl"
          data-sanity={dataAttribute?.("heading")}
        >
          {heading}
        </p>
      ) : null}
      {text?.length ? (
        <div
          className={heroTextClassName}
          data-sanity={dataAttribute?.("text")}
        >
          <PortableText
            components={simpleRichTextComponents}
            value={text as PortableTextProps["value"]}
          />
        </div>
      ) : null}
      {visibleButtons.length ? (
        <div className="mt-8 flex flex-wrap gap-4" data-sanity={dataAttribute?.("buttons")}>
          {visibleButtons.map((button) => (
            <SiteButton button={button} className="max-w-full text-center whitespace-normal" key={button._key} />
          ))}
        </div>
      ) : null}
    </HeroPanel>
  );
}
