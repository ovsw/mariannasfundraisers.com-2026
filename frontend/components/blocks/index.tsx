import {
  HOME_PAGE_QUERY_RESULT,
  PAGE_QUERY_RESULT,
  POST_QUERY_RESULT,
} from "@/sanity.types";
import { type LivePerspective } from "next-sanity/live";
import { createDataAttribute, stegaClean } from "next-sanity";
import RichTextBlock from "@/components/blocks/rich-text-block";
import {
  resolveSectionBands,
  resolveSectionBoundaries,
  type SectionBand,
} from "@/components/blocks/section-boundaries";
import {
  resolveSectionBrushes,
  SectionBrush,
  type SectionBrushShape,
} from "@/components/blocks/section-brush";
import Scaffold, { hasScaffoldContent } from "@/components/blocks/scaffold";
import PageBanner, { hasPageBannerContent } from "@/components/blocks/page-banner";
import PageHeading, { hasPageHeadingContent } from "@/components/blocks/page-heading";
import PhotoLeftAndText, { hasPhotoLeftAndTextContent } from "@/components/blocks/photo-left-and-text";
import PhotoRightAndText, { hasPhotoRightAndTextContent } from "@/components/blocks/photo-right-and-text";
import CutoutLeftAndText, { hasCutoutLeftAndTextContent } from "@/components/blocks/cutout-left-and-text";
import CutoutRightAndText, { hasCutoutRightAndTextContent } from "@/components/blocks/cutout-right-and-text";
import BadgeAndText, { hasBadgeAndTextContent } from "@/components/blocks/badge-and-text";
import VideoLeftAndText, { hasVideoLeftAndTextContent } from "@/components/blocks/video-left-and-text";
import VideoRightAndText, { hasVideoRightAndTextContent } from "@/components/blocks/video-right-and-text";
import ImageAndIconList, { hasImageAndIconListContent } from "@/components/blocks/image-and-icon-list";
import LatestNews, { hasLatestNewsContent } from "@/components/blocks/latest-news";
import CognitoForm, { hasCognitoFormContent } from "@/components/blocks/cognito-form";
import FaqList, { hasFaqListContent } from "@/components/blocks/faq-list";
import TwoTextColumns, { hasTwoTextColumnsContent } from "@/components/blocks/two-text-columns";
import HoagieMenu, { hasHoagieMenuContent } from "@/components/blocks/hoagie-menu";
import PizzaMenu, { hasPizzaMenuContent } from "@/components/blocks/pizza-menu";
import SalsaMenu, { hasSalsaMenuContent } from "@/components/blocks/salsa-menu";
import HomeHero, { hasHomeHeroContent } from "@/components/blocks/home-hero";
import Steps, { hasStepsContent } from "@/components/blocks/steps";
import MenuTeaser, { hasMenuTeaserContent } from "@/components/blocks/menu-teaser";
import CallToActionWithImage, { hasCallToActionWithImageContent } from "@/components/blocks/call-to-action-with-image";
import Testimonials, { hasTestimonialsContent } from "@/components/blocks/testimonials";
// page-builder-generator:component-imports
import { dataset, projectId } from "@/sanity/lib/env";

type Block =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<POST_QUERY_RESULT>["blocks"]>[number];

type BlockEditingProps = {
  dataAttribute?: (path: string) => string | undefined;
};

const serverFieldEditingBlockTypes = new Set<Block["_type"]>([
  "richTextBlock",
  "scaffold",
  "pageBanner",
  "pageHeading",
  "photoLeftAndText",
  "photoRightAndText",
  "cutoutLeftAndText",
  "cutoutRightAndText",
  "badgeAndText",
  "videoLeftAndText",
  "videoRightAndText",
  "imageAndIconList",
  "latestNews",
  "cognitoForm",
  "faqList",
  "twoTextColumns",
  "hoagieMenu",
  "pizzaMenu",
  "salsaMenu",
  "homeHero",
  "steps",
  "menuTeaser",
  "callToActionWithImage",
  "testimonials",
  // page-builder-generator:editing-types
]);

