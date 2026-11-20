// Products (spec decisions 8 and 20, ticket #16): each old product page
// becomes one `product`, the two rows that are the same on every product page
// become `productPageSettings`, and the old menu rows become the Hoagie,
// Pizza and Salsa menu sections.
//
// The fields come from fixed places in the old body: the product hero, the
// first "big image" row (ingredients), an optional single-column row in the
// same wrapper (the note), the two-column row with the nutrition table, then
// the second "big image" row (Handmade food) and the call-to-action row. The
// kind and the menu card come from the old menu card that links to the
// product, because the old `item_type` field is wrong on the salsas and on two
// pizzas.

import { headingAnchorId } from "../../../shared/heading-anchor.ts";
import { productPath } from "../../../shared/content-routes.ts";
import { imageFromAsset } from "./files.mjs";
import { normalizeSitePath } from "./links.mjs";
import { outlineHeadings, richTextToBlocks, withKeys } from "./rich-text.mjs";

/** The menu section each old menu card kind fills. */
export const PRODUCT_MENU_TYPES = {
  "Hoagie menu": "hoagieMenu",
  "Pizza menu": "pizzaMenu",
  "Salsa menu": "salsaMenu",
};

const CARD_KINDS = new Set(["hoagie", "pizza", "salsa"]);

/** The old nutrition table's fields and the product field each becomes. */
export const NUTRITION_FIELDS = {
  calories: "calories",
  fat: "totalFat",
  fat_per: "totalFatDailyValue",
  saturated_fat: "saturatedFat",
  saturated_fat_per: "saturatedFatDailyValue",
  trans_fat: "transFat",
  cholesterol: "cholesterol",
  cholesterol_per: "cholesterolDailyValue",
  sodium: "sodium",
  sodium_per: "sodiumDailyValue",
  carbs: "totalCarbohydrates",
  carbs_per: "totalCarbohydratesDailyValue",
  fiber: "dietaryFiber",
  fiber_per: "dietaryFiberDailyValue",
  sugars: "totalSugars",
  added_sugars: "addedSugars",
  added_sugars_per: "addedSugarsDailyValue",
  protein: "protein",
  vit_d: "vitaminD",
  vit_d_per: "vitaminDDailyValue",
  calcium: "calcium",
  calcium_per: "calciumDailyValue",
  iron: "iron",
  iron_per: "ironDailyValue",
  potassium: "potassium",
  potassium_per: "potassiumDailyValue",
};

export function productDocumentId(story) {
  return `product-${story.uuid}`;
}

function storyPathOf(story) {
  return normalizeSitePath(story.full_slug);
}

/**
 * The old menu cards, by the product story they link to: each with the kind
 * of card it is, the page it is listed on, and the card's fields.
 */
export function menuCardsByProduct(stories) {
  const productsByPath = new Map(
    stories.filter((s) => s.content.component === "menu-item-page").map((s) => [storyPathOf(s), s]),
  );
  const productsByUuid = new Map(
    [...productsByPath.values()].map((s) => [s.uuid, s]),
  );
  const cards = new Map();
  for (const story of stories) {
    for (const section of story.content.body ?? []) {
      if (section.hidden) continue;
      for (const row of section.content ?? []) {
        if (row.hidden || row.component !== "row-menu-listing") continue;
        for (const item of row.items ?? []) {
          if (item.hidden) continue;
          const target = productsByUuid.get(item.link?.id) ?? productsByPath.get(normalizeSitePath(item.link?.cached_url ?? ""));
          if (!target) continue;
          if (!cards.has(target.uuid)) cards.set(target.uuid, []);
          cards.get(target.uuid).push({ kind: item.component, listedOn: storyPathOf(story), item });
        }
      }
    }
  }
  return cards;
}

/** A value without the `_key`s, for comparing what two products import. */
export function withoutKeys(value) {
  if (Array.isArray(value)) return value.map(withoutKeys);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "_key")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => [key, withoutKeys(v)]),
  );
}

const sameImport = (a, b) => JSON.stringify(withoutKeys(a)) === JSON.stringify(withoutKeys(b));

