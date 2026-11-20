// The importer transform (spec testing seam 1), with fixtures cut from the
// real Storyblok export of 2026-11-20 (fixtures/): a page with a hero and
// wrappers of several rows (how-it-works), a page with a banner title and
// pasted marks (contact-us), a story link with an anchor that an override
// fixes (how-it-is-made, to products/), one product and one news story, a
// rich text with every node kind, one "big image" row of each of the eight
// image-and-text kinds (fixtures/image-and-text.json, issue #15), and the
// Cognito form rows (one by ID, one with pasted embed code), the FAQ row and a
// two-column text row (fixtures/forms-faq-columns.json, issue #19).
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
  assert.deepEqual(report.sections, {
    cognitoForm: 1,
    cutoutLeftAndText: 1,
    imageAndIconList: 3,
    pageBanner: 3,
    pageHeading: 1,
    photoLeftAndText: 1,
    richTextBlock: 4,
    scaffold: 1,
  });
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
      ["imageAndIconList", "light", null],
      ["richTextBlock", "shaded", "Start Selling"],
      ["imageAndIconList", "shaded", null],
      ["richTextBlock", "light", "Submit & Receive  Order"],
      ["imageAndIconList", "light", null],
      ["scaffold", null, "Call to action with image"],
    ],
  );
  // A Scaffold names its intended section and keeps the wrapper's theme in words.
  assert.match(document.blocks[8].proposedSectionShape, /^Call to action with image, theme muslin\./);
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

// One "big image" row of each kind, cut from the real export (issue #15).
const imageAndTextStories = read("./fixtures/image-and-text.json");
const imageAndTextPlan = () => planImport({ stories: imageAndTextStories }, { overrides, fileRef });
const rowOf = (index) => imageAndTextStories[0].content.body[index].content[0];

test("each kind of big image row becomes its image-and-text section", () => {
  const { documents, report } = imageAndTextPlan();
  const [document] = documents;
  assert.deepEqual(
    document.blocks.map((block) => [block._type, block.theme, block.eyebrow ?? null, block.title ?? null]),
    [
      // No switch: a photo, cropped; the image on the right.
      ["photoRightAndText", "shaded", "Only the", "Freshest Ingredients"],
      // `is_reversed` puts the image on the left, as the old code and the
      // reference screenshots show.
      ["photoLeftAndText", "light", "Only the", "Cleanest Environment"],
      // `contain_image`: a cutout, shown whole.
      ["cutoutLeftAndText", "light", "Fundraiser Pricing", "You Control"],
      ["cutoutRightAndText", "shaded", "Please", "Note"],
      // `badge_image` wins over `contain_image`.
      ["badgeAndText", "light", "Available Now", "In Select Counties"],
      // A YouTube link wins over every other switch.
      ["videoLeftAndText", "light", "How To", "Start a Sale"],
      ["videoRightAndText", "light", "That's it!", "We Take Care of the Rest"],
      // Feature groups make the icon list.
      ["imageAndIconList", "light", null, null],
    ],
  );
  assert.equal(report.sections.scaffold, undefined);
  // Keys are the row _uids.
  assert.deepEqual(document.blocks.map((block) => block._key), imageAndTextStories[0].content.body.map((_, index) => rowOf(index)._uid));
});

test("an image-and-text section keeps its image, text, buttons and anchor ID, and stores no side, fit or spacing", () => {
  const blocks = imageAndTextPlan().documents[0].blocks;
  blocks.forEach((block, index) => {
    const row = rowOf(index);
    assert.equal(block.image.asset._ref, fileRef(row.image.filename, "image"));
    for (const field of ["is_reversed", "contain_image", "badge_image", "extra_padding", "side", "fit", "padding"]) {
      assert.equal(field in block, false, `${block._type} stores ${field}`);
    }
  });
  const video = blocks.find((block) => block._type === "videoRightAndText");
  assert.equal(video.image.alt, rowOf(6).image.alt);
  assert.equal(video.youTubeUrl, "https://youtu.be/Uil1c8p_jV0");
  assert.deepEqual(video.buttons.map((button) => button.text), ["Pricing Info", "Step-by-Step Guide"]);
  assert.equal(video.richText.length, 3);
  // The old headings' anchor IDs are kept.
  assert.equal(blocks.find((block) => block._type === "badgeAndText").anchorId, "available-now");
  assert.equal(blocks.find((block) => block._type === "videoLeftAndText").anchorId, "how-to-start-a-sale");
  // An old table in the row becomes a table in the section's rich text, and
  // the row's heading sits under the section heading.
  const cutout = blocks.find((block) => block._type === "cutoutLeftAndText");
  assert.ok(cutout.richText.some((item) => item._type === "table" && item.rows.length > 1));
  assert.equal(cutout.richText.find((item) => item.style?.startsWith("h")).style, "h3");
});

