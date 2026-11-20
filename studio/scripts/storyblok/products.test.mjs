// The product import (issue #16, spec decisions 8 and 20), with fixtures cut
// from the real Storyblok export of 2026-11-20 (fixtures/products.json): a
// hoagie (products/italian-hoagie), a pizza with its storage note
// (products/pepperoni-pizza, whose shared call-to-action row has one line
// break fewer than the others) and a salsa (flavored-salsas/mph-salsa), with
// the old menu rows that list them on /products, /flavored-salsas/menu and
// /flavored-salsas, cut to these three cards.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { productPath } from "../../../shared/content-routes.ts";
import { NUTRITION_FIELDS, withoutKeys } from "./products.mjs";
import { createSite, planImport } from "./transform.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
const stories = read("./fixtures/products.json");
const overrides = read("./overrides.json");

const assetIds = new Map();
const fileRef = (url, kind) => {
  const key = `${kind} ${url}`;
  if (!assetIds.has(key)) assetIds.set(key, `${kind}-asset-${assetIds.size}`);
  return assetIds.get(key);
};

const plan = (source = stories) => planImport({ stories: source }, { overrides, fileRef });
const story = (slug) => stories.find((s) => s.full_slug === slug);
const productOf = (documents, slug) => documents.find((d) => d._id === `product-${story(slug).uuid}`);
const plainText = (blocks) =>
  (blocks ?? []).flatMap((block) => (block.children ?? []).map((span) => span.text)).join("");

const PRODUCT_FIELDS = [
  "name",
  "kind",
  "slug",
  "heroTitle",
  "heroText",
  "heroImage",
  "ingredientsText",
  "ingredientsImage",
  "nutritionFacts",
  "menuCard",
  "meta",
];

test("each product page becomes one product with every field filled and the right kind", () => {
  const { documents, report } = plan();
  const products = documents.filter((d) => d._type === "product");
  assert.equal(products.length, 3);
  assert.deepEqual(report.documents.product, 3);

  const expected = {
    "products/italian-hoagie": "hoagie",
    "products/pepperoni-pizza": "pizza",
    "flavored-salsas/mph-salsa": "salsa",
  };
  for (const [slug, kind] of Object.entries(expected)) {
    const product = productOf(documents, slug);
    assert.ok(product, slug);
    for (const field of PRODUCT_FIELDS) assert.ok(product[field], `${slug}: ${field}`);
    assert.equal(product.kind, kind, slug);
    // The kind sets the address, which is the old one.
    assert.equal(productPath(product.kind, product.slug.current), `/${slug}`);
    assert.equal(product.name, story(slug).name);
    assert.ok(product.heroImage.asset._ref);
    assert.ok(product.ingredientsImage.asset._ref);
    assert.ok(product.menuCard.image.asset._ref);
    assert.ok(product.menuCard.shortName);
    assert.ok(product.menuCard.shortDescription);
    for (const field of Object.values(NUTRITION_FIELDS)) {
      assert.equal(typeof product.nutritionFacts[field], "number", `${slug}: ${field}`);
    }
    assert.ok(product.nutritionFacts.servingText.length);
  }
});

test("the kind comes from the menu card, not the old item_type", () => {
  const { documents, report } = plan();
  // The old item_type says "hoagie" on the pepperoni pizza and on the salsas.
  assert.equal(story("products/pepperoni-pizza").content.item_type, "hoagie");
  assert.equal(productOf(documents, "products/pepperoni-pizza").kind, "pizza");
  assert.equal(productOf(documents, "flavored-salsas/mph-salsa").kind, "salsa");
  assert.ok(report.dropped["product item_type (wrong on the old site)"] >= 2);
});

test("the fields come from fixed places in the old body", () => {
  const { documents } = plan();
  const hoagie = productOf(documents, "products/italian-hoagie");
  const pizza = productOf(documents, "products/pepperoni-pizza");
  const salsa = productOf(documents, "flavored-salsas/mph-salsa");

  assert.equal(hoagie.heroTitle, "14'' Italian Hoagie");
  assert.equal(hoagie.ingredientsLabel, "Always Fresh");
  assert.equal(salsa.ingredientsLabel, undefined);
  assert.match(plainText(hoagie.ingredientsText), /Provolone/);
  assert.equal(hoagie.menuCard.shortName, "Italian");
  assert.equal(hoagie.menuCard.dressing, "italian");
  assert.equal(pizza.menuCard.dressing, undefined);
  assert.equal(salsa.menuCard.shortName, "MPH Salsa");
  // The old card stores the word "null" as its alt text: that is none.
  assert.equal(hoagie.menuCard.image.alt, undefined);

  // Only the pizzas carry the storage note, with its baking heading.
  assert.match(plainText(pizza.note), /must be refrigerated/);
  assert.ok(pizza.note.some((block) => /^h[3-6]$/.test(block.style)));
  assert.equal(hoagie.note, undefined);

  const table = story("products/italian-hoagie").content.body
    .flatMap((block) => block.content ?? [])
    .find((row) => row.component === "row-two-columns")
    .column_2[0];
  assert.equal(hoagie.nutritionFacts.calories, Number(table.calories));
  assert.equal(hoagie.nutritionFacts.ironDailyValue, Number(table.iron_per));
  assert.match(plainText(hoagie.nutritionFacts.servingText), /serving size/);
});

