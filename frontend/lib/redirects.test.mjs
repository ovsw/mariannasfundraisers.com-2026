import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

import { readFileSync } from "node:fs";

import {
  compileNextRedirects,
  EXTERNAL_REDIRECTS,
  siteRedirects,
} from "./redirects.mjs";

test("compiles permanent and temporary redirects without ending slashes", () => {
  assert.deepEqual(
    compileNextRedirects([
      {
        source: { current: "/old/" },
        destination: { current: "/new/" },
        permanent: "true",
        status: "active",
      },
      {
        source: { current: "/temp" },
        destination: { current: "/later" },
        permanent: "false",
        status: "active",
      },
    ]),
    [
      { source: "/old", destination: "/new", statusCode: 301 },
      { source: "/temp", destination: "/later", statusCode: 302 },
    ],
  );
});

test("allows shared destinations, ignores inactive records, and deduplicates retries", () => {
  assert.deepEqual(
    compileNextRedirects([
      { source: "/one", destination: "/target", permanent: true },
      { source: "/two", destination: "/target", permanent: true },
      { source: "/off", destination: "/target", permanent: true, status: "inactive" },
      { source: "/one/", destination: "/target/", permanent: "true" },
    ]),
    [
      { source: "/one", destination: "/target", statusCode: 301 },
      { source: "/two", destination: "/target", statusCode: 301 },
    ],
  );
});

test("rejects conflicting sources, self redirects, chains, and cycles", () => {
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/old", destination: "/one", permanent: true },
        { source: "/old/", destination: "/two", permanent: true },
      ]),
    /Conflicting redirects share the source \/old/,
  );
  assert.throws(
    () => compileNextRedirects([{ source: "/same", destination: "/same/" }]),
    /source and destination are the same/,
  );
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/a", destination: "/b" },
        { source: "/b", destination: "/c" },
      ]),
    /chain or cycle/,
  );
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/a", destination: "/b" },
        { source: "/b", destination: "/a" },
      ]),
    /chain or cycle/,
  );
});

test("rejects unsafe paths and application-owned sources", () => {
  for (const source of [
    "https://example.com/old",
    "/bad\\source",
    "/old?preview=true",
    "/api/draft-mode/enable",
    "/news/2",
    "/contact/thanks",
  ]) {
    assert.throws(
      () => compileNextRedirects([{ source, destination: "/target" }]),
      /missing a valid internal|reserved by the application/,
      source,
    );
  }
  assert.throws(
    () => compileNextRedirects([{ source: "/source", destination: "/bad#target" }]),
    /missing a valid internal/,
  );
});

// Next.js matches a redirect source with its own copy of path-to-regexp.
const { pathToRegexp } = createRequire(import.meta.url)(
  "next/dist/compiled/path-to-regexp",
);

test("a source with a colon compiles to a rule that matches the literal path", () => {
  const oldPath = "/news/winner:-2024-hometown-favorite-sandwich";
  const [rule] = compileNextRedirects([
    {
      source: { current: oldPath },
      destination: "/news/winner-2024-hometown-favorite-sandwich",
      permanent: "true",
      status: "active",
    },
  ]);
  assert.deepEqual(rule, {
    source: "/news/winner\\:-2024-hometown-favorite-sandwich",
    destination: "/news/winner-2024-hometown-favorite-sandwich",
    statusCode: 301,
  });
  // Unescaped, Next.js would read ":" as the start of a parameter and fail.
  assert.throws(() => pathToRegexp(oldPath));
  const pattern = pathToRegexp(rule.source);
  assert.ok(pattern.test(oldPath));
  assert.ok(!pattern.test("/news/winner-2024-hometown-favorite-sandwich"));
  assert.ok(!pattern.test("/news/winnerX-2024-hometown-favorite-sandwich"));
});

test("a source that ends in a hyphen keeps its hyphen and matches only itself", () => {
  const [rule] = compileNextRedirects([
    {
      source: "/news/fund-fiesta-is-here-",
      destination: "/news/fund-fiesta-is-here",
      permanent: "true",
    },
  ]);
  assert.deepEqual(rule, {
    source: "/news/fund-fiesta-is-here-",
    destination: "/news/fund-fiesta-is-here",
    statusCode: 301,
  });
  const pattern = pathToRegexp(rule.source);
  assert.ok(pattern.test("/news/fund-fiesta-is-here-"));
  assert.ok(!pattern.test("/news/fund-fiesta-is-here"));
});

test("the iubenda redirects come first, permanent, and match the old site's", () => {
  const seed = JSON.parse(
    readFileSync(
      new URL("../../docs/migration/seed/hard-coded-content.json", import.meta.url),
      "utf8",
    ),
  );
  const old = seed.redirects.items
    .filter((item) => item.external)
    .map(({ source, destination, permanent }) => ({ source, destination, permanent }));
  assert.deepEqual(EXTERNAL_REDIRECTS, old);

  const rules = siteRedirects([
    { source: { current: "/testimonials" }, destination: "/success-stories", permanent: "true", status: "active" },
  ]);
  assert.deepEqual(rules.slice(0, 3), EXTERNAL_REDIRECTS);
  assert.deepEqual(rules[3], { source: "/testimonials", destination: "/success-stories", statusCode: 301 });
});

test("a redirect record cannot take an iubenda redirect's source", () => {
  assert.throws(
    () =>
      siteRedirects([
        { source: { current: "/privacy-policy" }, destination: "/contact-us", status: "active" },
      ]),
    /reserved by the application: \/privacy-policy/,
  );
});
