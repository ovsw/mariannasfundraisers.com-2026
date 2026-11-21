import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { bigImageSection, compareSharedRow, EXPECTED, importedShape, pageRowSections } from "./migration/block-inventory.mjs";
import { malformedSlugReason, migrationDir, pathToFileStem, sitemapPaths } from "./migration/lib.mjs";

const readJson = (file) => JSON.parse(readFileSync(path.join(migrationDir, file), "utf8"));

test("a news slug is malformed when it ends in a hyphen or holds a colon", () => {
  assert.equal(malformedSlugReason("/news/fund-fiesta-is-here-"), "ends in a hyphen");
  assert.equal(malformedSlugReason("/news/winner:-2024-hometown-favorite-sandwich"), "contains a colon");
  assert.equal(malformedSlugReason("/news/Spring-sale"), "is not lowercase letters and digits with single hyphens");
  assert.equal(malformedSlugReason("/news/spring--sale"), "is not lowercase letters and digits with single hyphens");
  assert.equal(malformedSlugReason("/news/a-positive-partnership"), null);
  assert.equal(malformedSlugReason("/products/italian-hoagie"), null);
});

test("screenshot file names keep the path and are safe on every file system", () => {
  assert.equal(pathToFileStem("/"), "home");
  assert.equal(pathToFileStem("/products/italian-hoagie"), "products__italian-hoagie");
  assert.equal(pathToFileStem("/news/winner:-2024"), "news__winner%3A-2024");
});

test("sitemap paths lose the origin and the trailing slash", () => {
  const xml = "<urlset><url><loc>https://example.com</loc></url><url><loc>https://example.com/a/b/</loc></url></urlset>";
  assert.deepEqual(sitemapPaths(xml), ["/", "/a/b"]);
});

test("a big image row picks its section from its switches, video first", () => {
  assert.equal(bigImageSection({ youTubeLink: "https://youtu.be/x", badge_image: true, is_reversed: true, content: [] }), "Video left and text");
  assert.equal(bigImageSection({ badge_image: true, contain_image: true, content: [] }), "Badge and text");
  assert.equal(bigImageSection({ contain_image: true, content: [{ component: "feature-group" }] }), "Image and icon list");
  assert.equal(bigImageSection({ contain_image: true, content: [] }), "Cutout right and text");
  assert.equal(bigImageSection({ is_reversed: true, content: [] }), "Photo left and text");
});

test("an FAQ row with two lists becomes two FAQ list sections", () => {
  const row = { component: "row-single-column", content: [{ component: "faq-list" }, { component: "faq-list" }] };
  assert.deepEqual(pageRowSections(row), ["FAQ list", "FAQ list"]);
});

test("shared rows compare as imported: IDs, empty values, options and colour marks do not count", () => {
  const text = (marks, extra = []) => ({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hi", marks }, ...extra] }] });
  const a = { _uid: "1", component: "row-big-image", name: "A", badge_image: false, text: text([{ type: "textStyle", attrs: { color: "#D4D4D4" } }]) };
  const b = { _uid: "2", component: "row-big-image", extra_padding: true, text: text([]) };
  assert.deepEqual(importedShape(a), importedShape(b));
  const c = { _uid: "3", component: "row-big-image", text: text([], [{ type: "hard_break" }]) };
  const result = compareSharedRow([{ slug: "a", row: a }, { slug: "b", row: b }, { slug: "c", row: c }]);
  assert.equal(result.identical, false);
  assert.deepEqual(result.variants.map((v) => v.products), [["a", "b"], ["c"]]);
});

test("the URL inventory lists 67 URLs, 11 redirects and 5 malformed slugs", () => {
  const inventory = readJson("url-inventory.json");
  const paths = inventory.urls.map((u) => u.path);
  assert.equal(paths.length, 67);
  assert.equal(new Set(paths).size, 67);
  assert.equal(inventory.urls.filter((u) => u.inSitemap).length, 65);
  for (const extra of ["/accessibility-statement", "/accessibility-policy"]) assert.ok(paths.includes(extra), extra);
  assert.equal(inventory.redirects.length, 11);
  const malformed = inventory.urls.filter((u) => u.malformedSlug);
  assert.equal(malformed.length, 5);
  assert.equal(malformed.filter((u) => u.malformedSlug.reason === "ends in a hyphen").length, 4);
  assert.equal(malformed.filter((u) => u.malformedSlug.reason === "contains a colon").length, 1);
  for (const url of inventory.urls) {
    assert.ok(["page", "news post", "product", "news list"].includes(url.kind), url.path);
    assert.equal(url.status, 200, url.path);
  }
});

test("every inventory URL has a screenshot at 1440 px and at 390 px", () => {
  const files = new Set(readdirSync(path.join(migrationDir, "screenshots")));
  const expected = readJson("url-inventory.json").urls.flatMap((u) => [1440, 390].map((w) => `${pathToFileStem(u.path)}--${w}.webp`));
  for (const file of expected) assert.ok(files.has(file), `missing ${file}`);
  assert.equal(files.size, expected.length);
});

test("the block inventory counts equal the export", () => {
  const { counts, stories } = readJson("block-inventory.json");
  for (const [key, value] of Object.entries(EXPECTED)) assert.equal(counts[key], value, key);
  assert.equal(stories.length, EXPECTED.stories);
  for (const story of stories) for (const row of story.rows) assert.ok(row.becomes?.type && row.becomes?.name, `${story.path} ${row.source}`);
});

test("the seed holds the header and footer links, with dropped links marked", () => {
  const seed = readJson("seed/hard-coded-content.json");
  const groups = seed.navigation.items.filter((item) => item.type === "group");
  assert.deepEqual(groups.map((g) => g.title), ["Fundraisers", "About Us", "Selling Tools"]);
  assert.deepEqual(groups.map((g) => g.links.filter((l) => !l.dropped).length), [8, 8, 7]);
  assert.deepEqual(seed.footer.columns.map((c) => c.title), ["Fundraisers", "Support", "Company"]);
  assert.equal(seed.footer.legalLinks.length, 5);
  const links = [
    ...groups.flatMap((g) => g.links),
    ...seed.navigation.items.filter((item) => item.type === "link"),
    ...seed.navigation.actionButtons,
    ...seed.footer.columns.flatMap((c) => c.links),
    ...seed.footer.legalLinks,
    ...seed.settings.social,
  ];
  for (const link of links) {
    if (link.dropped) {
      assert.ok(link.reason, `${link.label} is dropped without a reason`);
      continue;
    }
    assert.ok(link.label && link.description !== "" && link.href, JSON.stringify(link));
    assert.notEqual(link.href, "#");
    assert.doesNotMatch(link.href, /^\/.+\/$/, `${link.label} keeps a trailing slash`);
    assert.doesNotMatch(link.href, /\/blog/, `${link.label} points at /blog`);
  }
  assert.equal(seed.settings.social.filter((s) => s.oldHref === "#").every((s) => s.dropped), true);
  assert.equal(seed.authors.items.length, 4);
  for (const author of seed.authors.items) assert.ok(existsSync(path.join(migrationDir, "seed", author.photo)), author.photo);
});
