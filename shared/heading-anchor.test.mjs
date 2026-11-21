import assert from "node:assert/strict";
import test from "node:test";
import { headingAnchorId } from "./heading-anchor.ts";

test("a heading's anchor is its text in lowercase hyphenated words", () => {
  assert.equal(headingAnchorId("Italian Hoagie"), "italian-hoagie");
  assert.equal(headingAnchorId("Ham & Swiss Hoagie"), "ham-and-swiss-hoagie");
  assert.equal(headingAnchorId("Smoked Ham & Cheddar Hoagie"), "smoked-ham-and-cheddar-hoagie");
  assert.equal(headingAnchorId("All-American Hoagie"), "all-american-hoagie");
  assert.equal(headingAnchorId("Marianna's  Story!"), "mariannas-story");
  assert.equal(headingAnchorId("   "), "");
});
