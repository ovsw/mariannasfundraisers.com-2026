// The text of an old row as Portable Text, for the Scaffold that holds the
// row until its own section is built: headings, text, buttons as links,
// images, tables, form IDs, video links and list items, in display order.

import { imageFromAsset } from "./files.mjs";
import { customUrlFor, normalizeMultilink } from "./links.mjs";
import { DROPPED_OPTIONS } from "../../../scripts/migration/block-inventory.mjs";
import { linkParagraph, paragraph, richTextToBlocks } from "./rich-text.mjs";

const META_FIELDS = new Set(["_uid", "component", "_editable", "hidden"]);

/** Field order per component; other components keep their stored order. */
const FIELD_ORDER = {
  hero: ["title", "text", "buttons", "background_image", "youTubeLink"],
  "row-big-image": ["image", "badge_image", "youTubeLink", "content"],
  "row-two-columns": ["column_1", "column_2"],
  "row-two-columns-cta": ["image", "content_main", "content_buttons"],
  "row-menu-teaser-one-off": ["heading", "intro", "image_1", "content_1", "image_2", "content_2"],
  "row-testimonials": ["image", "heading", "testimonials_list"],
  "heading-group": ["eyebrow", "title", "subtitle"],
  "page-heading": ["heading_title", "intro_text"],
  "faq-list": ["title", "items"],
  "faq-item": ["question", "answer_single", "answer"],
  step: ["image", "title", "description"],
  testimonial: ["text", "author_name", "author_info"],
  "feature-group": ["icon", "heading", "text"],
  hoagie: ["image", "name", "description", "dressing", "link"],
  pizza: ["image", "name", "description", "link"],
  salsa: ["image", "name", "description", "link"],
};

/** Fields shown as a heading, by component. */
const HEADING_FIELDS = new Set(["title", "heading", "heading_title", "name", "question"]);

/** Fields whose value is shown as `Label: value`. */
const LABELLED_FIELDS = {
  cognito_form_id: "Cognito form ID",
  youTubeLink: "YouTube video",
  icon: "Icon",
  dressing: "Dressing",
  menu_item: "Menu item",
};

function headingBlock(text, level) {
  return paragraph(text, { style: level });
}

function tableBlock(table) {
  const row = (cells) => ({ _type: "tableRow", cells: cells.map((cell) => String(cell.value ?? "")) });
  const rows = [...(table?.thead?.length ? [row(table.thead)] : []), ...(table?.tbody ?? []).map((r) => row(r.body ?? []))];
  if (!rows.length) return null;
  return { _type: "table", rows: rows.map((r, index) => ({ _key: `r${index}`, ...r })) };
}

function buttonBlock(button, context) {
  const url = customUrlFor(normalizeMultilink(button.link), context);
  return linkParagraph(button.text ? `Button: ${button.text}` : "", url);
}

function valueBlocks(component, field, value, context, depth) {
  if (value === undefined || value === null || value === "" || value === false) return [];
  if (typeof value === "boolean" || typeof value === "number") return [];
  if (Array.isArray(value)) return value.flatMap((child) => (child?.component ? blockToPortableText(child, context, depth + 1) : []));
  if (typeof value === "object") {
    if (value.type === "doc") return richTextToBlocks(value, context);
    if (value.fieldtype === "asset") {
      const image = imageFromAsset(value, context);
      return image ? [image] : [];
    }
    if (value.fieldtype === "multilink") {
      const url = customUrlFor(normalizeMultilink(value), context);
      return url ? [linkParagraph("Link", url)] : [];
    }
    if (field === "table") {
      const table = tableBlock(value);
      return table ? [table] : [];
    }
    return [];
  }
  const text = String(value);
  if (LABELLED_FIELDS[field]) {
    if (field === "youTubeLink") return [linkParagraph(`${LABELLED_FIELDS[field]}: ${text}`, { _type: "customUrl", type: "external", external: text.trim(), openInNewTab: false })];
    return [paragraph(`${LABELLED_FIELDS[field]}: ${text}`)];
  }
  if (HEADING_FIELDS.has(field)) return [headingBlock(text, depth <= 1 ? "h2" : "h3")];
  return [paragraph(text)];
}

/**
 * The Portable Text of one old block and every block inside it, without
 * array keys. `context` is the link context plus `fileRef` and `missingAlt`.
 */
export function blockToPortableText(block, context, depth = 0) {
  if (!block?.component || block.hidden) return [];
  if (block.component === "button") return [buttonBlock(block, context)].filter(Boolean);
  if (block.component === "heading") return [headingBlock(block.title, depth <= 1 ? "h2" : "h3")].filter(Boolean);
  const dropped = new Set(DROPPED_OPTIONS[block.component] ?? []);
  const fields = FIELD_ORDER[block.component] ?? Object.keys(block);
  return fields
    .filter((field) => !META_FIELDS.has(field) && !dropped.has(field))
    .flatMap((field) => valueBlocks(block.component, field, block[field], context, depth))
    .filter(Boolean);
}
