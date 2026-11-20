import { Sandwich } from "lucide-react";
import { defineField, defineType } from "sanity";
import { productPath } from "../../../shared/content-routes.ts";
import meta from "../blocks/shared/meta";
import { requiredRichText } from "../validation/required-rich-text";
import { requiredText } from "../validation/required-text";
import { uniqueRoutedSlug } from "../validation/routed-slug";

// A product (spec decision 8): one of the hoagies, pizzas and salsas. Its page
// is drawn by one template in code from these fields and the shared blocks of
// `productPageSettings`; a product has no Page Builder. The kind sets the
// address and which menu can list it.

const altField = defineField({
  name: "alt",
  title: "Alternative text",
  type: "string",
  description: "Describe the image for screen readers. Leave empty if it is decorative.",
});

function requiredImage(name: string, title: string, description: string, group: string) {
  return defineField({
    name,
    title,
    type: "image",
    group,
    description,
    options: { hotspot: true },
    fields: [altField],
    validation: (rule) =>
      rule
        .required()
        .assetRequired()
        .error(`Choose the ${title.toLowerCase()}. The product page is not complete without it.`),
  });
}

/** One value of the nutrition facts: a number, in the unit the label prints. */
function nutritionValue(name: string, title: string, unit: string) {
  return defineField({
    name,
    title,
    type: "number",
    description: unit,
    validation: (rule) =>
      rule.required().min(0).error(`Add the ${title.toLowerCase()} (${unit}), 0 or more.`),
  });
}

const nutrient = (name: string, title: string, unit: string) => [
  nutritionValue(name, title, unit),
  nutritionValue(`${name}DailyValue`, `${title} daily value`, "% Daily Value"),
];

/** The 26 values of the nutrition facts label, in the order the label prints them. */
export const nutritionValueFields = [
  nutritionValue("calories", "Calories", "Calories per serving"),
  ...nutrient("totalFat", "Total fat", "grams"),
  ...nutrient("saturatedFat", "Saturated fat", "grams"),
  nutritionValue("transFat", "Trans fat", "grams"),
  ...nutrient("cholesterol", "Cholesterol", "milligrams"),
  ...nutrient("sodium", "Sodium", "milligrams"),
  ...nutrient("totalCarbohydrates", "Total carbohydrates", "grams"),
  ...nutrient("dietaryFiber", "Dietary fiber", "grams"),
  nutritionValue("totalSugars", "Total sugars", "grams"),
  ...nutrient("addedSugars", "Added sugars", "grams"),
  nutritionValue("protein", "Protein", "grams"),
  ...nutrient("vitaminD", "Vitamin D", "micrograms"),
  ...nutrient("calcium", "Calcium", "milligrams"),
  ...nutrient("iron", "Iron", "milligrams"),
  ...nutrient("potassium", "Potassium", "milligrams"),
];

export const nutritionFacts = defineType({
  name: "nutritionFacts",
  title: "Nutrition facts",
  type: "object",
  options: { columns: 2 },
  fields: [
    defineField({
      name: "servingText",
      title: "Serving text",
      type: "richTextContent",
      description:
        "Beside the label: servings per container, serving size, calories, the % Daily Value note and the allergens.",
      validation: (rule) =>
        requiredRichText(rule, "Add the serving text. The nutrition facts are not complete without it."),
    }),
    ...nutritionValueFields,
  ],
});

