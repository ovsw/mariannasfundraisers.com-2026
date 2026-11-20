// The site shell's import (ticket #14): settings, navigation and footer built
// from the reference capture's seed file, with the fixture stories as the
// pages that links resolve to. A second run writes nothing.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderNavigationIconSvgs } from "../lib/navigation-icon-svg.mjs";
import { readSecret } from "../lib/read-secret.mjs";
import { keyFrom, logoUrl, NAVIGATION_ICONS, navigationIconNames, siteShellDocuments } from "./site-shell.mjs";
import { createSite, planImport } from "./transform.mjs";
import { writeDocuments } from "./write.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
const seed = read("../../../docs/migration/seed/hard-coded-content.json");
const stories = read("./fixtures/stories.json");

const fileRef = (url, kind) => `${kind}-${url.split("/").pop()}`;
const iconSvg = (name) => `<svg data-icon="${name}"></svg>`;
const GA = "G-TEST123456";

function build(options = {}) {
  const missing = [];
  const documents = siteShellDocuments(seed, {
    site: createSite(stories),
    fileRef,
    iconSvg,
    gaMeasurementId: GA,
    missingPath: (path, label) => missing.push({ path, label }),
    ...options,
  });
  const [settings, navigation, footer] = documents;
  return { documents, settings, navigation, footer, missing };
}

function allKeyed(value, visit, path = "") {
  if (Array.isArray(value)) {
    visit(value, path);
    value.forEach((item, index) => allKeyed(item, visit, `${path}[${index}]`));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) allKeyed(child, visit, `${path}.${key}`);
  }
}

test("the shell is the three global documents at their singleton IDs", () => {
  const { documents } = build();
  assert.deepEqual(documents.map((d) => [d._id, d._type]), [
    ["settings", "settings"],
    ["navigation", "navigation"],
    ["footer", "footer"],
  ]);
});

