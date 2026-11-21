import { defineField } from "sanity";

export const contentPageBuilderBlockTypes = [
  "richTextBlock",
  "scaffold",
  "pageHeading",
  "photoLeftAndText",
  "photoRightAndText",
  "boxedPhotoLeftAndText",
  "boxedPhotoRightAndText",
  "cutoutLeftAndText",
  "cutoutRightAndText",
  "badgeAndText",
  "videoLeftAndText",
  "videoRightAndText",
  "boxedVideoLeftAndText",
  "boxedVideoRightAndText",
  "imageAndIconList",
  "steps",
  "callToActionWithImage",
  "testimonials",
  // page-builder-generator:content-types
] as const;

const generalOnlyPageBuilderBlockTypes = [
  "pageBanner",
  "contactForm",
  "tastingForm",
  "findASaleForm",
  "faqList",
  "twoTextColumns",
  "hoagieMenu",
  "pizzaMenu",
  "salsaMenu",
  // page-builder-generator:general-types
] as const;

const homeOnlyPageBuilderBlockTypes = [
  "latestNews",
  "homeHero",
  "menuTeaser",
  // page-builder-generator:home-types
] as const;

// A news post is built from the Rich Text section and the image-and-text
// sections, as the old posts were (spec decision 9, issue #17). Its header is
// drawn by the post template, so no heading or banner section belongs here.
export const postPageBuilderBlockTypes = [
  "richTextBlock",
  "photoLeftAndText",
  "photoRightAndText",
  "boxedPhotoLeftAndText",
  "boxedPhotoRightAndText",
  "cutoutLeftAndText",
  "cutoutRightAndText",
  "badgeAndText",
  "videoLeftAndText",
  "videoRightAndText",
  "boxedVideoLeftAndText",
  "boxedVideoRightAndText",
  "imageAndIconList",
] as const satisfies readonly (typeof contentPageBuilderBlockTypes)[number][];

export const generalPageBuilderBlockTypes = [
  ...generalOnlyPageBuilderBlockTypes,
  ...contentPageBuilderBlockTypes,
] as const;

export const pageBuilderBlockTypes = generalPageBuilderBlockTypes;
export const homePagePageBuilderBlockTypes = [
  ...homeOnlyPageBuilderBlockTypes,
  ...contentPageBuilderBlockTypes,
] as const;

type PageBuilderBlockType =
  | (typeof generalPageBuilderBlockTypes)[number]
  | (typeof homePagePageBuilderBlockTypes)[number];

const previewBlockTypes = new Set<string>([
  "pageBanner",
  "pageHeading",
  "photoLeftAndText",
  "photoRightAndText",
  "boxedPhotoLeftAndText",
  "boxedPhotoRightAndText",
  "cutoutLeftAndText",
  "cutoutRightAndText",
  "badgeAndText",
  "videoLeftAndText",
  "videoRightAndText",
  "boxedVideoLeftAndText",
  "boxedVideoRightAndText",
  "imageAndIconList",
  "latestNews",
  "contactForm",
  "tastingForm",
  "findASaleForm",
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
  // page-builder-generator:preview-types
]);

export function getPageBuilderPreviewImageUrl(schemaTypeName: string) {
  return previewBlockTypes.has(schemaTypeName)
    ? `/static/images/preview/${schemaTypeName}.jpg`
    : undefined;
}

function createBlocksField(
  blockTypes: readonly PageBuilderBlockType[],
  title = "Page sections",
) {
  return defineField({
    name: "blocks",
    title,
    type: "array",
    group: "content",
    of: blockTypes.map((type) => ({ type })),
    // A Page heading or Page banner with a title draws the page's h1; a page
    // has one.
    validation: (rule) =>
      rule.custom((blocks) => {
        const titled = (blocks ?? []).filter((block) => {
          const { _type, title } = block as { _type?: string; title?: unknown };
          return (
            (_type === "pageHeading" || _type === "pageBanner") &&
            typeof title === "string" &&
            title.trim() !== ""
          );
        });
        return titled.length > 1
          ? "Only one Page heading or Page banner can have a title: it is the page's main heading"
          : true;
      }),
    options: {
      insertMenu: {
        views: [
          { name: "list" },
          { name: "grid", previewImageUrl: getPageBuilderPreviewImageUrl },
        ],
      },
    },
  });
}

// Replaced Scaffolds move here. The archive accepts the same block types as
// `blocks`, so a section can move back without losing data. The Website never
// queries or renders it.
export const blocksArchiveFieldset = {
  name: "blocksArchive",
  title: "Archived sections",
  options: { collapsible: true, collapsed: true },
} as const;

function createBlocksArchiveField(blockTypes: readonly PageBuilderBlockType[]) {
  return defineField({
    name: "blocksArchive",
    title: "Archived sections",
    description:
      "Scaffolds and other sections that were replaced. Nothing here appears on the Website.",
    type: "array",
    group: "content",
    fieldset: blocksArchiveFieldset.name,
    of: blockTypes.map((type) => ({ type })),
  });
}

export const blocksField = createBlocksField(generalPageBuilderBlockTypes);
export const blocksArchiveField = createBlocksArchiveField(
  generalPageBuilderBlockTypes,
);
export const contentBlocksField = createBlocksField(
  contentPageBuilderBlockTypes,
);
export const contentBlocksArchiveField = createBlocksArchiveField(
  contentPageBuilderBlockTypes,
);
export const postBlocksField = createBlocksField(
  postPageBuilderBlockTypes,
  "Post sections",
);
export const homePageBlocksField = createBlocksField(
  homePagePageBuilderBlockTypes,
);
export const homePageBlocksArchiveField = createBlocksArchiveField(
  homePagePageBuilderBlockTypes,
);
