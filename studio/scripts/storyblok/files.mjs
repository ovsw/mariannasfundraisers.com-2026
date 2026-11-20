// Storyblok files: which files the stories use, and the Sanity image object
// an image field becomes (spec decision 20). Pure: the asset each file
// matches is looked up through `fileRef`, which the importer supplies.

const STORYBLOK_FILE = /^https:\/\/a\.storyblok\.com\/f\//;

export function isStoryblokFile(url) {
  return typeof url === "string" && STORYBLOK_FILE.test(url);
}

/** The file name at the end of a Storyblok file URL. */
export function fileName(url) {
  return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "file");
}

/** Pixel size from a Storyblok image URL (`/f/<space>/<w>x<h>/...`), or null. */
export function imageSize(url) {
  const match = /\/f\/\d+\/(\d+)x(\d+)\//.exec(url);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}

function walk(value, visit) {
  if (Array.isArray(value)) return value.forEach((item) => walk(item, visit));
  if (!value || typeof value !== "object") return;
  visit(value);
  for (const child of Object.values(value)) walk(child, visit);
}

/**
 * Every Storyblok file the stories use, by URL: as an image field (an asset
 * object), as a link target (a button or a rich text link), or both. The
 * first non-empty alt text and title of each file are kept for its asset.
 */
export function collectFiles(stories) {
  const files = new Map();
  const entry = (url) => {
    if (!files.has(url)) files.set(url, { url, asImage: false, asLink: false, alt: "", title: "", storyblokId: null });
    return files.get(url);
  };
  for (const story of stories) {
    walk(story.content, (node) => {
      if (node.fieldtype === "asset" && isStoryblokFile(node.filename)) {
        const file = entry(node.filename);
        file.asImage = true;
        file.alt ||= altText(node.alt);
        file.title ||= node.title?.trim() ?? "";
        file.storyblokId ??= node.id ?? null;
      }
      if (node.fieldtype === "multilink" && isStoryblokFile(node.url)) entry(node.url).asLink = true;
      if (node.type === "link" && isStoryblokFile(node.attrs?.href)) entry(node.attrs.href).asLink = true;
    });
  }
  return files;
}

/**
 * Sanity hotspot from a Storyblok focal point (`x1xy1:x2xy2`, in pixels of
 * the original image), or null when there is none.
 */
export function hotspotFromFocus(focus, size) {
  const match = /^(\d+)x(\d+):(\d+)x(\d+)$/.exec(focus ?? "");
  if (!match || !size?.width || !size?.height) return null;
  const [x1, y1, x2, y2] = match.slice(1).map(Number);
  const round = (value) => Math.round(Math.min(Math.max(value, 0), 1) * 10000) / 10000;
  return {
    _type: "sanity.imageHotspot",
    x: round((x1 + x2) / 2 / size.width),
    y: round((y1 + y2) / 2 / size.height),
    width: round(Math.max((x2 - x1) / size.width, 0.01)),
    height: round(Math.max((y2 - y1) / size.height, 0.01)),
  };
}

/**
 * The Sanity image an asset field becomes, with its alt text and focal
 * point, or null when the field holds no file. `context.fileRef(url,
 * "image")` gives the matched asset ID; `context.missingAlt(url)` records an
 * image without alt text.
 */
/**
 * An asset's alt text, or "" when it has none. Some old cards store the word
 * "null" as their alt text (spec decision 21); that is no alt text.
 */
export function altText(value) {
  const alt = typeof value === "string" ? value.trim() : "";
  return alt.toLowerCase() === "null" ? "" : alt;
}

export function imageFromAsset(asset, context) {
  if (!asset || !isStoryblokFile(asset.filename)) return null;
  const image = {
    _type: "image",
    asset: { _type: "reference", _ref: context.fileRef(asset.filename, "image") },
  };
  const alt = altText(asset.alt);
  if (alt) image.alt = alt;
  else context.missingAlt?.(asset.filename);
  const hotspot = hotspotFromFocus(asset.focus, imageSize(asset.filename));
  if (hotspot) {
    image.crop = { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 };
    image.hotspot = hotspot;
  }
  return image;
}
