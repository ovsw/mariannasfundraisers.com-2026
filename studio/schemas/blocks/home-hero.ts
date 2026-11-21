import { House } from "lucide-react";
import { defineField, defineType } from "sanity";
import { youTubeVideoId } from "../../../shared/youtube.ts";
import sectionTheme from "./shared/section-theme";
import { requiredText } from "../validation/required-text";

// The photo band at the top of the home page (spec decision 12, issue #18):
// a large title over the photo, a short text, buttons and an optional video
// link. Like the Page banner, the photo has no background of its own, so its
// theme is the colour of the brushed edge it draws at its foot: the theme of
// the section below it.
export default defineType({
  name: "homeHero",
  title: "Home hero",
  type: "object",
  icon: House,
  description:
    "The top of the home page: a full-width photo with a large title, a short text and buttons over it.",
  fields: [
    defineField({
      ...sectionTheme,
      description:
        "The colour of the brushed edge at the foot of the photo. Choose the theme of the section below the hero.",
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description:
        "Set the hotspot on the part of the photo that must stay in view; the text sits on the left.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the photo for screen readers. Leave empty if it is decorative.",
        }),
      ],
      validation: (rule) =>
        rule.required().assetRequired().error("Choose the photo. The hero is not shown without it."),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The page's main heading, shown large over the photo.",
      validation: (rule) =>
        requiredText(rule, "Add the title. The hero is not shown without it."),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "Optional. A smaller line under the title.",
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "simpleRichText",
      description: "Optional. A few sentences under the title.",
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      description: "Optional. Up to two buttons under the text.",
      of: [{ type: "button" }],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "youTubeUrl",
      title: "YouTube link",
      type: "url",
      description:
        "Optional. A YouTube video's address, as in https://www.youtube.com/watch?v=…. It adds a “Watch the video” button that opens the video on YouTube.",
      validation: (rule) =>
        rule
          .uri({ scheme: ["http", "https"] })
          .custom((value) =>
            typeof value !== "string" || youTubeVideoId(value)
              ? true
              : "Paste the link to one YouTube video, or leave the field empty.",
          ),
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({
      title: title || "Untitled Home hero",
      subtitle: "Home hero",
      media,
    }),
  },
});
