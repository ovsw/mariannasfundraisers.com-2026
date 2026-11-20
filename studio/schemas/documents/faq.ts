import { defineField, defineType } from "sanity";
import { requiredText } from "../validation/required-text";
import { requiredRichText } from "../validation/required-rich-text";
import { ListCollapse } from "lucide-react";

export default defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  icon: ListCollapse,
  description:
    "A reusable question and answer that can be selected in FAQ sections.",
  initialValue: {
    title: "What should visitors know before getting started?",
    body: [
      {
        _key: "starter-faq-answer",
        _type: "block",
        children: [
          {
            _key: "starter-faq-answer-span",
            _type: "span",
            marks: [],
            text: "Replace this with a clear answer to a common visitor question.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
  },
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Question",
      description: "The question shown to visitors.",
      validation: (rule) =>
        requiredText(rule, "Add the question. An FAQ without it is not shown."),
    }),
    defineField({
      name: "body",
      title: "Answer",
      type: "simpleRichText",
      description: "The reusable answer shown inside FAQ sections.",
      validation: (rule) =>
        requiredRichText(rule, "Add the answer. An FAQ without it is not shown."),
    }),
  ],

  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Untitled FAQ",
      subtitle: "Reusable FAQ",
    }),
  },
});
