import { Store } from "lucide-react";
import { defineField, defineType } from "sanity";
import { requiredText } from "../validation/required-text";

// What is the same on every product page (spec decision 8): the "Handmade
// food" block and the "Preparing a fundraiser?" call to action, and for each
// kind of product the two hero buttons and the optional "full ingredients
// list" button. The pattern of `blogPostSettings`: one global document.

const altField = defineField({
  name: "alt",
  title: "Alternative text",
  type: "string",
  description: "Describe the image for screen readers. Leave empty if it is decorative.",
});

function blockImage(title: string, description: string) {
  return defineField({
    name: "image",
    title,
    type: "image",
    description,
    options: { hotspot: true },
    fields: [altField],
    validation: (rule) =>
      rule.required().assetRequired().error(`Choose the ${title.toLowerCase()}. The block is not shown without it.`),
  });
}

const buttonsField = (description: string) =>
  defineField({
    name: "buttons",
    title: "Buttons",
    type: "array",
    description,
    of: [{ type: "button" }],
    validation: (rule) => rule.max(2),
  });

export const productHandmadeBlock = defineType({
  name: "productHandmadeBlock",
  title: "Handmade food block",
  type: "object",
  description: "A photo on the left and text on the right, under the nutrition facts of every product page.",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Optional. The short line above the heading, as in “Handmade Food That”.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (rule) => requiredText(rule, "Add the heading. The block is not shown without it."),
    }),
    defineField({
      name: "richText",
      title: "Text",
      type: "richTextContent",
      description: "Optional. Text under the heading.",
    }),
    buttonsField("Optional. Up to two buttons under the text."),
    blockImage("Photo", "Cropped to fill its frame, beside the text."),
  ],
});

export const productCallToAction = defineType({
  name: "productCallToAction",
  title: "Call to action",
  type: "object",
  description: "The closing block of every product page: a heading, a line of text and a button, beside a photo.",
  fields: [
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (rule) => requiredText(rule, "Add the heading. The call to action is not shown without it."),
    }),
    defineField({
      name: "richText",
      title: "Text",
      type: "richTextContent",
      description: "Optional. A line under the heading.",
    }),
    buttonsField("Optional. Up to two buttons under the text."),
    blockImage("Photo", "A cut-out photo on the right, standing out of the block's top."),
  ],
});

export const productKindLinks = defineType({
  name: "productKindLinks",
  title: "Buttons for one kind of product",
  type: "object",
  fields: [
    defineField({
      name: "heroButtons",
      title: "Hero buttons",
      type: "array",
      description:
        "The two buttons under the hero text: more selections (back to the menu) and pricing info.",
      of: [{ type: "button" }],
      validation: (rule) =>
        rule.required().length(2).error("Add the two hero buttons: more selections and pricing info."),
    }),
    defineField({
      name: "ingredientsListButton",
      title: "Full ingredients list button",
      type: "button",
      description:
        "Optional. The button under the ingredients. Point it at the ingredients list page; each product adds its own anchor, its name in lowercase words with hyphens, which lands on the heading with the product's name.",
    }),
  ],
});

export default defineType({
  name: "productPageSettings",
  title: "Product Page Settings",
  type: "document",
  icon: Store,
  description: "The blocks and buttons that are the same on every product page.",
  groups: [
    { name: "blocks", title: "Shared blocks", default: true },
    { name: "buttons", title: "Buttons per kind" },
  ],
  fields: [
    defineField({
      name: "handmade",
      title: "Handmade food block",
      type: "productHandmadeBlock",
      group: "blocks",
      validation: (rule) => rule.required().error("Add the Handmade food block."),
    }),
    defineField({
      name: "callToAction",
      title: "Call to action",
      type: "productCallToAction",
      group: "blocks",
      validation: (rule) => rule.required().error("Add the call to action."),
    }),
    defineField({
      name: "hoagie",
      title: "Hoagies",
      type: "productKindLinks",
      group: "buttons",
      validation: (rule) => rule.required().error("Add the hoagie buttons."),
    }),
    defineField({
      name: "pizza",
      title: "Pizzas",
      type: "productKindLinks",
      group: "buttons",
      validation: (rule) => rule.required().error("Add the pizza buttons."),
    }),
    defineField({
      name: "salsa",
      title: "Salsas",
      type: "productKindLinks",
      group: "buttons",
      validation: (rule) => rule.required().error("Add the salsa buttons."),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Product Page Settings" }),
  },
});
