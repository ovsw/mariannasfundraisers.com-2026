// The URL and SEO parity comparison (spec testing seam 2, ticket #20), with
// small fixtures in the shape of docs/migration/url-inventory.json.
import assert from "node:assert/strict";
import test from "node:test";
import { compareInventory, locationOf, newPath, ON_PURPOSE, parseArguments, requestHeaders } from "./migration/parity.mjs";
import { parseHead } from "./migration/lib.mjs";

const sharing = (image, alt) => ({ "og:image": image, "og:image:alt": alt });
const url = (path, fields = {}) => ({
  path,
  inSitemap: true,
  status: 200,
  title: `${path} | Marianna's Fundraisers`,
  description: `About ${path}.`,
  noindex: false,
  sharing: sharing(true, true),
  ...fields,
});
const same = (entry) => ({ status: entry.status, location: null, title: entry.title, description: entry.description, noindex: entry.noindex, sharing: { ...entry.sharing } });

function fixture() {
  const urls = [
    url("/"),
    url("/jobs"),
    url("/ingredients-list", { noindex: true }),
    url("/news/a-post", { title: "NOTITLE Marianna's Fundraisers", description: null, sharing: sharing(true, false) }),
    url("/news/fund-fiesta-is-here-"),
  ];
  const redirects = [
    { source: "/testimonials", destination: "/success-stories", permanent: true, observed: { status: 308, location: "/success-stories" } },
    { source: "/privacy-policy", destination: "https://www.iubenda.com/privacy-policy/1", permanent: true, observed: { status: 308, location: "https://www.iubenda.com/privacy-policy/1" } },
  ];
  const pages = Object.fromEntries(urls.map((entry) => [entry.path, same(entry)]));
  pages["/news/a-post"] = { ...pages["/news/a-post"], title: "A Post | Marianna's Fundraisers", sharing: sharing(true, true) };
  pages["/news/fund-fiesta-is-here-"] = { status: 301, location: "/news/fund-fiesta-is-here" };
  pages["/news/fund-fiesta-is-here"] = same(urls[4]);
  const observed = {
    pages,
    sitemap: ["/", "/jobs", "/news/a-post", "/news/fund-fiesta-is-here"],
    redirects: {
      "/testimonials": { status: 301, location: "/success-stories" },
      "/privacy-policy": { status: 308, location: "https://www.iubenda.com/privacy-policy/1" },
    },
  };
  return { inventory: { urls, redirects }, observed };
}

test("a malformed news address maps to its clean one; others stay", () => {
  assert.equal(newPath("/news/fund-fiesta-is-here-"), "/news/fund-fiesta-is-here");
  assert.equal(newPath("/news/winner:-2024-hometown-favorite-sandwich"), "/news/winner-2024-hometown-favorite-sandwich");
  assert.equal(newPath("/news/a-post"), "/news/a-post");
  assert.equal(newPath("/products/italian-hoagie"), "/products/italian-hoagie");
});

test("a site that matches has no differences, and the intended ones are listed with their reason", () => {
  const { inventory, observed } = fixture();
  const result = compareInventory(inventory, observed);
  assert.deepEqual(result.differences, []);
  assert.deepEqual(
    result.onPurpose.map((d) => [d.path, d.field, d.why]),
    [
      ["/ingredients-list", "sitemap", ON_PURPOSE.noindexSitemap],
      ["/news/a-post", "title", ON_PURPOSE.noTitle],
      ["/news/a-post", "og:image:alt", ON_PURPOSE.sharingAlt],
      ["/news/fund-fiesta-is-here-", "redirect", ON_PURPOSE.cleanNewsAddress],
    ],
  );
  assert.equal(result.sitemapExpected, 4);
});

test("status, title, description, noindex and a lost sharing image are differences", () => {
  const { inventory, observed } = fixture();
  observed.pages["/jobs"] = { ...observed.pages["/jobs"], title: "Jobs", description: "Other.", noindex: true, sharing: sharing(false, false) };
  observed.pages["/"] = { status: 404, location: null };
  const fields = compareInventory(inventory, observed).differences.map((d) => `${d.path} ${d.field}`);
  assert.deepEqual(fields, ["/ status", "/jobs title", "/jobs description", "/jobs noindex", "/jobs og:image", "/jobs og:image:alt", "/jobs sitemap"]);
});

test("whitespace does not count; a NOTITLE page without a named title does", () => {
  const { inventory, observed } = fixture();
  observed.pages["/jobs"].title = "  /jobs  | Marianna's\nFundraisers ";
  observed.pages["/news/a-post"].title = "Marianna's Fundraisers";
  const differences = compareInventory(inventory, observed).differences;
  assert.deepEqual(differences.map((d) => `${d.path} ${d.field}`), ["/news/a-post title"]);
});

