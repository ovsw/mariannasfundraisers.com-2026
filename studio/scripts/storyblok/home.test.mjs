// The home page in the importer (spec testing seam 1, issue #18), with the
// home story cut whole from the real Storyblok export of 2026-11-20
// (fixtures/home.json): the old home hero, the steps row, the menu teaser,
// the call to action row and the testimonials row, each becoming its own
// section, and the three old testimonials becoming `testimonial` records. The
// Latest news section comes from the reference capture's seed file.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { richTextToBlocks } from "./rich-text.mjs";
import { planImport, testimonialDocumentId } from "./transform.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
const stories = read("./fixtures/home.json");
const seed = read("../../../docs/migration/seed/hard-coded-content.json");
const [story] = stories;
const body = story.content.body;

const assetIds = new Map();
const fileRef = (url, kind) => {
  const key = `${kind} ${url}`;
  if (!assetIds.has(key)) assetIds.set(key, `${kind}-asset-${assetIds.size}`);
  return assetIds.get(key);
};

const plan = (source = stories) => planImport({ stories: source }, { fileRef, seed });
const homeOf = (documents) => documents.find((document) => document._id === "homePage");
const sectionOf = (documents, type) => homeOf(documents).blocks.find((block) => block._type === type);
const rowOf = (component) =>
  body.flatMap((block) => (block.component === "section" ? block.content : [])).find((row) => row.component === component);
const textOf = (blocks) => blocks.map((block) => (block.children ?? []).map((span) => span.text).join("")).join("\n");
const richTextContext = () => ({
  story: "home",
  site: { byUuid: () => null, byPath: () => null },
  overrides: [],
  at: "",
  note() {},
  drop() {},
  missingAlt() {},
});

test("the home page holds no Scaffold: its rows are their sections in the old order, then Latest news", () => {
  const { documents, report } = plan();
  const home = homeOf(documents);
  assert.equal(home._type, "homePage");
  assert.deepEqual(
    home.blocks.map((block) => [block._type, block.theme]),
    [
      ["homeHero", "light"],
      ["richTextBlock", "light"],
      ["steps", "light"],
      ["videoRightAndText", "light"],
      ["menuTeaser", "shaded"],
      ["callToActionWithImage", "muslin"],
      ["photoLeftAndText", "light"],
      ["testimonials", "muslin"],
      ["latestNews", "light"],
    ],
  );
  // Section keys are the old block _uids.
  assert.deepEqual(
    home.blocks.slice(0, 8).map((block) => block._key),
    body.flatMap((block) => (block.component === "section" ? block.content.map((row) => row._uid) : [block._uid])),
  );
  assert.equal(home.blocks.some((block) => block._type === "scaffold"), false);
  assert.deepEqual(report.scaffolds, {});
  // The fixture holds only the home story, so the seed's site shell links to
  // pages it does not have; nothing on the home page needs a hand.
  assert.deepEqual(report.needsHand.filter(({ story: where }) => where !== "seed"), []);
  // The dry-run counts: one of each new section and the three testimonials.
  for (const type of ["homeHero", "steps", "menuTeaser", "callToActionWithImage", "testimonials"]) {
    assert.equal(report.sections[type], 1, type);
  }
  assert.equal(report.documents.testimonial, 3);
});

test("document IDs and array keys are the same on every run", () => {
  assert.deepEqual(plan().documents, plan().documents);
});

test("the home hero keeps its photo, title, text and YouTube link; its theme is its edge colour", () => {
  const { documents, report } = plan();
  const hero = sectionOf(documents, "homeHero");
  const source = body[0];
  assert.equal(hero._key, source._uid);
  assert.equal(hero.title, '"The Fundraiser That Sells Itself"');
  assert.equal(hero.theme, "light");
  assert.equal(hero.image.asset._ref, fileRef(source.background_image.filename, "image"));
  assert.match(textOf(hero.text), /^Empowering groups to raise funds for worthy causes/);
  assert.equal(hero.youTubeUrl, "https://www.youtube.com/watch?v=3nQNiWdeH2Q");
  // The old hero had no buttons, and its `content` heading (a repeat of the
  // title the old site never drew) is a dropped option, not a field value.
  assert.equal(hero.buttons, undefined);
  assert.equal(hero.heading, undefined);
  assert.equal(report.dropped["option: hero.content"], 1);
});

test("the steps row becomes Steps: three items with their picture, title and list", () => {
  const steps = sectionOf(plan().documents, "steps");
  const row = rowOf("row-steps");
  assert.deepEqual(
    steps.items.map((item) => [item._key, item._type, item.title, item.image.alt]),
    row.steps.map((step) => [step._uid, "stepItem", step.title, step.image.alt]),
  );
  assert.deepEqual(steps.items.map((item) => item.title), ["Contact Us", "Start Selling", "Submit Order"]);
  assert.equal(steps.items[0].image.asset._ref, fileRef(row.steps[0].image.filename, "image"));
  // The bullet lists and their bold words are kept.
  const first = steps.items[0].text;
  assert.deepEqual(first.map((block) => [block.listItem, textOf([block])]), [
    ["bullet", "set up delivery date"],
    ["bullet", "send documentation"],
    ["bullet", "receive sale confirmation"],
  ]);
  assert.ok(first[0].children.some((span) => span.text === "delivery date" && span.marks.includes("strong")));
  assert.ok(steps.items.every((item) => item.text.every((block) => block._key)));
});

