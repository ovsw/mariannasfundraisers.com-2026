#!/usr/bin/env node
// Run Studio's own validation rules on one document: schema rules, custom
// rules and warnings. Content written by a script or by Sanity MCP never
// passes through Studio, so nothing else runs these rules before handover.
// Checks the draft when one exists, else the published document.
// Prints each problem with its path. Exits 1 on any error or warning.
// Usage: pnpm page:check <document id>
//   pnpm page:check homePage

import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { selectPage } from "./lib/page-text.mjs";
import { getPageToolsClient } from "./lib/page-tools-client.mjs";

const USAGE = "Usage: pnpm page:check <document id>";
const studioRoot = fileURLToPath(new URL("..", import.meta.url));

/** A marker path as people read it, for example `blocks[abc].buttons[def].text`. */
export function formatPath(segments = []) {
  return segments
    .map((segment) => {
      if (typeof segment === "object" && segment !== null) return `[${segment._key ?? segment}]`;
      if (typeof segment === "number") return `[${segment}]`;
      return `.${segment}`;
    })
    .join("")
    .replace(/^\./, "");
}

/**
 * Validate one document with `sanity documents validate`, which loads this
 * Studio's workspace and schema. Returns the markers it reports.
 */
export async function validateWithStudio(document) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "page-check-"));
  const file = path.join(directory, "document.ndjson");
  try {
    // The CLI reads nothing from a file shorter than 300 bytes: it waits for a
    // full archive header first. Blank lines after the document are ignored.
    await writeFile(file, `${JSON.stringify(document)}\n${" ".repeat(300)}\n`);
    const result = spawnSync(
      "pnpm",
      [
        "exec",
        "sanity",
        "documents",
        "validate",
        "--file",
        file,
        "--level",
        "warning",
        "--format",
        "ndjson",
        "--yes",
      ],
      { cwd: studioRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    if (result.error) throw result.error;
    const reports = result.stdout
      .split("\n")
      .filter((line) => line.startsWith("{"))
      .map((line) => JSON.parse(line));
    const markers = reports.flatMap((report) => report.markers ?? []);
    // The CLI exits 1 when it finds problems. Any other failure has no report.
    if (result.status !== 0 && reports.length === 0) {
      throw new Error(`sanity documents validate failed:\n${result.stderr || result.stdout}`);
    }
    return markers;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

/**
 * Check one document and return the exit code. `fetchDocuments(id)` returns
 * the draft and published copies; `validate(document)` returns the markers.
 */
export async function checkDocument({
  argv,
  fetchDocuments,
  validate = validateWithStudio,
  log = console.log,
  error = console.error,
}) {
  const id = argv[0]?.replace(/^drafts\./, "");
  if (!id || argv.length > 1) {
    error(USAGE);
    return 1;
  }

  const document = selectPage(await fetchDocuments(id));
  if (!document) {
    error(`No document with the id "${id}", draft or published.`);
    return 1;
  }
  log(`Checking ${document._id} (${document._type})`);

  const markers = await validate(document);
  for (const marker of markers) {
    log(`${marker.level}: ${formatPath(marker.path) || "(document)"}: ${marker.message}`);
  }
  if (markers.length > 0) {
    error(`${markers.length} problem(s). Fix every one before handing the document over.`);
    return 1;
  }
  log("Valid: no errors, no warnings.");
  return 0;
}

async function main() {
  process.exitCode = await checkDocument({
    argv: process.argv.slice(2),
    // Load credentials only after the arguments pass, so a missing id shows
    // the usage line rather than a credentials error.
    fetchDocuments: (id) =>
      getPageToolsClient().fetch("*[_id in [$id, $draft]]", {
        id,
        draft: `drafts.${id}`,
      }),
  });
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((caught) => {
    console.error(caught.message);
    process.exitCode = 1;
  });
}
