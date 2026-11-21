import { Columns2 } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";
import { requiredRichText } from "../validation/required-rich-text";
import { cognitoFormId } from "../../../shared/cognito.ts";

// One of the site's Cognito forms with a text beside it: the text in the left
// half, the form in the right half. The Cognito form section is the other
// design: the form at full width, under an optional introduction.
export default defineType({
  name: "cognitoFormAndText",
  title: "Cognito form beside text",
  type: "object",
  icon: Columns2,
  description:
    "A Cognito form in the right half of the page, with a text beside it on the left.",
  fields: [
    sectionTheme,
    defineField({
      name: "richText",
      title: "Text",
      type: "richTextContent",
      description: "Headings and text shown beside the form.",
      validation: (rule) =>
        requiredRichText(rule, "Add the text. The section is not shown without it."),
    }),
    defineField({
      name: "formId",
      title: "Form ID",
      type: "string",
      description:
        "The number at the end of the form's address in Cognito Forms, as in 114. Type the number only, never embed code.",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value?.trim()) return "Add the form ID. The section is not shown without it.";
          return cognitoFormId(value)
            ? true
            : "Type the form's number only, as in 114, not embed code or a link.";
        }),
    }),
    defineField({
      name: "title",
      title: "Accessible title",
      type: "string",
      description:
        "Names the form for screen readers, as in Contact form. It is not shown on the page.",
      validation: (rule) =>
        requiredText(rule, "Add the accessible title. The section is not shown without it."),
    }),
  ],
  preview: {
    select: { title: "title", formId: "formId" },
    prepare: ({ title, formId }) => ({
      title: title || "Untitled Cognito form",
      subtitle: formId ? `Cognito form ${formId} beside text` : "Cognito form beside text",
    }),
  },
});
