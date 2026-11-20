#!/usr/bin/env node
// Moves the Storyblok content into the Sanity dataset (spec decision 20,
// ticket #13). Dry run by default: prints the counts and writes the report.
// `--apply` also checks the target, backs the dataset up, uploads the files
// and writes the documents that changed. See docs/migration/import.md.
// The site shell (settings, navigation, footer) comes from the reference
// capture's seed file; the Google Analytics measurement ID from the
// MFR_GA_MEASUREMENT_ID secret (ticket #14).
//
//   pnpm storyblok:import [--export <folder>] [--apply]

import { existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getPageToolsClient } from "./lib/page-tools-client.mjs";
import { renderNavigationIconSvgs } from "./lib/navigation-icon-svg.mjs";
import { readSecret } from "./lib/read-secret.mjs";
import { reportMarkdown } from "./storyblok/report.mjs";
import { backupDataset, verifyTarget } from "./storyblok/safety.mjs";
import { navigationIconNames } from "./storyblok/site-shell.mjs";
import { planImport } from "./storyblok/transform.mjs";
import { importFiles, writeDocuments } from "./storyblok/write.mjs";

const studioDirectory = path.resolve(import.meta.dirname, "..");
const repository = path.resolve(studioDirectory, "..");
export const DEFAULT_EXPORT = path.join(homedir(), "backups", "mfr", "storyblok-export");
const BACKUP_ROOT = path.join(homedir(), "backups", "mfr", "sanity");
const OVERRIDES = path.join(studioDirectory, "scripts", "storyblok", "overrides.json");
const REPORT = path.join(repository, "docs", "migration", "import-report");
const SEED = path.join(repository, "docs", "migration", "seed", "hard-coded-content.json");
const GA_SECRET = "MFR_GA_MEASUREMENT_ID";

const USAGE = "Usage: pnpm storyblok:import [--export <folder>] [--apply]";

export function parseArguments(args) {
  const options = { apply: false, exportFolder: DEFAULT_EXPORT };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--apply") options.apply = true;
    else if (arg === "--dry-run") options.apply = false;
    else if (arg === "--export") {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error(`--export needs a folder. ${USAGE}`);
      options.exportFolder = path.resolve(value);
    } else throw new Error(`Unknown argument ${arg}. ${USAGE}`);
  }
  return options;
}

/** The export folder's draft stories and the UUIDs of the published ones. */
export function readExport(folder) {
  const draftFile = path.join(folder, "stories-draft.json");
  if (!existsSync(draftFile)) {
    throw new Error(`No Storyblok export in ${folder}: stories-draft.json is missing. Run pnpm storyblok:export, or unzip an export there.`);
  }
  const stories = JSON.parse(readFileSync(draftFile, "utf8"));
  const publishedFile = path.join(folder, "stories-published.json");
  const published = existsSync(publishedFile) ? JSON.parse(readFileSync(publishedFile, "utf8")).map((story) => story.uuid) : null;
  return { stories, published };
}

function summary(report) {
  return {
    found: report.found,
    documents: report.documents,
    sections: report.sections,
    skipped: report.skipped.length,
    dropped: report.droppedItems.length,
    imagesWithoutAlt: report.imagesWithoutAlt.length,
    needsHand: report.needsHand.length,
    overridesApplied: report.overrides.applied.length,
  };
}

async function writeReport(report, source) {
  await writeFile(`${REPORT}.json`, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(`${REPORT}.md`, reportMarkdown(report, { source }));
}

export async function main(args = process.argv.slice(2)) {
  const options = parseArguments(args);
  const source = readExport(options.exportFolder);
  const overrides = JSON.parse(readFileSync(OVERRIDES, "utf8"));
  const seed = JSON.parse(readFileSync(SEED, "utf8"));
  const svgs = await renderNavigationIconSvgs(navigationIconNames(seed));
  const shell = { seed, iconSvg: (name) => svgs.get(name), gaMeasurementId: readSecret(GA_SECRET) };
  const sourceLabel = `${source.stories.length} draft stories from the Storyblok export`;

  const plan = planImport(source, { overrides, ...shell });
  await writeReport(plan.report, sourceLabel);
  console.log(JSON.stringify({ mode: options.apply ? "apply" : "dry run", ...summary(plan.report) }, null, 2));
  console.log(`Report: ${path.relative(repository, REPORT)}.md`);
  if (!options.apply) return plan;

  const client = getPageToolsClient();
  const target = await verifyTarget(client);
  console.log(`Target: ${target.projectId}/${target.dataset}`);
  const backup = await backupDataset({ studioDirectory, root: BACKUP_ROOT, dataset: target.dataset });
  console.log(`Backup: ${backup} (gzip check passed)`);

  // Without the secret, keep the measurement ID the dataset already holds.
  shell.gaMeasurementId ||= await client.fetch(`*[_id == "settings"][0].googleAnalyticsMeasurementId`);
  const files = await importFiles(client, plan.files, { log: (entry) => console.log(JSON.stringify(entry)) });
  console.log(JSON.stringify({ files: files.stats }));
  const written = planImport(source, { overrides, fileRef: files.fileRef, ...shell });
  const result = await writeDocuments(client, written.documents);
  console.log(JSON.stringify({
    created: result.created.length,
    changed: result.changed.length,
    unchanged: result.unchanged.length,
    draftsThatHideTheImport: result.drafts,
  }, null, 2));
  return { ...written, result };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
