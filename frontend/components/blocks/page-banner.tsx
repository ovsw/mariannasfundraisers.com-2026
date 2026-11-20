import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import { resolveSectionTheme } from "./section-boundaries";
import { SectionBrush } from "./section-brush";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type PageBannerBlock = Extract<PageBlock, { _type: "pageBanner" }>;

type PageBannerProps = PageBannerBlock & {
  dataAttribute?: (path: string) => string | undefined;
};

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below.
export function hasPageBannerContent(block: Pick<PageBannerBlock, "image">) {
  return Boolean(block.image?.asset?.url);
}

// A hero: the Page Builder treats it as themeless, so it never shares a band
// and nothing is drawn next to it. It draws its own brushed edge at its foot,
// rising into the photo in the colour of its theme (the section below it).
export default function PageBanner({
  dataAttribute,
  image,
  theme,
  title,
}: PageBannerProps) {
  if (!image?.asset?.url || !hasPageBannerContent({ image })) return null;

  const displayTitle = stegaClean(title)?.trim();
  const hotspot = image.hotspot;
  const objectPosition =
    hotspot?.x != null && hotspot?.y != null
      ? `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%`
      : "50% 50%";

  return (
    <section
      className="relative isolate flex h-[clamp(14rem,42vw,37.5rem)] items-center overflow-hidden bg-scrim"
      data-sanity={dataAttribute?.("theme")}
    >
      <Image
        alt={stegaClean(image.alt) || ""}
        blurDataURL={image.asset.metadata?.lqip || undefined}
        className="-z-10 object-cover"
        data-sanity={dataAttribute?.("image")}
        fill
        placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
        preload
        sizes="100vw"
        src={urlFor({ asset: image.asset }).width(2400).fit("max").url()}
        style={{ objectPosition }}
      />
      {displayTitle ? (
        <div className="container">
          <h1
            className="max-w-3xl text-5xl font-bold text-primary-foreground drop-shadow-lg md:text-7xl"
            data-sanity={dataAttribute?.("title")}
          >
            {title}
          </h1>
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0">
        <SectionBrush edge="top" theme={resolveSectionTheme(theme)} />
      </div>
    </section>
  );
}
