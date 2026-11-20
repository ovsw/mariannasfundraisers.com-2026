// News posts in the importer (spec testing seam 1, issue #17), with fixtures
// cut from the real Storyblok export of 2026-11-20 (fixtures/news.json): a post
// of one image row whose slug holds a colon, and a post built from several
// rows with a video. The authors, the news list and the Latest news section
// come from the reference capture's seed file.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isRouteSlug } from "../../../shared/content-routes.ts";
import { cleanPostSlug, publishedAtFrom } from "./news.mjs";
import { createSite, planImport } from "./transform.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
const posts = read("./fixtures/news.json");
const seed = read("../../../docs/migration/seed/hard-coded-content.json");
const home = { name: "Home", uuid: "home-fixture", full_slug: "home", slug: "home", content: { component: "page", _uid: "home", body: [] } };

const assetIds = new Map();
const fileRef = (url, kind) => {
  const key = `${kind} ${url}`;
  if (!assetIds.has(key)) assetIds.set(key, `${kind}-asset-${assetIds.size}`);
  return assetIds.get(key);
};

const plan = (stories = posts) => planImport({ stories }, { fileRef, seed });
const story = (slug) => posts.find((item) => item.slug === slug);
const postFor = (documents, slug) => documents.find((document) => document._id === `post-${story(slug).uuid}`);

test("a post of one image row becomes a post with its header fields and one section", () => {
  const { documents, report } = plan();
  const source = story("winner:-2024-hometown-favorite-sandwich");
  const post = postFor(documents, source.slug);
  const row = source.content.body[0].content[0];

  assert.equal(post._type, "post");
  assert.equal(post.title, source.name);
  assert.equal(post.excerpt[0].children[0].text, source.content.excerpt);
  assert.deepEqual(post.author, { _type: "reference", _ref: "author-todd" });
  assert.equal(post.publishedAt, "2024-11-07T00:00:00.000Z");
  assert.equal(post.readingTime, 1);
  assert.equal(post.image.asset._ref, fileRef(source.content.main_image.filename, "image"));
  assert.equal(post.image.alt, source.content.main_image.alt);
  assert.deepEqual(
    post.blocks.map((block) => [block._type, block._key, block.theme]),
    [["photoLeftAndText", row._uid, "light"]],
  );
  assert.equal(post.blocks[0].image.asset._ref, fileRef(row.image.filename, "image"));
  assert.ok(post.blocks[0].richText.length);
  assert.equal(report.found.news, 2);
  assert.equal(report.documents.post, 2);
});

test("a post of several rows keeps their order, themes and video, and never holds a Scaffold", () => {
  const { documents, report } = plan();
  const source = story("mariannas-hoagies-on-tv");
  const post = postFor(documents, source.slug);
  const rows = source.content.body.flatMap((section) => section.content);

  assert.deepEqual(
    post.blocks.map((block) => [block._type, block._key, block.theme]),
    [
      ["richTextBlock", rows[0]._uid, "light"],
      ["videoRightAndText", rows[1]._uid, "light"],
      ["richTextBlock", rows[2]._uid, "light"],
    ],
  );
  assert.equal(post.blocks[1].youTubeUrl, rows[1].youTubeLink);
  assert.deepEqual(report.scaffolds, {});
  // The old news template never drew body_rte; it is counted, not imported.
  assert.equal(report.dropped["news: body_rte"], 1);
  assert.equal(post.body, undefined);
});

test("a malformed slug gets a clean slug and a permanent redirect from the old address", () => {
  const { documents, report } = plan();
  const source = story("winner:-2024-hometown-favorite-sandwich");
  const post = postFor(documents, source.slug);
  assert.equal(post.slug.current, "winner-2024-hometown-favorite-sandwich");

  const redirects = documents.filter((document) => document._type === "redirect");
  assert.deepEqual(redirects, [
    {
      _id: `redirect-${post._id}`,
      _type: "redirect",
      status: "active",
      source: { _type: "slug", current: "/news/winner:-2024-hometown-favorite-sandwich" },
      destinationReference: { _type: "reference", _ref: post._id },
      permanent: "true",
    },
  ]);
  assert.deepEqual(report.newsRedirects, [
    { from: "/news/winner:-2024-hometown-favorite-sandwich", to: "/news/winner-2024-hometown-favorite-sandwich" },
  ]);
  // A clean old slug keeps its address and needs no redirect.
  assert.equal(postFor(documents, "mariannas-hoagies-on-tv").slug.current, "mariannas-hoagies-on-tv");
});

