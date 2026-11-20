import assert from "node:assert/strict";
import test from "node:test";

import { findUnrenderedSections } from "./unrendered-sections.mjs";

const sections = [
  { _key: "a1", _type: "richTextBlock" },
  { _key: "b2", _type: "richTextBlock" },
  { _key: "c3", _type: "futureBlock" },
];

test("a page whose sections all draw content passes", () => {
  const body =
    '<div data-band="light"><div data-section-key="a1"><section>One</section></div>' +
    '<div data-section-key="b2"><section>Two</section></div>' +
    '<div data-section-key="c3"><section>Three</section></div></div>';
  assert.deepEqual(findUnrenderedSections(body, sections), []);
});

test("an empty wrapper and a missing wrapper are both reported", () => {
  const body =
    '<div data-section-key="a1"><section>One</section></div>' +
    '<div data-section-key="b2"><!--$--><!--/$--></div>';
  assert.deepEqual(findUnrenderedSections(body, sections), [
    "richTextBlock (b2) drew nothing",
    "futureBlock (c3) has no renderer",
  ]);
});

test("a wrapper with other attributes and whitespace only is empty", () => {
  const body = '<div data-sanity="x" data-section-key="a1" class="y"> \n </div>';
  assert.deepEqual(findUnrenderedSections(body, [sections[0]]), [
    "richTextBlock (a1) drew nothing",
  ]);
});

test("a key is matched whole, not as a prefix", () => {
  const body = '<div data-section-key="a1x"><section>One</section></div>';
  assert.deepEqual(findUnrenderedSections(body, [sections[0]]), [
    "richTextBlock (a1) has no renderer",
  ]);
});

test("content between two comment markers is content", () => {
  const body =
    '<div data-section-key="a1"><!--$--><section>One</section><!--/$--></div>';
  assert.deepEqual(findUnrenderedSections(body, [sections[0]]), []);
});
