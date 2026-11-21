import { defineField, defineType } from "sanity";
import { requiredText } from "../../validation/required-text";
import {
  buttonColours,
  defaultButtonColour,
  siteIcons,
} from "../../../../shared/site-design.ts";

export default defineType({
  name: "button",
  title: "Button",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Button Text",
      type: "string",
      validation: (rule) =>
        requiredText(
          rule,
          "Add the button text. A button without it is not shown.",
        ),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "customUrl",
      validation: (rule) =>
        rule
          .required()
          .error(
            "Add where the button goes. A button without it is not shown.",
          ),
    }),
    defineField({
      name: "colour",
      title: "Colour",
      type: "string",
      description:
        "Red for the main action; green, or white with red or green text, for the others.",
      options: {
        list: buttonColours.map(({ title, value }) => ({ title, value })),
      },
      initialValue: defaultButtonColour,
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description:
        "Optional. Chevron right sits after the text; every other icon sits before it.",
      options: {
        list: siteIcons.map(({ title, value }) => ({ title, value })),
      },
    }),
  ],
  preview: {
    select: { title: "text", subtitle: "url.external" },
  },
});