export const productMenuCard = defineType({
  name: "productMenuCard",
  title: "Menu card",
  type: "object",
  fields: [
    defineField({
      name: "shortName",
      title: "Short name",
      type: "string",
      description:
        "The name on the menu card, as in “Italian”. The card adds “Hoagie” or “Pizza” after it; a salsa card shows it as written.",
      validation: (rule) => requiredText(rule, "Add the short name. The menu card is not shown without it."),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      description: "A few sentences under the name on the menu card.",
      validation: (rule) =>
        requiredText(rule, "Add the short description. The menu card is not complete without it."),
    }),
    defineField({
      name: "image",
      title: "Card photo",
      type: "image",
      description: "The product on a plain background, beside the card's text.",
      options: { hotspot: true },
      fields: [altField],
      validation: (rule) =>
        rule.required().assetRequired().error("Choose the card photo. The menu card is not shown without it."),
    }),
    defineField({
      name: "dressing",
      title: "Dressing",
      type: "string",
      description: "Hoagies only: the dressing the card names under the hoagie's name.",
      options: {
        list: [
          { title: "Marianna’s Italian Dressing", value: "italian" },
          { title: "Marianna’s Sweet & Sassy Mayo", value: "mayo" },
        ],
        layout: "radio",
      },
      hidden: ({ document }) => document?.kind !== "hoagie",
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.kind === "hoagie" && !value
            ? "Choose the dressing. A hoagie's menu card names it."
            : true,
        ),
    }),
  ],
});

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: Sandwich,
  groups: [
    { name: "content", title: "Page", default: true },
    { name: "nutrition", title: "Nutrition facts" },
    { name: "menuCard", title: "Menu card" },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Settings" },
  ],
  orderings: [
    { title: "Name (A–Z)", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
    {
      title: "Kind, then name",
      name: "kindName",
      by: [
        { field: "kind", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "content",
      description:
        "The product's full name, as in “Italian Hoagie”. It heads the nutrition facts, and the “full ingredients list” button jumps to the heading with this name on the ingredients list page.",
      validation: (rule) => requiredText(rule, "Add the product's name."),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      group: "settings",
      description:
        "Sets the address: hoagies and pizzas live at /products/<slug>, salsas at /flavored-salsas/<slug>. It also picks the hero buttons and the menu that can list the product.",
      options: {
        list: [
          { title: "Hoagie", value: "hoagie" },
          { title: "Pizza", value: "pizza" },
          { title: "Salsa", value: "salsa" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) => rule.required().error("Choose the kind. It sets the product's address."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "settings",
      description: "The last part of the address, after /products/ or /flavored-salsas/.",
      // The routed slug rule checks uniqueness by address: a hoagie and a
      // salsa may share a slug, as they live under different prefixes.
      options: { source: "name", maxLength: 96, isUnique: () => true },
      validation: (rule) => rule.required().custom(uniqueRoutedSlug),
    }),
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      group: "content",
      description: "The page's main heading, over the dark top of the page, as in “14\" Italian Hoagie”.",
      validation: (rule) => requiredText(rule, "Add the hero title. It is the page's main heading."),
    }),
    defineField({
      name: "heroText",
      title: "Hero text",
      type: "richTextContent",
      group: "content",
      description: "Optional. A few sentences under the hero title. The two buttons under it come from Product Page Settings.",
    }),
    requiredImage("heroImage", "Hero photo", "The product beside the hero title, on a transparent or dark background.", "content"),
    defineField({
      name: "ingredientsLabel",
      title: "Ingredients label",
      type: "string",
      group: "content",
      description: "Optional. The short line above the “Ingredients” heading, as in “Always Fresh”.",
    }),
    defineField({
      name: "ingredientsText",
      title: "Ingredients text",
      type: "richTextContent",
      group: "content",
      description: "The ingredients, under the “Ingredients” heading.",
      validation: (rule) =>
        requiredRichText(rule, "Add the ingredients. The product page is not complete without them."),
    }),
    requiredImage("ingredientsImage", "Ingredients image", "Shown whole beside the ingredients, as the product's badge sticker.", "content"),
    defineField({
      name: "note",
      title: "Note",
      type: "richTextContent",
      group: "content",
      description: "Optional. A note under the ingredients, as the pizzas' storage and baking note.",
    }),
    defineField({
      name: "nutritionFacts",
      title: "Nutrition facts",
      type: "nutritionFacts",
      group: "nutrition",
      validation: (rule) => rule.required().error("Add the nutrition facts."),
    }),
    defineField({
      name: "menuCard",
      title: "Menu card",
      type: "productMenuCard",
      group: "menuCard",
      description: "How the product appears in the Hoagie, Pizza or Salsa menu section, with a link to this page.",
      validation: (rule) => rule.required().error("Add the menu card."),
    }),
    meta,
  ],
  preview: {
    select: { title: "name", kind: "kind", slug: "slug.current", media: "menuCard.image" },
    prepare: ({ title, kind, slug, media }) => ({
      title: title || "Untitled product",
      subtitle: productPath(kind, slug) ?? kind,
      media,
    }),
  },
});