function richText(doc, context, previousLevel = 2) {
  const blocks = outlineHeadings(richTextToBlocks(doc, context), previousLevel);
  return blocks.length ? withKeys(blocks, "b") : undefined;
}

/** The parts of an old product body, by their fixed places. */
function productRows(story) {
  const body = (story.content.body ?? []).filter((block) => !block.hidden);
  const hero = body.find((block) => block.component === "hero-product");
  const rows = [];
  for (const [blockIndex, block] of (story.content.body ?? []).entries()) {
    if (block.component !== "section" || block.hidden) continue;
    for (const [rowIndex, row] of (block.content ?? []).entries()) {
      if (row.hidden) continue;
      rows.push({ row, at: `body[${blockIndex}] section > content[${rowIndex}] ${row.component}`, wrapper: block._uid });
    }
  }
  const bigImages = rows.filter(({ row }) => row.component === "row-big-image");
  const ingredients = bigImages[0];
  return {
    hero,
    ingredients,
    note: rows.find(({ row, wrapper }) => row.component === "row-single-column" && wrapper === ingredients?.wrapper),
    nutrition: rows.find(({ row }) => row.component === "row-two-columns" && (row.column_2 ?? []).some((b) => b.component === "nutrition-table")),
    handmade: bigImages[1],
    callToAction: rows.find(({ row }) => row.component === "row-two-columns-cta"),
  };
}

/** The kind and menu card of a product, from the old cards that link to it. */
function productCard(story, cards, context) {
  const linked = cards.get(story.uuid) ?? [];
  if (!linked.length) {
    throw new Error(`No old menu card links to the product page ${story.full_slug}: its kind and menu card come from that card`);
  }
  const kinds = new Set(linked.map(({ kind }) => kind));
  if (kinds.size !== 1 || !CARD_KINDS.has([...kinds][0])) {
    throw new Error(`The menu cards that link to ${story.full_slug} are of different kinds: ${[...kinds].join(", ")}`);
  }
  const [first, ...others] = linked;
  for (const other of others) {
    const fields = ["name", "description", "dressing"].filter((field) => (other.item[field] ?? "") !== (first.item[field] ?? ""));
    if (other.item.image?.filename !== first.item.image?.filename) fields.push("image");
    if (fields.length) {
      context.note("needs a hand", `the menu card on ${other.listedOn} differs from the one on ${first.listedOn} (${fields.join(", ")}); the card on ${first.listedOn} is imported`);
    }
  }
  const kind = first.kind;
  const card = { _type: "productMenuCard" };
  if (first.item.name?.trim()) card.shortName = first.item.name.trim();
  if (first.item.description?.trim()) card.shortDescription = first.item.description.trim();
  context.at = `menu card on ${first.listedOn}`;
  const image = imageFromAsset(first.item.image, context);
  if (image) card.image = image;
  if (kind === "hoagie") {
    if (["italian", "mayo"].includes(first.item.dressing)) card.dressing = first.item.dressing;
    else context.note("needs a hand", `the hoagie card has the dressing "${first.item.dressing ?? ""}", which is neither italian nor mayo`);
  }
  if (story.content.item_type && story.content.item_type !== kind) {
    context.drop("story", `item_type = "${story.content.item_type}" (the menu card says ${kind})`, "product item_type (wrong on the old site)");
  }
  return { kind, card };
}

function headingGroupOf(blocks) {
  return (blocks ?? []).find((block) => block.component === "heading-group" && !block.hidden);
}

function richTextOf(blocks, context) {
  const texts = (blocks ?? []).filter((block) => block.component === "rich-text-basic" && !block.hidden);
  if (!texts.length) return undefined;
  const blocksOut = texts.flatMap((block) => richTextToBlocks(block.text, context));
  const outlined = outlineHeadings(blocksOut, 2);
  return outlined.length ? withKeys(outlined, "b") : undefined;
}

