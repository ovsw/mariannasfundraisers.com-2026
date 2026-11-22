import { Columns2 } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredRichText } from "../validation/required-rich-text";

// The free tasting form (old Cognito form 168) with a text beside it: the
// text in the left half, the form in the right half; on a phone the text
// comes first. The form's fields, accessible name and thank-you message are
// code, and so are its emails (frontend/emails).
export default defineType({
  name: "tastingForm",
  title: "Free tasting form beside text",
  type: "object",
  icon: Columns2,
  description:
    "The free tasting request form in the right half of the page, with a text beside it on the left.",
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
  ],
  preview: {
    prepare: () => ({ title: "Free tasting form", subtitle: "Form beside text" }),
  },
});
