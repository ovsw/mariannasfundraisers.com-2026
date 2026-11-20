import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { parseEnv } from "node:util";

const studioDirectory = path.resolve(import.meta.dirname, "..", "..");

/** Where a secret is looked up after the shell: studio/.env.local, then the shared secrets file. */
export const SECRET_FILES = [
  path.join(studioDirectory, ".env.local"),
  path.join(homedir(), ".config", "ovs", "secrets.env"),
];

/**
 * One variable by name from the shell, then env files read as KEY=value lines
 * (never run as shell). Returns null when no source sets it. Callers never
 * print the value.
 */
export function readSecret(name, env = process.env, files = SECRET_FILES) {
  // Values are trimmed; a blank value counts as unset.
  const fromShell = env[name]?.trim();
  if (fromShell) return fromShell;
  for (const file of files) {
    if (!existsSync(file)) continue;
    const value = parseEnv(readFileSync(file, "utf8"))[name]?.trim();
    if (value) return value;
  }
  return null;
}
