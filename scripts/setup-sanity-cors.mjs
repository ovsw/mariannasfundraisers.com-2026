#!/usr/bin/env node

// Add the Website and Studio origins to the Sanity project's CORS settings.
// Existing origins are left as they are; repeat runs add nothing.
import { pathToFileURL } from "node:url";
import { desiredSanityOrigins } from "./worktree-config.mjs";

export async function setupSanityCors(env, fetcher = fetch, log = console.log) {
  for (const key of [
    "SANITY_AUTH_TOKEN",
    "SANITY_STUDIO_PROJECT_ID",
    "SANITY_STUDIO_PREVIEW_URL",
  ]) {
    if (!env[key]?.trim())
      throw new Error(`Missing ${key}. See docs/deployment.md.`);
  }
  const productionUrl = new URL(env.SANITY_STUDIO_PREVIEW_URL.trim());
  if (!["http:", "https:"].includes(productionUrl.protocol)) {
    throw new Error("SANITY_STUDIO_PREVIEW_URL must use http or https.");
  }
  const url = `https://api.sanity.io/v2021-06-07/projects/${encodeURIComponent(env.SANITY_STUDIO_PROJECT_ID.trim())}/cors`;

  async function request(body) {
    let response;
    try {
      response = await fetcher(url, {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${env.SANITY_AUTH_TOKEN.trim()}`,
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(30000),
        redirect: "error",
      });
    } catch {
      throw new Error("Sanity CORS request failed. Check connectivity and run it again.");
    }
    // API bodies can contain secrets. Never include them in errors.
    if (!response.ok)
      throw new Error(
        `Sanity CORS API returned HTTP ${response.status}. Check that SANITY_AUTH_TOKEN can manage the project.`,
      );
    try {
      return await response.json();
    } catch {
      throw new Error("Sanity CORS API returned invalid JSON.");
    }
  }

  const existing = new Map(
    (await request()).map((entry) => [entry.origin, entry]),
  );
  const added = [];
  for (const { origin } of desiredSanityOrigins({
    productionOrigin: productionUrl.origin,
  })) {
    const current = existing.get(origin);
    if (!current) {
      await request({ origin, allowCredentials: true });
      added.push(origin);
    } else if (!current.allowCredentials) {
      log(`Already present without credentials, left unchanged: ${origin}`);
    }
  }
  log(
    added.length
      ? `Added ${added.length} Sanity CORS origin(s):\n${added.join("\n")}`
      : "All Sanity CORS origins are already present.",
  );
  return added;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const run =
    process.argv.length > 2
      ? Promise.reject(
          new Error("Usage: node scripts/setup-sanity-cors.mjs (takes no arguments)"),
        )
      : setupSanityCors(process.env);
  run.catch((error) => {
    console.error(`CORS setup failed: ${error.message}`);
    process.exitCode = 1;
  });
}