test("feature groups become the icon list's items of icon, heading and text", () => {
  const list = imageAndTextPlan().documents[0].blocks.find((block) => block._type === "imageAndIconList");
  assert.deepEqual(
    list.items.map((item) => [item._key, item._type, item.icon, item.heading]),
    rowOf(7).content.map((group) => [group._uid, "iconListItem", group.icon, group.heading]),
  );
  for (const item of list.items) {
    assert.ok(item.text.length > 0);
    assert.ok(item.text.every((block) => block._type === "block" && block.style === "normal" && !block.listItem));
  }
  assert.equal(list.richText, undefined);
  assert.equal(list.title, undefined);
});

test("a big image row that cannot be its section stays a Scaffold and the report says why", () => {
  const story = structuredClone(imageAndTextStories[0]);
  story.content.body[5].content[0].youTubeLink = "https://vimeo.com/123456";
  delete story.content.body[0].content[0].image;
  const { documents, report } = planImport({ stories: [story] }, { overrides, fileRef });
  const blocks = documents[0].blocks;
  assert.equal(blocks[0]._type, "scaffold");
  assert.equal(blocks[0].name, "Photo right and text");
  assert.equal(blocks[5]._type, "scaffold");
  assert.equal(blocks[5].name, "Video left and text");
  assert.ok(report.needsHand.some(({ issue }) => /not a YouTube video link/.test(issue)));
  assert.ok(report.needsHand.some(({ issue }) => /has no image/.test(issue)));
});

// The Cognito form rows, the FAQ row and a two-column text row, cut from the
// real export (issue #19): get-assistance (a heading group over the one form
// block that stores pasted embed code), schedule-a-free-tasting (a text column
// beside the form), the FAQ page (two lists) and products (two text columns).
const formStories = read("./fixtures/forms-faq-columns.json");
const formPlan = (stories = formStories) => planImport({ stories }, { overrides, fileRef });
const formRow = (index) => formStories[0].content.body[index].content[0];
const textOf = (blocks) => blocks.map((block) => (block.children ?? []).map((span) => span.text).join("")).join("\n");

test("the form, FAQ and two-column rows become their sections, with no Scaffold", () => {
  const { documents, report } = formPlan();
  const page = documents.find((document) => document._type === "page");
  assert.deepEqual(
    page.blocks.map((block) => [block._type, block.theme, block._key]),
    [
      ["cognitoForm", "shaded", formRow(0)._uid],
      ["cognitoForm", "light", formRow(1)._uid],
      // A row with two FAQ lists becomes two sections.
      ["faqList", "light", formRow(2)._uid],
      ["faqList", "light", `${formRow(2)._uid}-2`],
      ["twoTextColumns", "shaded", formRow(3)._uid],
    ],
  );
  assert.equal(report.sections.scaffold, undefined);
  assert.deepEqual(report.scaffolds, {});
  assert.deepEqual(report.needsHand, []);
  assert.deepEqual(formPlan().documents, documents);
});

test("a Cognito form is imported by its form ID and no document holds embed code", () => {
  const { documents, report } = formPlan();
  const [byEmbed, beside] = documents.find((document) => document._type === "page").blocks;
  // The one old block that stores pasted embed code keeps only its form ID.
  assert.ok(formRow(0).content.find((block) => block.component === "form_cognito").embed_code.includes("<script"));
  assert.deepEqual(
    [byEmbed.formId, byEmbed.title, beside.formId, beside.title],
    ["114", "Contact form", "168", "Schedule a free tasting form"],
  );
  const stored = JSON.stringify(documents);
  for (const fragment of ["embed_code", "<script", "seamless.js", "data-key"]) assert.ok(!stored.includes(fragment), fragment);
  assert.equal(report.dropped["option: form_cognito.embed_code"], 1);
  // The heading group above the form is its introduction: eyebrow, then heading.
  assert.deepEqual(
    byEmbed.intro.map((block) => [block.style, textOf([block])]),
    [["normal", "Marianna's Fundraisers"], ["h2", "Contact Form"]],
  );
  // The text column beside the form is its introduction, word for word.
  const column = richTextToBlocks(formRow(1).column_1[0].text, richTextContext().context);
  assert.equal(textOf(beside.intro), textOf(column));
  assert.ok(beside.intro.every((block) => block._key));
});

