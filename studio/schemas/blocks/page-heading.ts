import { HeadingIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";

// The page's main heading and its introduction, centred, under the banner.
export default defineType({
  name: "pageHeading",
  title: "Page heading",
  type: "object",
  icon: HeadingIcon,
  description: "The page's main heading with a short introduction, centred.",
  fields: [
    sectionTheme,
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The page's main heading.",
      validation: (rule) =>
        requiredText(rule, "Add the title. The section is not shown without it."),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "simpleRichText",
      description: "Optional. A short introduction under the title.",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Untitled Page heading",
      subtitle: "Page heading",
    }),
  },
});