test("sitemap membership compares by value both ways", () => {
  const { inventory, observed } = fixture();
  // /jobs is missing, /ingredients-list is noindex (the old sitemap listing
  // it is no reason to keep it), and /extra was never on the old site.
  observed.sitemap = ["/", "/news/a-post", "/news/fund-fiesta-is-here", "/ingredients-list", "/extra"];
  const differences = compareInventory(inventory, observed).differences;
  assert.deepEqual(
    differences.map((d) => [d.path, d.field, d.old, d.new]),
    [
      ["/jobs", "sitemap", true, false],
      ["/ingredients-list", "sitemap", "left out: noindex (spec decision 19)", true],
      ["/extra", "sitemap", false, true],
    ],
  );
});

test("a malformed address that does not redirect to its clean one is a difference", () => {
  const { inventory, observed } = fixture();
  observed.pages["/news/fund-fiesta-is-here-"] = { status: 200, location: null, title: "x" };
  const differences = compareInventory(inventory, observed).differences;
  assert.deepEqual(differences.map((d) => `${d.path} ${d.field}`), ["/news/fund-fiesta-is-here- redirect"]);
});

test("a redirect compares by permanence and target, not by 301 or 308", () => {
  const { inventory, observed } = fixture();
  assert.deepEqual(compareInventory(inventory, observed).differences, []);
  observed.redirects["/testimonials"] = { status: 302, location: "/success-stories" };
  observed.redirects["/privacy-policy"] = { status: 404, location: null };
  const differences = compareInventory(inventory, observed).differences;
  assert.deepEqual(differences.map((d) => [d.path, d.new]), [["/testimonials", "302 /success-stories"], ["/privacy-policy", "404"]]);
});

test("a Location header becomes a path on the new site, or stays an outside URL", () => {
  assert.equal(locationOf("/jobs/", "http://localhost:3460"), "/jobs");
  assert.equal(locationOf("http://localhost:3460/news/a-post", "http://localhost:3460"), "/news/a-post");
  assert.equal(locationOf("https://www.iubenda.com/privacy-policy/1", "http://localhost:3460"), "https://www.iubenda.com/privacy-policy/1");
  assert.equal(locationOf(null, "http://localhost:3460"), null);
});

test("the head of a new page reads like the old inventory", () => {
  const head = parseHead(
    `<html><head><title>Jobs | Marianna&#x27;s Fundraisers</title><meta name="robots" content="noindex"/><meta property="og:image" content="https://x/a.png"/></head><body></body></html>`,
  );
  assert.equal(head.title, "Jobs | Marianna's Fundraisers");
  assert.equal(head.noindex, true);
  assert.equal(head.description, null);
  assert.equal(head.sharing["og:image"], true);
  assert.equal(head.sharing["og:image:alt"], false);
});

test("the arguments name the origin and, optionally, the report", () => {
  assert.deepEqual(parseArguments(["http://localhost:3460/"]), { origin: "http://localhost:3460", report: "parity-report", preview: false });
  assert.deepEqual(parseArguments(["https://preview.vercel.app", "--report", "parity-report-vercel", "--preview"]), { origin: "https://preview.vercel.app", report: "parity-report-vercel", preview: true });
  assert.throws(() => parseArguments([]), /Usage/);
  assert.throws(() => parseArguments(["https://a.test", "--report"]), /--report needs a name/);
  assert.throws(() => parseArguments(["https://a.test", "--report", "--preview"]), /--report needs a name/);
  assert.throws(() => parseArguments(["https://a.test", "--report", "../elsewhere"]), /--report needs a name/);
  assert.throws(() => parseArguments(["https://a.test", "https://b.test"]), /Unexpected argument/);
});

test("a preview cookie is sent only when PARITY_COOKIE is set", () => {
  assert.equal(requestHeaders({}).cookie, undefined);
  assert.equal(requestHeaders({ PARITY_COOKIE: "  " }).cookie, undefined);
  assert.equal(requestHeaders({ PARITY_COOKIE: "_vercel_jwt=abc" }).cookie, "_vercel_jwt=abc");
});

test("on a preview, every page is noindex on purpose and the sitemap follows the old site", () => {
  const { inventory, observed } = fixture();
  for (const page of Object.values(observed.pages)) if (page.status === 200) page.noindex = true;
  const without = compareInventory(inventory, observed).differences.map((d) => `${d.path} ${d.field}`);
  assert.ok(without.includes("/jobs noindex") && without.includes("/jobs sitemap"));

  const result = compareInventory(inventory, observed, { preview: true });
  assert.deepEqual(result.differences, []);
  assert.deepEqual(
    result.onPurpose.filter((d) => d.why === ON_PURPOSE.previewNoindex).map((d) => d.path),
    ["/", "/jobs", "/news/a-post", "/news/fund-fiesta-is-here"],
  );
  assert.equal(result.sitemapExpected, 4);

  // A real difference still shows on a preview.
  observed.sitemap = observed.sitemap.filter((entry) => entry !== "/jobs");
  observed.pages["/"].title = "Other";
  assert.deepEqual(
    compareInventory(inventory, observed, { preview: true }).differences.map((d) => `${d.path} ${d.field}`),
    ["/ title", "/jobs sitemap"],
  );
});