test("every malformed old slug has a clean one that passes the slug rule", () => {
  assert.equal(cleanPostSlug("winner:-2024-hometown-favorite-sandwich"), "winner-2024-hometown-favorite-sandwich");
  assert.equal(cleanPostSlug("salsa-sales-supporting-waly-warmth-"), "salsa-sales-supporting-waly-warmth");
  assert.equal(cleanPostSlug("fund-fiesta-is-here-"), "fund-fiesta-is-here");
  assert.equal(cleanPostSlug("promotion-spotlight-"), "promotion-spotlight");
  assert.equal(cleanPostSlug("exciting-promotion-"), "exciting-promotion");
  for (const slug of ["a-positive-partnership", "Winner: 2024!"]) assert.ok(isRouteSlug(cleanPostSlug(slug)));
  assert.throws(() => cleanPostSlug("::"));
});

test("a link to a post's old address points at the post", () => {
  const site = createSite(posts);
  const source = story("winner:-2024-hometown-favorite-sandwich");
  for (const path of ["/news/winner:-2024-hometown-favorite-sandwich", "/news/winner-2024-hometown-favorite-sandwich"]) {
    assert.deepEqual(site.byPath(path), {
      path: "/news/winner-2024-hometown-favorite-sandwich",
      ref: { _type: "reference", _ref: `post-${source.uuid}` },
    });
  }
  assert.equal(site.byUuid(source.uuid).ref._ref, `post-${source.uuid}`);
});

test("post documents and keys are the same on every run", () => {
  assert.deepEqual(plan().documents, plan().documents);
});

test("the seed gives the four authors with their photos, the news list and the home page's Latest news", () => {
  const { documents, files } = plan([...posts, home]);
  const authors = documents.filter((document) => document._type === "author");
  assert.deepEqual(authors.map((author) => [author._id, author.name]), [
    ["author-amy", "Amy Mearkle"],
    ["author-amie", "Amie Uliano-Parisi"],
    ["author-juls", "Juls Bratton"],
    ["author-todd", "Todd Hill"],
  ]);
  for (const author of authors) {
    // The alt text is the author's name (spec decision 21).
    assert.equal(author.image.alt, author.name);
    const file = [...files.values()].find((entry) => fileRef(entry.url, "image") === author.image.asset._ref);
    assert.ok(file?.asImage, `${author.name} has no photo file`);
    assert.match(file.url, /^https:\/\/raw\.githubusercontent\.com\/ovsw\/mfr-web-next2\/[0-9a-f]{40}\/public\/images\/avatars\//);
  }

  assert.deepEqual(documents.find((document) => document._id === "blogIndex"), {
    _id: "blogIndex",
    _type: "blogIndex",
    eyebrow: "Marianna's",
    title: "News & Events",
    meta: { noindex: false, title: "News and Events", description: "Get the latest company news, events and promotions." },
  });

  const homePage = documents.find((document) => document._id === "homePage");
  assert.deepEqual(homePage.blocks.at(-1), {
    _key: "latest-news",
    _type: "latestNews",
    theme: "light",
    eyebrow: "Marianna's",
    title: "News & Events",
  });
});

test("a post with an unknown author, no main image or no date still imports, and the report says so", () => {
  const source = story("winner:-2024-hometown-favorite-sandwich");
  const odd = { ...source, content: { ...source.content, author: "someone", main_image: { filename: "" }, date: "" } };
  const { documents, report } = plan([odd]);
  const post = documents.find((document) => document._type === "post");
  assert.equal(post.author, undefined);
  assert.equal(post.image, undefined);
  assert.equal(post.publishedAt, undefined);
  const issues = report.needsHand.map((item) => item.issue).join("\n");
  assert.match(issues, /author "someone"/);
  assert.match(issues, /no main image/);
  assert.match(issues, /no publish date/);
});

test("a top-level hero with a photo in a post is left out, and the report says so", () => {
  const source = story("winner:-2024-hometown-favorite-sandwich");
  const hero = { _uid: "post-hero", component: "hero", title: "Hero", background_image: source.content.main_image };
  const withHero = { ...source, content: { ...source.content, body: [hero, ...source.content.body] } };
  const { documents, report } = plan([withHero]);
  const post = documents.find((document) => document._type === "post");
  assert.ok(post.blocks.length);
  assert.ok(post.blocks.every((block) => block._type !== "pageBanner"));
  assert.match(report.needsHand.map((item) => item.issue).join("\n"), /top-level hero/);
});

test("Storyblok dates become UTC datetimes", () => {
  assert.equal(publishedAtFrom("2025-10-31 00:00"), "2025-10-31T00:00:00.000Z");
  assert.equal(publishedAtFrom("2024-03-08"), "2024-03-08T00:00:00.000Z");
  assert.equal(publishedAtFrom("soon"), null);
});
