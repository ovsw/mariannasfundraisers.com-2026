#!/usr/bin/env node
// Full-page screenshots of every old-site URL at 1440 px and 390 px, in
// headless Chrome, with the consent banner closed. Build input only: no check
// compares against them.
//
//   node scripts/migration/capture-screenshots.mjs [--only <path>]...
//
// Reads the URL list from docs/migration/url-inventory.json and writes
// docs/migration/screenshots/<path stem>--<width>.webp.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { importFromFrontend, migrationDir, OLD_ORIGIN, pathToFileStem } from "./lib.mjs";

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
/** The WebP format stores at most 16383 px per side. */
const WEBP_MAX = 16383;
const QUALITY = 60;

const only = [];
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--only" && args[i + 1]) only.push(args[++i]);
  else throw new Error(`Unexpected argument: ${args[i]}`);
}

const inventory = JSON.parse(readFileSync(path.join(migrationDir, "url-inventory.json"), "utf8"));
const paths = inventory.urls.map((entry) => entry.path).filter((p) => !only.length || only.includes(p));
const outDir = path.join(migrationDir, "screenshots");
mkdirSync(outDir, { recursive: true });

const playwright = await importFromFrontend("playwright", "@playwright/test");
const sharp = await importFromFrontend("sharp", "next");
const browser = await playwright.chromium.launch({ channel: "chrome", headless: true });

async function closeConsentBanner(page) {
  const banner = page.locator("#iubenda-cs-banner");
  try {
    await banner.waitFor({ state: "visible", timeout: 8000 });
  } catch {
    return false;
  }
  const close = page.locator("#iubenda-cs-banner .iubenda-cs-close-btn, #iubenda-cs-banner .iubenda-cs-reject-btn").first();
  await close.click();
  await banner.waitFor({ state: "hidden", timeout: 8000 });
  return true;
}

async function scrollThrough(page) {
  // Lazy images load only near the viewport, so walk the page once.
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].filter((img) => !img.complete).map((img) => new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 5000);
      })),
    );
  });
}

const results = [];
try {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    let bannerSeen = false;
    for (const pathname of paths) {
      const page = await context.newPage();
      await page.goto(`${OLD_ORIGIN}${pathname}`, { waitUntil: "load", timeout: 60000 });
      // iubenda remembers the closed banner in this context, so it shows once.
      if (!bannerSeen) bannerSeen = await closeConsentBanner(page);
      await scrollThrough(page);
      // A full-page capture draws the fixed header part-way down the page;
      // pin it to the top of the document, where a visitor sees it on load.
      await page.addStyleTag({ content: "body > div header.fixed, header.fixed { position: absolute !important; top: 0 !important; }" });
      await page.waitForTimeout(500);
      const png = await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
      let image = sharp(png);
      const { height } = await image.metadata();
      let scaled = false;
      if (height > WEBP_MAX) {
        image = image.resize({ height: WEBP_MAX });
        scaled = true;
      }
      const file = `${pathToFileStem(pathname)}--${viewport.width}.webp`;
      writeFileSync(path.join(outDir, file), await image.webp({ quality: QUALITY, effort: 6 }).toBuffer());
      results.push({ pathname, width: viewport.width, height, scaled });
      console.log(`${file} ${height}px${scaled ? " (scaled to fit WebP)" : ""}`);
      await page.close();
    }
    // iubenda shows the banner by visitor region; from some regions it never shows.
    if (!bannerSeen) console.log(`No consent banner was shown at ${viewport.width} px.`);
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify({ shots: results.length, scaled: results.filter((r) => r.scaled).length }));
