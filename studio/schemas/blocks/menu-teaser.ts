import { UtensilsCrossed } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";

// The home page's food teaser (spec decision 12, issue #18): a heading and an
// introduction over two parts, each a large cut-out photo beside a heading,
// text and buttons. The first part has its photo on the right, the second on
// the left; the order is the design, not a setting.

const altField = defineField({
  name: "alt",
  title: "Alternative text",
  type: "string",
  description: "Describe the photo for screen readers. Leave empty if it is decorative.",
});

/** One part of the Menu teaser: a cut-out photo beside a heading, text and buttons. */
export const menuTeaserItem = defineType({
  name: "menuTeaserItem",
  title: "Menu teaser part",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      description: "A large cut-out photo on a transparent or matching background, shown whole.",
      fields: [altField],
      validation: (rule) =>
        rule.required().assetRequired().error("Choose the photo. The section is not shown without it."),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "As in 14\" Famous Hoagies.",
      validation: (rule) =>
        requiredText(rule, "Add the heading. The section is not shown without it."),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "richTextContent",
      description: "Optional. A few sentences under the heading.",
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      description: "Optional. Up to two buttons under the text, as in See Hoagie Menu.",
      of: [{ type: "button" }],
      validation: (rule) => rule.max(2),
    }),
  ],
  preview: {
    select: { title: "heading", media: "image" },
    prepare: ({ title, media }) => ({ title: title || "Untitled part", media }),
  },
});

export default defineType({
  name: "menuTeaser",
  title: "Menu teaser",
  type: "object",
  icon: UtensilsCrossed,
  description:
    "A heading and introduction over two parts, each a large food photo beside a heading, text and buttons.",
  fields: [
    sectionTheme,
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Optional. The short line above the heading, as in Handmade Food Menu.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      description: "The section heading, as in Fresh & Clean Obsessed.",
      validation: (rule) =>
        requiredText(rule, "Add the heading. The section is not shown without it."),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "simpleRichText",
      description: "Optional. A few sentences under the heading.",
    }),
    defineField({
      name: "items",
      title: "Parts",
      type: "array",
      description:
        "Exactly two parts. The first has its photo on the right, the second on the left.",
      of: [defineArrayMember({ type: "menuTeaserItem" })],
      validation: (rule) =>
        rule.required().length(2).error("Add the two parts. The section is not shown without both."),
    }),
  ],
  preview: {
    select: { title: "title", eyebrow: "eyebrow", media: "items.0.image" },
    prepare: ({ title, eyebrow, media }) => ({
      title: [eyebrow, title].filter((part) => part?.trim()).join(" ") || "Untitled Menu teaser",
      subtitle: "Menu teaser",
      media,
    }),
  },
});