function buttonsOf(blocks, context, button) {
  return (blocks ?? [])
    .filter((block) => !block.hidden)
    .flatMap((block) => (block.component === "button-group" ? block.content ?? [] : block.component === "button" ? [block] : []))
    .filter((block) => block.component === "button" && !block.hidden)
    .map((block) => button(block, context))
    .filter(Boolean);
}

function expectOnly(blocks, allowed, where, context) {
  for (const block of blocks ?? []) {
    if (block.hidden || allowed.includes(block.component)) continue;
    context.note("needs a hand", `a ${block.component} block in the ${where} has no product field; it is not imported`);
  }
}

/**
 * One product page as a `product`, with what it gives the shared settings:
 * its hero buttons, its ingredients list button and its two shared rows.
 */
function productFromStory(story, cards, context, helpers) {
  const { button, meta, recordDroppedOptions, droppedOptions } = helpers;
  const parts = productRows(story);
  const { kind, card } = productCard(story, cards, context);
  const slug = story.slug;
  const path = productPath(kind, slug);
  if (path !== storyPathOf(story)) {
    throw new Error(`The product page ${story.full_slug} is a ${kind} by its menu card, so its address would be ${path}, not /${story.full_slug}`);
  }
  const name = story.name.trim();
  const document = { _id: productDocumentId(story), _type: "product", name, kind, slug: { _type: "slug", current: slug } };
  const result = { document, heroButtons: [], ingredientsListButton: null, handmade: null, callToAction: null };

  for (const [index, block] of (story.content.body ?? []).entries()) {
    if (block.component !== "section" && block.hidden) {
      context.drop(`body[${index}] ${block.component}`, `hidden ${block.component}${block.title ? ` "${block.title}"` : ""}`, "hidden blocks");
    }
  }

  // Hero: title, text and photo; its two buttons go to the kind's settings.
  const { hero } = parts;
  if (!hero) throw new Error(`The product page ${story.full_slug} has no product hero`);
  context.at = "product hero";
  recordDroppedOptions(context, context.at, droppedOptions(hero));
  if (hero.title?.trim()) document.heroTitle = hero.title.trim();
  const heroText = richText(hero.text, context, 1);
  if (heroText) document.heroText = heroText;
  const heroImage = imageFromAsset(hero.background_image, context);
  if (heroImage) document.heroImage = heroImage;
  result.heroButtons = (hero.buttons ?? []).filter((b) => !b.hidden).map((b) => button(b, context)).filter(Boolean);

  // Ingredients: the first "big image" row.
  if (!parts.ingredients) throw new Error(`The product page ${story.full_slug} has no ingredients row`);
  {
    const { row, at } = parts.ingredients;
    context.at = at;
    recordDroppedOptions(context, at, droppedOptions(row));
    for (const field of ["badge_image", "contain_image", "is_reversed"]) {
      if (row[field]) context.drop(at, `row-big-image.${field} = true (the product template draws the ingredients image)`, `option: row-big-image.${field}`);
    }
    expectOnly(row.content, ["heading-group", "rich-text-basic", "button-group"], "ingredients row", context);
    const heading = headingGroupOf(row.content);
    if (heading?.eyebrow?.trim()) document.ingredientsLabel = heading.eyebrow.trim();
    if (heading?.title?.trim() && heading.title.trim() !== "Ingredients") {
      context.note("needs a hand", `the ingredients heading is "${heading.title.trim()}"; the product template always reads "Ingredients"`);
    }
    const text = richTextOf(row.content, context);
    if (text) document.ingredientsText = text;
    const image = imageFromAsset(row.image, context);
    if (image) document.ingredientsImage = image;
    const [listButton, ...extra] = buttonsOf(row.content, context, button);
    if (extra.length) context.note("needs a hand", `the ingredients row has ${extra.length + 1} buttons; only the first, the ingredients list button, is imported`);
    if (listButton) {
      const anchor = listButton.url?.anchor;
      if (anchor && anchor !== headingAnchorId(name)) {
        context.note("needs a hand", `the ingredients list button lands on #${anchor}; the product template sends it to #${headingAnchorId(name)}, the anchor of the heading "${name}"`);
      }
      result.ingredientsListButton = listButton;
    }
  }

  // Note: a single-column row in the ingredients wrapper (the pizzas).
  if (parts.note) {
    context.at = parts.note.at;
    expectOnly(parts.note.row.content, ["rich-text-basic"], "note row", context);
    const note = richTextOf(parts.note.row.content, context);
    if (note) document.note = note;
  }

  // Nutrition facts: the serving text and the 26 typed values.
  if (!parts.nutrition) throw new Error(`The product page ${story.full_slug} has no nutrition facts row`);
  {
    const { row, at } = parts.nutrition;
    context.at = at;
    recordDroppedOptions(context, at, droppedOptions(row));
    expectOnly(row.column_1, ["heading-group", "rich-text-basic"], "nutrition facts row", context);
    expectOnly(row.column_2, ["nutrition-table"], "nutrition facts row", context);
    const heading = headingGroupOf(row.column_1);
    if (heading?.eyebrow && heading.eyebrow.replace(/\s+/g, " ").trim() !== name) {
      context.note("needs a hand", `the nutrition facts were headed "${heading.eyebrow.trim()}"; the product template heads them with the name "${name}"`);
    }
    const facts = { _type: "nutritionFacts" };
    const servingText = richTextOf(row.column_1, context);
    if (servingText) facts.servingText = servingText;
    const table = row.column_2.find((block) => block.component === "nutrition-table");
    for (const [source, field] of Object.entries(NUTRITION_FIELDS)) {
      const raw = String(table?.[source] ?? "").trim();
      const value = Number(raw);
      if (raw === "" || !Number.isFinite(value)) {
        context.note("needs a hand", `the nutrition value ${source} is "${raw}", not a number; it is not imported`);
        continue;
      }
      facts[field] = value;
    }
    document.nutritionFacts = facts;
  }

  document.menuCard = card;
  document.meta = meta(story, context);
  for (const [field, value] of Object.entries(story.content)) {
    if (field.startsWith("nt_") && value !== "" && value != null) {
      context.drop("story", `${field} = ${JSON.stringify(value)}`, "product nt_* fields (unused on the old site)");
    }
  }

  result.handmade = parts.handmade ? handmadeBlock(parts.handmade, context, button) : null;
  result.callToAction = parts.callToAction ? callToActionBlock(parts.callToAction, context, button) : null;
  return result;
}

