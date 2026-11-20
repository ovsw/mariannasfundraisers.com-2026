#!/usr/bin/env node
// Fail the production build when a required environment key is missing.
// A failed build keeps the previous deployment live; a missing key ships
// broken pages. Required = every key set (not commented out) in
// .env.local.example above its "# Optional" line. Runs before `next build`
// and does nothing outside Vercel's production environment.

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/** The keys the env example sets above its "# Optional" line. */
export function requiredKeys(example) {
  const keys = [];
  for (const line of example.split(/\r?\n/)) {
    if (/^#\s*Optional\b/i.test(line)) break;
    const match = /^\s*([A-Z][A-Z0-9_]*)\s*=/.exec(line);
    if (match) keys.push(match[1]);
  }
  return keys;
}

/**
 * The required keys that are empty or unset in `env`, or `null` when the
 * build is not a Vercel production build and the check does not apply.
 */
export function missingProductionKeys(example, env) {
  if (env.VERCEL_ENV !== "production") return null;
  return requiredKeys(example).filter((key) => !env[key]?.trim());
}

function main() {
  // Decide before reading the example, so an unreadable file cannot stop a
  // preview or local build.
  if (process.env.VERCEL_ENV !== "production") {
    console.log("Environment check: not a Vercel production build; skipped.");
    return;
  }
  const example = readFileSync(
    new URL("../.env.local.example", import.meta.url),
    "utf8",
  );
  const missing = missingProductionKeys(example, process.env);
  if (missing.length > 0) {
    console.error(
      `Production environment check failed. Missing keys:\n- ${missing.join("\n- ")}\n` +
        "Add each key to the Vercel project's Production environment, then redeploy.",
    );
    process.exitCode = 1;
    return;
  }
  console.log("Environment check: every required production key is set.");
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main();
}
