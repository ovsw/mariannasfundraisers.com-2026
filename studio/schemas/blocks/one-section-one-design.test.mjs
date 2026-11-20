// One section, one design (docs/adr/0001-one-section-one-design.md): a Page
// Builder section never changes its design through a field. This test walks
// every section type in the extracted schema (studio/schema.json, which
// `pnpm verify:typegen` keeps current) and fails on any field, at any depth,
// whose name says layout, variant, style, design, look, or appearance, or names
// a layout switch (position, alignment, columns, reverse, orientation). A
// content field caught by mistake (a job "position") gets a clearer name.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  contentPageBuilderBlockTypes,
  generalPageBuilderBlockTypes,
  homePagePageBuilderBlockTypes,
} from "./page-builder.ts";

const designWords = new Set([
  "layout",
  "variant",
  "style",
  "design",
  "look",
  "appearance",
  "position",
  "align",
  "alignment",
  "column",
  "reverse",
  "reversed",
  "orientation",
]);

// Fields Ovi has approved in writing, as "<section>.<field path>". Keep empty
// unless an exception is approved before the work starts.
const approvedDesignFields = new Set([]);

function isDesignFieldName(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[\s_-]+/)
    .some((word) => designWords.has(word.replace(/s$/, "")));
}

function findDesignFields(schema, sectionType) {
  const namedTypes = new Map(schema.map(({ name, value }) => [name, value]));
  // Types on the current recursion path only, so a shared nested type is
  // checked under every field that uses it while cycles still stop.
  const activeTypes = new Set();
  const found = [];

  function visit(node, path) {
    if (!node) return;
    switch (node.type) {
      case "object": {
        // A Portable Text block's `style` is a text style (h2, quote), not a
        // section design. Its other fields, such as annotations in
        // `markDefs`, are still checked.
        const isTextBlock = node.attributes?._type?.value?.value === "block";
        for (const [name, attribute] of Object.entries(node.attributes ?? {})) {
          if (name.startsWith("_")) continue;
          if (isTextBlock && name === "style") continue;
          const fieldPath = path ? `${path}.${name}` : name;
          if (isDesignFieldName(name)) found.push(fieldPath);
          visit(attribute.value, fieldPath);
        }
        visit(node.rest, path);
        return;
      }
      case "array":
        visit(node.of, `${path}[]`);
        return;
      case "union":
        for (const member of node.of) visit(member, path);
        return;
      case "inline": {
        if (node.name.endsWith(".reference") || node.name.startsWith("sanity.")) {
          return;
        }
        if (activeTypes.has(node.name)) return;
        activeTypes.add(node.name);
        visit(namedTypes.get(node.name), path);
        activeTypes.delete(node.name);
        return;
      }
      default:
        return;
    }
  }

  visit(namedTypes.get(sectionType), "");
  return found.map((fieldPath) => `${sectionType}.${fieldPath}`);
}

const schema = JSON.parse(
  readFileSync(new URL("../../schema.json", import.meta.url), "utf8"),
);
const sectionTypes = [
  ...new Set([
    ...contentPageBuilderBlockTypes,
    ...generalPageBuilderBlockTypes,
    ...homePagePageBuilderBlockTypes,
  ]),
];

test("every Page Builder section type is in the extracted schema", () => {
  const schemaTypeNames = new Set(schema.map(({ name }) => name));
  assert.deepEqual(
    sectionTypes.filter((type) => !schemaTypeNames.has(type)),
    [],
  );
});

test("no Page Builder section has a layout- or variant-style field", () => {
  const found = sectionTypes.flatMap((type) => findDesignFields(schema, type));
  assert.deepEqual(
    found.filter((field) => !approvedDesignFields.has(field)),
    [],
    "A new design is a new section with its own _type; see docs/adr/0001-one-section-one-design.md.",
  );
  assert.deepEqual(
    [...approvedDesignFields].filter((field) => !found.includes(field)),
    [],
    "This section no longer has the approved field; remove it from approvedDesignFields.",
  );
});

test("the design-field check finds nested fields and skips text styles", () => {
  const string = { type: "string" };
  const field = (value) => ({ type: "objectAttribute", value });
  const fixture = [
    {
      name: "demoSection",
      type: "type",
      value: {
        type: "object",
        attributes: {
          _type: field({ type: "string", value: "demoSection" }),
          theme: field(string),
          heading: field(string),
          variant: field(string),
          ctaURLStyle: field(string),
          cards: field({
            type: "array",
            of: { type: "inline", name: "demoCard" },
          }),
          featuredCard: field({ type: "inline", name: "demoCard" }),
          body: field({
            type: "array",
            of: {
              type: "object",
              attributes: {
                _type: field({ type: "string", value: "block" }),
                style: field(string),
                markDefs: field({
                  type: "array",
                  of: {
                    type: "object",
                    attributes: {
                      _type: field({ type: "string", value: "buttonLink" }),
                      variant: field(string),
                    },
                  },
                }),
              },
            },
          }),
        },
      },
    },
    {
      name: "demoCard",
      type: "type",
      value: {
        type: "object",
        attributes: {
          title: field(string),
          cardLayout: field(string),
          imageStyles: field(string),
          lookup: field(string),
        },
      },
    },
  ];

  assert.deepEqual(findDesignFields(fixture, "demoSection"), [
    "demoSection.variant",
    "demoSection.ctaURLStyle",
    "demoSection.cards[].cardLayout",
    "demoSection.cards[].imageStyles",
    "demoSection.featuredCard.cardLayout",
    "demoSection.featuredCard.imageStyles",
    "demoSection.body[].markDefs[].variant",
  ]);
});
