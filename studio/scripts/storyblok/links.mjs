// Storyblok links to the Starter's `customUrl` (spec decision 14). A story
// link becomes a reference to the document imported from that story, with its
// anchor; email, phone, file and external links keep their kind. Links to the
// old site's own address become site links.

import { isStoryblokFile } from "./files.mjs";

const OLD_HOSTS = new Set(["mariannasfundraisers.com", "www.mariannasfundraisers.com"]);

/** `/a/b/` and `a/b` both become `/a/b`; the home page is `/`. */
export function normalizeSitePath(value) {
  const trimmed = `/${String(value ?? "").replace(/^\/+/, "")}`.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** A multilink field (buttons, cards) as one link shape, or null when empty. */
export function normalizeMultilink(link) {
  if (!link || typeof link !== "object") return null;
  const openInNewTab = link.target === "_blank";
  if (link.linktype === "story") {
    if (!link.id && !link.cached_url) return null;
    return { linktype: "story", uuid: link.id || null, href: link.cached_url ?? "", anchor: link.anchor || null, openInNewTab };
  }
  const href = (link.url || link.cached_url || "").trim();
  if (!href) return null;
  return { linktype: link.linktype === "email" ? "email" : "url", uuid: null, href, anchor: null, openInNewTab };
}

/** A rich text link mark's attributes as the same link shape. */
export function normalizeRichTextLink(attrs) {
  if (!attrs) return null;
  return {
    linktype: attrs.linktype ?? "url",
    uuid: attrs.uuid || null,
    href: (attrs.href ?? "").trim(),
    anchor: attrs.anchor || null,
    openInNewTab: attrs.target === "_blank",
  };
}

function internal(target, anchor, openInNewTab) {
  const url = { _type: "customUrl", type: "internal", internal: target.ref, openInNewTab };
  if (anchor) url.anchor = anchor;
  return url;
}

function external(href, openInNewTab) {
  return { _type: "customUrl", type: "external", external: href, openInNewTab };
}

/**
 * A link on a site path: the document that owns the path, or the path itself
 * (a static file such as `/downloads/...`, or a path a redirect handles).
 */
function sitePathLink(rawPath, anchor, openInNewTab, context) {
  const target = context.site.byPath(normalizeSitePath(rawPath));
  if (target?.ref) return internal(target, anchor, openInNewTab);
  const path = target?.path ?? normalizeSitePath(rawPath);
  return external(anchor ? `${path}#${anchor}` : path, openInNewTab);
}

function findOverride(link, context) {
  const from = normalizeSitePath(link.href);
  return context.overrides?.find(
    (override) => override.story === context.story && normalizeSitePath(override.from) === from,
  );
}

/**
 * The `customUrl` a link becomes, or null when it goes nowhere. `context`:
 * `story` (the full slug of the story that holds the link), `site` (`byUuid`
 * and `byPath`, each giving `{ ref }` for an imported document or `{ path }`
 * for a site path, or null), `fileRef(url, "file")`, `overrides` (the link
 * overrides), and `note(kind, detail)` for the report.
 */
export function customUrlFor(link, context) {
  if (!link) return null;
  const override = findOverride(link, context);
  if (override) {
    context.note("override", { from: override.from, to: override.to });
    const to = override.to;
    if (to.url) return external(to.url, link.openInNewTab);
    return sitePathLink(to.story, to.anchor ?? null, link.openInNewTab, context);
  }

  if (link.linktype === "story") {
    const target = (link.uuid && context.site.byUuid(link.uuid)) || null;
    if (!target) {
      if (!link.href) {
        context.note("needs a hand", `a story link to an unknown story (${link.uuid})`);
        return null;
      }
      return sitePathLink(link.href, link.anchor, link.openInNewTab, context);
    }
    if (link.href && normalizeSitePath(link.href) !== target.path) {
      context.note("moved story", { stored: normalizeSitePath(link.href), now: target.path });
    }
    if (target.ref) return internal(target, link.anchor, link.openInNewTab);
    return external(link.anchor ? `${target.path}#${link.anchor}` : target.path, link.openInNewTab);
  }

  const href = link.href;
  if (link.linktype === "email" || /^mailto:/i.test(href)) {
    return external(/^mailto:/i.test(href) ? href : `mailto:${href}`, link.openInNewTab);
  }
  if (/^tel:/i.test(href)) return external(href, link.openInNewTab);
  if (isStoryblokFile(href)) {
    return {
      _type: "customUrl",
      type: "file",
      file: { _type: "file", asset: { _type: "reference", _ref: context.fileRef(href, "file") } },
      openInNewTab: link.openInNewTab,
    };
  }
  if (href.startsWith("/")) {
    const [path, anchor] = href.split("#");
    return sitePathLink(path, anchor || null, link.openInNewTab, context);
  }
  if (href === "#" || href.startsWith("#")) {
    context.note("dropped", `a link to "${href}", which goes nowhere`);
    return null;
  }
  let url;
  try {
    url = new URL(href);
  } catch {
    context.note("needs a hand", `a link to "${href}", which is not a valid URL`);
    return null;
  }
  if (OLD_HOSTS.has(url.hostname)) {
    return sitePathLink(url.pathname, url.hash.slice(1) || null, link.openInNewTab, context);
  }
  return external(href, link.openInNewTab);
}
