// Storyblok rich text to the Starter's Portable Text (spec decision 14):
// paragraphs, headings, bullet and numbered lists, bold, italic, underline,
// line breaks and links. Pasted colour and class marks, and text alignment,
// are dropped and counted.

import { customUrlFor, normalizeRichTextLink } from "./links.mjs";

const DECORATORS = { bold: "strong", italic: "em", underline: "underline" };
const DROPPED_MARKS = { textStyle: "pasted text colour", styled: "pasted class", highlight: "pasted highlight" };

/** Old heading levels shift down one: the page's h1 belongs to its heading section. */
export function headingStyle(level) {
  return `h${Math.min(Math.max(Number(level) || 1, 1) + 1, 6)}`;
}

/**
 * Raises headings that would skip a level, so a section's outline never
 * jumps. All headings move up together until the highest sits one under
 * `previousLevel` (sibling h3s straight under the page's h1 become sibling
 * h2s); a heading that still skips a level is then raised on its own.
 * `previousLevel` is the level of the heading the blocks sit under: 1 for the
 * page's h1, 2 under the section's own title.
 */
export function outlineHeadings(blocks, previousLevel = 1) {
  const levelOf = (block) => Number(/^h([1-6])$/.exec(block?.style ?? "")?.[1]) || 0;
  const levels = blocks.map(levelOf).filter(Boolean);
  if (!levels.length) return blocks;
  const shift = Math.max(0, Math.min(...levels) - (previousLevel + 1));
  let previous = previousLevel;
  return blocks.map((block) => {
    const original = levelOf(block);
    if (!original) return block;
    const level = Math.min(original - shift, previous + 1);
    previous = level;
    return level === original ? block : { ...block, style: `h${level}` };
  });
}

/** Keys `<prefix>0`, `<prefix>1`, ... in order: unique within one array, the same on every run. */
export function withKeys(items, prefix = "k") {
  return items.map((item, index) => ({ _key: `${prefix}${index}`, ...item }));
}

function sameMarks(a, b) {
  return a.length === b.length && a.every((mark, index) => mark === b[index]);
}

/**
 * Inline nodes to spans and link mark definitions. Adjacent text with the
 * same marks merges; a hard break is a newline in the text.
 */
function inlineChildren(nodes, context) {
  const spans = [];
  const markDefs = [];
  const markKeyFor = new Map();
  const push = (text, marks) => {
    const last = spans[spans.length - 1];
    if (last && sameMarks(last.marks, marks)) last.text += text;
    else spans.push({ _type: "span", marks, text });
  };
  for (const node of nodes ?? []) {
    if (node.type === "hard_break") {
      push("\n", spans[spans.length - 1]?.marks ?? []);
      continue;
    }
    if (node.type !== "text") {
      context.note("needs a hand", `rich text inline node "${node.type}" has no equivalent`);
      continue;
    }
    const marks = [];
    for (const mark of node.marks ?? []) {
      if (DECORATORS[mark.type]) marks.push(DECORATORS[mark.type]);
      else if (mark.type === "link") {
        const url = customUrlFor(normalizeRichTextLink(mark.attrs), context);
        if (!url) continue;
        const signature = JSON.stringify(url);
        if (!markKeyFor.has(signature)) {
          const key = `l${markDefs.length}`;
          markKeyFor.set(signature, key);
          markDefs.push({ _key: key, _type: "customLink", customLink: url });
        }
        marks.push(markKeyFor.get(signature));
      } else if (DROPPED_MARKS[mark.type]) {
        context.note("dropped mark", DROPPED_MARKS[mark.type]);
      } else {
        context.note("needs a hand", `rich text mark "${mark.type}" has no equivalent`);
      }
    }
    push(node.text ?? "", marks);
  }
  return { spans, markDefs };
}

function textBlock(nodes, context, extra) {
  const { spans, markDefs } = inlineChildren(nodes, context);
  if (!spans.some((span) => span.text.trim())) return null;
  // Line breaks at the edges of a paragraph draw nothing.
  spans[0].text = spans[0].text.replace(/^\n+/, "");
  spans[spans.length - 1].text = spans[spans.length - 1].text.replace(/\n+$/, "");
  return {
    _type: "block",
    style: "normal",
    ...extra,
    markDefs,
    children: withKeys(spans.filter((span) => span.text !== ""), "s"),
  };
}

function noteAlignment(node, context) {
  const align = node.attrs?.textAlign;
  if (align && align !== "left") context.note("dropped option", `text alignment "${align}"`);
}

function convertNodes(nodes, context, list) {
  const blocks = [];
  for (const node of nodes ?? []) {
    switch (node.type) {
      case "paragraph": {
        noteAlignment(node, context);
        const block = textBlock(node.content, context, list ? { listItem: list.kind, level: list.level } : {});
        if (block) blocks.push(block);
        break;
      }
      case "heading": {
        noteAlignment(node, context);
        const block = textBlock(node.content, context, { style: headingStyle(node.attrs?.level) });
        if (block) blocks.push(block);
        break;
      }
      case "bullet_list":
      case "ordered_list": {
        const kind = node.type === "bullet_list" ? "bullet" : "number";
        const level = (list?.level ?? 0) + 1;
        for (const item of node.content ?? []) {
          blocks.push(...convertNodes(item.content, context, { kind, level }));
        }
        break;
      }
      case "list_item":
        blocks.push(...convertNodes(node.content, context, list));
        break;
      case "blockquote":
        for (const block of convertNodes(node.content, context, list)) blocks.push({ ...block, style: "blockquote" });
        break;
      case "horizontal_rule":
        context.note("dropped", "a horizontal rule in rich text");
        break;
      default:
        context.note("needs a hand", `rich text node "${node.type}" has no equivalent`);
    }
  }
  return blocks;
}

/**
 * The Portable Text blocks of a Storyblok rich text document, without array
 * keys (the caller numbers the array it builds with `withKeys`). `context`
 * is the link context of `customUrlFor` plus `note(kind, detail)`.
 */
export function richTextToBlocks(doc, context) {
  if (!doc || doc.type !== "doc") return [];
  return convertNodes(doc.content, context, null);
}

/** One paragraph of plain text, or null when it is empty. */
export function paragraph(text, extra = {}) {
  const value = String(text ?? "").trim();
  if (!value) return null;
  return { _type: "block", style: "normal", ...extra, markDefs: [], children: [{ _key: "s0", _type: "span", marks: [], text: value }] };
}

/** One paragraph whose whole text links to `url`. */
export function linkParagraph(text, url) {
  const value = String(text ?? "").trim();
  if (!value) return null;
  if (!url) return paragraph(value);
  return {
    _type: "block",
    style: "normal",
    markDefs: [{ _key: "l0", _type: "customLink", customLink: url }],
    children: [{ _key: "s0", _type: "span", marks: ["l0"], text: value }],
  };
}
