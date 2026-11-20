import { Newspaper } from "lucide-react";
import { defineField, defineType } from "sanity";
import { requiredText } from "../validation/required-text";
import {
  blocksArchiveFieldset,
  contentBlocksArchiveField,
  contentBlocksField,
} from "../blocks/page-builder";
import meta from "../blocks/shared/meta";

export default defineType({
  name: "blogIndex",
  title: "News Index",
  type: "document",
  icon: Newspaper,
  fieldsets: [blocksArchiveFieldset],
  groups: [
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (rule) => requiredText(rule),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) =>
        rule
          .custom((value) =>
            value?.trim() ? true : "Add a description for the News Index header",
          )
          .warning(),
    }),
    contentBlocksField,
    contentBlocksArchiveField,
    meta,
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
    prepare: ({ subtitle, title }) => ({
      title: title || "Untitled News Index",
      subtitle: subtitle || "/news",
    }),
  },
});