test("the shared blocks are written once, into Product Page Settings", () => {
  const { documents, report } = plan();
  const settings = documents.filter((d) => d._type === "productPageSettings");
  assert.equal(settings.length, 1);
  assert.equal(report.documents.productPageSettings, 1);
  const [doc] = settings;
  assert.equal(doc._id, "productPageSettings");
  assert.equal(doc.handmade.eyebrow, "Handmade Food That");
  assert.equal(doc.handmade.title, "We'd Love to Eat");
  assert.ok(doc.handmade.image.asset._ref);
  assert.equal(doc.handmade.buttons.length, 2);
  assert.equal(doc.callToAction.title, "Preparing a Fundraiser?");
  assert.match(plainText(doc.callToAction.richText), /video guides/);
  assert.equal(doc.callToAction.buttons[0].text, "Helpful Video Guides");
  // No product holds a copy.
  for (const product of documents.filter((d) => d._type === "product")) {
    assert.equal(product.handmade, undefined);
    assert.equal(product.callToAction, undefined);
  }
});

test("each kind gets its hero buttons and its ingredients list button, without a product's anchor", () => {
  const { documents } = plan();
  const settings = documents.find((d) => d._type === "productPageSettings");
  for (const kind of ["hoagie", "pizza", "salsa"]) {
    assert.equal(settings[kind].heroButtons.length, 2, kind);
  }
  assert.equal(settings.salsa.heroButtons[0].text, "Other Salsas");
  assert.equal(settings.pizza.heroButtons[0].url.anchor, "pizza");
  assert.equal(settings.hoagie.ingredientsListButton.text, "full ingredients list");
  assert.equal(settings.hoagie.ingredientsListButton.url.type, "external");
  assert.equal(settings.hoagie.ingredientsListButton.url.anchor, undefined);
  assert.equal(settings.hoagie.ingredientsListButton._key, undefined);
  assert.equal(settings.salsa.ingredientsListButton, undefined);
});

test("a shared row that differs between products stops the import", () => {
  const changed = structuredClone(stories);
  const pizza = changed.find((s) => s.full_slug === "products/pepperoni-pizza");
  const cta = pizza.content.body.flatMap((b) => b.content ?? []).find((r) => r.component === "row-two-columns-cta");
  cta.content_main[0].title = "Planning a Fundraiser?";
  assert.throws(() => plan(changed), /call to action row is not the same on every product page: products\/pepperoni-pizza/);

  const handmadeChanged = structuredClone(stories);
  const hoagie = handmadeChanged.find((s) => s.full_slug === "products/italian-hoagie");
  const handmade = hoagie.content.body.flatMap((b) => b.content ?? []).filter((r) => r.component === "row-big-image")[1];
  handmade.image.filename = "https://a.storyblok.com/f/133593/1x1/0000000000/other.jpg";
  assert.throws(() => plan(handmadeChanged), /Handmade food block row is not the same on every product page/);
});

test("a product page no menu card links to stops the import", () => {
  const withoutMenus = stories.filter((s) => s.content.component === "menu-item-page");
  assert.throws(() => plan(withoutMenus), /No old menu card links to the product page/);
});

test("the old menu rows become the menu sections, with the products in the old order", () => {
  const { documents, report } = plan();
  const pageWith = (slug) => documents.find((d) => d.slug?.current === slug);
  const productsPage = pageWith("products");
  const types = productsPage.blocks.map((block) => block._type);
  assert.deepEqual(types, ["hoagieMenu", "pizzaMenu"]);
  const [hoagies, pizzas] = productsPage.blocks;
  assert.deepEqual(hoagies.products.map((p) => p._ref), [`product-${story("products/italian-hoagie").uuid}`]);
  assert.deepEqual(pizzas.products.map((p) => p._ref), [`product-${story("products/pepperoni-pizza").uuid}`]);
  assert.equal(hoagies.theme, "shaded");
  assert.equal(pizzas.theme, "light");
  for (const slug of ["flavored-salsas/menu", "flavored-salsas"]) {
    const [menu] = pageWith(slug).blocks;
    assert.equal(menu._type, "salsaMenu");
    assert.deepEqual(menu.products.map((p) => p._ref), [`product-${story("flavored-salsas/mph-salsa").uuid}`]);
  }
  assert.equal(report.sections.hoagieMenu, 1);
  assert.equal(report.sections.salsaMenu, 2);
  assert.equal(report.scaffolds["Hoagie menu"], undefined);
});

test("links to a product page point at the product", () => {
  const site = createSite(stories);
  const salsa = story("flavored-salsas/mph-salsa");
  assert.deepEqual(site.byUuid(salsa.uuid), {
    path: "/flavored-salsas/mph-salsa",
    ref: { _type: "reference", _ref: `product-${salsa.uuid}` },
  });
});

test("a second run plans the same documents", () => {
  assert.deepEqual(plan().documents, plan().documents);
  assert.deepEqual(withoutKeys({ b: [{ _key: "x", a: 1 }], a: 2 }), { a: 2, b: [{ a: 1 }] });
});
