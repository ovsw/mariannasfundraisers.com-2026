import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { copyMissingEnvFiles, parseArgs, startDetached } from "./dev-worktree.mjs";

const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

async function repositoryWithWorktree(t) {
  const root = await mkdtemp(path.join(tmpdir(), "starter dev worktree test "));
  t.after(() => rm(root, { recursive: true, force: true }));
  const primary = path.join(root, "primary");
  const worktree = path.join(root, "worktree");
  await mkdir(primary);
  await writeFile(path.join(primary, ".gitignore"), ".env*\n");
  const hooks = path.join(root, "no-hooks");
  await mkdir(hooks);
  git(primary, "init");
  git(primary, "config", "core.hooksPath", hooks);
  git(primary, "add", ".");
  git(primary, "-c", "user.name=Dev test", "-c", "user.email=dev@example.invalid", "-c", "commit.gpgsign=false", "commit", "-m", "fixture");
  git(primary, "worktree", "add", "--detach", worktree);
  for (const workspace of ["frontend", "studio"]) {
    await mkdir(path.join(primary, workspace));
    await writeFile(path.join(primary, workspace, ".env.local"), `primary ${workspace}`);
  }
  return { primary, worktree };
}

test("copies missing env files from the primary checkout and keeps existing ones", async (t) => {
  const { worktree } = await repositoryWithWorktree(t);
  await mkdir(path.join(worktree, "frontend"));
  await writeFile(path.join(worktree, "frontend/.env.local"), "worktree frontend");

  assert.deepEqual(await copyMissingEnvFiles({ worktreeRoot: worktree }), ["studio/.env.local"]);
  assert.equal(await readFile(path.join(worktree, "frontend/.env.local"), "utf8"), "worktree frontend");
  assert.equal(await readFile(path.join(worktree, "studio/.env.local"), "utf8"), "primary studio");

  assert.deepEqual(await copyMissingEnvFiles({ worktreeRoot: worktree }), []);
});

test("copies a missing env file when the primary checkout lacks the other one", async (t) => {
  const { primary, worktree } = await repositoryWithWorktree(t);
  await rm(path.join(primary, "studio/.env.local"));
  await mkdir(path.join(worktree, "studio"));
  await writeFile(path.join(worktree, "studio/.env.local"), "worktree studio");

  assert.deepEqual(await copyMissingEnvFiles({ worktreeRoot: worktree }), ["frontend/.env.local"]);
  assert.equal(await readFile(path.join(worktree, "frontend/.env.local"), "utf8"), "primary frontend");
});

test("the primary checkout without env files warns and runs on the shell's environment", async (t) => {
  const { primary } = await repositoryWithWorktree(t);
  await rm(path.join(primary, "studio/.env.local"));
  const warnings = [];
  t.mock.method(console, "warn", (message) => warnings.push(message));
  assert.deepEqual(await copyMissingEnvFiles({ worktreeRoot: primary }), []);
  assert.match(warnings.join("\n"), /Missing studio\/\.env\.local\. Run pnpm setup/);
});

test("accepts --detach beside the port flags", () => {
  assert.deepEqual(parseArgs(["--detach", "--frontend-port", "3001", "--studio-port", "3334"]), {
    detach: true,
    frontendPort: "3001",
    studioPort: "3334",
  });
  assert.deepEqual(parseArgs([]), { detach: false });
  assert.throws(() => parseArgs(["--background"]), /--detach/);
});

test("--detach returns the addresses and leaves the servers running", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "starter-detach-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const entry = path.join(root, "servers.mjs");
  const pidFile = path.join(root, "pid");
  await writeFile(entry, `
import { writeFileSync } from "node:fs";
writeFileSync(${JSON.stringify(pidFile)}, String(process.pid));
console.log("Worktree slot 2");
console.log("Website: http://localhost:3002");
console.log("Studio:  http://localhost:3335");
console.log("other output");
setInterval(() => {}, 1000);
`);

  const addresses = await startDetached({ entry, cwd: root, logFile: path.join(root, "dev.log") });
  const pid = Number(await readFile(pidFile, "utf8"));
  t.after(() => {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Already stopped.
    }
  });

  assert.equal(
    addresses,
    "Worktree slot 2\nWebsite: http://localhost:3002\nStudio:  http://localhost:3335",
  );
  assert.doesNotThrow(() => process.kill(pid, 0), "the detached servers keep running");
});

test("--detach reports the log when the servers stop before they start", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "starter-detach-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const entry = path.join(root, "servers.mjs");
  await writeFile(entry, 'console.error("port taken"); process.exit(1);\n');

  await assert.rejects(
    startDetached({ entry, cwd: root, logFile: path.join(root, "dev.log") }),
    /did not start:\nport taken/,
  );
});
