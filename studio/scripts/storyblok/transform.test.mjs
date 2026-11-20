// The importer transform (spec testing seam 1), with fixtures cut from the
// real Storyblok export of 2026-11-20 (fixtures/): a page with a hero and
// wrappers of several rows (how-it-works), a page with a banner title and
// pasted marks (contact-us), a story link with an anchor that an override
// fixes (how-it-is-made, to products/), one product and one news story, and a
// rich text with every node kind.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { headingAnchorId } from "../../../shared/heading-anchor.ts";
import { collectFiles, hotspotFromFocus } from "./files.mjs";
import { customUrlFor } from "./links.mjs";
import { headingStyle, outlineHeadings, richTextToBlocks } from "./rich-text.mjs";
import { createSite, planImport, storyDocumentId } from "./transform.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
const stories = read("./fixtures/stories.json");
const overrides = read("./overrides.json");
const richText = read("./fixtures/rich-text.json");

// A stand-in for the matched Sanity asset of each file.
const assetIds = new Map();
const fileRef = (url, kind) => {
  const key = `${kind} ${url}`;
  if (!assetIds.has(key)) assetIds.set(key, `${kind}-asset-${assetIds.size}`);
  return assetIds.get(key);
};

const plan = () => planImport({ stories }, { overrides, fileRef });
const page = (documents, slug) => documents.find((document) => document.slug?.current === slug);

test("a dry run counts the stories by kind and the files", () => {
  const { report, files } = plan();
  assert.deepEqual(report.found, { stories: 6, page: 4, product: 1, news: 1, files: 10, images: 10, documentFiles: 0 });
  assert.equal(files.size, 10);
  assert.deepEqual(report.documents, { page: 4 });
  assert.deepEqual(report.sections, { pageBanner: 3, pageHeading: 1, richTextBlock: 4, scaffold: 7 });
  assert.deepEqual(
    report.skipped.map(({ story }) => story),
    ["/news/winner:-2024-hometown-favorite-sandwich", "/products/italian-hoagie"],
  );
});

test("document IDs and array keys are the same on every run", () => {
  const first = plan().documents;
  const second = plan().documents;
  assert.deepEqual(second, first);
  const howItWorks = stories.find((story) => story.full_slug === "how-it-works");
  const document = page(first, "how-it-works");
  assert.equal(document._id, `page-${howItWorks.uuid}`);
  assert.equal(storyDocumentId({ full_slug: "home", uuid: "x", content: { component: "page" } }), "homePage");
  // Section keys are the old block _uids.
  const rowUids = howItWorks.content.body.flatMap((block) =>
    block.component === "section" ? block.content.map((row) => row._uid) : [block._uid],
  );
  assert.deepEqual(document.blocks.map((block) => block._key), rowUids);
});

test("each row becomes one section, with its wrapper's background as theme", () => {
  const document = page(plan().documents, "how-it-works");
  assert.deepEqual(
    document.blocks.map((block) => [block._type, block.theme ?? null, block.name ?? block.title ?? null]),
    [
      ["pageBanner", "shaded", null],
      ["pageHeading", "shaded", "How it Works"],
      ["richTextBlock", "light", "Contact Us"],
      ["scaffold", null, "Image and icon list"],
      ["richTextBlock", "shaded", "Start Selling"],
      ["scaffold", null, "Image and icon list"],
      ["richTextBlock", "light", "Submit & Receive  Order"],
      ["scaffold", null, "Image and icon list"],
      ["scaffold", null, "Call to action with image"],
    ],
  );
  // A Scaffold names its intended section and keeps the wrapper's theme in words.
  assert.match(document.blocks[3].proposedSectionShape, /^Image and icon list, theme light\./);
  assert.ok(document.blocks[3].richText.some((item) => item._type === "image"));
  // The Page heading keeps its introduction as simple rich text.
  assert.equal(document.blocks[1].intro[0].children[0].text.slice(0, 22), "It's as easy as 1, 2, ");
});