test("the menu teaser becomes the Menu teaser: heading, introduction and two parts", () => {
  const teaser = sectionOf(plan().documents, "menuTeaser");
  const row = rowOf("row-menu-teaser-one-off");
  assert.equal(teaser.eyebrow, "Handmade Food Menu");
  assert.equal(teaser.title, "Fresh & Clean Obsessed");
  assert.equal(textOf(teaser.intro), textOf(richTextToBlocks(row.intro[0].text, richTextContext())));
  assert.ok(teaser.intro[0].children.some((span) => span.text === "guaranteed fresh" && span.marks.includes("strong")));
  assert.deepEqual(
    teaser.items.map((item) => [item._type, item.heading, item.image.asset._ref, item.image.alt ?? ""]),
    [
      ["menuTeaserItem", "14'' Famous Hoagies", fileRef(row.image_1.filename, "image"), ""],
      ["menuTeaserItem", "12'' Delicious Pizzas", fileRef(row.image_2.filename, "image"), "Marianna's 12'' Pepperoni Pizza"],
    ],
  );
  assert.match(textOf(teaser.items[0].text), /^The largest, freshest, and best-tasting hoagies/);
  assert.deepEqual(
    teaser.items.map((item) => item.buttons.map((button) => [button.text, button.colour, button.icon])),
    [[["See Hoagie Menu", "accent", "hoagie"]], [["See Pizza Menu", "accent", "pizza"]]],
  );
  // The pizza button keeps its anchor on the products page (here a path: the
  // fixture holds no products story to reference).
  assert.equal(teaser.items[1].buttons[0].url.external, "/products#pizza");
});

test("the call to action row becomes Call to action with image", () => {
  const cta = sectionOf(plan().documents, "callToActionWithImage");
  const row = rowOf("row-two-columns-cta");
  assert.equal(cta.title, "Over 40 years of experience, one phone call away");
  assert.equal(textOf(cta.richText), "Running a fundraiser can be overwhelming.\nWe're here to help!");
  assert.deepEqual(
    cta.buttons.map((button) => [button.text, button.colour, button.icon, button.url.type, button.url.external]),
    [["Get Support", "light-primary", "phone-ringing", "external", "tel:8146842666"]],
  );
  assert.equal(cta.image.asset._ref, fileRef(row.image.filename, "image"));
});

test("the three old testimonials become testimonial records, listed in the old order", () => {
  const { documents } = plan();
  const section = sectionOf(documents, "testimonials");
  const row = rowOf("row-testimonials");
  const records = documents.filter((document) => document._type === "testimonial");
  assert.equal(section.eyebrow, "Quotes From Our");
  assert.equal(section.title, "Hoagie Heroes");
  assert.equal(section.image.asset._ref, fileRef(row.image.filename, "image"));
  assert.deepEqual(
    records.map((record) => [record._id, record.name, record.title]),
    [
      [testimonialDocumentId(story.uuid, row.testimonials_list[0]), "Suzie", "Verona, PA"],
      [testimonialDocumentId(story.uuid, row.testimonials_list[1]), "Megan", "Worthington, PA"],
      [testimonialDocumentId(story.uuid, row.testimonials_list[2]), "Ronald", "Middletown, PA"],
    ],
  );
  assert.deepEqual(
    section.testimonials.map((ref) => [ref._type, ref._ref, ref._key]),
    row.testimonials_list.map((item) => ["reference", testimonialDocumentId(story.uuid, item), item._uid]),
  );
  // The quote is the old text, trimmed, as one paragraph of simple rich text.
  assert.deepEqual(records[2].body.map((block) => [block._type, block.style, textOf([block])]), [
    ["block", "normal", "Keep up the good work! Other providers cannot equal your product, assistance, and prices!!!"],
  ]);
  assert.ok(records.every((record) => record.body.every((block) => block._key)));
});

test("a home hero without a photo stays a Scaffold and the report says why", () => {
  const broken = structuredClone(stories);
  broken[0].content.body[0].background_image = { filename: "" };
  const { documents, report } = plan(broken);
  const [first] = homeOf(documents).blocks;
  assert.deepEqual([first._type, first.name], ["scaffold", "Home hero"]);
  assert.ok(report.needsHand.some(({ issue }) => /home hero has no photo/.test(issue)));
});

test("a testimonials row without a photo stays a Scaffold and writes no testimonial record", () => {
  const broken = structuredClone(stories);
  const row = broken[0].content.body.find((block) => block.content?.[0]?.component === "row-testimonials").content[0];
  row.image = { filename: "" };
  const { documents, report } = plan(broken);
  const section = homeOf(documents).blocks.find((block) => block._key === row._uid);
  assert.deepEqual([section._type, section.name], ["scaffold", "Testimonials"]);
  assert.equal(documents.filter((document) => document._type === "testimonial").length, 0);
  assert.ok(report.needsHand.some(({ issue }) => /testimonials row has no photo/.test(issue)));
});

test("a hidden step or testimonial is dropped and counted", () => {
  const changed = structuredClone(stories);
  const rows = changed[0].content.body.flatMap((block) => (block.component === "section" ? block.content : []));
  rows.find((row) => row.component === "row-steps").steps[1].hidden = true;
  rows.find((row) => row.component === "row-testimonials").testimonials_list[0].hidden = true;
  const { documents, report } = plan(changed);
  assert.deepEqual(sectionOf(documents, "steps").items.map((item) => item.title), ["Contact Us", "Submit Order"]);
  assert.deepEqual(documents.filter((document) => document._type === "testimonial").map((record) => record.name), ["Megan", "Ronald"]);
  assert.ok(report.droppedItems.some(({ item }) => item === 'hidden step "Start Selling"'));
  assert.ok(report.droppedItems.some(({ item }) => item === 'hidden testimonial "Suzie"'));
});