function handmadeBlock({ row, at }, context, button) {
  context.at = at;
  const block = { _type: "productHandmadeBlock" };
  const heading = headingGroupOf(row.content);
  if (heading?.eyebrow?.trim()) block.eyebrow = heading.eyebrow.trim();
  if (heading?.title?.trim()) block.title = heading.title.trim();
  const text = richTextOf(row.content, context);
  if (text) block.richText = text;
  const buttons = buttonsOf(row.content, context, button);
  if (buttons.length) block.buttons = buttons;
  const image = imageFromAsset(row.image, context);
  if (image) block.image = image;
  return block;
}

function callToActionBlock({ row, at }, context, button) {
  context.at = at;
  const block = { _type: "productCallToAction" };
  const main = (row.content_main ?? []).filter((b) => !b.hidden);
  const heading = main.find((b) => b.component === "heading");
  if (heading?.title?.trim()) block.title = heading.title.trim();
  const text = richTextOf(main, context);
  if (text) block.richText = text;
  const buttons = buttonsOf(row.content_buttons, context, button);
  if (buttons.length) block.buttons = buttons;
  const image = imageFromAsset(row.image, context);
  if (image) block.image = image;
  return block;
}

/** The most common of several imported values, and whether they all agree. */
function majority(values) {
  const groups = [];
  for (const value of values) {
    const group = groups.find((g) => sameImport(g.value, value));
    if (group) group.count++;
    else groups.push({ value, count: 1 });
  }
  groups.sort((a, b) => b.count - a.count);
  return { value: groups[0]?.value, agree: groups.length <= 1 };
}

/**
 * Plans the products: one `product` per old product page, and the
 * `productPageSettings` document. Throws when a shared row is not the same on
 * every product page (spec decision 20): it is written once, so a difference
 * would be lost.
 */
