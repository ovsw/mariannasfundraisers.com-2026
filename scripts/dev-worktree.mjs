#!/usr/bin/env node

import { execFile, spawn } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync } from "node:fs";
import { realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { approvedEnvPaths, copyApprovedEnv } from "./setup-worktree.mjs";
import { allocatePorts, HOST } from "./worktree-config.mjs";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG_FILE = path.join(repoRoot, ".worktree-dev.log");
const USAGE =
  "Usage: pnpm dev:worktree [--detach] [--frontend-port <port> --studio-port <port>]";

export function parseArgs(argv) {
  const values = { detach: false };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--detach") {
      values.detach = true;
      continue;
    }
    if (flag !== "--frontend-port" && flag !== "--studio-port") {
      throw new Error(USAGE);
    }
    const value = argv[index + 1];
    if (!value) throw new Error(`${flag} needs a value.`);
    values[flag === "--frontend-port" ? "frontendPort" : "studioPort"] = value;
    index += 1;
  }
  return values;
}

/**
 * A worktree made by another tool has no env files. Copy the missing ones
 * from the primary checkout; never overwrite a file that exists. Returns the
 * paths that were copied. The primary checkout has nothing to copy from, so
 * it only warns and the servers run on the shell's environment.
 */
export async function copyMissingEnvFiles({ worktreeRoot }) {
  const missing = approvedEnvPaths.filter(
    (file) => !existsSync(path.join(worktreeRoot, file)),
  );
  if (missing.length === 0) return [];

  const { stdout } = await execFileAsync(
    "git",
    ["rev-parse", "--path-format=absolute", "--git-common-dir"],
    { cwd: worktreeRoot },
  );
  const commonDirectory = await realpath(stdout.trim());
  const primaryRoot = path.dirname(commonDirectory);
  if (
    path.basename(commonDirectory) !== ".git" ||
    primaryRoot === (await realpath(worktreeRoot))
  ) {
    console.warn(
      `Missing ${missing.join(" and ")}. Run pnpm setup to create the env files; ` +
        "starting with the shell's environment.",
    );
    return [];
  }
  console.log(`Missing ${missing.join(" and ")}; copying from ${primaryRoot}.`);
  await copyApprovedEnv({
    sourceRoot: primaryRoot,
    destinationRoot: worktreeRoot,
    paths: missing,
  });
  return missing;
}

/**
 * Run `entry` with Node in its own session, its output in `logFile`, and
 * return once it prints the Studio address. The servers then outlive the
 * shell or agent that started them; stop them with `pnpm dev:stop --here`.
 */
export async function startDetached({
  entry,
  args = [],
  cwd,
  logFile,
  timeoutMs = 60_000,
}) {
  const log = openSync(logFile, "w");
  let child;
  try {
    child = spawn(process.execPath, [entry, ...args], {
      cwd,
      detached: true,
      stdio: ["ignore", log, log],
    });
  } finally {
    closeSync(log);
  }
  let exited = false;
  let spawnError;
  child.once("exit", () => {
    exited = true;
  });
  child.once("error", (error) => {
    exited = true;
    spawnError = error;
  });
  child.unref();

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (spawnError) throw new Error(`The servers did not start: ${spawnError.message}`);
    const output = readFileSync(logFile, "utf8");
    if (exited) throw new Error(`The servers did not start:\n${output}`);
    if (/^Studio: /m.test(output)) {
      return output.match(/^(Worktree slot|Website:|Studio: ).*$/gm).join("\n");
    }
  }
  // Stop the launch so it cannot start servers after reporting failure; the
  // supervisor's SIGTERM handler stops its servers and frees the slot.
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
  throw new Error(`The servers did not report their addresses in time; stopped them. See ${logFile}.`);
}

async function main() {
  const argv = process.argv.slice(2);
  const { detach, ...overrides } = parseArgs(argv);
  await copyMissingEnvFiles({ worktreeRoot: repoRoot });
  if (detach) {
    const addresses = await startDetached({
      entry: fileURLToPath(import.meta.url),
      args: argv.filter((flag) => flag !== "--detach"),
      cwd: repoRoot,
      logFile: LOG_FILE,
    });
    console.log(addresses);
    console.log(`Running detached. Log: ${LOG_FILE}. Stop: pnpm dev:stop --here`);
    return;
  }
  const ports = await allocatePorts({ worktreeRoot: repoRoot, overrides });
  let reservationReleased = false;
  async function releaseReservation() {
    if (reservationReleased) return;
    reservationReleased = true;
    await ports.release();
  }
  const frontendUrl = `http://localhost:${ports.frontendPort}`;
  const studioUrl = `http://localhost:${ports.studioPort}`;
  const childEnvironment = {
    ...process.env,
    NEXT_PUBLIC_SITE_URL: frontendUrl,
    NEXT_PUBLIC_STUDIO_URL: studioUrl,
    SANITY_STUDIO_PREVIEW_URL: frontendUrl,
  };

  console.log(`Worktree slot ${ports.slot}`);
  console.log(`Website: ${frontendUrl}`);
  console.log(`Studio:  ${studioUrl}`);

  const commands = [
    {
      name: "Website",
      args: [
        "--dir",
        "frontend",
        "exec",
        "next",
        "dev",
        "--hostname",
        HOST,
        "--port",
        String(ports.frontendPort),
      ],
    },
    {
      name: "Studio",
      args: [
        "--dir",
        "studio",
        "exec",
        "sanity",
        "dev",
        "--host",
        HOST,
        "--port",
        String(ports.studioPort),
      ],
    },
  ];

  const children = [];
  try {
    for (const { name, args } of commands) {
      children.push({
        name,
        process: spawn("pnpm", args, {
          cwd: repoRoot,
          detached: process.platform !== "win32",
          env: childEnvironment,
          stdio: "inherit",
        }),
      });
    }
  } catch (error) {
    await releaseReservation();
    throw error;
  }
  let stopping = false;
  let exitCode = 0;
  const closedChildren = new Set();

  function signalChild(child, signal) {
    if (child.exitCode !== null || child.signalCode !== null) return;
    if (child.pid === undefined) return;
    try {
      if (process.platform === "win32") child.kill(signal);
      else process.kill(-child.pid, signal);
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  }

  function stopAll(signal = "SIGTERM") {
    if (!stopping) stopping = true;
    for (const child of children) signalChild(child.process, signal);
    const timer = setTimeout(() => {
      for (const child of children) signalChild(child.process, "SIGKILL");
    }, 5_000);
    timer.unref();
  }

  for (const { name, process: child } of children) {
    child.once("error", (error) => {
      console.error(`${name} failed to start: ${error.message}`);
      exitCode = 1;
      // A failed spawn may never emit "close", so record the failure on the
      // process now instead of waiting for the final close handler.
      process.exitCode = 1;
      stopAll();
    });
    child.once("exit", (code, signal) => {
      if (!stopping) {
        console.error(`${name} stopped (${signal ?? `exit ${code ?? 1}`}); stopping the group.`);
        exitCode = code ?? 1;
        stopAll();
      }
    });
    child.once("close", async () => {
      closedChildren.add(child);
      if (closedChildren.size !== children.length) return;
      try {
        await releaseReservation();
      } catch (error) {
        console.error(`Failed to release worktree slot: ${error.message}`);
        exitCode = 1;
      }
      process.exit(exitCode);
    });
  }

  process.once("SIGINT", () => stopAll("SIGINT"));
  process.once("SIGTERM", () => stopAll("SIGTERM"));
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
