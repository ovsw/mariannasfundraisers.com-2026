#!/usr/bin/env node
// Block inventory of the Storyblok export: for each story, its rows in order
// and the section, product field or post section each one becomes under spec
// decisions 8, 9, 10 and 12 (issue #3). Lists every hidden block and every
// dropped option value.
//
//   node scripts/migration/block-inventory.mjs --export <unzipped Storyblok export folder>
//
// Writes docs/migration/block-inventory.json and docs/migration/block-inventory.md.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrationDir, normalizePath } from "./lib.mjs";

/** The counts the spec gives for the 2026-11-20 export. */
export const EXPECTED = { stories: 68, page: 34, "blog-post": 18, "menu-item-page": 16, sections: 174, bigImageRows: 115 };

const THEMES = { light: "Light", shaded: "Shaded", muslin: "Muslin", primary: "Primary" };

/**
 * Fields that set a block's look or are unused, per component. None becomes a
 * field (spec decision 10). Fields that pick a section (image side, fit,
 * badge, video) are not listed: they choose the section type.
 */
export const DROPPED_OPTIONS = {
  section: ["name", "width", "margin_top", "margin_bottom", "padding_top", "padding_bottom", "decoration_top", "decoration_bottom", "overflow_hidden", "is_reversed"],
  "row-big-image": ["name", "extra_padding"],
  "row-single-column": ["name"],
  "row-two-columns": ["name", "is_flexible"],
  "row-two-columns-cta": ["name"],
  "row-menu-listing": ["menu_items", "menu_listing"],
  hero: ["height", "is_tall", "type", "border_color", "background_color", "content"],
  heading: ["style"],
  "heading-group": ["heading_level"],
  "feature-group": ["heading_level"],
  button: ["icon_position"],
  table: ["remove_margins"],
  form_cognito: ["embed_code"],
  "faq-list": ["content"],
};

/** Story-level fields that are not imported (spec decision 20). */
const DROPPED_STORY_FIELDS = {
  "menu-item-page": (field) => field === "item_type" || field.startsWith("nt_"),
  "blog-post": (field) => field === "body_rte",
  page: () => false,
};

const KIND = { page: "page", "blog-post": "news post", "menu-item-page": "product" };

export function isEmptyValue(value) {
  if (value === undefined || value === null || value === "" || value === false) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    if (value.type === "doc") return !richTextHasText(value);
    if ("filename" in value) return !value.filename;
    if (value.fieldtype === "multilink") return !value.url && !value.cached_url && !value.id;
  }
  return false;
}

export function richTextHasText(node) {
  if (!node || typeof node !== "object") return false;
  if (node.type === "text" && node.text?.trim()) return true;
  return (node.content ?? []).some(richTextHasText);
}

function displayValue(value) {
  if (Array.isArray(value)) {
    return value.every((v) => typeof v === "string") ? value : value.map((v) => v?.component ?? typeof v);
  }
  if (value && typeof value === "object" && value.type === "doc") return "(rich text)";
  if (typeof value === "string" && value.length > 120) return `${value.slice(0, 117)}...`;
  return value;
}

/** Non-empty dropped option values of a block and every block inside it. */
export function droppedOptions(block, trail = block.component) {
  const result = [];
  for (const field of DROPPED_OPTIONS[block.component] ?? []) {
    if (isEmptyValue(block[field])) continue;
    // Pasted embed code is imported by its form ID (spec decision 15); do not repeat it here.
    const value = field === "embed_code" ? "(pasted embed code; the form is imported by its form ID)" : displayValue(block[field]);
    result.push({ at: trail, field, value });
  }
  for (const [field, value] of Object.entries(block)) {
    if (!Array.isArray(value) || (DROPPED_OPTIONS[block.component] ?? []).includes(field)) continue;
    value.forEach((child, index) => {
      if (child?.component) result.push(...droppedOptions(child, `${trail}.${field}[${index}] ${child.component}`));
    });
  }
  return result;
}

