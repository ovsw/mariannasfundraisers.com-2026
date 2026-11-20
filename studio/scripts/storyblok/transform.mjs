// The pure mapping from the Storyblok export to Sanity documents (spec
// decisions 4, 7, 10, 14, 20 and 21). No network: files are looked up through
// `fileRef`, which the importer supplies (dry run: a placeholder; --apply: the
// matched or uploaded asset).
//
// Built here: the home page and every page, with Page banner, Page heading,
// Rich Text (with its button row) and the eight image-and-text sections of
// the old "big image" row (issue #15). Every other row becomes a Scaffold that
// holds the row's text and names its intended section. News posts, their
// authors, the news list and the Latest news section (issue #17) are built
// here too, with news.mjs. Product pages are counted and left to their own
// ticket. The site shell (settings, navigation, footer) comes from the seed
// file, through site-shell.mjs.

import {
  droppedOptions,
  pageRowSections,
} from "../../../scripts/migration/block-inventory.mjs";
import { headingAnchorId } from "../../../shared/heading-anchor.ts";
import { buttonColours, defaultButtonColour, isSiteIconName } from "../../../shared/site-design.ts";
import { collectFiles, imageFromAsset } from "./files.mjs";
import { customUrlFor, normalizeMultilink, normalizeSitePath } from "./links.mjs";
import { outlineHeadings, paragraph, richTextToBlocks, withKeys } from "./rich-text.mjs";
import { blockToPortableText } from "./scaffold-text.mjs";
import { siteShellDocuments, siteShellFiles } from "./site-shell.mjs";
import {
  authorDocumentId,
  authorDocuments,
  authorFiles,
  blogIndexDocument,
  cleanPostSlug,
  latestNewsSection,
  postRedirect,
  publishedAtFrom,
} from "./news.mjs";
import { youTubeVideoId } from "../../../shared/youtube.ts";

/** Story components and the document type each becomes. */
export const STORY_TYPES = { page: "page", "menu-item-page": "product", "blog-post": "post" };

/** Story kinds as the report names them. */
const KIND = { page: "page", "menu-item-page": "product", "blog-post": "news" };

/** Story kinds imported by later tickets: links to them are site paths until then. */
const IMPORTED_LATER = {
  "menu-item-page": "product page: imported by ticket #16",
};

/** Page stories whose URL the old site redirects away (spec decision 6). */
export const REDIRECTED_PAGES = {
  "/privacy-policy": "the old site redirects this URL to iubenda; it becomes a redirect (ticket #20)",
  "/terms-and-conditions": "the old site redirects this URL to iubenda; it becomes a redirect (ticket #20)",
};

const THEMES = { "": "light", light: "light", shaded: "shaded", muslin: "muslin", primary: "primary" };

/** The old hero's edge colour (`border_color`) as a section theme. */
const BANNER_EDGE_THEMES = { light: "light", white: "light", shaded: "shaded", muslin: "muslin", green: "primary", primary: "primary" };

const BUTTON_COLOURS = new Set(buttonColours.map(({ value }) => value));
const ANCHOR = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function storyPath(story) {
  return story.full_slug === "home" ? "/" : normalizeSitePath(story.full_slug);
}

/** The document ID of a story: the home page is the `homePage` singleton; others come from the story UUID. */
export function storyDocumentId(story) {
  if (story.content.component === "page" && story.full_slug === "home") return "homePage";
  const type = STORY_TYPES[story.content.component];
  if (!type) throw new Error(`No document type for story component ${story.content.component} (${story.full_slug})`);
  return `${type}-${story.uuid}`;
}

function isImportedPage(story) {
  return story.content.component === "page" && !REDIRECTED_PAGES[storyPath(story)];
}

/** A news post's address: `/news/<clean slug>` (spec decision 5). */
export function postStoryPath(story) {
  return `/news/${cleanPostSlug(story.slug)}`;
}

