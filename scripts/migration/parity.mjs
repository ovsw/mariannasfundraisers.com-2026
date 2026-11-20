#!/usr/bin/env node
// URL and SEO parity of the new site with the old one (spec testing seam 2,
// ticket #20).
//
//   node scripts/migration/parity.mjs <new origin>
//
// Reads docs/migration/url-inventory.json (the reference capture of the old
// site) and asks the new origin for every URL, every old redirect and the
// sitemap, without following redirects. Compares status, redirect target,
// title, description, noindex and sitemap membership by value, and sharing
// images by presence only. The differences that are on purpose are listed
// apart, with the reason; every other difference is printed and fails the run.
// Writes docs/migration/parity-report.md and .json.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanPostSlug } from "../../studio/scripts/storyblok/news.mjs";
import { malformedSlugReason, migrationDir, normalizePath, parseHead, sitemapPaths } from "./lib.mjs";

export const SITE_SUFFIX = " | Marianna's Fundraisers";
const PERMANENT = [301, 308];

/** Why a difference is on purpose. */
export const ON_PURPOSE = {
  cleanNewsAddress: "malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5)",
  noTitle: "the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19)",
  sharingAlt: "the new site gives every sharing image an alt text (spec decision 21)",
  sharingCard: "a page without a sharing image falls back to the generated card (spec decision 19)",
  noindexSitemap: "the sitemap leaves out noindex pages (spec decision 19)",
};

/** The path a page of the old site has on the new site: a malformed news address gets its clean one. */
export function newPath(oldPath) {
  if (!malformedSlugReason(oldPath)) return oldPath;
  return `/news/${cleanPostSlug(oldPath.slice("/news/".length))}`;
}

const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const isPermanent = (status) => PERMANENT.includes(status);

/**
 * Compares the old-site inventory with what the new site answered. `observed`:
 * `{ pages: { [path]: { status, location, title, description, noindex,
 * sharing } }, sitemap: [path], redirects: { [source]: { status, location } } }`,
 * with each `location` a path on the new site or an outside URL. Returns the
 * differences and the differences that are on purpose, each
 * `{ path, field, old, new }`, the latter with `why`.
 */
export function compareInventory(inventory, observed) {
  const differences = [];
  const onPurpose = [];
  const differ = (entry) => differences.push(entry);
  const intended = (entry, why) => onPurpose.push({ ...entry, why });
  const sitemap = new Set(observed.sitemap);
  const expectedInSitemap = new Set();

  for (const url of inventory.urls) {
    const target = newPath(url.path);
    if (target !== url.path) {
      const moved = observed.pages[url.path];
      const entry = { path: url.path, field: "redirect", old: `${url.status}`, new: moved ? `${moved.status} ${moved.location ?? ""}`.trim() : "not fetched" };
      if (moved && isPermanent(moved.status) && moved.location === target) intended(entry, ON_PURPOSE.cleanNewsAddress);
      else differ({ ...entry, old: `permanent redirect to ${target}` });
    }

    const page = observed.pages[target];
    if (!page) {
      differ({ path: target, field: "status", old: url.status, new: "not fetched" });
      continue;
    }
    if (page.status !== url.status) differ({ path: target, field: "status", old: url.status, new: page.status });

    if (page.status === 200) {
      const oldTitle = text(url.title);
      const title = text(page.title);
      if (title !== oldTitle) {
        const entry = { path: target, field: "title", old: url.title, new: page.title };
        const named = title.endsWith(SITE_SUFFIX) && title.length > SITE_SUFFIX.length;
        if (/^NOTITLE\b/.test(oldTitle) && named) intended(entry, ON_PURPOSE.noTitle);
        else differ(entry);
      }
      if (text(page.description) !== text(url.description)) {
        differ({ path: target, field: "description", old: url.description, new: page.description });
      }
      if (Boolean(page.noindex) !== Boolean(url.noindex)) {
        differ({ path: target, field: "noindex", old: Boolean(url.noindex), new: Boolean(page.noindex) });
      }
      for (const [tag, why] of [["og:image", ON_PURPOSE.sharingCard], ["og:image:alt", ON_PURPOSE.sharingAlt]]) {
        const had = Boolean(url.sharing?.[tag]);
        const has = Boolean(page.sharing?.[tag]);
        if (had === has) continue;
        const entry = { path: target, field: tag, old: had ? "present" : "absent", new: has ? "present" : "absent" };
        if (has) intended(entry, why);
        else differ(entry);
      }
    }

    const noindex = page.status === 200 ? Boolean(page.noindex) : Boolean(url.noindex);
    const inSitemap = sitemap.has(target);
    if (url.inSitemap && !noindex) expectedInSitemap.add(target);
    if (inSitemap && noindex) differ({ path: target, field: "sitemap", old: "left out: noindex (spec decision 19)", new: true });
    else if (inSitemap !== Boolean(url.inSitemap)) {
      const entry = { path: target, field: "sitemap", old: Boolean(url.inSitemap), new: inSitemap };
      if (url.inSitemap && !inSitemap && noindex) intended(entry, ON_PURPOSE.noindexSitemap);
      else differ(entry);
    }
  }

  const known = new Set(inventory.urls.map((url) => newPath(url.path)));
  for (const location of observed.sitemap) {
    if (!known.has(location)) differ({ path: location, field: "sitemap", old: false, new: true });
  }

  for (const redirect of inventory.redirects) {
    const answer = observed.redirects[redirect.source];
    const ok = answer && isPermanent(answer.status) === Boolean(redirect.permanent) && answer.location === redirect.destination;
    if (!ok) {
      differ({
        path: redirect.source,
        field: "redirect",
        old: `${redirect.permanent ? "permanent" : "temporary"} redirect to ${redirect.destination}`,
        new: answer ? `${answer.status} ${answer.location ?? ""}`.trim() : "not fetched",
      });
    }
  }

  return { differences, onPurpose, sitemapExpected: expectedInSitemap.size, sitemapFound: observed.sitemap.length };
}

