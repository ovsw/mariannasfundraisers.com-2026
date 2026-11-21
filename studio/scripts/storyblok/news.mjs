// News (spec decisions 5, 9, 12, 20 and 21; ticket #17): the clean slugs of
// the five malformed news addresses and their redirects, the four authors and
// the news list and Latest news headings from the seed file. Pure: files go
// through `fileRef`, like the rest of the transform.

import { isRouteSlug } from "../../../shared/content-routes.ts";
import { keyFrom, logoUrl } from "./site-shell.mjs";

/**
 * A news slug as one the Starter's slug rule accepts: lowercase words joined
 * by single hyphens. The old slugs that end in a hyphen lose it; the one with
 * a colon loses the colon (`winner:-2024-…` becomes `winner-2024-…`).
 */
export function cleanPostSlug(slug) {
  const clean = String(slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!isRouteSlug(clean)) throw new Error(`No clean news slug for ${JSON.stringify(slug)}`);
  return clean;
}

/** The ID of the author document for an old author key (`amy`). */
export function authorDocumentId(key) {
  return `author-${key}`;
}

/** The old author photos, as files in the old repository at the seed's commit. */
export function authorFiles(seed) {
  return (seed.authors?.items ?? []).map((author) => ({
    url: logoUrl(seed, author.oldPhoto),
    asImage: true,
    asLink: false,
    // The alt text is the author's name (spec decision 21): the old code gave
    // every author photo the same name.
    alt: author.name,
    title: author.name,
    storyblokId: null,
  }));
}

/** The four authors of the old code, with their photos (spec decision 9). */
export function authorDocuments(seed, { fileRef }) {
  return (seed.authors?.items ?? []).map((author) => ({
    _id: authorDocumentId(author.key),
    _type: "author",
    name: author.name,
    slug: { _type: "slug", current: keyFrom(author.name) },
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: fileRef(logoUrl(seed, author.oldPhoto), "image") },
      alt: author.name,
    },
  }));
}

/** The news list's heading and SEO fields, from the old `pages/news.js`. */
export function blogIndexDocument(seed) {
  const list = seed.news.newsList;
  const meta = { noindex: false };
  if (list.seoTitle && list.seoTitle !== list.title) meta.title = list.seoTitle;
  if (list.seoDescription) meta.description = list.seoDescription;
  return { _id: "blogIndex", _type: "blogIndex", eyebrow: list.eyebrow, title: list.title, meta };
}

/** The Latest news section the old home page drew from code, last on the page. */
export function latestNewsSection(seed) {
  const latest = seed.news.latestNews;
  return { _key: "latest-news", _type: "latestNews", theme: "light", eyebrow: latest.eyebrow, title: latest.title };
}

/** A permanent redirect from an old news address to its post's clean one. */
export function postRedirect(oldPath, postId) {
  return {
    _id: `redirect-${postId}`,
    _type: "redirect",
    status: "active",
    source: { _type: "slug", current: oldPath },
    destinationReference: { _type: "reference", _ref: postId },
    permanent: "true",
  };
}

/** "2025-10-31 00:00" (Storyblok's date field, in UTC) as an ISO datetime. */
export function publishedAtFrom(value) {
  const match = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/.exec(String(value ?? "").trim());
  if (!match) return null;
  const iso = `${match[1]}T${match[2] ?? "00:00"}:00.000Z`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}