/** Resolves links: to the document of an imported page, otherwise to the story's path. */
export function createSite(stories) {
  const targets = new Map();
  const byPath = new Map();
  for (const story of stories) {
    const path = storyPath(story);
    let target;
    if (isImportedPage(story)) target = { path, ref: { _type: "reference", _ref: storyDocumentId(story) } };
    // A news post is linked at its clean address; a link to its old address
    // finds it too.
    else if (story.content.component === "blog-post") {
      target = { path: postStoryPath(story), ref: { _type: "reference", _ref: storyDocumentId(story) } };
      byPath.set(target.path, target);
    }
    // A story that is not a document yet (a product page, until its ticket
    // imports it; a redirected page) is linked by its path.
    else target = { path };
    targets.set(story.uuid, target);
    byPath.set(path, target);
  }
  return { byUuid: (uuid) => targets.get(uuid) ?? null, byPath: (path) => byPath.get(path) ?? null };
}

/** The report: counts, and every dropped item, image without alt text and item that needs a hand. */
function createReport() {
  return {
    found: { stories: 0, page: 0, product: 0, news: 0, files: 0, images: 0, documentFiles: 0 },
    documents: {},
    sections: {},
    scaffolds: {},
    skipped: [],
    publishedFromDraft: [],
    dropped: {},
    droppedItems: [],
    imagesWithoutAlt: [],
    needsHand: [],
    movedStoryLinks: [],
    newsRedirects: [],
    overrides: { applied: [], unused: [] },
  };
}

function count(map, key, by = 1) {
  map[key] = (map[key] ?? 0) + by;
}

/** Everything a story's transform needs, with the report notes tied to the story. */
function storyContext(story, shared) {
  const { report } = shared;
  const where = storyPath(story);
  const context = {
    story: story.full_slug,
    site: shared.site,
    fileRef: shared.fileRef,
    overrides: shared.overrides.links,
    at: "",
    missingAlt(url) {
      report.imagesWithoutAlt.push({ story: where, at: context.at, file: url });
    },
    note(kind, detail) {
      if (kind === "override") {
        shared.usedOverrides.add(JSON.stringify([story.full_slug, detail.from]));
        report.overrides.applied.push({ story: where, at: context.at, from: detail.from, to: detail.to });
      } else if (kind === "moved story") {
        report.movedStoryLinks.push({ story: where, at: context.at, ...detail });
      } else if (kind === "dropped mark") {
        count(report.dropped, `rich text: ${detail}`);
        report.droppedItems.push({ story: where, at: context.at, item: `rich text mark: ${detail}` });
      } else if (kind === "dropped option") {
        count(report.dropped, `rich text: ${detail.replace(/ ".*"$/, "")}`);
        report.droppedItems.push({ story: where, at: context.at, item: detail });
      } else if (kind === "dropped") {
        count(report.dropped, detail.startsWith("a link") ? "links that go nowhere" : detail);
        report.droppedItems.push({ story: where, at: context.at, item: detail });
      } else {
        report.needsHand.push({ story: where, at: context.at, issue: detail });
      }
    },
    drop(at, item, label) {
      count(report.dropped, label);
      report.droppedItems.push({ story: where, at, item });
    },
  };
  return context;
}

function recordDroppedOptions(context, at, options) {
  for (const option of options) {
    const component = option.at.split(" ").pop().split(".")[0];
    context.drop(`${at} ${option.at}`, `${component}.${option.field} = ${JSON.stringify(option.value)}`, `option: ${component}.${option.field}`);
  }
}

function button(block, context) {
  const text = block.text?.trim();
  const url = customUrlFor(normalizeMultilink(block.link), context);
  if (!text || !url) {
    context.note("needs a hand", `button "${block.text ?? ""}" has no ${text ? "destination" : "text"}; it is not imported`);
    return null;
  }
  const result = { _key: block._uid, _type: "button", text, url: { ...url, openInNewTab: url.openInNewTab || block.target === true } };
  result.colour = BUTTON_COLOURS.has(block.style) ? block.style : defaultButtonColour;
  if (block.icon) {
    if (isSiteIconName(block.icon)) result.icon = block.icon;
    else context.drop(context.at, `button icon "${block.icon}"`, "button icons not in the icon list");
  }
  return result;
}