test("settings hold the site name, logos, contact details, social links and the measurement ID", () => {
  const { settings } = build();
  assert.equal(settings.siteName, "Marianna's Fundraisers");
  assert.equal(settings.logo.light.asset._ref, "image-mariannas-fundraisers_2022_alt_wordmark.png");
  assert.equal(settings.logo.dark.asset._ref, "image-mariannas-fundraisers_2022_alt_white_wordmark.png");
  assert.match(logoUrl(seed, seed.settings.logos.header.oldFile), /^https:\/\/raw\.githubusercontent\.com\/ovsw\/mfr-web-next2\/[0-9a-f]{40}\/public\/images\//);
  assert.deepEqual(settings.contact, {
    _type: "contactDetails",
    email: "mariannas@delgrossos.com",
    phone: "1-814-684-2666",
    addressLines: ["627 Sauce Factory Drive", "PO Box 332, Tipton, PA 16684"],
  });
  // The four links that went nowhere (#) are not carried over.
  assert.deepEqual(settings.socialLinks.map((link) => link.label), ["Facebook", "YouTube"]);
  assert.equal(settings.googleAnalyticsMeasurementId, GA);
});

test("without a measurement ID the field is left out", () => {
  for (const gaMeasurementId of [null, "", "  "]) {
    assert.equal("googleAnalyticsMeasurementId" in build({ gaMeasurementId }).settings, false);
  }
});

test("navigation holds the three dropdowns with descriptions, the two links and one action", () => {
  const { navigation } = build();
  assert.deepEqual(
    navigation.items.map((item) => [item._type, item.label]),
    [
      ["navigationGroup", "Fundraisers"],
      ["navigationLink", "Menu"],
      ["navigationGroup", "About Us"],
      ["navigationGroup", "Selling Tools"],
      ["navigationLink", "Contact Us"],
    ],
  );
  const groups = navigation.items.filter((item) => item._type === "navigationGroup");
  assert.ok(groups.every((group) => group.description?.length > 20));
  assert.deepEqual(groups.map((group) => group.links.length), [8, 8, 7]);
  // A commented-out link of the old menu stays out.
  assert.equal(groups[0].links.some((link) => link.label === "Special Fundraising Events"), false);
  for (const link of groups.flatMap((group) => group.links)) {
    assert.ok(link.description, `${link.label} keeps its description`);
    assert.equal(link.icon.svg, iconSvg(link.icon.name));
  }
  assert.deepEqual(navigation.actions.map((action) => action.label), ["Submit Order"]);
});

test("links to an imported page are references; other targets stay URLs", () => {
  const { navigation, footer, missing } = build();
  const howItWorks = navigation.items[0].links.find((link) => link.label === "How it Works");
  assert.equal(howItWorks.destination.kind, "internal");
  assert.match(howItWorks.destination.internal._ref, /^page-/);
  const contact = navigation.items.find((item) => item.label === "Contact Us");
  assert.equal(contact.destination.kind, "internal");

  const company = footer.columns.find((column) => column.heading === "Company");
  const news = company.links.find((link) => link.label === "News & Events");
  // The old footer's stale /blog/ link points at /news.
  assert.deepEqual(news.destination, { _type: "footerDestination", openInNewTab: false, kind: "external", external: "/news" });
  const privacy = footer.legalLinks.find((link) => link.label === "Privacy Policy");
  assert.equal(privacy.destination.external, "https://www.iubenda.com/privacy-policy/52141374");
  // The fixtures hold only a few pages; every other site path is reported.
  assert.ok(missing.some(({ path }) => path === "/pricing-info"));
  assert.equal(missing.some(({ path }) => path === "/how-it-works"), false);
});

test("the footer holds its columns, legal links, button, parent company and copyright", () => {
  const { footer } = build();
  assert.equal(footer.intro, "The Fundraiser that Sells Itself");
  assert.deepEqual(
    footer.columns.map((column) => [column.heading, column.links.map((link) => link.label)]),
    [
      ["Fundraisers", ["How it Works", "Benefits", "Menu", "Schedule Free Tasting"]],
      ["Support", ["Pricing Info", "Resources", "Get Assistance", "Contact"]],
      ["Company", ["Hoagie Heroes", "Our Story", "News & Events", "Jobs"]],
    ],
  );
  assert.equal(footer.legalLinks.length, 5);
  assert.equal(footer.action.label, "Submit Order");
  assert.ok(footer.affiliation.text.includes(footer.affiliation.link.label));
  assert.equal(footer.copyrightOwner, "DelGrosso Foods, Inc.");
  assert.equal(footer.copyrightStartYear, 2022);
});

test("every array member has a key that is unique in its array and stable across runs", () => {
  const first = build().documents;
  allKeyed(first, (array, path) => {
    if (!path) return; // the list of documents itself
    const objects = array.filter((item) => item && typeof item === "object");
    if (!objects.length) return;
    const keys = objects.map((item) => item._key);
    assert.ok(keys.every(Boolean), `${path} members have keys`);
    assert.equal(new Set(keys).size, keys.length, `${path} keys are unique`);
  });
  assert.deepEqual(build().documents, first);
  assert.equal(keyFrom("News & Events"), "news-and-events");
});

test("every old menu icon maps to a Lucide icon the picker renders", async () => {
  const names = navigationIconNames(seed);
  assert.ok(names.length > 10);
  assert.ok(names.every((name) => Object.values(NAVIGATION_ICONS).includes(name)));
  const svgs = await renderNavigationIconSvgs(names);
  for (const name of names) assert.match(svgs.get(name), /^<svg [^>]*aria-hidden="true"/);
});

test("the import plan carries the shell and its logo files, and reports a missing measurement ID", () => {
  const plan = planImport({ stories }, { fileRef, seed, iconSvg });
  assert.deepEqual(
    plan.documents.filter((d) => ["settings", "navigation", "footer"].includes(d._id)).map((d) => d._id),
    ["settings", "navigation", "footer"],
  );
  assert.equal(plan.report.documents.settings, 1);
  assert.ok([...plan.files.keys()].some((url) => url.endsWith("alt_white_wordmark.png")));
  assert.ok(plan.report.needsHand.some((item) => /MFR_GA_MEASUREMENT_ID/.test(item.issue)));
  assert.equal(planImport({ stories }, { fileRef }).documents.some((d) => d._id === "settings"), false);
});

test("a second import writes nothing in settings, navigation and footer", async () => {
  const stored = new Map();
  const client = {
    async fetch(query, { ids }) {
      if (query.includes("]._id")) return [];
      return ids.filter((id) => stored.has(id)).map((id) => ({ ...structuredClone(stored.get(id)), _rev: "r", _updatedAt: "now" }));
    },
    transaction() {
      const pending = [];
      const transaction = {
        createOrReplace(document) {
          pending.push(document);
          return transaction;
        },
        async commit() {
          for (const document of pending) stored.set(document._id, structuredClone(document));
        },
      };
      return transaction;
    },
  };
  const first = await writeDocuments(client, build().documents);
  assert.deepEqual(first.created, ["settings", "navigation", "footer"]);
  const second = await writeDocuments(client, build().documents);
  assert.deepEqual(second.changed, []);
  assert.deepEqual(second.created, []);
  assert.deepEqual(second.unchanged, ["settings", "navigation", "footer"]);
});

test("a secret is read from the shell first, then from env files", () => {
  assert.equal(readSecret("MFR_TEST_SECRET", { MFR_TEST_SECRET: "from-shell" }, []), "from-shell");
  assert.equal(readSecret("MFR_TEST_SECRET", {}, []), null);
});