export function planProducts(stories, shared, helpers) {
  const products = stories
    .filter((story) => story.content.component === "menu-item-page")
    .sort((a, b) => a.full_slug.localeCompare(b.full_slug));
  if (!products.length) return { documents: [] };
  const cards = menuCardsByProduct(stories);
  const results = products.map((story) => {
    const context = helpers.storyContext(story, shared);
    context.shared = shared;
    return { story, context, ...productFromStory(story, cards, context, helpers) };
  });

  for (const row of ["handmade", "callToAction"]) {
    const label = row === "handmade" ? "Handmade food block" : "call to action";
    const missing = results.filter((r) => !r[row]).map((r) => r.story.full_slug);
    if (missing.length) throw new Error(`The shared ${label} row is missing on ${missing.join(", ")}`);
    const base = results[0];
    const differing = results.filter((r) => !sameImport(r[row], base[row])).map((r) => r.story.full_slug);
    if (differing.length) {
      throw new Error(
        `The shared ${label} row is not the same on every product page: ${differing.join(", ")} differ from ${base.story.full_slug}. Fix it in the overrides or the transform; it is written once into productPageSettings.`,
      );
    }
  }

  const settings = {
    _id: "productPageSettings",
    _type: "productPageSettings",
    handmade: results[0].handmade,
    callToAction: results[0].callToAction,
  };
  for (const kind of ["hoagie", "pizza", "salsa"]) {
    const ofKind = results.filter((r) => r.document.kind === kind);
    const links = { _type: "productKindLinks" };
    if (ofKind.length) {
      const hero = majority(ofKind.map((r) => r.heroButtons));
      if (!hero.agree) {
        shared.report.needsHand.push({
          story: "products",
          at: `${kind} hero buttons`,
          issue: `the ${kind} pages do not all have the same hero buttons; the most common (${hero.value.map((b) => b.text).join(", ")}) are written into productPageSettings`,
        });
      }
      links.heroButtons = hero.value;
      const withList = ofKind.map((r) => r.ingredientsListButton).filter(Boolean).map((b) => {
        const { _key, ...rest } = b;
        const url = { ...rest.url };
        delete url.anchor;
        return { ...rest, url };
      });
      if (withList.length) {
        const list = majority(withList);
        if (!list.agree || withList.length !== ofKind.length) {
          shared.report.needsHand.push({
            story: "products",
            at: `${kind} ingredients list button`,
            issue: `the ${kind} pages do not all have the same ingredients list button; the most common is written into productPageSettings`,
          });
        }
        links.ingredientsListButton = list.value;
      }
    } else {
      shared.report.needsHand.push({
        story: "products",
        at: `${kind} hero buttons`,
        issue: `no ${kind} product page was found, so productPageSettings has no ${kind} hero buttons; add the two by hand before publishing`,
      });
    }
    settings[kind] = links;
  }

  return { documents: [...results.map((r) => r.document), settings] };
}

/** An old menu row as its menu section: the products its cards link to, in order. */
export function productMenuSection(row, name, theme, context) {
  const type = PRODUCT_MENU_TYPES[name];
  const products = [];
  const used = new Set();
  for (const item of row.items ?? []) {
    if (item.hidden) {
      context.drop(context.at, `hidden ${item.component}${item.name ? ` "${item.name}"` : ""}`, "hidden blocks");
      continue;
    }
    const target = (item.link?.id && context.site.byUuid(item.link.id)) || context.site.byPath(normalizeSitePath(item.link?.cached_url ?? ""));
    const ref = target?.ref?._ref;
    if (!ref?.startsWith("product-")) {
      context.note("needs a hand", `the menu card "${item.name ?? ""}" links to ${item.link?.cached_url || "nothing"}, which is not a product; it is not listed`);
      continue;
    }
    let key = item._uid;
    for (let n = 2; used.has(key); n++) key = `${item._uid}-${n}`;
    used.add(key);
    products.push({ _key: key, _type: "reference", _ref: ref });
  }
  if (!products.length) return null;
  return { _key: row._uid, _type: type, theme, products };
}