function pageBanner(hero, nextTheme, context) {
  const image = imageFromAsset(hero.background_image, context);
  if (!image) return null;
  const theme = BANNER_EDGE_THEMES[hero.border_color] ?? nextTheme ?? "light";
  const banner = { _key: hero._uid, _type: "pageBanner", theme, image };
  if (hero.title?.trim()) banner.title = hero.title.trim();
  if (hero.text?.content?.some((node) => JSON.stringify(node).includes('"text":'))) {
    context.drop(context.at, "hero text (the Page banner has no text field)", "hero text");
  }
  if (hero.buttons?.length) {
    context.drop(context.at, `hero buttons: ${hero.buttons.map((b) => b.text).join(", ")}`, "hero buttons");
  }
  if (hero.youTubeLink?.trim()) context.drop(context.at, `hero video ${hero.youTubeLink}`, "hero video");
  return banner;
}

/** Rich text reduced to the simple rich text profile: paragraphs with bold, italic and links. */
function simpleRichText(blocks, context) {
  return blocks.map((block) => {
    if (block._type !== "block") {
      context.note("needs a hand", `a ${block._type} in a simple rich text field is not imported`);
      return null;
    }
    const { listItem, level, ...rest } = block;
    if (listItem || block.style !== "normal") context.drop(context.at, "list or heading style in a Page heading introduction", "rich text: list or heading style in a simple text field");
    return {
      ...rest,
      style: "normal",
      children: block.children.map((span) => ({
        ...span,
        marks: span.marks.filter((mark) => {
          if (mark !== "underline") return true;
          context.drop(context.at, "underline in a Page heading introduction", "rich text: underline in a simple text field");
          return false;
        }),
      })),
    };
  }).filter(Boolean);
}

function pageHeading(row, theme, context) {
  const heading = row.content.find((block) => block.component === "page-heading");
  const others = row.content.filter((block) => block !== heading);
  if (others.length) context.note("needs a hand", `the Page heading row also holds ${others.map((b) => b.component).join(", ")}, which is not imported`);
  const section = { _key: row._uid, _type: "pageHeading", theme, title: heading.heading_title?.trim() ?? "" };
  const intro = simpleRichText(richTextToBlocks(heading.intro_text, context), context);
  if (intro.length) section.intro = withKeys(intro, "b");
  return section;
}

/**
 * The content of a row of headings, text and buttons: a leading heading group
 * becomes the section's eyebrow, title and anchor ID; headings, text and
 * tables become its rich text; button groups its buttons. With
 * `featureGroups`, the old feature groups (icon, heading, text) become items.
 */
function rowContent(row, context, { section, featureGroups = false }) {
  const body = [];
  const buttons = [];
  const items = [];
  row.content.forEach((block, index) => {
    if (block.hidden) return;
    switch (block.component) {
      case "heading-group":
        if (index === 0 && !body.length) {
          if (block.eyebrow?.trim()) section.eyebrow = block.eyebrow.trim();
          if (block.title?.trim()) section.title = block.title.trim();
          if (block.subtitle?.trim()) body.push(paragraph(block.subtitle));
          if (block.anchor_id) {
            if (ANCHOR.test(block.anchor_id)) section.anchorId = block.anchor_id;
            else context.note("needs a hand", `anchor ID "${block.anchor_id}" is not lowercase words with hyphens`);
          }
        } else {
          if (block.eyebrow?.trim()) body.push(paragraph(block.eyebrow));
          if (block.title?.trim()) body.push(paragraph(block.title, { style: "h2" }));
          if (block.subtitle?.trim()) body.push(paragraph(block.subtitle));
          if (block.anchor_id) context.note("needs a hand", `anchor ID "${block.anchor_id}" on a heading group inside the text has no field`);
        }
        break;
      case "heading": {
        // The heading block's own level, kept (an h1 becomes h2: the page's
        // h1 belongs to its heading section).
        const level = Number(String(block.level ?? "h2").replace(/^h/, "")) || 2;
        if (block.title?.trim()) body.push(paragraph(block.title, { style: `h${Math.min(Math.max(level, 2), 6)}` }));
        if (block.anchor_id && block.anchor_id !== headingAnchorId(block.title ?? "")) {
          context.note("needs a hand", `heading "${block.title}" had anchor "${block.anchor_id}"; the Website gives it "${headingAnchorId(block.title ?? "")}"`);
        }
        break;
      }
      case "rich-text-basic":
        body.push(...richTextToBlocks(block.text, context));
        break;
      case "button-group":
        if (row.content.slice(index + 1).some((later) => !later.hidden && !["button-group", "button"].includes(later.component))) {
          context.note("needs a hand", "a button row stood above more text; the section draws its buttons under the text");
        }
        for (const item of block.content ?? []) {
          const result = item.component === "button" && !item.hidden ? button(item, context) : null;
          if (result) buttons.push(result);
        }
        break;
      case "button": {
        const result = button(block, context);
        if (result) buttons.push(result);
        break;
      }
      case "table": {
        const table = blockToPortableText(block, context).find((item) => item._type === "table");
        if (table) body.push(table);
        break;
      }
      case "feature-group":
        if (featureGroups) {
          const item = iconListItem(block, context);
          if (item) items.push(item);
          break;
        }
      // falls through: a feature group outside an icon list has no field
      default:
        context.note("needs a hand", `a ${block.component} block inside a ${section._type} row is not imported`);
    }
  });
  const content = outlineHeadings(body.filter(Boolean), section.title ? 2 : 1);
  if (content.length) section.richText = withKeys(content, "b");
  if (featureGroups && items.length) section.items = items;
  if (buttons.length) section.buttons = buttons;
  return section;
}

