import { Columns2 } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredRichText } from "../validation/required-rich-text";

// Two rich texts side by side; on phones the left one comes first.
export default defineType({
  name: "twoTextColumns",
  title: "Two text columns",
  type: "object",
  icon: Columns2,
  description: "Two blocks of text side by side; stacked on phones, left first.",
  fields: [
    sectionTheme,
    defineField({
      name: "leftText",
      title: "Left text",
      type: "richTextContent",
      description: "The text on the left; on phones it comes first.",
      validation: (rule) =>
        requiredRichText(rule, "Add the left text. The section is not shown without both texts."),
    }),
    defineField({
      name: "rightText",
      title: "Right text",
      type: "richTextContent",
      description: "The text on the right; on phones it comes second.",
      validation: (rule) =>
        requiredRichText(rule, "Add the right text. The section is not shown without both texts."),
    }),
  ],
  preview: {
    select: { leftText: "leftText" },
    prepare: ({ leftText }) => {
      const first = Array.isArray(leftText)
        ? leftText.find((block) => block?._type === "block")
        : undefined;
      const text = Array.isArray(first?.children)
        ? first.children.map((child: { text?: string }) => child.text ?? "").join("")
        : "";
      return { title: text || "Untitled Two text columns", subtitle: "Two text columns" };
    },
  },
});
