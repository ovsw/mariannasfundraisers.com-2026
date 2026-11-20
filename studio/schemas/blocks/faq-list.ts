import { ListCollapse } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";

// A titled list of FAQs, each opening to its answer. The questions and
// answers are `faq` documents, so one FAQ is edited once wherever it is used.
export default defineType({
  name: "faqList",
  title: "FAQ list",
  type: "object",
  icon: ListCollapse,
  description:
    "A heading over a list of FAQs; a visitor opens a question to read its answer.",
  fields: [
    sectionTheme,
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The heading over the list, as in Selling.",
      validation: (rule) =>
        requiredText(rule, "Add the title. The section is not shown without it."),
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      description: "The FAQs in the order they are shown. Pick existing FAQs or create new ones.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "faq" }],
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .unique()
          .error("Add at least one FAQ, each once. The section is not shown without one."),
    }),
  ],
  preview: {
    select: { title: "title", faqs: "faqs" },
    prepare: ({ title, faqs }) => ({
      title: title || "Untitled FAQ list",
      subtitle: `FAQ list${Array.isArray(faqs) ? `, ${faqs.length} FAQ${faqs.length === 1 ? "" : "s"}` : ""}`,
    }),
  },
});