/** A single-column row of headings, text and buttons as the Rich Text section. */
function richTextSection(row, theme, context) {
  return rowContent(row, context, { section: { _key: row._uid, _type: "richTextBlock", theme } });
}

/** An old feature group (icon, heading, text) as an item of the Image and icon list. */
function iconListItem(block, context) {
  const heading = block.heading?.trim();
  if (!heading) {
    context.note("needs a hand", "a feature group has no heading; it is not imported");
    return null;
  }
  if (!isSiteIconName(block.icon)) {
    context.note("needs a hand", `the feature group "${heading}" has the icon "${block.icon ?? ""}", which is not in the icon list; it is not imported`);
    return null;
  }
  const item = { _key: block._uid, _type: "iconListItem", icon: block.icon, heading };
  const text = simpleRichText(richTextToBlocks(block.text, context), context);
  if (text.length) item.text = withKeys(text, "b");
  return item;
}

/** The image-and-text section each old "big image" row becomes (spec decision 12, issue #15). */
export const IMAGE_AND_TEXT_TYPES = {
  "Photo left and text": "photoLeftAndText",
  "Photo right and text": "photoRightAndText",
  "Cutout left and text": "cutoutLeftAndText",
  "Cutout right and text": "cutoutRightAndText",
  "Badge and text": "badgeAndText",
  "Video left and text": "videoLeftAndText",
  "Video right and text": "videoRightAndText",
  "Image and icon list": "imageAndIconList",
};

/**
 * An old "big image" row as its image-and-text section, or null when it
 * cannot be one (no image, or a video link that is not a YouTube video): the
 * row then stays a Scaffold and the report says why.
 */
function imageAndTextSection(row, name, theme, context) {
  const type = IMAGE_AND_TEXT_TYPES[name];
  const image = imageFromAsset(row.image, context);
  if (!image) {
    context.note("needs a hand", `the ${name} row has no image; it stays a Scaffold`);
    return null;
  }
  const section = { _key: row._uid, _type: type, theme };
  if (type === "videoLeftAndText" || type === "videoRightAndText") {
    const link = row.youTubeLink.trim();
    if (!youTubeVideoId(link)) {
      context.note("needs a hand", `the video link "${link}" is not a YouTube video link; the row stays a Scaffold`);
      return null;
    }
    // The Studio field takes an absolute http(s) URL; the parser also accepts
    // a link typed without its scheme, so store it with one.
    section.youTubeUrl = /^[a-z]+:\/\//i.test(link) ? link : `https://${link}`;
  }
  rowContent(row, context, { section, featureGroups: type === "imageAndIconList" });
  section.image = image;
  if (type === "imageAndIconList" ? !section.items?.length : !(section.title || section.eyebrow || section.richText?.length)) {
    context.note("needs a hand", `the ${name} row has no ${type === "imageAndIconList" ? "items" : "heading or text"}; it stays a Scaffold`);
    return null;
  }
  return section;
}

function scaffold(key, name, theme, source, content, context) {
  const richText = withKeys(content.filter(Boolean), "b");
  const section = {
    _key: key,
    _type: "scaffold",
    name,
    proposedSectionShape: `${name}${theme ? `, theme ${theme}` : ""}. Imported from the old ${source} as text; replace it with the ${name} section when that section is built.`,
  };
  if (richText.length) section.richText = richText;
  count(context.shared.report.scaffolds, name);
  return section;
}

