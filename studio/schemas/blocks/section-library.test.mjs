// The "Section library" list in docs/content-model.md is the text version of
// the Page Builder catalogue that content-editing agents are given. This test
// fails when it names different sections than the scope lists in
// page-builder.ts. It cannot tell whether an entry's text is still true.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  contentPageBuilderBlockTypes,
  generalPageBuilderBlockTypes,
  homePagePageBuilderBlockTypes,
} from "./page-builder.ts";

export function listedSectionTypes(markdown) {
  const start = markdown.search(/^## Section library\s*$/m);
  assert.notEqual(start, -1, 'docs/content-model.md has no "## Section library" heading.');
  const rest = markdown.slice(start).replace(/^.*\n/, "");
  const end = rest.search(/^## /m);
  const body = end === -1 ? rest : rest.slice(0, end);
  return [...body.matchAll(/^- `([^`]+)`/gm)].map((match) => match[1]);
}

const sectionTypes = [
  ...new Set([
    ...contentPageBuilderBlockTypes,
    ...generalPageBuilderBlockTypes,
    ...homePagePageBuilderBlockTypes,
  ]),
];
const listed = listedSectionTypes(
  readFileSync(new URL("../../../docs/content-model.md", import.meta.url), "utf8"),
);

test("every Page Builder section is in the Section library list", () => {
  assert.deepEqual(
    sectionTypes.filter((type) => !listed.includes(type)),
    [],
    'Add these sections to "Section library" in docs/content-model.md.',
  );
});

test("the Section library list names only existing sections, once each", () => {
  assert.deepEqual(
    listed.filter((type) => !sectionTypes.includes(type)),
    [],
    'Remove these entries from "Section library" in docs/content-model.md, or fix the name.',
  );
  assert.deepEqual(
    listed.filter((type, index) => listed.indexOf(type) !== index),
    [],
    "These sections are listed more than once.",
  );
});

test("the list parser reads only entries under the Section library heading", () => {
  const markdown = [
    "## Other",
    "- `notASection` text",
    "## Section library",
    "Intro with `inlineCode`.",
    "- `heroBlock` (Hero). Text.",
    "  continued `nested` line",
    "- `faqBlock` text",
    "## Next",
    "- `alsoNot` text",
  ].join("\n");
  assert.deepEqual(listedSectionTypes(markdown), ["heroBlock", "faqBlock"]);
});
