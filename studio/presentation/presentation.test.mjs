import assert from "node:assert/strict";
import test from "node:test";
import {
  getDocumentKind,
  getDocumentSlug,
  getPresentationPath,
  isPresentationDocumentType,
  resolveContentPath,
} from "./routes.ts";
import { resolve } from "./resolve.ts";

test("does not treat an ordinary index slug as homepage identity", () => {
  assert.equal(resolveContentPath("index"), "/index");
});

test("normalizes leading and trailing slashes", () => {
  assert.equal(resolveContentPath("///method-process///"), "/method-process");
});

test("resolves a normal page slug to a canonical path", () => {
  assert.equal(getPresentationPath("page", "about"), "/about");
  assert.equal(
    getPresentationPath("page", "staff/available-positions"),
    "/staff/available-positions",
  );
});

test("resolves a normal post slug to a canonical path", () => {
  assert.equal(getPresentationPath("post", "first-post"), "/news/first-post");
});

test("has no category routes", () => {
  assert.equal(getPresentationPath("category", "categories"), null);
  assert.equal(
    resolve.mainDocuments.some(({ route }) => route.includes("category")),
    false,
  );
});

test("resolves the News Index singleton without an authored slug", () => {
  assert.equal(getPresentationPath("blogIndex"), "/news");
});

test("missing and empty slugs disable Presentation navigation", () => {
  assert.equal(getPresentationPath("page", undefined), null);
  assert.equal(getPresentationPath("page", ""), null);
});

test("an existing draft is authoritative when resolving its slug", () => {
  assert.equal(
    getDocumentSlug({ slug: {} }, { slug: { current: "published-path" } }),
    undefined,
  );
  assert.equal(
    getDocumentSlug(undefined, { slug: { current: "published-path" } }),
    "published-path",
  );
});

test("unsupported document types do not expose the action", () => {
  assert.equal(isPresentationDocumentType("page"), true);
  assert.equal(isPresentationDocumentType("post"), true);
  assert.equal(isPresentationDocumentType("category"), false);
  assert.equal(isPresentationDocumentType("blogIndex"), true);
  assert.equal(isPresentationDocumentType("author"), false);
});

test("matches nested page paths when Presentation follows the preview", () => {
  assert.equal(resolve.mainDocuments.at(-1).route, "/:slug(.+)");
});

test("resolves a product to the address its kind sets", () => {
  assert.equal(getPresentationPath("product", "italian-hoagie", "hoagie"), "/products/italian-hoagie");
  assert.equal(getPresentationPath("product", "mph-salsa", "salsa"), "/flavored-salsas/mph-salsa");
  assert.equal(getPresentationPath("product", "mph-salsa"), null);
  assert.equal(isPresentationDocumentType("product"), true);
  assert.equal(getDocumentKind({ kind: "pizza" }, { kind: "hoagie" }), "pizza");
  assert.equal(getDocumentKind(undefined, { kind: "hoagie" }), "hoagie");
});

test("product addresses find a product or the page that owns them", () => {
  const routes = resolve.mainDocuments.map(({ route }) => route);
  assert.ok(routes.indexOf("/products/:slug") < routes.indexOf("/:slug(.+)"));
  assert.ok(routes.indexOf("/flavored-salsas/:slug") < routes.indexOf("/:slug(.+)"));
  const salsa = resolve.mainDocuments.find(({ route }) => route === "/flavored-salsas/:slug");
  assert.match(salsa.filter, /_type == "product" && kind == "salsa"/);
  assert.match(salsa.filter, /_type == "page" && slug\.current in \["flavored-salsas\/" \+ \$slug/);
});