test("a Cognito form without a form ID stays a Scaffold and the report says why", () => {
  const story = structuredClone(formStories[0]);
  story.content.body[0].content[0].content[1].cognito_form_id = "";
  const { documents, report } = formPlan([story]);
  const blocks = documents[0].blocks;
  assert.deepEqual([blocks[0]._type, blocks[0].name], ["scaffold", "Cognito form"]);
  assert.ok(report.needsHand.some(({ issue }) => /has no form ID/.test(issue)));
});

test("the 14 old FAQ items become faq records, listed in the old order under the two titles", () => {
  const { documents, report } = formPlan();
  const faqs = documents.filter((document) => document._type === "faq");
  const lists = formRow(2).content;
  const items = lists.flatMap((list) => list.items);
  assert.equal(faqs.length, 14);
  assert.equal(report.documents.faq, 14);
  assert.deepEqual(faqs.map((faq) => faq._id), items.map((item) => `faq-${formStories[0].uuid}-${item._uid}`));
  assert.deepEqual(faqs.map((faq) => faq.title), items.map((item) => item.question.trim()));
  const sections = documents.find((document) => document._type === "page").blocks.filter((block) => block._type === "faqList");
  assert.deepEqual(sections.map((section) => section.title), ["Selling", "Product Info"]);
  sections.forEach((section, index) => {
    assert.deepEqual(
      section.faqs.map((ref) => [ref._type, ref._ref, ref._key]),
      lists[index].items.map((item) => ["reference", `faq-${formStories[0].uuid}-${item._uid}`, item._uid]),
    );
  });
  // The answer is the rich text the old site shows (`answer_single`), lists
  // and underline kept; the unused `answer` blocks (placeholder text) are
  // dropped.
  for (const faq of faqs) {
    assert.ok(faq.body.length > 0);
    assert.ok(faq.body.every((block) => block._type === "block" && block._key));
    assert.ok(!textOf(faq.body).includes("Lorem ipsum"));
  }
  const submit = faqs.find((faq) => faq.title === "How do I submit my order?");
  assert.deepEqual(
    submit.body.filter((block) => block.listItem).map((block) => [block.listItem, textOf([block])]).slice(0, 2),
    [["bullet", "Online Ordering System"], ["bullet", "Order Tally Spreadsheet"]],
  );
  assert.ok(faqs.some((faq) => faq.body.some((block) => block.children.some((span) => span.marks.includes("underline")))));
  assert.equal(Object.keys(report.dropped).filter((label) => /simple text field/.test(label)).length, 0);
  assert.equal(textOf(faqs[0].body).slice(0, 49), "Yes, we do have a minimum requirement of at least");
  assert.equal(report.dropped["unused field: faq-item.answer"], items.filter((item) => item.answer?.length).length);
});

test("a two-column text row keeps each column's text in its own field", () => {
  const section = formPlan().documents.find((document) => document._type === "page").blocks[4];
  const row = formRow(3);
  const { context } = richTextContext();
  assert.equal(textOf(section.leftText), textOf(richTextToBlocks(row.column_1[0].text, context)));
  assert.equal(textOf(section.rightText), textOf(richTextToBlocks(row.column_2[0].text, context)));
  assert.match(textOf(section.leftText), /^Our hoagies are made on freshly baked Italian rolls/);
  assert.match(textOf(section.rightText), /^Plus, our hoagies come with either/);
});

test("a hidden Cognito form beside a text column leaves the row Two text columns", () => {
  const story = structuredClone(formStories[0]);
  const row = story.content.body[1].content[0];
  row.column_2 = [{ ...row.column_2.find((block) => block.component === "form_cognito"), hidden: true }, { ...row.column_1[0], _uid: "visible-right-text" }];
  const { documents, report } = formPlan([story]);
  const section = documents.find((document) => document._type === "page").blocks[1];
  assert.equal(section._type, "twoTextColumns");
  assert.ok(report.droppedItems.some(({ item }) => item === "hidden form_cognito"));
});
