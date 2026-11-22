import { MapPin } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";

// The find a sale form (old Cognito form 173). Its fields, its accessible
// name and its thank-you message are code. The office notification and the
// reply email are code in frontend/emails. An optional introduction sits
// above the form, in one column.
export default defineType({
  name: "findASaleForm",
  title: "Find a sale form",
  type: "object",
  icon: MapPin,
  description:
    "The form visitors send to hear about fundraisers near them, with an optional introduction above it.",
  fields: [
    sectionTheme,
    defineField({
      name: "intro",
      title: "Introduction",
      type: "richTextContent",
      description: "Optional. Headings and text shown above the form.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Find a sale form", subtitle: "Form" }),
  },
});
