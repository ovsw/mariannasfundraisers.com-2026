// The old site's redirects in the importer (spec decision 6, ticket #20): the
// eight internal ones of the seed file become `redirect` documents; the three
// to iubenda stay in the Website's config.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compileNextRedirects } from "../../../frontend/lib/redirects.mjs";
import { seedRedirectId, seedRedirects } from "./redirects.mjs";
import { createSite, planImport } from "./transform.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
const seed = read("../../../docs/migration/seed/hard-coded-content.json");

const page = (slug) => ({ name: slug, uuid: `uuid-${slug}`, full_slug: slug, slug, content: { component: "page", _uid: slug, body: [] } });
const destinations = ["our-story-and-promise", "hoagie-heroes", "success-stories", "jobs", "contact-us", "fundraiser-resources"];
const stories = [page("home"), ...destinations.map(page)];

test("the eight internal redirects become permanent redirect documents to their pages", () => {
  const { documents, internal, external } = seedRedirects(seed, { site: createSite(stories), missingPath: assert.fail });
  assert.equal(documents.length, 8);
  assert.deepEqual(documents[0], {
    _id: "redirect-seed-about-us-our-history",
    _type: "redirect",
    status: "active",
    source: { _type: "slug", current: "/about-us/our-history" },
    destinationReference: { _type: "reference", _ref: "page-uuid-our-story-and-promise" },
    permanent: "true",
  });
  const bySource = Object.fromEntries(documents.map((d) => [d.source.current, d.destinationReference._ref]));
  assert.equal(bySource["/about-us/in-the-news"], "blogIndex");
  assert.equal(bySource["/selling-tools"], "page-uuid-fundraiser-resources");
  assert.ok(documents.every((d) => d.permanent === "true" && d.status === "active"));
  assert.deepEqual(internal.map((r) => r.source), documents.map((d) => d.source.current));

  assert.deepEqual(external.map((r) => r.source), ["/terms-and-conditions", "/cookie-policy", "/privacy-policy"]);
});

test("the redirect documents compile into Next redirects once their destinations resolve", () => {
  const { documents } = seedRedirects(seed, { site: createSite(stories), missingPath: assert.fail });
  const paths = { "page-uuid-our-story-and-promise": "/our-story-and-promise", blogIndex: "/news" };
  const records = documents.map((d) => ({ ...d, destination: paths[d.destinationReference._ref] ?? "/somewhere" }));
  const compiled = compileNextRedirects(records);
  assert.equal(compiled.length, 8);
  assert.deepEqual(compiled.find((r) => r.source === "/about-us/in-the-news"), { source: "/about-us/in-the-news", destination: "/news", statusCode: 301 });
});

test("a redirect whose destination is no imported page is left out and reported", () => {
  const missing = [];
  const { documents } = seedRedirects(seed, {
    site: createSite([page("home"), page("jobs")]),
    missingPath: (source, destination) => missing.push(`${source} -> ${destination}`),
  });
  assert.deepEqual(documents.map((d) => d.source.current), ["/about-us/join-our-team", "/about-us/in-the-news"]);
  assert.equal(missing.length, 6);
  assert.ok(missing.includes("/testimonials -> /success-stories"));
});

test("the import plan holds the seed redirects with stable IDs and reports them", () => {
  const first = planImport({ stories }, { seed });
  const second = planImport({ stories }, { seed });
  const ids = (plan) => plan.documents.filter((d) => d._type === "redirect").map((d) => d._id);
  assert.equal(ids(first).length, 8);
  assert.deepEqual(ids(first), ids(second));
  assert.equal(first.report.documents.redirect, 8);
  assert.equal(first.report.seedRedirects.documents.length, 8);
  assert.equal(first.report.seedRedirects.external.length, 3);
  assert.equal(seedRedirectId("/about-us/our-team"), "redirect-seed-about-us-our-team");
});