test("a page banner keeps its photo, title, alt text and focal point; its theme is its edge colour", () => {
  const document = page(plan().documents, "contact-us");
  const [banner] = document.blocks;
  const hero = stories.find((story) => story.full_slug === "contact-us").content.body[0];
  assert.equal(banner._type, "pageBanner");
  assert.equal(banner.title, "Contact Us");
  assert.equal(banner.theme, "shaded");
  assert.equal(banner.image.asset._ref, fileRef(hero.background_image.filename, "image"));
  assert.equal(banner.image.alt, hero.background_image.alt);
  assert.deepEqual(hotspotFromFocus("100x50:102x52", { width: 200, height: 100 }), {
    _type: "sanity.imageHotspot", x: 0.505, y: 0.51, width: 0.01, height: 0.02,
  });
});

test("SEO fields map to meta, and the story name is the title", () => {
  const document = page(plan().documents, "how-it-works");
  const story = stories.find((s) => s.full_slug === "how-it-works");
  assert.equal(document.title, story.name);
  assert.equal(document.meta.noindex, false);
  assert.equal(document.meta.description, story.content.seo_description);
  assert.equal(document.meta.image.asset._ref, fileRef(story.content.seo_image.filename, "image"));
});

test("a heading-group row becomes Rich Text with its anchor ID", () => {
  const section = page(plan().documents, "products").blocks[0];
  assert.equal(section._type, "richTextBlock");
  assert.equal(section.anchorId, "hoagies");
  assert.equal(section.eyebrow, "Our Famous");
});

test("an override fixes the old /menu/ link and keeps its anchor", () => {
  const { documents, report } = plan();
  const scaffold = page(documents, "how-it-is-made").blocks[1];
  const link = scaffold.richText.flatMap((block) => block.markDefs ?? []).find((mark) => mark.customLink.anchor);
  assert.deepEqual(link.customLink, {
    _type: "customUrl",
    type: "internal",
    internal: { _type: "reference", _ref: storyDocumentId(stories.find((s) => s.full_slug === "products/")) },
    openInNewTab: false,
    anchor: "hoagies",
  });
  assert.deepEqual(report.overrides.applied.map(({ story, from }) => [story, from]), [["/how-it-is-made", "/menu/"]]);
  assert.deepEqual(report.overrides.unused.map(({ story }) => story), [
    "news/national-pizza-day-february-9th-2022",
    "products/smoked-ham-cheddar-hoagie",
  ]);
});

test("dropped options, pasted marks and images without alt text are counted", () => {
  const { report } = plan();
  assert.equal(report.dropped["option: section.margin_top"], 8);
  assert.equal(report.dropped["option: hero.height"], 3);
  assert.equal(report.dropped["rich text: pasted class"], 2);
  assert.equal(report.droppedItems.length, Object.values(report.dropped).reduce((sum, n) => sum + n, 0));
  assert.equal(report.imagesWithoutAlt.length, 5);
  assert.ok(report.imagesWithoutAlt.every((image) => image.file.startsWith("https://a.storyblok.com/")));
});

function richTextContext() {
  const notes = [];
  const site = {
    byUuid: (uuid) => (uuid === "fa6265db-3dfc-41bd-bdda-910c42723ef6" ? { path: "/products", ref: { _type: "reference", _ref: "page-products" } } : null),
    byPath: () => null,
  };
  return { notes, context: { story: "fixture", site, fileRef, overrides: [], note: (kind, detail) => notes.push([kind, detail]) } };
}

test("rich text keeps every node kind and drops pasted marks", () => {
  const { notes, context } = richTextContext();
  const blocks = richTextToBlocks(richText.doc, context);
  const styles = new Set(blocks.map((block) => block.style));
  assert.ok(styles.has("normal"));
  // An old heading level n is h(n+1): the page's h1 belongs to its heading section.
  const heading = richText.doc.content.find((node) => node.type === "heading");
  assert.ok(styles.has(headingStyle(heading.attrs.level)));
  assert.equal(headingStyle(1), "h2");
  assert.equal(headingStyle(5), "h6");
  assert.ok(blocks.some((block) => block.listItem === "bullet" && block.level === 1));
  assert.ok(blocks.some((block) => block.listItem === "number" && block.level === 1));
  const marks = new Set(blocks.flatMap((block) => block.children.flatMap((span) => span.marks)));
  for (const decorator of ["strong", "em", "underline"]) assert.ok(marks.has(decorator), decorator);
  assert.ok(blocks.some((block) => block.children.some((span) => span.text.includes("\n"))), "a line break");
  const links = blocks.flatMap((block) => block.markDefs).map((mark) => mark.customLink);
  assert.ok(links.some((link) => link.type === "internal" && link.anchor === "hoagies" && link.internal._ref === "page-products"));
  assert.ok(links.some((link) => link.type === "external" && link.external.startsWith("mailto:")));
  assert.ok(links.some((link) => link.type === "external" && link.external.startsWith("tel:")));
  assert.deepEqual(
    [...new Set(notes.filter(([kind]) => kind === "dropped mark").map(([, detail]) => detail))].sort(),
    ["pasted class", "pasted text colour"],
  );
  assert.equal(notes.filter(([kind]) => kind === "needs a hand").length, 0);
});