const componentMap: Partial<{
  [K in Block["_type"]]: React.ComponentType<
    Extract<Block, { _type: K }> & BlockEditingProps
  >;
}> = {
  richTextBlock: RichTextBlock,
  scaffold: Scaffold,
  pageBanner: PageBanner,
  pageHeading: PageHeading,
  photoLeftAndText: PhotoLeftAndText,
  photoRightAndText: PhotoRightAndText,
  cutoutLeftAndText: CutoutLeftAndText,
  cutoutRightAndText: CutoutRightAndText,
  badgeAndText: BadgeAndText,
  videoLeftAndText: VideoLeftAndText,
  videoRightAndText: VideoRightAndText,
  imageAndIconList: ImageAndIconList,
  latestNews: LatestNews,
  cognitoForm: CognitoForm,
  faqList: FaqList,
  twoTextColumns: TwoTextColumns,
  hoagieMenu: HoagieMenu,
  pizzaMenu: PizzaMenu,
  salsaMenu: SalsaMenu,
  homeHero: HomeHero,
  steps: Steps,
  menuTeaser: MenuTeaser,
  callToActionWithImage: CallToActionWithImage,
  testimonials: Testimonials,
  // page-builder-generator:component-map
};

// Code owns brushed edges (see section-brush.tsx). Which edge a section
// paints follows from the themes around it; which brush shape it paints is
// part of its design. A section listed here paints the "menu" stroke of the
// old menu sections; every other section paints the default "brush" stroke.
const sectionBrushShapes: Partial<Record<Block["_type"], SectionBrushShape>> =
  {
    hoagieMenu: "menu",
    pizzaMenu: "menu",
    salsaMenu: "menu",
  };

// Heroes draw their own edge. Their theme picks that edge's colour, not a
// background, so the Page Builder treats them as themeless: they never share
// a band and nothing is drawn next to them.
const selfEdgedBlockTypes = new Set<Block["_type"]>(["pageBanner", "homeHero"]);

export default function Blocks({
  blocks,
  documentId,
  documentType = "page",
  stega,
}: {
  blocks: Block[];
  documentId: string;
  documentType?: "blogIndex" | "homePage" | "page" | "post";
  perspective: LivePerspective;
  stega: boolean;
}) {
  const visibleSections = blocks.flatMap((block) => {
    if (!componentMap[block._type] || !isRenderableBlock(block)) return [];
    return [
      {
        key: block._key,
        theme:
          "theme" in block && !selfEdgedBlockTypes.has(block._type)
            ? (block.theme as string | null)
            : null,
      },
    ];
  });
  const resolvedBoundaries = resolveSectionBoundaries(visibleSections);
  const brushes = new Map(
    resolveSectionBrushes(visibleSections).map((brush) => [brush.key, brush]),
  );

  // A band is a run of visible sections joined by seams: one continuous
  // surface. The stylesheet paints a surface texture on the band, so the
  // texture does not restart at every seam. A block that renders nothing
  // stays inside the band around it; a leading one gets a plain wrapper.
  const bandStarts = new Map(
    resolveSectionBands(resolvedBoundaries).map((band) => [band.keys[0], band]),
  );
  const groups: { band?: SectionBand; blocks: Block[] }[] = [];
  for (const block of blocks) {
    const band = bandStarts.get(block._key);
    if (band || groups.length === 0) groups.push({ band, blocks: [] });
    groups[groups.length - 1].blocks.push(block);
  }

  function renderBlock(block: Block) {
    const Component = componentMap[block._type] as
      React.ComponentType<Block & BlockEditingProps> | undefined;
    if (!Component) return null;

    const blockPath = `blocks[_key=="${block._key}"]`;
    const dataSanity = stega
      ? createDataAttribute({
          baseUrl:
            process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
          dataset,
          id: documentId,
          path: blockPath,
          projectId,
          type: documentType,
        }).toString()
      : undefined;
    const dataAttribute = stega
      ? (path: string) =>
          createDataAttribute({
            baseUrl:
              process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
            dataset,
            id: documentId,
            path: `${blockPath}.${path}`,
            projectId,
            type: documentType,
          }).toString()
      : undefined;
    const editingProps: BlockEditingProps = serverFieldEditingBlockTypes.has(
      block._type,
    )
      ? { dataAttribute }
      : {};
    const boundary = resolvedBoundaries.find(({ key }) => key === block._key);
    const brush = brushes.get(block._key);
    const brushTheme = boundary?.theme;
    const brushShape = sectionBrushShapes[block._type];

    return (
      // scripts/verify-no-skeleton.mjs reads `data-section-key` to find a
      // published section that drew nothing.
      <div
        className={
          brushTheme && (brush?.top || brush?.bottom) ? "relative" : undefined
        }
        data-sanity={dataSanity}
        data-section-key={block._key}
        key={block._key}
      >
        <Component
          {...block}
          {...editingProps}
          {...boundary}
          // A self-edged section is themeless for its neighbours, but its own
          // edge still takes the theme it was given.
          {...(selfEdgedBlockTypes.has(block._type) && "theme" in block
            ? { theme: block.theme }
            : {})}
        />
        {brushTheme && brush?.top ? (
          <SectionBrush edge="top" shape={brushShape} theme={brushTheme} />
        ) : null}
        {brushTheme && brush?.bottom ? (
          <SectionBrush edge="bottom" shape={brushShape} theme={brushTheme} />
        ) : null}
      </div>
    );
  }

  return (
    <>
      {groups.map(({ band, blocks: bandBlocks }) => (
        <div
          data-band={band?.theme ?? undefined}
          key={bandBlocks[0]._key}
        >
          {bandBlocks.map(renderBlock)}
        </div>
      ))}
    </>
  );
}

