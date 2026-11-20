import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./shared/internal-href.ts", import.meta.url), "utf8");
const footerSource = readFileSync(new URL("./footer.ts", import.meta.url), "utf8");

test("every shared href variant resolves the news index without a slug", () => {
  for (const prefix of ["customLink.internal", "url.internal", "internal", "link.internal", "@.internalLink"]) {
    assert.ok(source.includes(`${prefix}->_id == "blogIndex" || ${prefix}->_type == "blogIndex" => "/news"`));
  }
});

test("internal href resolvers use the news post namespace and no category routes", () => {
  assert.equal((source.match(/_type == "post"/g) || []).length, 5);
  assert.equal((source.match(/"\/news\/" \+/g) || []).length, 5);
  assert.doesNotMatch(source, /category|\/blog/);
  assert.doesNotMatch(source, /slug\.current \+ "\/"/);
  assert.match(footerSource, /internal->_type == "post"/);
  assert.match(footerSource, /"\/news\/" \+ array::join/);
  assert.doesNotMatch(footerSource, /category|\/blog/);
  assert.match(footerSource, /string::split\(internal->slug\.current, "\/"\)/);
  assert.doesNotMatch(footerSource, /slug\.current \+ "\/"/);
});
