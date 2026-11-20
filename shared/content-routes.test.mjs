import assert from "node:assert/strict";
import test from "node:test";

import {
  isApplicationPath,
  isReservedPagePath,
  normalizePublicPath,
  pagePath,
  postPath,
  routedDocumentPath,
} from "./content-routes.ts";

test("resolves every routed document type without an ending slash", () => {
  assert.equal(pagePath("/about/"), "/about");
  assert.equal(
    pagePath("/staff/available-positions/"),
    "/staff/available-positions",
  );
  assert.equal(postPath("/first-post/"), "/news/first-post");
  assert.equal(routedDocumentPath("post", "first-post"), "/news/first-post");
  assert.equal(routedDocumentPath("page", "about"), "/about");
});

test("rejects missing and malformed routed slugs", () => {
  for (const slug of [undefined, "", "/", "Uppercase", "under_score", "two//segments", "two/Bad"]) {
    assert.equal(pagePath(slug), null, String(slug));
  }
  for (const slug of [undefined, "", "/", "two/segments", "Uppercase", "under_score"]) {
    assert.equal(postPath(slug), null, String(slug));
  }
});

test("normalizes safe internal paths and rejects unsafe values", () => {
  assert.equal(normalizePublicPath(" /old/path/ "), "/old/path");
  assert.equal(normalizePublicPath("https://example.com"), "");
  assert.equal(normalizePublicPath("/old?preview=true"), "");
  assert.equal(normalizePublicPath("/old#section"), "");
  assert.equal(normalizePublicPath("/bad\\path"), "");
});

test("recognizes application-owned routes", () => {
  for (const path of [
    "/",
    "/news",
    "/news/2",
    "/contact/thanks",
    "/api/draft-mode/enable",
    "/_next/static/file.js",
    "/robots.txt",
    "/sitemap.xml",
  ]) {
    assert.equal(isApplicationPath(path), true, path);
  }
  assert.equal(isApplicationPath("/about"), false);
  assert.equal(isApplicationPath("/news/first-post"), false);
  assert.equal(isApplicationPath("/blog"), false);
});

test("reserves the news namespace from editor-created pages", () => {
  assert.equal(isReservedPagePath("/news"), true);
  assert.equal(isReservedPagePath("/news/first-post"), true);
  assert.equal(isReservedPagePath("/blog/first-post"), false);
  assert.equal(isReservedPagePath("/staff/available-positions"), false);
});
