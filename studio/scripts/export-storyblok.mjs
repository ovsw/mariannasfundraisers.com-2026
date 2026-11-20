#!/usr/bin/env node
// Refreshes the Storyblok export folder from Storyblok's content API (EU
// region) with the read-only preview token: draft and published stories,
// links, and the option lists. The importer reads this folder. It stays out
// of git. See docs/migration/import.md.
//
//   pnpm storyblok:export [--export <folder>]
//
// The token is read by name, MFR_STORYBLOK_PREVIEW_TOKEN, from the shell, then
// studio/.env.local, then the shared secrets file (~/.config/ovs/secrets.env).

import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseEnv } from "node:util";
import { DEFAULT_EXPORT } from "./import-storyblok.mjs";
import { collectFiles } from "./storyblok/files.mjs";

const API = "https://api.storyblok.com/v2/cdn";
const TOKEN_NAME = "MFR_STORYBLOK_PREVIEW_TOKEN";
const studioDirectory = path.resolve(import.meta.dirname, "..");

/** Reads one variable by name from env files without running them as shell. */
export function readToken(env = process.env, files = [path.join(studioDirectory, ".env.local"), path.join(homedir(), ".config", "ovs", "secrets.env")]) {
  if (env[TOKEN_NAME]) return env[TOKEN_NAME];
  for (const file of files) {
    if (!existsSync(file)) continue;
    // parseEnv reads KEY=value lines; lines it cannot read are skipped.
    const value = parseEnv(readFileSync(file, "utf8"))[TOKEN_NAME];
    if (value) return value;
  }
  throw new Error(`${TOKEN_NAME} is not set in the shell, studio/.env.local or ~/.config/ovs/secrets.env`);
}

async function getJson(endpoint, params, token, fetchJson = fetch) {
  const url = new URL(`${API}/${endpoint}`);
  for (const [key, value] of Object.entries({ ...params, token })) url.searchParams.set(key, String(value));
  const response = await fetchJson(url);
  if (!response.ok) throw new Error(`Storyblok ${endpoint} answered ${response.status}`);
  return { body: await response.json(), total: Number(response.headers.get("total") ?? 0) };
}

async function allStories(version, token, fetchJson) {
  const stories = [];
  for (let page = 1; ; page++) {
    const { body, total } = await getJson("stories", { version, per_page: 100, page }, token, fetchJson);
    stories.push(...body.stories);
    if (!body.stories.length || stories.length >= total) break;
  }
  return stories.sort((a, b) => a.full_slug.localeCompare(b.full_slug));
}

async function allLinks(version, token, fetchJson) {
  const { body } = await getJson("links", { version, per_page: 1000 }, token, fetchJson);
  return Object.values(body.links).sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function exportStoryblok(folder, { token, fetchJson = fetch } = {}) {
  const [draft, published, linksDraft, linksPublished, datasources] = await Promise.all([
    allStories("draft", token, fetchJson),
    allStories("published", token, fetchJson),
    allLinks("draft", token, fetchJson),
    allLinks("published", token, fetchJson),
    getJson("datasources", { per_page: 100 }, token, fetchJson).then(({ body }) => body.datasources),
  ]);
  const entries = {};
  for (const datasource of datasources) {
    const { body } = await getJson("datasource_entries", { datasource: datasource.slug, per_page: 1000 }, token, fetchJson);
    entries[datasource.slug] = body.datasource_entries;
  }
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const write = (name, value) => writeFile(path.join(folder, name), typeof value === "string" ? value : `${JSON.stringify(value, null, 1)}\n`);
  await write("stories-draft.json", draft);
  await write("stories-published.json", published);
  await write("links-draft.json", linksDraft);
  await write("links-published.json", linksPublished);
  await write("datasources.json", datasources);
  await write("datasource_entries.json", entries);
  await write("asset-urls-all.txt", `${[...collectFiles(draft).keys()].sort().join("\n")}\n`);
  return { stories: draft.length, published: published.length, links: linksDraft.length, datasources: datasources.length };
}

async function main(args = process.argv.slice(2)) {
  let folder = DEFAULT_EXPORT;
  if (args[0] === "--export" && args[1]) folder = path.resolve(args[1]);
  else if (args.length) throw new Error("Usage: pnpm storyblok:export [--export <folder>]");
  const result = await exportStoryblok(folder, { token: readToken() });
  console.log(JSON.stringify({ folder, ...result }, null, 2));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