/** A `Location` header as a path on the new site, or the outside URL as it is. */
export function locationOf(location, origin) {
  if (!location) return null;
  const url = new URL(location, origin);
  if (url.origin !== new URL(origin).origin) return url.href;
  return `${normalizePath(decodeURI(url.pathname))}${url.search}`;
}

async function fetchManual(url) {
  const response = await fetch(url, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (parity check)" } });
  const body = response.status === 200 ? await response.text() : "";
  return { status: response.status, location: response.headers.get("location"), body };
}

/** Asks the new origin for every URL, old redirect and the sitemap. */
export async function observe(inventory, origin) {
  const pages = {};
  const paths = new Set(inventory.urls.flatMap((url) => [url.path, newPath(url.path)]));
  for (const pathname of paths) {
    const { status, location, body } = await fetchManual(`${origin}${encodeURI(pathname)}`);
    const head = status === 200 ? parseHead(body) : {};
    pages[pathname] = { status, location: locationOf(location, origin), ...head };
  }
  const redirects = {};
  for (const redirect of inventory.redirects) {
    const { status, location } = await fetchManual(`${origin}${redirect.source}`);
    redirects[redirect.source] = { status, location: locationOf(location, origin) };
  }
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
  if (!sitemapResponse.ok) throw new Error(`${origin}/sitemap.xml answered ${sitemapResponse.status}`);
  return { pages, redirects, sitemap: sitemapPaths(await sitemapResponse.text()) };
}

function table(rows, headers) {
  if (!rows.length) return "None.\n";
  const cell = (value) => (value === null || value === undefined || value === "" ? "–" : String(value).replaceAll("|", "\\|").replaceAll("\n", " "));
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`)].join("\n") + "\n";
}

export function reportMarkdown(result, { origin, inventory, checkedAt }) {
  const lines = [
    "# URL and SEO parity report",
    "",
    `Checked ${checkedAt} by \`node scripts/migration/parity.mjs ${origin}\` against the old-site inventory captured ${inventory.capturedAt} ([\`url-inventory.json\`](url-inventory.json)).`,
    "The machine-readable version is [`parity-report.json`](parity-report.json).",
    "",
    "Status, redirect target, title, description, noindex and sitemap membership compare by value; sharing images by presence only. A redirect compares by permanence (301 and 308 are both permanent) and target. Sitemap entries compare by path, so the host the build names does not matter.",
    "",
    `${inventory.urls.length} URLs and ${inventory.redirects.length} redirects compared. Sitemap: ${result.sitemapFound} URLs found, ${result.sitemapExpected} expected. ${result.differences.length} differences, ${result.onPurpose.length} on purpose.`,
    "",
    "## Differences",
    "",
    table(result.differences.map((d) => [`\`${d.path}\``, d.field, d.old, d.new]), ["Path", "Field", "Old", "New"]),
    "## Differences on purpose",
    "",
    table(result.onPurpose.map((d) => [`\`${d.path}\``, d.field, d.old, d.new, d.why]), ["Path", "Field", "Old", "New", "Why"]),
  ];
  return lines.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const origin = process.argv[2]?.replace(/\/+$/, "");
  if (!origin) throw new Error("Usage: node scripts/migration/parity.mjs <new origin>");
  const inventory = JSON.parse(readFileSync(path.join(migrationDir, "url-inventory.json"), "utf8"));
  const result = compareInventory(inventory, await observe(inventory, origin));
  const checkedAt = new Date().toISOString();
  writeFileSync(path.join(migrationDir, "parity-report.json"), `${JSON.stringify({ checkedAt, origin, ...result }, null, 2)}\n`);
  writeFileSync(path.join(migrationDir, "parity-report.md"), reportMarkdown(result, { origin, inventory, checkedAt }));
  for (const d of result.differences) console.log(`${d.path}  ${d.field}\n  old: ${JSON.stringify(d.old)}\n  new: ${JSON.stringify(d.new)}`);
  console.log(`\n${inventory.urls.length} URLs and ${inventory.redirects.length} redirects compared with ${origin}: ${result.differences.length} differences, ${result.onPurpose.length} on purpose.`);
  process.exitCode = result.differences.length ? 1 : 0;
}
