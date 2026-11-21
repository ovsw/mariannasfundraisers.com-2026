import { Quote } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";

// Customer quotes, one at a time with previous and next buttons, beside a
// photo (spec decision 12, issue #18). The quotes are `testimonial` records,
// so a quote used twice is edited once.
export default defineType({
  name: "testimonials",
  title: "Testimonials",
  type: "object",
  icon: Quote,
  description: "Customer quotes, one at a time with previous and next buttons, beside a photo.",
  fields: [
    sectionTheme,
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Optional. The short line above the heading, as in Quotes From Our.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      description: "As in Hoagie Heroes.",
      validation: (rule) =>
        requiredText(rule, "Add the heading. The section is not shown without it."),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      description:
        "A cut-out photo of a person on a transparent background, on the right on wide screens. Shown whole.",
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
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      description:
        "The quotes in the order they are shown. Pick existing testimonials or create new ones.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "testimonial" }],
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .unique()
          .error("Add at least one testimonial, each once. The section is not shown without one."),
    }),
  ],
  preview: {
    select: { title: "title", eyebrow: "eyebrow", media: "image", testimonials: "testimonials" },
    prepare: ({ title, eyebrow, media, testimonials }) => ({
      title: [eyebrow, title].filter((part) => part?.trim()).join(" ") || "Untitled Testimonials",
      subtitle: `Testimonials${Array.isArray(testimonials) ? `, ${testimonials.length}` : ""}`,
      media,
    }),
  },
});