// Sections that render nothing must not create joins. Keep each rule aligned
// with the renderer's own empty result.
function isRenderableBlock(block: Block) {
  if (block._type === "richTextBlock") {
    return Boolean(
      stegaClean(block.eyebrow)?.trim() ||
        stegaClean(block.title)?.trim() ||
        block.richText?.length,
    );
  }
  if (block._type === "scaffold") return hasScaffoldContent(block);
  if (block._type === "pageBanner") return hasPageBannerContent(block);
  if (block._type === "pageHeading") return hasPageHeadingContent(block);
  if (block._type === "photoLeftAndText") return hasPhotoLeftAndTextContent(block);
  if (block._type === "photoRightAndText") return hasPhotoRightAndTextContent(block);
  if (block._type === "cutoutLeftAndText") return hasCutoutLeftAndTextContent(block);
  if (block._type === "cutoutRightAndText") return hasCutoutRightAndTextContent(block);
  if (block._type === "badgeAndText") return hasBadgeAndTextContent(block);
  if (block._type === "videoLeftAndText") return hasVideoLeftAndTextContent(block);
  if (block._type === "videoRightAndText") return hasVideoRightAndTextContent(block);
  if (block._type === "imageAndIconList") return hasImageAndIconListContent(block);
  if (block._type === "latestNews") return hasLatestNewsContent(block);
  if (block._type === "cognitoForm") return hasCognitoFormContent(block);
  if (block._type === "faqList") return hasFaqListContent(block);
  if (block._type === "twoTextColumns") return hasTwoTextColumnsContent(block);
  if (block._type === "hoagieMenu") return hasHoagieMenuContent(block);
  if (block._type === "pizzaMenu") return hasPizzaMenuContent(block);
  if (block._type === "salsaMenu") return hasSalsaMenuContent(block);
  if (block._type === "homeHero") return hasHomeHeroContent(block);
  if (block._type === "steps") return hasStepsContent(block);
  if (block._type === "menuTeaser") return hasMenuTeaserContent(block);
  if (block._type === "callToActionWithImage") return hasCallToActionWithImageContent(block);
  if (block._type === "testimonials") return hasTestimonialsContent(block);
  // page-builder-generator:visible-blocks
  return true;
}
