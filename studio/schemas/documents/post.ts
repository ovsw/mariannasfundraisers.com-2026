import { defineArrayMember, defineField, defineType } from "sanity";
import { requiredText } from "../validation/required-text";
import { FileText } from "lucide-react";
import meta from "../blocks/shared/meta";
import { postPath } from "../../../shared/content-routes.ts";
import { uniqueRoutedSlug } from "../validation/routed-slug";
import { postBlocksField } from "../blocks/page-builder";

export default defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: FileText,
  groups: [
    {
      name: "content",
      title: "Content",
    },
    {
      name: "seo",
      title: "SEO",
    },
    {
      name: "settings",
      title: "Settings",
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => [requiredText(rule), rule.max(96)],
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "settings",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().custom(uniqueRoutedSlug),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "array",
      group: "content",
      description:
        "A short Portable Text summary used on article listings and in metadata.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      group: "settings",
      to: { type: "author" },
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      group: "settings",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Main image",
      type: "image",
      group: "settings",
      description:
        "The photo on the post's card in the news list and the Latest news section, and its sharing image.",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description:
            "Describe the image for screen readers. Leave empty if the image is decorative or repeats nearby text.",
        }),
        defineField({
          name: "caption",
          type: "string",
          title: "Caption",
        }),
      ],
    }),
    defineField({
      name: "readingTime",
      title: "Reading time",
      type: "number",
      group: "settings",
      description: "Minutes, shown in the post's header and on its card: \"2 min read\".",
      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(1)
          .error("Add the reading time in whole minutes, 1 or more."),
    }),
    // The post's body: sections, as the old posts were built (spec decision
    // 9, issue #17). The post template draws the header above them.
    postBlocksField,
    meta,
  ],

  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      media: "image",
    },
    prepare({ title, slug, media }) {
      return {
        title,
        subtitle: postPath(slug) ?? undefined,
        media,
      };
    },
  },
});
