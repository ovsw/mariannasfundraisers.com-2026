// The checks every importer write runs first: the target is this site's
// Sanity project and dataset, and a verified backup of it exists
// (docs/agents/sanity-cli.md, "Authorized dataset writes").

import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { chmod, mkdir } from "node:fs/promises";
import path from "node:path";

export const TARGET = { projectId: "bgnqkzlg", dataset: "production", name: "mariannasfundraisers.com-2026" };

/** Throws unless the client points at this site's project and dataset. */
export async function verifyTarget(client, target = TARGET) {
  const { projectId, dataset } = client.config();
  if (projectId !== target.projectId || dataset !== target.dataset) {
    throw new Error(`The importer writes only to ${target.projectId}/${target.dataset}; the environment names ${projectId}/${dataset}`);
  }
  const datasets = await client.datasets.list();
  if (!datasets.some((entry) => entry.name === target.dataset)) {
    throw new Error(`Dataset ${target.dataset} is missing from project ${target.projectId}`);
  }
  return { projectId, dataset };
}

/** A path with symlinks resolved; the part that does not exist yet is kept as written. */
function realLocation(location) {
  let existing = location;
  while (!existsSync(existing) && path.dirname(existing) !== existing) existing = path.dirname(existing);
  return path.join(realpathSync(existing), path.relative(existing, location));
}

/**
 * Exports the dataset as a raw backup (every document with its asset
 * references; the asset files stay in Sanity) to a timestamped file under
 * `root`, checks it with `gzip -t`, and returns its path. Throws, before any
 * write, when a step fails or when `root` is inside the repository.
 */
export async function backupDataset({ studioDirectory, root, dataset = TARGET.dataset, label = "storyblok-import", run = spawnSync }) {
  const repository = realLocation(path.resolve(studioDirectory, ".."));
  const target = path.resolve(root);
  const realTarget = realLocation(target);
  if (realTarget === repository || realTarget.startsWith(repository + path.sep)) {
    throw new Error("Dataset backups must stay outside the repository");
  }
  await mkdir(target, { recursive: true, mode: 0o700 });
  const filename = path.join(target, `${new Date().toISOString().replaceAll(":", "-")}-${dataset}-${label}.tar.gz`);
  const exported = run("pnpm", ["exec", "sanity", "datasets", "export", dataset, filename, "--raw", "--overwrite"], {
    cwd: studioDirectory,
    encoding: "utf8",
    stdio: ["ignore", "ignore", "pipe"],
  });
  if (exported.status !== 0) throw new Error(`Dataset backup failed; nothing was written. ${exported.stderr ?? ""}`.trim());
  const verified = run("gzip", ["-t", filename], { encoding: "utf8" });
  if (verified.status !== 0) throw new Error("Dataset backup failed its gzip check; nothing was written");
  await chmod(filename, 0o600);
  return filename;
}
