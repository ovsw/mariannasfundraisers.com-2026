import { TextIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { hasVisibleRichText } from "../validation/required-rich-text";

export default defineType({
  name: "richTextBlock",
  title: "Rich Text Block",
  type: "object",
  icon: TextIcon,
  description:
    "Headings, text and a row of buttons, in one column, with an optional label and heading.",
  initialValue: {
    eyebrow: "What we do",
    title: "Built to make the next decision easier.",
    richText: [
      {
        _key: "starter-rich-text",
        _type: "block",
        children: [
          {
            _key: "starter-rich-text-span",
            _type: "span",
            marks: [],
            text: "Replace this sample with the useful details visitors need to understand your work and take the next step.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
  },
  fields: [
    sectionTheme,
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label shown above the section heading",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "Optional heading shown above the rich text content",
    }),
    defineField({
      name: "richText",
      title: "Content",
      type: "richTextContent",
      description: "Optional when the section has a heading.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as
            | { eyebrow?: string; title?: string }
            | undefined;
          return hasVisibleRichText(value) ||
            parent?.title?.trim() ||
            parent?.eyebrow?.trim()
            ? true
            : "Add the content or a heading. The section is not shown without either.";
        }),
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      description: "Optional. A row of buttons under the content.",
      of: [{ type: "button" }],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "anchorId",
      title: "Anchor ID",
      type: "string",
      description:
        "Optional. Lets a link jump to this section: a link to this page with #<anchor ID> lands here. Lowercase words with single hyphens.",
      validation: (rule) =>
        rule.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
          name: "anchor",
          invert: false,
        }).error("Use lowercase letters, numbers and single hyphens, as in our-story."),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Untitled Rich Text",
      subtitle: "Rich Text",
    }),
  },
});