/** The image-and-text section an old "big image" row becomes (spec decision 12, issue #15 order). */
export function bigImageSection(row) {
  const side = row.is_reversed ? "left" : "right";
  if (row.youTubeLink?.trim()) return `Video ${side} and text`;
  if (row.badge_image) return "Badge and text";
  if (row.content?.some((block) => block.component === "feature-group")) return "Image and icon list";
  if (row.contain_image) return `Cutout ${side} and text`;
  return `Photo ${side} and text`;
}

const has = (blocks, component) => (blocks ?? []).some((block) => block.component === component);

/** Page Builder sections one old page row becomes. Usually one; an FAQ row with two lists becomes two. */
export function pageRowSections(row) {
  switch (row.component) {
    case "row-big-image":
      return [bigImageSection(row)];
    case "row-single-column": {
      if (has(row.content, "page-heading")) return ["Page heading"];
      if (has(row.content, "form_cognito")) return ["Cognito form"];
      const faqLists = row.content.filter((block) => block.component === "faq-list").length;
      if (faqLists) return Array(faqLists).fill("FAQ list");
      return ["Rich Text"];
    }
    case "row-two-columns":
      return has(row.column_2, "form_cognito") ? ["Cognito form"] : ["Two text columns"];
    case "row-two-columns-cta":
      return ["Call to action with image"];
    case "row-menu-listing": {
      const kinds = new Set(row.items.map((item) => item.component));
      if (kinds.size !== 1) throw new Error(`Mixed menu listing: ${[...kinds].join(", ")}`);
      return [{ hoagie: "Hoagie menu", pizza: "Pizza menu", salsa: "Salsa menu" }[[...kinds][0]]];
    }
    case "row-menu-teaser-one-off":
      return ["Menu teaser"];
    case "row-steps":
      return ["Steps"];
    case "row-testimonials":
      return ["Testimonials"];
    default:
      throw new Error(`No section for page row ${row.component}`);
  }
}

function rowContents(row) {
  const lists = ["content", "column_1", "column_2", "content_main", "content_buttons", "items", "steps", "testimonials_list", "heading", "intro", "content_1", "content_2"];
  return lists.flatMap((field) => (Array.isArray(row[field]) ? row[field].filter((b) => b?.component).map((b) => b.component) : []));
}

function storyPath(story) {
  return story.full_slug === "home" ? "/" : normalizePath(`/${story.full_slug}`);
}

/** Paths whose story exists but whose URL the old site redirects away. */
const REDIRECTED_STORIES = { "/privacy-policy": "redirects to iubenda", "/terms-and-conditions": "redirects to iubenda" };

