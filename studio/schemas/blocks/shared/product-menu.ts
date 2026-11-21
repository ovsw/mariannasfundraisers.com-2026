import type { ComponentType } from "react";
import { defineField, defineType } from "sanity";
import type { ProductKind } from "../../../../shared/content-routes.ts";
import sectionTheme from "./section-theme";

// The Hoagie, Pizza and Salsa menus (spec decision 12): an ordered list of
// products of one kind. Each product's menu card (short name, description,
// card photo, dressing) lives on the product, so it is edited once and every
// menu that lists the product shows the same card.

export function defineProductMenuSection({
  name,
  title,
  kind,
  plural,
  icon,
}: {
  name: string;
  title: string;
  kind: ProductKind;
  plural: string;
  icon: ComponentType;
}) {
  return defineType({
    name,
    title,
    type: "object",
    icon,
    description: `The menu cards of the ${plural} you choose, in your order, each with a Details button to the product's page.`,
    fields: [
      sectionTheme,
      defineField({
        name: "products",
        title: plural.charAt(0).toUpperCase() + plural.slice(1),
        type: "array",
        description: `The ${plural} to list, in order. Each card comes from the product's Menu card fields.`,
        of: [
          {
            type: "reference",
            to: [{ type: "product" }],
            options: { filter: "kind == $kind", filterParams: { kind } },
          },
        ],
        validation: (rule) => [
          rule
            .required()
            .min(1)
            .unique()
            .error(`Choose at least one of the ${plural}, each once. The section is not shown without them.`),
          // The picker's filter only limits what can be chosen; a product's
          // kind can change after it is listed, so check what is listed now.
          rule.custom(async (value, context) => {
            const ids = (value as Array<{ _ref?: string }> | undefined)
              ?.map((item) => item?._ref)
              .filter((id): id is string => Boolean(id));
            if (!ids?.length) return true;
            const others = await context
              .getClient({ apiVersion: "2026-03-23" })
              .fetch<Array<{ name?: string }>>(
                `*[_id in $ids && kind != $kind]{ name }`,
                { ids, kind },
              );
            if (!others.length) return true;
            const names = [...new Set(others.map((item) => item.name || "Untitled product"))].join(", ");
            return `Only ${plural} belong in this menu. Remove ${names}, which is not of this kind now.`;
          }),
        ],
      }),
    ],
    preview: {
      select: { first: "products.0.name", count: "products.length" },
      prepare: ({ first, count }) => ({
        title: title,
        subtitle: count ? `${count} ${plural}${first ? `, from ${first}` : ""}` : `No ${plural} yet`,
      }),
    },
  });
}
