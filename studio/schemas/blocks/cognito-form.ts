import { ClipboardList } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";
import { cognitoFormId } from "../../../shared/cognito.ts";

// One of the site's Cognito forms (spec decision 15): the editor types the
// form ID; the account key is fixed in code, so no field holds embed code.
// An optional introduction sits above the form, in one column.
export default defineType({
  name: "cognitoForm",
  title: "Cognito form",
  type: "object",
  icon: ClipboardList,
  description:
    "A Cognito form (an order, contact or support form), with an optional introduction above it.",
  fields: [
    sectionTheme,
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
    defineField({
      name: "intro",
      title: "Introduction",
      type: "richTextContent",
      description: "Optional. Headings and text shown above the form.",
    }),
  ],
  preview: {
    select: { title: "title", formId: "formId" },
    prepare: ({ title, formId }) => ({
      title: title || "Untitled Cognito form",
      subtitle: formId ? `Cognito form ${formId}` : "Cognito form",
    }),
  },
});