export function inventoryStory(story) {
  const component = story.content.component;
  const entries = [];
  const hidden = [];
  const notes = [];
  let bigImagesSeen = 0;

  (story.content.body ?? []).forEach((block, blockIndex) => {
    if (block.component !== "section") {
      const entry = { source: `body[${blockIndex}] ${block.component}`, uid: block._uid, theme: null, becomes: null, dropped: droppedOptions(block) };
      if (block.hidden) {
        entry.becomes = { type: "dropped", name: "hidden block" };
        hidden.push({ story: story.full_slug, source: entry.source, uid: block._uid, title: block.title || null });
      } else if (block.component === "hero" && component === "page") {
        if (story.full_slug === "home") entry.becomes = { type: "section", name: "Home hero" };
        else {
          entry.becomes = { type: "section", name: "Page banner" };
          if (richTextHasText(block.text)) entry.dropped.push({ at: "hero", field: "text", value: "(rich text; Page banner has no text field)" });
          if (block.buttons?.length) entry.dropped.push({ at: "hero", field: "buttons", value: block.buttons.map((b) => b.text) });
        }
      } else if (block.component === "hero-product" && component === "menu-item-page") {
        entry.becomes = { type: "product field", name: "hero title, hero text, hero photo (buttons: productPageSettings hero links)" };
      } else {
        throw new Error(`Unexpected top block ${block.component} in ${story.full_slug}`);
      }
      entries.push(entry);
      return;
    }

    const background = block.background ?? "";
    const theme = THEMES[background] ?? (background === "" ? "Light" : null);
    if (!theme) throw new Error(`Unknown background ${background} in ${story.full_slug}`);
    if (background === "") notes.push(`body[${blockIndex}] section has no background; the old code draws it white, so it becomes Light.`);
    const sectionDropped = droppedOptions({ ...block, content: [] });

    block.content.forEach((row, rowIndex) => {
      const source = `body[${blockIndex}] section > content[${rowIndex}] ${row.component}`;
      const dropped = [...(rowIndex === 0 ? sectionDropped : []), ...droppedOptions(row)];
      const base = { source, uid: row._uid, wrapperUid: block._uid, theme, contains: rowContents(row) };
      if (row.component === "row-big-image") bigImagesSeen++;

      if (component === "page") {
        for (const name of pageRowSections(row)) entries.push({ ...base, becomes: { type: "section", name }, dropped });
        if (row.component === "row-two-columns" && has(row.column_2, "form_cognito")) {
          notes.push(`${source}: the text column beside the form has no field in the Cognito form section; it needs a hand (for example a Rich Text section before the form).`);
        }
      } else if (component === "blog-post") {
        let name;
        if (row.component === "row-big-image") name = bigImageSection(row);
        else if (row.component === "row-single-column") name = "Rich Text";
        else throw new Error(`No post section for ${row.component} in ${story.full_slug}`);
        entries.push({ ...base, becomes: { type: "post section", name }, dropped });
      } else {
        let becomes;
        if (row.component === "row-big-image" && bigImagesSeen === 1) {
          becomes = { type: "product field", name: "ingredients label, ingredients text, ingredients image" };
          for (const field of ["badge_image", "contain_image", "is_reversed"]) {
            if (row[field]) dropped.push({ at: "row-big-image", field, value: true });
          }
        } else if (row.component === "row-single-column") {
          becomes = { type: "product field", name: "note" };
        } else if (row.component === "row-two-columns" && has(row.column_2, "nutrition-table")) {
          becomes = { type: "product field", name: "nutrition facts (serving text and nutrition values)" };
        } else if (row.component === "row-big-image" && bigImagesSeen === 2) {
          becomes = { type: "productPageSettings", name: "Handmade food block (shared on every product page)" };
          for (const field of ["is_reversed"]) if (row[field]) dropped.push({ at: "row-big-image", field, value: true });
        } else if (row.component === "row-two-columns-cta") {
          becomes = { type: "productPageSettings", name: "Preparing a fundraiser? call to action (shared on every product page)" };
        } else {
          throw new Error(`No product field for ${source} in ${story.full_slug}`);
        }
        entries.push({ ...base, becomes, dropped });
      }
    });
  });

  if (story.full_slug === "home") {
    entries.push({ source: "old code: pages/index.jsx PostListFeatured", uid: null, theme: null, becomes: { type: "section", name: "Latest news" }, dropped: [] });
  }

  const droppedStoryFields = Object.entries(story.content)
    .filter(([field, value]) => DROPPED_STORY_FIELDS[component](field) && !isEmptyValue(value))
    .map(([field, value]) => ({ field, value: displayValue(value) }));

  const pathname = storyPath(story);
  return {
    path: pathname,
    fullSlug: story.full_slug,
    uuid: story.uuid,
    kind: KIND[component],
    component,
    served: REDIRECTED_STORIES[pathname] ? `no: ${REDIRECTED_STORIES[pathname]}` : "yes",
    rows: entries,
    hidden,
    droppedStoryFields,
    notes,
  };
}

/** Menu card each product page is linked from: its kind comes from the card (spec decision 20). */
export function menuCards(stories) {
  const cards = {};
  for (const story of stories) {
    for (const section of story.content.body ?? []) {
      for (const row of section.content ?? []) {
        if (row.component !== "row-menu-listing") continue;
        for (const item of row.items) {
          const target = normalizePath(`/${item.link?.cached_url ?? ""}`);
          (cards[target] ??= []).push({ listedOn: storyPath(story), card: item.component, name: item.name, dressing: item.dressing || null });
        }
      }
    }
  }
  return cards;
}

