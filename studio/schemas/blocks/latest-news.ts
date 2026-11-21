import { Newspaper } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";

// The three newest news posts as cards, under a heading (spec decision 12,
// issue #17). The posts are not chosen here: the section always shows the
// three newest by publish date.
export default defineType({
  name: "latestNews",
  title: "Latest news",
  type: "object",
  icon: Newspaper,
  description: "The three newest news posts as cards, newest first, under a heading.",
  fields: [
    sectionTheme,
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Optional. A short line above the title, for example the company name.",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The heading above the posts.",
      validation: (rule) =>
        requiredText(rule, "Add the title. The section is not shown without it."),
    }),
  ],
  preview: {
    select: { title: "title", eyebrow: "eyebrow" },
    prepare: ({ eyebrow, title }) => ({
      title: [eyebrow, title].filter(Boolean).join(" ") || "Untitled Latest news",
      subtitle: "Latest news: the three newest posts",
    }),
  },
});
