/**
 * Verify every known published route against a running production server.
 *
 * From the repository root:
 *   pnpm --dir frontend build
 *   pnpm --dir frontend start
 *   node frontend/scripts/verify-no-skeleton.mjs
 *
 * Set VERIFY_BASE_URL when the server is not at http://127.0.0.1:3000.
 */

import { createClient } from "@sanity/client";
import { fileURLToPath } from "node:url";

import { findUnrenderedSections } from "./unrendered-sections.mjs";

const POSTS_PER_PAGE = 12;

// process.loadEnvFile requires Node 20.12+ / 21.7+; fail with a clear message
// instead of a TypeError on older runtimes.
if (typeof process.loadEnvFile !== "function") {
  throw new Error("This script requires Node.js 20.12 or newer.");
}
// Load env before reading VERIFY_BASE_URL so a value in .env.local is honored.
process.loadEnvFile(fileURLToPath(new URL("../.env.local", import.meta.url)));
const baseUrl = new URL(process.env.VERIFY_BASE_URL || "http://127.0.0.1:3000");

// The check only reads published content, from the dataset the tested
// server uses.
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
if (!dataset) throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET.");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID.");

const client = createClient({
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-31",
  dataset,
  perspective: "published",
  projectId,
  stega: false,
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

// These mirror the complete published queries used by generateStaticParams.
const SECTIONS_PROJECTION = `"sections": coalesce(blocks[]{_key, _type}, [])`;
const PAGES_SLUGS_QUERY = `*[_type == "page" && defined(slug)]{slug, ${SECTIONS_PROJECTION}}`;
const HOME_SECTIONS_QUERY = `*[_id == "homePage" && _type == "homePage"][0]{${SECTIONS_PROJECTION}}`;
const BLOG_SECTIONS_QUERY = `*[_id == "blogIndex"][0]{${SECTIONS_PROJECTION}}`;
const POSTS_SLUGS_QUERY = `*[_type == "post" && defined(slug)]{slug}`;
const PUBLISHED_POST_FILTER =
  `_type == "post" && defined(slug.current) && defined(publishedAt)`;
const ELIGIBLE_BLOG_POSTS_COUNT_QUERY = `count(*[${PUBLISHED_POST_FILTER}])`;
const CATEGORY_STATIC_PARAMS_QUERY = `
  *[
    _type == "category"
    && defined(slug.current)
  ]{
    "slug": slug.current,
    "publishedPostCount": count(*[${PUBLISHED_POST_FILTER} && category._ref == ^._id])
  }
`;

const forbiddenMarkers = [
  // A Scaffold is a Building-phase placeholder; see components/blocks/scaffold.tsx.
  ["page builder scaffold", /<section\b[^>]*\sdata-scaffold(?:=|\s|>)/i],
  ["aria-busy loader", /\saria-busy(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?(?:\s|>)/i],
  ["page loader label", /Page content loading/i],
  ["blog loader label", /Blog content loading/i],
  ["category loader label", /Category content loading/i],
  ["footer loader label", /Site footer loading/i],
  ["page eyebrow skeleton", /h-4 w-28 animate-pulse/],
  ["blog eyebrow skeleton", /h-4 w-24 animate-pulse/],
  ["category eyebrow skeleton", /h-4 w-36 animate-pulse/],
  ["page card skeleton", /h-36 animate-pulse/],
  ["blog card skeleton", /h-64 animate-pulse/],
  ["footer column skeleton", /h-40 animate-pulse/],
];

function normalizeSlug(value) {
  if (typeof value !== "string") return undefined;
  const slug = value.replace(/^\/+|\/+$/g, "");
  return slug || undefined;
}

function routeFromSlug(slug) {
  return `/${slug.split("/").map(encodeURIComponent).join("/")}`;
}

function categoryHasValidSlug(category) {
  return (
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.slug) &&
    !/^\d+$/.test(category.slug)
  );
}

function totalPages(itemCount) {
  return Math.ceil(itemCount / POSTS_PER_PAGE);
}

function findForbiddenMarkers(body) {
  return forbiddenMarkers
    .filter(([, pattern]) => pattern.test(body))
    .map(([label]) => label);
}

const [pages, home, blogIndex, posts, eligiblePostCount, rawCategories] = await Promise.all([
  client.fetch(PAGES_SLUGS_QUERY),
  client.fetch(HOME_SECTIONS_QUERY),
  client.fetch(BLOG_SECTIONS_QUERY),
  client.fetch(POSTS_SLUGS_QUERY),
  client.fetch(ELIGIBLE_BLOG_POSTS_COUNT_QUERY),
  client.fetch(CATEGORY_STATIC_PARAMS_QUERY),
]);

const pageSlugs = new Set(
  pages.flatMap(({ slug }) => {
    const normalized = normalizeSlug(slug?.current);
    return normalized ? [normalized] : [];
  }),
);
const postSlugs = new Set(
  posts.flatMap(({ slug }) => {
    const normalized = normalizeSlug(slug?.current);
    return normalized ? [normalized] : [];
  }),
);
const categories = rawCategories.filter(categoryHasValidSlug);
const knownRoutes = new Map([["/", "home"]]);

// The Page Builder sections each route must draw, by route.
const routeSections = new Map([
  ["/", home?.sections ?? []],
  ["/blog", blogIndex?.sections ?? []],
]);
for (const { slug, sections } of pages) {
  const normalized = normalizeSlug(slug?.current);
  if (!normalized) continue;
  // The home and blog routes keep their own sections even if a page was
  // given a slug that collides with them.
  const route = routeFromSlug(normalized);
  if (!routeSections.has(route)) routeSections.set(route, sections);
}

for (const slug of pageSlugs) knownRoutes.set(routeFromSlug(slug), "page");
for (const slug of postSlugs) knownRoutes.set(`/blog${routeFromSlug(slug)}`, "post");
knownRoutes.set("/blog", "blog");

const regularPostCount = Math.max(Number(eligiblePostCount) - 1, 0);
const blogTotalPages = totalPages(regularPostCount);
for (let page = 2; page <= blogTotalPages; page += 1) {
  knownRoutes.set(`/blog/${page}`, "blog pagination");
}

for (const category of categories) {
  const categoryPath = `/blog/category/${encodeURIComponent(category.slug)}`;
  knownRoutes.set(categoryPath, "category");
  const categoryTotalPages = totalPages(category.publishedPostCount);
  for (let page = 2; page <= categoryTotalPages; page += 1) {
    knownRoutes.set(`${categoryPath}/${page}`, "category pagination");
  }
}

const unique = crypto.randomUUID();
let unknownSlug = `verify-no-skeleton-${unique}`;
while (
  pageSlugs.has(unknownSlug) ||
  postSlugs.has(unknownSlug) ||
  categories.some(({ slug }) => slug === unknownSlug)
) {
  unknownSlug = `verify-no-skeleton-${crypto.randomUUID()}`;
}

const unknownRoutes = new Map([
  [`/${unknownSlug}`, "unknown content"],
  [`/blog/${Math.max(blogTotalPages + 1, 2)}`, "unknown blog pagination"],
  [`/blog/category/${unknownSlug}`, "unknown category"],
]);

const largestCategory = categories.reduce(
  (largest, category) =>
    category.publishedPostCount > (largest?.publishedPostCount ?? -1) ? category : largest,
  undefined,
);
if (largestCategory) {
  unknownRoutes.set(
    `/blog/category/${encodeURIComponent(largestCategory.slug)}/${Math.max(totalPages(largestCategory.publishedPostCount) + 1, 2)}`,
    "unknown category pagination",
  );
} else {
  unknownRoutes.set(`/blog/category/${unknownSlug}/2`, "unknown category pagination");
}

const failures = [];
const familyCounts = new Map();
let followedRedirectCount = 0;

async function verifyRoute(path, family, expectedStatus) {
  familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
  let response;
  let body;
  try {
    response = await fetch(new URL(path, baseUrl), {
      headers: { accept: "text/html" },
      method: "GET",
      redirect: "follow",
    });
    body = await response.text();
  } catch (error) {
    failures.push(`${path} (${family}): GET failed: ${error.message}`);
    return;
  }

  const problems = [];
  if (response.redirected) {
    followedRedirectCount += 1;
    if (new URL(response.url).origin !== baseUrl.origin) {
      problems.push(`redirect left the tested server for ${response.url}`);
    }
  }
  if (response.status !== expectedStatus) {
    problems.push(`expected ${expectedStatus}, received ${response.status}`);
  }

  const foundForbiddenMarkers = findForbiddenMarkers(body);
  if (foundForbiddenMarkers.length) {
    problems.push(`found ${foundForbiddenMarkers.join(", ")}`);
  }

  if (expectedStatus === 200) {
    // A redirected route shows another page, with that page's sections.
    // Only the home, blog and page handlers draw Page Builder sections. A
    // page whose slug collides with a post or category route is not served
    // there, so its sections are not expected.
    const drawsSections = ["home", "blog", "page"].includes(family);
    const unrendered =
      response.redirected || !drawsSections
        ? []
        : findUnrenderedSections(body, routeSections.get(path) ?? []);
    if (unrendered.length) {
      problems.push(`sections not shown: ${unrendered.join(", ")}`);
    }
    // The real header and footer mark themselves "ready"; their fallbacks
    // (components/header/index.tsx, components/footer/index.tsx) say
    // "unavailable".
    if (!/<header\b[^>]*\bdata-header-state="ready"/i.test(body)) {
      problems.push("missing ready site header");
    }
    if (!/aria-label="Main navigation"/i.test(body)) {
      problems.push("missing real main navigation");
    }
    if (!/<footer\b[^>]*\bdata-footer-state="ready"/i.test(body)) {
      problems.push("missing ready site footer");
    }
  }

  if (problems.length) failures.push(`${path} (${family}): ${problems.join("; ")}`);
}

for (const [path, family] of knownRoutes) await verifyRoute(path, family, 200);
for (const [path, family] of unknownRoutes) await verifyRoute(path, family, 404);

if (failures.length) {
  console.error(`FAIL: ${failures.length} route verification problem(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${knownRoutes.size} known routes returned 200 with real header/footer HTML, no Scaffold sections, no section that draws nothing, and no route/layout fallback markers.`);
  console.log(`PASS: ${unknownRoutes.size} unknown routes returned 404 with no route/layout fallback markers.`);
  console.log(
    `Route inventory: ${[...familyCounts].map(([family, count]) => `${family}=${count}`).join(", ")}.`,
  );
  console.log(`Redirected known routes followed to real HTML: ${followedRedirectCount}.`);
}
