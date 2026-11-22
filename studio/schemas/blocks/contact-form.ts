import { Mail } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";

// The contact form (old Cognito form 114). Its fields, its accessible name
// and its thank-you message are code; the fields shown under the topic follow
// the chosen topic. The office notification and the reply email are code in
// frontend/emails. An optional introduction sits above the form, in one
// column.
export default defineType({
  name: "contactForm",
  title: "Contact form",
  type: "object",
  icon: Mail,
  description:
    "The contact form (book a fundraiser, general info, submit a testimonial), with an optional introduction above it.",
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
    prepare: () => ({ title: "Contact form", subtitle: "Form" }),
  },
});
