import { ImageIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import sectionTheme from "./shared/section-theme";

// The photo band at the top of an inner page, at one height, with an optional
// title over the photo. The photo has no background of its own, so its theme
// is the colour of the brushed edge it draws at its foot: the theme of the
// section below it.
export default defineType({
  name: "pageBanner",
  title: "Page banner",
  type: "object",
  icon: ImageIcon,
  description:
    "A full-width photo at the top of a page, with an optional title over it.",
  fields: [
    defineField({
      ...sectionTheme,
      description:
        "The colour of the brushed edge at the foot of the photo. Choose the theme of the section below the banner.",
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description: "Set the hotspot on the part of the photo that must stay in view.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Describe the photo for screen readers. Leave empty if it is decorative.",
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .assetRequired()
          .error("Choose the photo. The banner is not shown without it."),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "Optional. Shown over the photo as the page's main heading; leave empty when a Page heading section follows.",
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({
      title: title || "Page banner",
      subtitle: "Page banner",
      media,
    }),
  },
});
