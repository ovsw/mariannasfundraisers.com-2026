import { House } from "lucide-react";
import { defineField, defineType } from "sanity";
import { requiredText } from "../validation/required-text";
import {
  blocksArchiveFieldset,
  homePageBlocksArchiveField,
  homePageBlocksField,
} from "../blocks/page-builder";
import meta from "../blocks/shared/meta";

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  icon: House,
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
      title: "Description",
      type: "text",
      rows: 3,
      group: "content",
    }),
    homePageBlocksField,
    homePageBlocksArchiveField,
    meta,
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
    prepare: ({ subtitle, title }) => ({
      title: title || "Untitled Home Page",
      subtitle: subtitle || "/",
    }),
  },
});