/** Keys from the block `_uid`; a repeat inside one array gets a suffix. */
function uniqueKey(used, key) {
  let candidate = key;
  for (let n = 2; used.has(candidate); n++) candidate = `${key}-${n}`;
  used.add(candidate);
  return candidate;
}

/** The sections a news post may hold (spec decision 9): Rich Text and the image-and-text family. */
const POST_SECTIONS = new Set(["Rich Text", ...Object.keys(IMAGE_AND_TEXT_TYPES)]);

/**
 * A story's rows as sections. A news post (`post: true`) takes only Rich Text
 * and the image-and-text sections and never a Scaffold: a row that cannot be
 * one of them is left out and listed under "needs a hand".
 */
function pageSections(story, context, { post = false } = {}) {
  const sections = [];
  const used = new Set();
  const push = (section) => {
    section._key = uniqueKey(used, section._key);
    sections.push(section);
    count(context.shared.report.sections, section._type);
  };
  const body = story.content.body ?? [];

  body.forEach((block, blockIndex) => {
    context.at = `body[${blockIndex}] ${block.component}`;
    if (block.component !== "section") {
      recordDroppedOptions(context, context.at, droppedOptions(block).filter((o) => !(block.component === "hero" && o.field === "border_color")));
      if (block.hidden) {
        context.drop(context.at, `hidden ${block.component}${block.title ? ` "${block.title}"` : ""}`, "hidden blocks");
        return;
      }
      if (block.component === "hero" && story.full_slug === "home") {
        push(scaffold(block._uid, "Home hero", null, "home hero", blockToPortableText(block, context), context));
        return;
      }
      if (block.component === "hero" && post) {
        context.note("needs a hand", "a top-level hero would be a Page banner, which a news post cannot hold; it is not imported");
        return;
      }
      if (block.component === "hero") {
        const next = body.slice(blockIndex + 1).find((b) => b.component === "section");
        const banner = pageBanner(block, THEMES[next?.background ?? ""], context);
        if (banner) push(banner);
        else context.note("needs a hand", "the hero has no photo; no Page banner is imported");
        return;
      }
      context.note("needs a hand", `a top-level ${block.component} block is not imported`);
      return;
    }

    const theme = THEMES[block.background ?? ""];
    if (!theme) throw new Error(`Unknown section background "${block.background}" in ${story.full_slug}`);
    recordDroppedOptions(context, context.at, droppedOptions({ ...block, content: [] }));
    if (block.hidden) {
      context.drop(context.at, "hidden section", "hidden blocks");
      return;
    }

    block.content.forEach((sourceRow, rowIndex) => {
      context.at = `body[${blockIndex}] section > content[${rowIndex}] ${sourceRow.component}`;
      recordDroppedOptions(context, context.at, droppedOptions(sourceRow));
      if (sourceRow.hidden) {
        context.drop(context.at, `hidden ${sourceRow.component}`, "hidden blocks");
        return;
      }
      // Hidden children neither shape the row nor reach the page.
      const row = Array.isArray(sourceRow.content) ? { ...sourceRow, content: sourceRow.content.filter((child) => !child.hidden) } : sourceRow;
      for (const child of sourceRow.content ?? []) {
        if (child.hidden) context.drop(context.at, `hidden ${child.component}`, "hidden blocks");
      }
      const names = pageRowSections(row);
      const faqLists = row.content?.filter((b) => b.component === "faq-list") ?? [];
      names.forEach((name, index) => {
        const key = index === 0 ? row._uid : `${row._uid}-${index + 1}`;
        if (post && !POST_SECTIONS.has(name)) {
          context.note("needs a hand", `the ${row.component} row would be a ${name} section, which a news post cannot hold; it is not imported`);
          return;
        }
        const imageAndText = IMAGE_AND_TEXT_TYPES[name] ? imageAndTextSection(row, name, theme, context) : null;
        if (post && IMAGE_AND_TEXT_TYPES[name] && !imageAndText) {
          context.note("needs a hand", `the ${name} row cannot be its section in a news post; it is not imported`);
          return;
        }
        if (name === "Page heading") push(pageHeading(row, theme, context));
        else if (name === "Rich Text") push(richTextSection(row, theme, context));
        else if (imageAndText) push(imageAndText);
        else {
          // A row with several FAQ lists: one Scaffold per list; the row's
          // other content goes once, into the first.
          const source = names.length > 1 && faqLists[index]
            ? { ...row, content: row.content.filter((b) => (b.component === "faq-list" ? b === faqLists[index] : index === 0)) }
            : row;
          push(scaffold(key, name, theme, `${row.component} row`, blockToPortableText(source, context), context));
        }
      });
      if (row.component === "row-two-columns" && row.column_2?.some((b) => b.component === "form_cognito")) {
        context.note("needs a hand", "the text column beside the Cognito form has no field in the Cognito form section");
      }
    });
  });

  if (story.full_slug === "home") {
    // The old home page drew the three newest posts from code, last on the page.
    context.at = "old code: pages/index.jsx PostListFeatured";
    const seed = context.shared.seed;
    if (seed?.news?.latestNews) push(latestNewsSection(seed));
    else context.note("needs a hand", "no seed file: the Latest news section is not added to the home page");
  }
  return sections;
}

