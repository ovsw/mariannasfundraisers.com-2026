#!/usr/bin/env node
// URL and SEO inventory of the old site: the input of the parity script.
//
//   node scripts/migration/capture-url-inventory.mjs --export <unzipped Storyblok export folder>
//
// Fetches every URL of the live sitemap plus the two pages it leaves out, and
// every redirect of the old Next config, without following redirects. Writes
// docs/migration/url-inventory.json and docs/migration/url-inventory.md.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  EXTRA_PATHS,
  malformedSlugReason,
  migrationDir,
  normalizePath,
  OLD_ORIGIN,
  OLD_REDIRECTS,
  parseHead,
  SITEMAP_URL,
  sitemapPaths,
} from "./lib.mjs";

const KIND_BY_COMPONENT = { page: "page", "blog-post": "news post", "menu-item-page": "product" };
const args = process.argv.slice(2);
const exportIndex = args.indexOf("--export");
if (exportIndex === -1 || !args[exportIndex + 1]) {
  throw new Error("Usage: node scripts/migration/capture-url-inventory.mjs --export <unzipped Storyblok export folder>");
}
const exportDir = path.resolve(args[exportIndex + 1]);
const stories = JSON.parse(readFileSync(path.join(exportDir, "stories-draft.json"), "utf8"));
// `/news` is drawn by the old code (pages/news.js), not by a story.
const kindByPath = new Map([
  ["/news", "news list"],
  ...stories.map((story) => [story.full_slug === "home" ? "/" : normalizePath(`/${story.full_slug}`), KIND_BY_COMPONENT[story.content.component]]),
]);

async function fetchManual(url) {
  const response = await fetch(url, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (reference capture)" } });
  const body = response.status === 200 ? await response.text() : "";
  return { status: response.status, location: response.headers.get("location"), body };
}

// fetch() does not throw on an HTTP error, so stop before an error page or an
// empty sitemap can replace the inventory with a short URL list.
const sitemapResponse = await fetch(SITEMAP_URL);
if (!sitemapResponse.ok) throw new Error(`${SITEMAP_URL} answered ${sitemapResponse.status}; the inventory was left as it was.`);
const inSitemap = sitemapPaths(await sitemapResponse.text());
if (!inSitemap.length) throw new Error(`${SITEMAP_URL} lists no URLs; the inventory was left as it was.`);
const allPaths = [...inSitemap, ...EXTRA_PATHS.filter((p) => !inSitemap.includes(p))];

const urls = [];
for (const pathname of allPaths) {
  const { status, location, body } = await fetchManual(`${OLD_ORIGIN}${pathname}`);
  const head = status === 200 ? parseHead(body) : null;
  const reason = malformedSlugReason(pathname);
  urls.push({
    path: pathname,
    kind: kindByPath.get(pathname) ?? null,
    inSitemap: inSitemap.includes(pathname),
    status,
    location,
    ...(head ?? {}),
    malformedSlug: reason ? { reason } : null,
  });
  console.log(`${status} ${pathname}`);
}

const redirects = [];
for (const redirect of OLD_REDIRECTS) {
  const { status, location } = await fetchManual(`${OLD_ORIGIN}${redirect.source}`);
  redirects.push({ ...redirect, observed: { status, location } });
  console.log(`${status} ${redirect.source} -> ${location}`);
}

const missingKind = urls.filter((u) => !u.kind).map((u) => u.path);
if (missingKind.length) throw new Error(`No Storyblok story for: ${missingKind.join(", ")}`);

const inventory = {
  capturedAt: new Date().toISOString(),
  origin: OLD_ORIGIN,
  sources: {
    sitemap: SITEMAP_URL,
    extraPaths: EXTRA_PATHS,
    redirects: "next.config.js of https://github.com/ovsw/mfr-web-next2",
    kinds: "Storyblok export 2026-11-20, stories-draft.json (content.component)",
  },
  summary: {
    urls: urls.length,
    inSitemap: urls.filter((u) => u.inSitemap).length,
    byKind: Object.fromEntries([...Object.values(KIND_BY_COMPONENT), "news list"].map((k) => [k, urls.filter((u) => u.kind === k).length])),
    noindex: urls.filter((u) => u.noindex).length,
    redirects: redirects.length,
    malformedSlugs: urls.filter((u) => u.malformedSlug).length,
  },
  urls,
  redirects,
};
writeFileSync(path.join(migrationDir, "url-inventory.json"), `${JSON.stringify(inventory, null, 2)}\n`);

const cell = (value) => (value === null || value === undefined || value === "" ? "–" : String(value).replace(/\|/g, "\\|").replace(/\s+/g, " "));
const yes = (value) => (value ? "yes" : "no");
const sharingSummary = (sharing) => {
  if (!sharing) return "–";
  const present = SHARING_TAGS.filter((tag) => sharing[tag]);
  return present.length ? present.join(", ") : "none";
};
const lines = [
  "# Old site URL and SEO inventory",
  "",
  `Captured ${inventory.capturedAt.slice(0, 10)} from ${OLD_ORIGIN} by \`node scripts/migration/capture-url-inventory.mjs\`.`,
  "The machine-readable version is [`url-inventory.json`](url-inventory.json), the input of the parity script.",
  "",
  `${inventory.summary.urls} URLs (${inventory.summary.inSitemap} in the sitemap), ${inventory.summary.byKind.page} pages, ${inventory.summary.byKind["news post"]} news posts, ${inventory.summary.byKind.product} products, ${inventory.summary.byKind["news list"]} news list, ${inventory.summary.noindex} noindex, ${inventory.summary.redirects} redirects, ${inventory.summary.malformedSlugs} malformed news slugs.`,
  "",
  "## URLs",
  "",
  "| Path | Kind | Status | Sitemap | Noindex | Title | Description | Canonical | Sharing tags | Malformed slug |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...urls.map((u) =>
    `| \`${u.path}\` | ${u.kind} | ${u.status} | ${yes(u.inSitemap)} | ${yes(u.noindex)} | ${cell(u.title)} | ${cell(u.description)} | ${cell(u.canonical?.replace(OLD_ORIGIN, ""))} | ${sharingSummary(u.sharing)} | ${u.malformedSlug ? u.malformedSlug.reason : "–"} |`,
  ),
  "",
  "## Redirects",
  "",
  "From the old site's `next.config.js`. Observed is the live response to the source path.",
  "",
  "| Source | Destination | Permanent | Observed |",
  "| --- | --- | --- | --- |",
  ...redirects.map((r) => `| \`${r.source}\` | ${r.destination} | ${yes(r.permanent)} | ${r.observed.status} ${cell(r.observed.location)} |`),
  "",
];
writeFileSync(path.join(migrationDir, "url-inventory.md"), lines.join("\n"));
console.log(JSON.stringify(inventory.summary));
