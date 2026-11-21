import type { ComponentType } from "react";
import { defineField, defineType, type FieldDefinition } from "sanity";
import { youTubeVideoId } from "../../../../shared/youtube.ts";
import { hasVisibleRichText } from "../../validation/required-rich-text";
import { requiredText } from "../../validation/required-text";
import { siteIcons } from "../../../../shared/site-design.ts";
import sectionTheme from "./section-theme";

// The image-and-text family (spec decisions 10 and 12, issue #15): the old
// "big image" row as eight sections. Each section has one design; they share
// these fields. No field stores a side, a fit or a spacing: the side and how
// the image fills its frame belong to the section type.

type ImageAndTextOptions = {
  name: string;
  title: string;
  description: string;
  icon: ComponentType;
  /** What the image is called in Studio, for example "Photo". */
  imageTitle: string;
  imageDescription: string;
  /** Fields that only this section has, placed after the text. */
  extraFields?: FieldDefinition[];
  /**
   * True when the section draws its text column without a heading or text
   * (the icon list draws its items). Otherwise one of eyebrow, title and
   * text is required.
   */
  textOptional?: boolean;
};

const ANCHOR = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The image's alt text field, shared by every image in the family. */
const altField = defineField({
  name: "alt",
  title: "Alternative text",
  type: "string",
  description: "Describe the image for screen readers. Leave empty if it is decorative.",
});

export function defineImageAndTextSection({
  name,
  title,
  description,
  icon,
  imageTitle,
  imageDescription,
  extraFields = [],
  textOptional = false,
}: ImageAndTextOptions) {
  return defineType({
    name,
    title,
    type: "object",
    icon,
    description,
    fields: [
      sectionTheme,
      defineField({
        name: "eyebrow",
        title: "Eyebrow",
        type: "string",
        description: "Optional. The short line above the heading, as in “Only the”.",
      }),
      defineField({
        name: "title",
        title: "Heading",
        type: "string",
        description: "Optional. The section heading beside the image.",
      }),
      defineField({
        name: "richText",
        title: "Text",
        type: "richTextContent",
        description: textOptional
          ? "Optional. Text under the heading."
          : "Optional when the section has a heading.",
        validation: (rule) =>
          rule.custom((value, context) => {
            if (textOptional) return true;
            const parent = context.parent as { eyebrow?: string; title?: string } | undefined;
            return hasVisibleRichText(value) || parent?.title?.trim() || parent?.eyebrow?.trim()
              ? true
              : "Add the text or a heading. The section is not shown without either.";
          }),
      }),
      ...extraFields,
      defineField({
        name: "buttons",
        title: "Buttons",
        type: "array",
        description: "Optional. A row of buttons under the text.",
        of: [{ type: "button" }],
        validation: (rule) => rule.max(4),
      }),
      defineField({
        name: "image",
        title: imageTitle,
        type: "image",
        options: { hotspot: true },
        description: imageDescription,
        fields: [altField],
        validation: (rule) =>
          rule
            .required()
            .assetRequired()
            .error(`Choose the ${imageTitle.toLowerCase()}. The section is not shown without it.`),
      }),
      defineField({
        name: "anchorId",
        title: "Anchor ID",
        type: "string",
        description:
          "Optional. Lets a link jump to this section: a link to this page with #<anchor ID> lands here. Lowercase words with single hyphens.",
        validation: (rule) =>
          rule
            .regex(ANCHOR, { name: "anchor", invert: false })
            .error("Use lowercase letters, numbers and single hyphens, as in our-story."),
      }),
    ],
    preview: {
      select: { title: "title", eyebrow: "eyebrow", media: "image" },
      prepare: ({ title: heading, eyebrow, media }) => ({
        title: [eyebrow, heading].filter((part) => part?.trim()).join(" ") || `Untitled ${title}`,
        subtitle: title,
        media,
      }),
    },
  });
}

/** The YouTube link of a video section. */
export const youTubeUrlField = defineField({
  name: "youTubeUrl",
  title: "YouTube link",
  type: "url",
  description:
    "The video's YouTube address, as in https://youtu.be/… or https://www.youtube.com/watch?v=…. The image is its poster; the video plays in a window over the page.",
  validation: (rule) =>
    rule
      .required()
      .uri({ scheme: ["http", "https"] })
      .custom((value) =>
        typeof value !== "string" || youTubeVideoId(value)
          ? true
          : "Paste the link to one YouTube video. The section is not shown without it.",
      )
      .error("Paste the link to one YouTube video. The section is not shown without it."),
});

/** One item of the Image and icon list: an icon, a heading and its text. */
export const iconListItem = defineType({
  name: "iconListItem",
  title: "Icon list item",
  type: "object",
  fields: [
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "The icon before the heading, from the site's icon list.",
      options: { list: siteIcons.map(({ title, value }) => ({ title, value })) },
      validation: (rule) =>
        rule.required().error("Choose the icon. The item is not shown without it."),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) =>
        requiredText(rule, "Add the heading. The item is not shown without it."),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "simpleRichText",
      description: "Optional. A few sentences under the heading.",
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "icon" },
  },
});

/** The items of the Image and icon list. */
export const iconListItemsField = defineField({
  name: "items",
  title: "Items",
  type: "array",
  description: "Up to three items, each an icon, a heading and a few sentences.",
  of: [{ type: "iconListItem" }],
  validation: (rule) =>
    rule
      .required()
      .min(1)
      .max(3)
      .error("Add one to three items. The section is not shown without them."),
});
