import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./sitemap.ts", import.meta.url), "utf8");

test("sitemap emits canonical news posts and the news index", () => {
  assert.match(source, /_type == "post"/);
  assert.match(source, /"\/news\/" \+ array::join/);
  assert.match(source, /_id == "blogIndex" => \$baseUrl \+ "\/news"/);
  assert.match(source, /string::split\(slug\.current, "\/"\)/);
  assert.doesNotMatch(source, /slug\.current \+ "\/"/);
});

test("sitemap leaves out noindex documents and has no category archives", () => {
  assert.match(source, /meta\.noindex != true/);
  assert.doesNotMatch(source, /category|\/blog/);
});