function meta(story, context) {
  const content = story.content;
  context.at = "SEO";
  const result = { noindex: content.seo_noindex === true };
  const title = content.seo_title?.trim();
  if (title && title !== story.name.trim()) result.title = title;
  if (content.seo_description?.trim()) result.description = content.seo_description.trim();
  // The sharing photo has no alt text field: the sharing card is an image of its own.
  const image = imageFromAsset(content.seo_image, { ...context, missingAlt: undefined });
  if (image) {
    delete image.alt;
    result.image = image;
  }
  return result;
}

/** An old news post as a `post` (spec decisions 9 and 20). */
function postDocument(story, shared) {
  const context = storyContext(story, shared);
  context.shared = shared;
  const content = story.content;
  const id = storyDocumentId(story);
  // The story name is the title, as on pages: the old news cards showed it,
  // and the slug, the SEO title and the sharing card follow it. The old post
  // page drew the story's own title field as its heading; where that differs,
  // the report lists it.
  const title = story.name.trim();
  const heading = content.title?.trim();
  if (heading && heading !== title) {
    context.drop("title", `post heading "${heading}" (the old post page's heading; the post's title is the story name "${title}")`, "news: post heading unlike the story name");
  }
  const document = { _id: id, _type: "post", title, slug: { _type: "slug", current: cleanPostSlug(story.slug) } };

  context.at = "excerpt";
  const excerpt = paragraph(content.excerpt);
  if (excerpt) document.excerpt = withKeys([excerpt], "excerpt");

  context.at = "author";
  const author = shared.seed?.authors?.items.find((item) => item.key === content.author);
  if (author) document.author = { _type: "reference", _ref: authorDocumentId(author.key) };
  else context.note("needs a hand", `the author "${content.author ?? ""}" is not one of the authors in the seed file; the post has no author`);

  context.at = "date";
  const publishedAt = publishedAtFrom(content.date);
  if (publishedAt) document.publishedAt = publishedAt;
  else context.note("needs a hand", `the date "${content.date ?? ""}" is not a date; the post has no publish date and stays off the news list`);

  context.at = "main_image";
  const image = imageFromAsset(content.main_image, context);
  if (image) document.image = image;
  else context.note("needs a hand", "the post has no main image; its card shows none");

  context.at = "reading_time";
  const readingTime = Number.parseInt(String(content.reading_time ?? ""), 10);
  if (readingTime > 0) document.readingTime = readingTime;
  else context.note("needs a hand", `the reading time "${content.reading_time ?? ""}" is not a number of minutes`);

  if (content.body_rte) {
    context.drop("body_rte", "body_rte (the old news template never drew it)", "news: body_rte");
  }

  document.blocks = pageSections(story, context, { post: true });
  // The SEO fields map as a page's; the post title is the default title.
  document.meta = meta({ ...story, name: title }, context);
  return document;
}

function pageDocument(story, shared) {
  const context = storyContext(story, shared);
  context.shared = shared;
  const id = storyDocumentId(story);
  const document = { _id: id, _type: id === "homePage" ? "homePage" : "page", title: story.name.trim() };
  if (document._type === "page") document.slug = { _type: "slug", current: storyPath(story).slice(1) };
  document.blocks = pageSections(story, context);
  document.meta = meta(story, context);
  return document;
}