/** Marks the importer drops (spec decision 14): pasted colours and classes. */
const DROPPED_MARKS = new Set(["textStyle", "styled", "highlight"]);

/**
 * A row as the importer keeps it: no IDs, no empty values, no dropped
 * options, no dropped marks. Two rows with the same result import the same.
 */
export function importedShape(value) {
  if (Array.isArray(value)) return value.map(importedShape);
  if (!value || typeof value !== "object") return value;
  const result = {};
  const dropped = new Set([...(DROPPED_OPTIONS[value.component] ?? []), "_uid", "_editable"]);
  for (const [key, v] of Object.entries(value)) {
    if (dropped.has(key) || isEmptyValue(v)) continue;
    if (key === "marks") {
      const kept = v.filter((mark) => !DROPPED_MARKS.has(mark.type));
      if (kept.length) result.marks = importedShape(kept);
      continue;
    }
    result[key] = importedShape(v);
  }
  return result;
}

function flatten(value, prefix = "", out = {}) {
  if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) flatten(v, `${prefix}.${k}`, out);
  else out[prefix] = value;
  return out;
}

/** Groups products by the imported shape of one shared row, with the paths that differ from the largest group. */
export function compareSharedRow(products) {
  const groups = new Map();
  for (const { slug, row } of products) {
    const key = JSON.stringify(importedShape(row));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(slug);
  }
  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  const base = flatten(JSON.parse(sorted[0][0]));
  return {
    identical: sorted.length === 1,
    variants: sorted.map(([key, slugs], index) => {
      const own = flatten(JSON.parse(key));
      const differences = index === 0 ? [] : [...new Set([...Object.keys(base), ...Object.keys(own)])]
        .filter((p) => base[p] !== own[p])
        .map((p) => ({ path: `row${p}`, majority: base[p] ?? null, here: own[p] ?? null }));
      return { products: slugs, differences };
    }),
  };
}

