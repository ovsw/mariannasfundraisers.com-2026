import { ListOrdered } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";

// Numbered steps side by side, joined by a dotted path (spec decision 12,
// issue #18): the old "How it Works" steps of the home page.

/** One step: a picture, a title and a few lines of text. */
export const stepItem = defineType({
  name: "stepItem",
  title: "Step",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Picture",
      type: "image",
      description: "A square illustration above the step, shown whole.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the picture for screen readers. Leave empty if it is decorative.",
        }),
      ],
      validation: (rule) =>
        rule.required().assetRequired().error("Choose the picture. The step is not shown without it."),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The step's name, shown after its number, as in Contact Us.",
      validation: (rule) => requiredText(rule, "Add the title. The step is not shown without it."),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "richTextContent",
      description: "Optional. A few lines or a short list under the title.",
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({ title: title || "Untitled step", media }),
  },
});

export default defineType({
  name: "steps",
  title: "Steps",
  type: "object",
  icon: ListOrdered,
  description: "Up to three numbered steps side by side, each with a picture, a title and text.",
  fields: [
    sectionTheme,
    defineField({
      name: "items",
      title: "Steps",
      type: "array",
      description: "The steps in order; each is numbered from 1.",
      of: [defineArrayMember({ type: "stepItem" })],
      validation: (rule) =>
        rule.required().min(1).max(3).error("Add one to three steps. The section is not shown without one."),
    }),
  ],
  preview: {
    select: { items: "items", first: "items.0.title" },
    prepare: ({ items, first }) => ({
      title: first ? `1. ${first}` : "Untitled Steps",
      subtitle: `Steps${Array.isArray(items) ? `, ${items.length}` : ""}`,
    }),
  },
});
