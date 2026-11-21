import { Megaphone } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";

// A closing call to action (spec decision 12, issue #18): a heading, a line of
// text and a button beside a cut-out photo that stands out of the block's top,
// as on the home page and How it Works. The product pages draw the same design
// from Product Page Settings.
export default defineType({
  name: "callToActionWithImage",
  title: "Call to action with image",
  type: "object",
  icon: Megaphone,
  description: "A heading, a line of text and a button beside a cut-out photo.",
  fields: [
    sectionTheme,
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      description: "As in Over 40 years of experience, one phone call away.",
      validation: (rule) =>
        requiredText(rule, "Add the heading. The section is not shown without it."),
    }),
    defineField({
      name: "richText",
      title: "Text",
      type: "richTextContent",
      description: "Optional. A line under the heading.",
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      description: "Optional. Up to two buttons under the text.",
      of: [{ type: "button" }],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      description:
        "A cut-out photo on a transparent background, on the right, standing out of the block's top. Shown whole.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the photo for screen readers. Leave empty if it is decorative.",
        }),
      ],
      validation: (rule) =>
        rule.required().assetRequired().error("Choose the photo. The section is not shown without it."),
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({
      title: title || "Untitled Call to action with image",
      subtitle: "Call to action with image",
      media,
    }),
  },
});
