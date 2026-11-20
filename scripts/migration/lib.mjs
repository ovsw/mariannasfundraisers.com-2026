// Shared helpers for the old-site reference capture scripts (issue #10).
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const migrationDir = path.join(root, "docs", "migration");
export const OLD_ORIGIN = "https://www.mariannasfundraisers.com";
export const SITEMAP_URL = `${OLD_ORIGIN}/sitemap-0.xml`;

/** Pages the old sitemap leaves out but the old site serves (spec decision 4). */
export const EXTRA_PATHS = ["/accessibility-statement", "/accessibility-policy"];

/** The redirects of the old site's `next.config.js`, in their order there. */
export const OLD_REDIRECTS = [
  { source: "/terms-and-conditions", destination: "https://www.iubenda.com/terms-and-conditions/52141374", permanent: true },
  { source: "/cookie-policy", destination: "https://www.iubenda.com/privacy-policy/52141374/cookie-policy", permanent: true },
  { source: "/privacy-policy", destination: "https://www.iubenda.com/privacy-policy/52141374", permanent: true },
  { source: "/about-us/our-history", destination: "/our-story-and-promise", permanent: true },
  { source: "/about-us/our-promise", destination: "/our-story-and-promise", permanent: true },
  { source: "/about-us/our-team", destination: "/hoagie-heroes", permanent: true },
  { source: "/testimonials", destination: "/success-stories", permanent: true },
  { source: "/about-us/join-our-team", destination: "/jobs", permanent: true },
  { source: "/about-us/in-the-news", destination: "/news", permanent: true },
  { source: "/about-us/contact-us", destination: "/contact-us", permanent: true },
  { source: "/selling-tools", destination: "/fundraiser-resources", permanent: true },
];

/** Paths from the sitemap XML, without the origin and without a trailing slash. */
export function sitemapPaths(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => normalizePath(new URL(match[1].trim()).pathname));
}

export function normalizePath(pathname) {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/**
 * Why a news slug is malformed, or null. The Starter's slug rule allows
 * lowercase letters, digits and single hyphens between them.
 */
export function malformedSlugReason(pathname) {
  if (!pathname.startsWith("/news/")) return null;
  const slug = pathname.slice("/news/".length);
  if (slug.includes(":")) return "contains a colon";
  if (slug.endsWith("-")) return "ends in a hyphen";
  return null;
}

/** File-name stem for a path: `/` is `home`, `/` separators become `__`. */
export function pathToFileStem(pathname) {
  if (pathname === "/") return "home";
  return pathname
    .replace(/^\//, "")
    .split("/")
    .map((part) => part.replace(/[^a-z0-9-]/gi, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`))
    .join("__");
}

/** Loads a module installed in the frontend workspace (Playwright, sharp). */
export async function importFromFrontend(specifier, via) {
  const frontendRequire = createRequire(path.join(root, "frontend", "package.json"));
  const viaRequire = via ? createRequire(frontendRequire.resolve(`${via}/package.json`)) : frontendRequire;
  const mod = await import(pathToFileURL(viaRequire.resolve(specifier)).href);
  return mod.default ?? mod;
}
