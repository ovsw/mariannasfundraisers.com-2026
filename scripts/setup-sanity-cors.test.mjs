import assert from "node:assert/strict";
import test from "node:test";
import { setupSanityCors } from "./setup-sanity-cors.mjs";

const env = {
  SANITY_AUTH_TOKEN: "private-sanity-token",
  SANITY_STUDIO_PROJECT_ID: "project",
  SANITY_STUDIO_PREVIEW_URL: "https://site.example/preview",
};
const quiet = () => {};

function service(initial = []) {
  const origins = [...initial];
  const writes = [];
  const fetcher = async (url, options) => {
    assert.equal(url, "https://api.sanity.io/v2021-06-07/projects/project/cors");
    if (options.method === "POST") {
      const body = JSON.parse(options.body);
      writes.push(body);
      origins.push(body);
    }
    return { ok: true, json: async () => origins };
  };
  return { fetcher, writes };
}

test("adds every missing origin with credentials; repeat runs do not write", async () => {
  const api = service([{ origin: "http://localhost:3333", allowCredentials: true }]);
  const added = await setupSanityCors(env, api.fetcher, quiet);
  assert.equal(added.length, 20);
  assert.ok(!added.includes("http://localhost:3333"));
  assert.ok(added.includes("http://localhost:3000"));
  assert.ok(added.includes("https://site.example"));
  assert.ok(api.writes.every((body) => body.allowCredentials === true));
  assert.deepEqual(await setupSanityCors(env, api.fetcher, quiet), []);
  assert.equal(api.writes.length, 20);
});

test("leaves an existing origin without credentials unchanged and says so", async () => {
  const api = service([{ origin: "http://localhost:3000", allowCredentials: false }]);
  const lines = [];
  await setupSanityCors(env, api.fetcher, (line) => lines.push(line));
  assert.ok(!api.writes.some((body) => body.origin === "http://localhost:3000"));
  assert.match(lines[0], /without credentials.*localhost:3000/);
});

test("validates settings before requests and does not expose error bodies", async () => {
  await assert.rejects(
    setupSanityCors({}, () => assert.fail("Unexpected request"), quiet),
    /Missing SANITY_AUTH_TOKEN/,
  );
  await assert.rejects(
    setupSanityCors(
      { ...env, SANITY_STUDIO_PREVIEW_URL: "ftp://site.example" },
      () => assert.fail("Unexpected request"),
      quiet,
    ),
    /http or https/,
  );
  await assert.rejects(
    setupSanityCors(
      env,
      async () => ({
        ok: false,
        status: 403,
        json: () => assert.fail("Secret body must not be read"),
      }),
      quiet,
    ),
    /HTTP 403/,
  );
  await assert.rejects(
    setupSanityCors(env, async () => {
      throw new Error("secret token");
    }, quiet),
    (error) => !error.message.includes("secret token"),
  );
});