function canonicalOverrides(overrides) {
  return { links: overrides?.links ?? [] };
}

/**
 * Plans the import of a Storyblok export: the documents to write and the
 * report. `source`: `{ stories, published }` (draft stories; the UUIDs of the
 * published ones). `options.fileRef(url, kind)` gives the asset ID of a file;
 * `options.overrides` holds the fixes that survive a second run. With
 * `options.seed` (the hard-coded content seed) the plan also holds the
 * `settings`, `navigation` and `footer` documents (`site-shell.mjs`), with
 * `options.iconSvg(name)` and `options.gaMeasurementId`.
 */
export function planImport(source, options = {}) {
  const stories = [...source.stories].sort((a, b) => a.full_slug.localeCompare(b.full_slug));
  const report = createReport();
  const overrides = canonicalOverrides(options.overrides);
  const shared = {
    report,
    site: createSite(stories),
    fileRef: options.fileRef ?? ((url, kind) => `storyblok-${kind}-${url}`),
    overrides,
    usedOverrides: new Set(),
    seed: options.seed ?? null,
  };

  const files = collectFiles(stories);
  report.found.stories = stories.length;
  for (const story of stories) {
    const kind = KIND[story.content.component];
    if (!kind) throw new Error(`Unknown story component ${story.content.component} (${story.full_slug})`);
    report.found[kind]++;
  }
  const documents = [];
  const published = source.published ? new Set(source.published) : null;
  for (const story of stories) {
    const path = storyPath(story);
    if (story.content.component === "blog-post") {
      if (published && !published.has(story.uuid)) report.publishedFromDraft.push(path);
      const document = postDocument(story, shared);
      count(report.documents, document._type);
      documents.push(document);
      // A malformed old address (spec decision 5) redirects to the clean one.
      if (postStoryPath(story) !== path) {
        const redirect = postRedirect(path, document._id);
        count(report.documents, redirect._type);
        documents.push(redirect);
        report.newsRedirects.push({ from: path, to: postStoryPath(story) });
      }
      continue;
    }
    if (story.content.component !== "page") {
      report.skipped.push({ story: path, reason: IMPORTED_LATER[story.content.component] });
      continue;
    }
    if (REDIRECTED_PAGES[path]) {
      report.skipped.push({ story: path, reason: REDIRECTED_PAGES[path] });
      continue;
    }
    if (published && !published.has(story.uuid)) report.publishedFromDraft.push(path);
    const document = pageDocument(story, shared);
    count(report.documents, document._type);
    documents.push(document);
  }

  if (options.seed) {
    const shell = siteShellDocuments(options.seed, {
      site: shared.site,
      fileRef: shared.fileRef,
      iconSvg: options.iconSvg ?? ((name) => `<svg data-icon="${name}"></svg>`),
      gaMeasurementId: options.gaMeasurementId,
      missingPath(path, label) {
        report.needsHand.push({ story: "seed", at: "site shell", issue: `the link ${label} goes to ${path}, which no story owns` });
      },
    });
    if (!options.gaMeasurementId?.trim()) {
      report.needsHand.push({ story: "seed", at: "settings", issue: "no Google Analytics measurement ID: set MFR_GA_MEASUREMENT_ID" });
    }
    for (const file of siteShellFiles(options.seed)) files.set(file.url, file);
    for (const file of authorFiles(options.seed)) files.set(file.url, file);
    shell.push(...authorDocuments(options.seed, { fileRef: shared.fileRef }), blogIndexDocument(options.seed));
    for (const document of shell) {
      count(report.documents, document._type);
      documents.push(document);
    }
  }
  // Counted after the shell logos join the story files.
  report.found.files = files.size;
  report.found.images = [...files.values()].filter((file) => file.asImage).length;
  report.found.documentFiles = files.size - report.found.images;

  for (const override of overrides.links) {
    if (!shared.usedOverrides.has(JSON.stringify([override.story, override.from]))) {
      const story = stories.find((s) => s.full_slug === override.story);
      report.overrides.unused.push({
        story: override.story,
        from: override.from,
        reason: story && story.content.component !== "page" ? IMPORTED_LATER[story.content.component] : "no link matches",
      });
    }
  }
  return { documents, files, report };
}