export function buildInventory(stories) {
  const storyEntries = stories.map(inventoryStory);
  const cards = menuCards(stories);
  for (const entry of storyEntries) if (entry.kind === "product") entry.menuCards = cards[entry.path] ?? [];

  // The two shared product rows must import the same on every product page:
  // the importer writes them once and stops when they differ (spec decision 20).
  const productRows = stories
    .filter((s) => s.content.component === "menu-item-page")
    .map((s) => ({ slug: s.full_slug, rows: s.content.body.filter((b) => b.component === "section").flatMap((b) => b.content) }));
  const sharedRows = {
    handmade: compareSharedRow(productRows.map(({ slug, rows }) => ({ slug, row: rows.filter((r) => r.component === "row-big-image")[1] }))),
    callToAction: compareSharedRow(productRows.map(({ slug, rows }) => ({ slug, row: rows.find((r) => r.component === "row-two-columns-cta") }))),
  };

  const allRows = storyEntries.flatMap((s) => s.rows.map((r) => ({ ...r, kind: s.kind })));
  const tally = (rows) => {
    const counts = {};
    for (const row of rows) {
      const key = `${row.becomes.type}: ${row.becomes.name}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
  };
  const droppedTally = {};
  for (const row of allRows) {
    for (const d of row.dropped) {
      const component = d.at.split(" ").pop().split(".")[0];
      const key = `${component}.${d.field} = ${JSON.stringify(d.value)}`;
      droppedTally[key] = (droppedTally[key] ?? 0) + 1;
    }
  }
  const storyFieldTally = {};
  for (const story of storyEntries) for (const d of story.droppedStoryFields) storyFieldTally[d.field] = (storyFieldTally[d.field] ?? 0) + 1;

  const countComponents = () => {
    let total = 0;
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node && typeof node === "object") {
        if (node.component) total++;
        Object.values(node).forEach(walk);
      }
    };
    stories.forEach((s) => walk(s.content.body));
    return total;
  };

  // One entry per row: a row that became two sections (an FAQ row) is counted once.
  const rowEntries = allRows.filter((r, i) => r.wrapperUid && !(i > 0 && allRows[i - 1].source === r.source && allRows[i - 1].uid === r.uid));
  const bigImageRows = rowEntries.filter((r) => r.source.endsWith("row-big-image"));
  const bigByKind = (kind) => bigImageRows.filter((r) => r.kind === kind).length;
  const counts = {
    stories: stories.length,
    page: stories.filter((s) => s.content.component === "page").length,
    "blog-post": stories.filter((s) => s.content.component === "blog-post").length,
    "menu-item-page": stories.filter((s) => s.content.component === "menu-item-page").length,
    sections: stories.reduce((n, s) => n + (s.content.body ?? []).filter((b) => b.component === "section").length, 0),
    sectionsWithSeveralRows: stories.reduce((n, s) => n + (s.content.body ?? []).filter((b) => b.component === "section" && b.content.length > 1).length, 0),
    rows: rowEntries.length,
    bigImageRows: bigImageRows.length,
    // Copied stories keep their block `_uid`s, so a `_uid` is unique only inside one story.
    rowUidsSharedAcrossStories: rowEntries.length - new Set(rowEntries.map((r) => r.uid)).size,
    bigImageRowsByKind: { page: bigByKind("page"), "news post": bigByKind("news post"), product: bigByKind("product") },
    blocksInBodies: countComponents(),
  };
  for (const [key, value] of Object.entries(EXPECTED)) {
    if (counts[key] !== value) throw new Error(`Count ${key} is ${counts[key]}, the export should hold ${value}.`);
  }

  return {
    source: "Storyblok export 2026-11-20, stories-draft.json (draft version)",
    counts,
    destinations: {
      all: tally(allRows),
      page: tally(allRows.filter((r) => r.kind === "page")),
      "news post": tally(allRows.filter((r) => r.kind === "news post")),
      product: tally(allRows.filter((r) => r.kind === "product")),
    },
    sharedRows,
    hidden: storyEntries.flatMap((s) => s.hidden),
    droppedOptionValues: Object.fromEntries(Object.entries(droppedTally).sort(([a], [b]) => a.localeCompare(b))),
    droppedStoryFields: storyFieldTally,
    stories: storyEntries,
  };
}

function markdown(inventory) {
  const c = inventory.counts;
  const lines = [
    "# Storyblok block inventory",
    "",
    "Generated by `node scripts/migration/block-inventory.mjs --export <folder>` from the Storyblok export of 2026-11-20 (draft stories).",
    "The machine-readable version is [`block-inventory.json`](block-inventory.json). Mapping rules: spec decisions 8, 9, 10 and 12 of issue #3, and the big-image order of issue #15.",
    "",
    "## Counts",
    "",
    `- Stories: ${c.stories} (${c.page} pages, ${c["blog-post"]} news posts, ${c["menu-item-page"]} product pages).`,
    `- Section wrappers: ${c.sections}; ${c.sectionsWithSeveralRows} hold more than one row. Rows inside them: ${c.rows}.`,
    `- "Big image" rows: ${c.bigImageRows} (${c.bigImageRowsByKind.page} on pages, ${c.bigImageRowsByKind["news post"]} in news posts, ${c.bigImageRowsByKind.product} on product pages).`,
    `- Blocks inside story bodies, every level: ${c.blocksInBodies}.`,
    "",
    "## Shared product rows",
    "",
    "The Handmade food block and the call to action are written once into `productPageSettings`. Compared as the importer keeps them (no IDs, empty values, dropped options or colour marks):",
    "",
    ...Object.entries(inventory.sharedRows).flatMap(([name, result]) => [
      `- ${name}: ${result.identical ? "the same on all 16 product pages." : `${result.variants.length} variants.`}`,
      ...result.variants.slice(1).map((variant) => `  - ${variant.products.join(", ")} differ${variant.products.length === 1 ? "s" : ""} from the other ${16 - variant.products.length}: ${variant.differences.map((d) => `\`${d.path}\` is ${JSON.stringify(d.here)} where the others have ${JSON.stringify(d.majority)}`).join("; ")}.`),
    ]),
    "",
    "## What the rows become",
    "",
    "| Destination | Pages | News posts | Products | All |",
    "| --- | --- | --- | --- | --- |",
    ...Object.entries(inventory.destinations.all).map(
      ([key, all]) => `| ${key} | ${inventory.destinations.page[key] ?? 0} | ${inventory.destinations["news post"][key] ?? 0} | ${inventory.destinations.product[key] ?? 0} | ${all} |`,
    ),
    "",
    "Section wrappers are not a destination: each row of a wrapper becomes its own section with the wrapper's background as theme. The Latest news row is not in Storyblok; the old home page drew it in code.",
    "",
    "## Hidden blocks",
    "",
    ...inventory.hidden.map((h) => `- \`${h.story}\` ${h.source} (${h.title ?? "no title"}): dropped.`),
    "",
    "## Dropped option values",
    "",
    "Each value is dropped; none becomes a field. Count is the number of rows that carry it.",
    "",
    "| Option = value | Rows |",
    "| --- | --- |",
    ...Object.entries(inventory.droppedOptionValues).map(([key, count]) => `| \`${key.replace(/\|/g, "\\|")}\` | ${count} |`),
    "",
    "Dropped story fields (stories that carry a value): " +
      Object.entries(inventory.droppedStoryFields).map(([field, count]) => `\`${field}\` ${count}`).join(", ") + ".",
    "",
    "## Stories",
    "",
  ];
  for (const story of inventory.stories) {
    lines.push(`### \`${story.path}\` (${story.kind})`, "");
    if (story.served !== "yes") lines.push(`Served: ${story.served}.`, "");
    if (story.menuCards) lines.push(`Menu cards: ${story.menuCards.map((m) => `${m.card} "${m.name}" on \`${m.listedOn}\`${m.dressing ? ` (${m.dressing})` : ""}`).join("; ") || "none"}.`, "");
    lines.push("| # | Old row | Theme | Becomes | Dropped options |", "| --- | --- | --- | --- | --- |");
    story.rows.forEach((row, index) => {
      const dropped = row.dropped.map((d) => `${d.field}=${JSON.stringify(d.value)}`).join(", ").replace(/\|/g, "\\|") || "–";
      lines.push(`| ${index + 1} | ${row.source} | ${row.theme ?? "–"} | ${row.becomes.type}: ${row.becomes.name} | ${dropped} |`);
    });
    if (story.droppedStoryFields.length) lines.push("", `Dropped story fields: ${story.droppedStoryFields.map((d) => `\`${d.field}\``).join(", ")}.`);
    for (const note of story.notes) lines.push("", `Note: ${note}`);
    lines.push("");
  }
  return lines.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const exportIndex = args.indexOf("--export");
  if (exportIndex === -1 || !args[exportIndex + 1]) {
    throw new Error("Usage: node scripts/migration/block-inventory.mjs --export <unzipped Storyblok export folder>");
  }
  const stories = JSON.parse(readFileSync(path.join(path.resolve(args[exportIndex + 1]), "stories-draft.json"), "utf8"));
  const inventory = buildInventory(stories);
  writeFileSync(path.join(migrationDir, "block-inventory.json"), `${JSON.stringify(inventory, null, 2)}\n`);
  writeFileSync(path.join(migrationDir, "block-inventory.md"), markdown(inventory));
  console.log(JSON.stringify({ counts: inventory.counts, sharedRows: Object.fromEntries(Object.entries(inventory.sharedRows).map(([k, v]) => [k, v.variants.length])), hidden: inventory.hidden.length }));
}
