import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  missingProductionKeys,
  requiredKeys,
} from "./check-production-env.mjs";

const example = `# Required
SITE=http://localhost
# COMMENTED_OUT=
TOKEN=
SECRET=your-secret

# Optional editor tooling.
TOOL_KEY=your-key
`;

const script = fileURLToPath(new URL("./check-production-env.mjs", import.meta.url));

test("requires every key set above the Optional line", () => {
  assert.deepEqual(requiredKeys(example), ["SITE", "TOKEN", "SECRET"]);
});

test("reads a required key written with spaces around the equals sign", () => {
  assert.deepEqual(requiredKeys("SITE = http://localhost\n  TOKEN =abc\n# Optional\n"), [
    "SITE",
    "TOKEN",
  ]);
});

test("lists the required keys a production build is missing", () => {
  assert.deepEqual(
    missingProductionKeys(example, {
      VERCEL_ENV: "production",
      SITE: "https://example.com",
      TOKEN: "  ",
    }),
    ["TOKEN", "SECRET"],
  );
  assert.deepEqual(
    missingProductionKeys(example, {
      VERCEL_ENV: "production",
      SITE: "https://example.com",
      TOKEN: "abc",
      SECRET: "def",
    }),
    [],
  );
});

test("skips the check outside a Vercel production build", () => {
  assert.equal(missingProductionKeys(example, {}), null);
  assert.equal(missingProductionKeys(example, { VERCEL_ENV: "preview" }), null);
});

test("the build script fails a production build and names each missing key", () => {
  const keys = requiredKeys(
    readFileSync(new URL("../.env.local.example", import.meta.url), "utf8"),
  );
  assert.ok(keys.length > 0, "the Website env example lists required keys");
  const env = { PATH: process.env.PATH };

  const production = spawnSync(process.execPath, [script], {
    encoding: "utf8",
    env: { ...env, VERCEL_ENV: "production" },
  });
  assert.equal(production.status, 1);
  for (const key of keys) assert.match(production.stderr, new RegExp(`- ${key}\\n`));

  const preview = spawnSync(process.execPath, [script], {
    encoding: "utf8",
    env: { ...env, VERCEL_ENV: "preview" },
  });
  assert.equal(preview.status, 0, preview.stderr);
  assert.match(preview.stdout, /skipped/);
});

test("the Website build runs the check before next build", () => {
  const { scripts } = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.match(scripts.build, /^node scripts\/check-production-env\.mjs && next build$/);
});
