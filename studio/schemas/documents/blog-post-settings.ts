import { PanelRight } from "lucide-react";
import { defineType } from "sanity";
import { blogPostSidebarFields } from "../blocks/shared/blog-post-sidebar";

export default defineType({
  name: "blogPostSettings",
  title: "News Post Settings",
  type: "document",
  icon: PanelRight,
  description: "Shared sidebar content shown on news post pages.",
  fields: blogPostSidebarFields,
  preview: {
    prepare: () => ({ title: "News Post Settings" }),
  },
});