test("file links keep their kind and point at the matched file asset", () => {
  const { context } = richTextContext();
  const url = "https://a.storyblok.com/f/133593/x/089b6d6939/mfs_salsa_info_flyer_2025.pdf";
  assert.deepEqual(customUrlFor({ linktype: "url", href: url, openInNewTab: false }, context), {
    _type: "customUrl",
    type: "file",
    file: { _type: "file", asset: { _type: "reference", _ref: fileRef(url, "file") } },
    openInNewTab: false,
  });
  const ownSite = customUrlFor({ linktype: "url", href: "https://www.mariannasfundraisers.com/downloads/tally.xlsm", openInNewTab: false }, context);
  assert.equal(ownSite.external, "/downloads/tally.xlsm");
  assert.equal(customUrlFor({ linktype: "url", href: "#", openInNewTab: false }, context), null);
});

test("links to stories that are not documents yet are site paths", () => {
  const site = createSite(stories);
  const product = stories.find((story) => story.content.component === "menu-item-page");
  const target = stories.find((story) => story.full_slug === "products/");
  assert.deepEqual(site.byUuid(product.uuid), { path: `/${product.full_slug}` });
  const link = { linktype: "story", uuid: product.uuid, href: product.full_slug, anchor: null, openInNewTab: false };
  assert.equal(customUrlFor(link, { story: "x", site, fileRef, overrides: [], note: () => {} }).external, `/${product.full_slug}`);
  assert.deepEqual(site.byUuid(target.uuid).ref, { _type: "reference", _ref: `page-${target.uuid}` });
  assert.equal(site.byPath("/products").path, "/products");
});

test("the files of the stories are collected once each", () => {
  const files = collectFiles(stories);
  assert.ok([...files.keys()].every((url) => url.startsWith("https://a.storyblok.com/f/")));
  assert.equal(new Set(files.keys()).size, files.size);
});

test("Storyblok heading anchors match the Website's heading anchors", () => {
  assert.equal(headingAnchorId("Smoked Ham & Cheddar Hoagie"), "smoked-ham-and-cheddar-hoagie");
});

test("a section's headings never skip a level", () => {
  const heading = (style) => ({ _type: "block", style });
  const styles = (blocks) => blocks.map((block) => block.style);
  // An old level-2 heading with no level 1 above it sits straight under the
  // page's h1, so it becomes an h2.
  assert.deepEqual(styles(outlineHeadings([heading("h3"), heading("normal"), heading("h3")])), ["h2", "normal", "h2"]);
  assert.deepEqual(styles(outlineHeadings([heading("h2"), heading("h4"), heading("h3")])), ["h2", "h3", "h3"]);
  assert.deepEqual(styles(outlineHeadings([heading("h4"), heading("h5"), heading("h4")])), ["h2", "h3", "h2"]);
  // Under the section's own title (an h2) an h3 is in order.
  assert.deepEqual(styles(outlineHeadings([heading("h3")], 2)), ["h3"]);

  for (const document of plan().documents) {
    for (const section of document.blocks ?? []) {
      if (section._type !== "richTextBlock") continue;
      let previous = section.title ? 2 : 1;
      for (const block of section.richText ?? []) {
        const level = Number(/^h(\d)$/.exec(block.style ?? "")?.[1]);
        if (!level) continue;
        assert.ok(level <= previous + 1, `${document._id} ${section._key}: h${level} after h${previous}`);
        previous = level;
      }
    }
  }
});
