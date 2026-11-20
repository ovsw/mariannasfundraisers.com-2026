import { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
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
// page-builder-generator:component-imports
import { dataset, projectId } from "@/sanity/lib/env";

type Block =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type BlockEditingProps = {
  dataAttribute?: (path: string) => string | undefined;
};

const serverFieldEditingBlockTypes = new Set<Block["_type"]>([
  "richTextBlock",
  "scaffold",
  "pageBanner",
  "pageHeading",
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
  // page-builder-generator:component-map
};

// Code owns brushed edges (see section-brush.tsx). Which edge a section
// paints follows from the themes around it; which brush shape it paints is
// part of its design. A section listed here paints the "menu" stroke of the
// old menu sections; every other section paints the default "brush" stroke.
const sectionBrushShapes: Partial<Record<Block["_type"], SectionBrushShape>> =
  {};

// Heroes draw their own edge. Their theme picks that edge's colour, not a
// background, so the Page Builder treats them as themeless: they never share
// a band and nothing is drawn next to them.
const selfEdgedBlockTypes = new Set<Block["_type"]>(["pageBanner"]);

export default function Blocks({
  blocks,
  documentId,
  documentType = "page",
  stega,
}: {
  blocks: Block[];
  documentId: string;
  documentType?: "blogIndex" | "homePage" | "page";
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
        <Component {...block} {...editingProps} {...boundary} />
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
  // page-builder-generator:visible-blocks
  return true;
}
