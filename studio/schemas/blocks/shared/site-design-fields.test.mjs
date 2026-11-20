// The editor-facing design choices (docs/design.md), checked in the extracted
// schema (studio/schema.json, kept current by `pnpm verify:typegen`): the
// section theme offers the old site's four backgrounds, and a button offers
// the old site's four colours and 22 icons, with no field for the icon side.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { contentPageBuilderBlockTypes } from "../page-builder.ts";

const schema = JSON.parse(
  readFileSync(new URL("../../../schema.json", import.meta.url), "utf8"),
);
const typeNamed = (name) => schema.find((type) => type.name === name)?.value;
const optionsOf = (attribute) =>
  attribute?.value?.of?.map((member) => member.value) ?? [];

test("every themed section offers exactly Light, Shaded, Muslin and Primary", () => {
  const themed = contentPageBuilderBlockTypes.filter(
    (name) => typeNamed(name)?.attributes?.theme,
  );
  assert.ok(themed.includes("richTextBlock"));
  for (const name of themed) {
    assert.deepEqual(
      optionsOf(typeNamed(name).attributes.theme),
      ["light", "shaded", "muslin", "primary"],
      name,
    );
  }
});

test("a button offers the four old colours and the 22 site icons", () => {
  const button = typeNamed("button");
  assert.deepEqual(optionsOf(button.attributes.colour), [
    "accent",
    "primary",
    "light-accent",
    "light-primary",
  ]);
  const icons = optionsOf(button.attributes.icon);
  assert.equal(icons.length, 22);
  assert.equal(new Set(icons).size, 22);
  for (const icon of ["chevron-right", "chevron-left", "people", "share"]) {
    assert.ok(icons.includes(icon), icon);
  }
});

test("no button field stores the icon side", () => {
  const fields = Object.keys(typeNamed("button").attributes).filter(
    (name) => !name.startsWith("_"),
  );
  assert.deepEqual(fields, ["text", "url", "colour", "icon"]);
});
