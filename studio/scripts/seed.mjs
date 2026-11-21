#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { createClient } from "@sanity/client";

const directory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(directory, "..", "..");

function parseEnvValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const name = trimmed.slice(0, separator).trim();
    if (process.env[name] !== undefined) continue;
    process.env[name] = parseEnvValue(trimmed.slice(separator + 1));
  }
}

loadEnvFile(path.join(rootDirectory, "studio", ".env.local"));

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID;
const DATASET = process.env.SANITY_STUDIO_DATASET;
const API_VERSION = process.env.SANITY_STUDIO_API_VERSION || "2026-03-23";
const TOKEN = process.env.SANITY_AUTH_TOKEN;

export const STARTER_SEED = {
  name: "next-sanity-starter",
  version: 1,
};

// Asset IDs derive from the bundled bytes, not from any project's dataset.
export const STARTER_ASSETS = ["landscape", "square", "avatar"].map((name) => {
  const buffer = readFileSync(
    path.join(directory, "seed-assets", `${name}.png`),
  );
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return {
    name,
    buffer,
    id: `image-${createHash("sha1").update(buffer).digest("hex")}-${width}x${height}-png`,
  };
});
export const STARTER_IMAGE_ASSET_ID = STARTER_ASSETS[0].id;
const placeholder = (name) => ({
  _type: "image",
  alt: "Neutral placeholder image.",
  asset: {
    _type: "reference",
    _ref: STARTER_ASSETS.find((asset) => asset.name === name).id,
  },
});
const imageRef = placeholder("landscape");

const ref = (_ref) => ({ _type: "reference", _ref });
const slug = (current) => ({ _type: "slug", current });
const block = (key, text, style = "normal") => ({
  _key: key,
  _type: "block",
  children: [{ _key: `${key}-span`, _type: "span", marks: [], text }],
  markDefs: [],
  style,
});
const simpleText = (key, text) => [block(key, text)];
const internalUrl = (_ref) => ({
  _type: "customUrl",
  type: "internal",
  internal: ref(_ref),
  openInNewTab: false,
});
const button = (key, text, _ref) => ({
  _key: key,
  _type: "button",
  text,
  url: internalUrl(_ref),
  colour: "accent",
  icon: "chevron-right",
});
const meta = (title, description) => ({
  title,
  description,
  noindex: false,
  image: imageRef,
});

export const STARTER_DOCUMENT_TYPES = new Map([
  ["settings", "settings"],
  ["navigation", "navigation"],
  ["footer", "footer"],
  ["homePage", "homePage"],
  ["blogIndex", "blogIndex"],
  ["blogPostSettings", "blogPostSettings"],
  ["starter-page-about", "page"],
  ["starter-author-editor", "author"],
  ["starter-post-field-guide", "post"],
  ["starter-faq-getting-started", "faq"],
  ["starter-team-member-editor", "teamMember"],
  ["starter-testimonial-reader", "testimonial"],
  ["productPageSettings", "productPageSettings"],
  ["starter-product-hoagie", "product"],
  ["starter-product-pizza", "product"],
  ["starter-product-salsa", "product"],
]);

// Seed documents of types this site no longer has. Older seeds created them,
// so unseed still removes them when they carry the seed marker.
export const LEGACY_STARTER_DOCUMENT_TYPES = new Map([
  ["starter-category-notes", "category"],
]);

const marker = {
  _starterSeed: STARTER_SEED,
};

/** A product of each kind (spec decision 8), every field filled. */
const nutritionValues = Object.fromEntries(
  [
    "calories", "totalFat", "totalFatDailyValue", "saturatedFat", "saturatedFatDailyValue",
    "transFat", "cholesterol", "cholesterolDailyValue", "sodium", "sodiumDailyValue",
    "totalCarbohydrates", "totalCarbohydratesDailyValue", "dietaryFiber", "dietaryFiberDailyValue",
    "totalSugars", "addedSugars", "addedSugarsDailyValue", "protein", "vitaminD",
    "vitaminDDailyValue", "calcium", "calciumDailyValue", "iron", "ironDailyValue",
    "potassium", "potassiumDailyValue",
  ].map((field, index) => [field, index]),
);
const starterProduct = (kind, name) => ({
  _id: `starter-product-${kind}`,
  _type: "product",
  ...marker,
  name: `Example ${name}`,
  kind,
  slug: slug(`example-${kind}`),
  heroTitle: `Example ${name}`,
  heroText: simpleText(`starter-product-${kind}-hero`, `A neutral ${kind} used to test the product page.`),
  heroImage: { ...placeholder("landscape"), alt: `An example ${kind}.` },
  ingredientsLabel: "Always Fresh",
  ingredientsText: simpleText(`starter-product-${kind}-ingredients`, "Example ingredient, another ingredient."),
  ingredientsImage: { ...placeholder("square"), alt: `The example ${kind} badge.` },
  ...(kind === "pizza"
    ? { note: simpleText("starter-product-pizza-note", "Please note: keep refrigerated.") }
    : {}),
  nutritionFacts: {
    _type: "nutritionFacts",
    servingText: simpleText(`starter-product-${kind}-serving`, "Servings per container: 4"),
    ...nutritionValues,
  },
  menuCard: {
    _type: "productMenuCard",
    shortName: "Example",
    shortDescription: `A short description of the example ${kind}.`,
    image: { ...placeholder("landscape"), alt: `The example ${kind} on its menu card.` },
    ...(kind === "hoagie" ? { dressing: "italian" } : {}),
  },
  meta: meta(`Example ${name}`, `Example metadata for a seeded ${kind}.`),
});

// A button stored on its own, not in an array, has no _key.
const withoutKey = ({ _key, ...value }) => value;
const kindLinks = (kind, menuRef) => ({
  _type: "productKindLinks",
  heroButtons: [
    button(`starter-${kind}-more`, "more selections", menuRef),
    button(`starter-${kind}-pricing`, "Pricing Info", menuRef),
  ],
  ...(kind === "salsa"
    ? {}
    : { ingredientsListButton: withoutKey(button(`starter-${kind}-ingredients`, "full ingredients list", menuRef)) }),
});

export const starterDocuments = [
  {
    _id: "settings",
    _type: "settings",
    ...marker,
    siteName: "Starter Example",
    contact: {
      _type: "contactDetails",
      email: "hello@example.com",
      phone: "+1 555 0100",
      addressLines: ["123 Example Street", "Sample City"],
    },
    socialLinks: [
      {
        _key: "starter-social",
        _type: "socialLink",
        label: "LinkedIn",
        url: "https://example.com",
      },
    ],
  },
  {
    _id: "starter-author-editor",
    _type: "author",
    ...marker,
    name: "Example Editor",
    slug: slug("example-editor"),
    image: placeholder("avatar"),
  },
  {
    _id: "starter-faq-getting-started",
    _type: "faq",
    ...marker,
    title: "What should this sample content prove?",
    body: simpleText(
      "starter-faq-body",
      "It proves that reusable FAQ entries can be selected and rendered.",
    ),
  },
  {
    _id: "starter-team-member-editor",
    _type: "teamMember",
    ...marker,
    name: "Morgan Example",
    role: "Content Editor",
    email: "morgan@example.com",
    phone: "+1 555 0101",
    image: placeholder("avatar"),
    bio: simpleText(
      "starter-team-bio",
      "Morgan is a neutral profile used to test team sections.",
    ),
    sortOrder: 1,
  },
  {
    _id: "starter-testimonial-reader",
    _type: "testimonial",
    ...marker,
    name: "Example Reader",
    title: "Seed content reviewer",
    image: placeholder("avatar"),
    body: simpleText(
      "starter-testimonial-body",
      "The sample content made every editing surface easy to find.",
    ),
    rating: 5,
  },
  starterProduct("hoagie", "Hoagie"),
  starterProduct("pizza", "Pizza"),
  starterProduct("salsa", "Salsa"),
  {
    _id: "productPageSettings",
    _type: "productPageSettings",
    ...marker,
    handmade: {
      _type: "productHandmadeBlock",
      eyebrow: "Handmade Food That",
      title: "We'd Love to Eat",
      richText: simpleText("starter-handmade-copy", "This tests the shared Handmade food block."),
      buttons: [button("starter-handmade-button", "Our Kitchens", "starter-page-about")],
      image: { ...placeholder("landscape"), alt: "Two kitchen staff in front of a truck." },
    },
    callToAction: {
      _type: "productCallToAction",
      title: "Preparing a Fundraiser?",
      richText: simpleText("starter-cta-copy", "This tests the shared call to action."),
      buttons: [button("starter-cta-button", "Helpful Video Guides", "starter-page-about")],
      image: { ...placeholder("square"), alt: "" },
    },
    hoagie: kindLinks("hoagie", "starter-page-about"),
    pizza: kindLinks("pizza", "starter-page-about"),
    salsa: kindLinks("salsa", "starter-page-about"),
  },
  {
    _id: "starter-page-about",
    _type: "page",
    ...marker,
    title: "About",
    description: "A neutral page used to test routed page rendering.",
    slug: slug("about"),
    blocks: [
      {
        _key: "starter-page-banner",
        _type: "pageBanner",
        theme: "shaded",
        image: { ...imageRef, alt: "Neutral placeholder image." },
      },
      {
        _key: "starter-page-heading",
        _type: "pageHeading",
        theme: "shaded",
        title: "About",
        intro: simpleText(
          "starter-page-heading-intro",
          "A neutral page used to test routed page rendering.",
        ),
      },
      {
        _key: "starter-page-rich-text",
        _type: "richTextBlock",
        theme: "light",
        eyebrow: "Page",
        title: "A normal routed page",
        richText: [
          block(
            "starter-page-copy",
            "This page proves normal page routing and rich text rendering.",
          ),
          {
            _key: "starter-page-table",
            _type: "table",
            title: "Simple comparison",
            rows: [
              {
                _key: "starter-table-row-1",
                _type: "tableRow",
                cells: ["Field", "Purpose"],
              },
              {
                _key: "starter-table-row-2",
                _type: "tableRow",
                cells: ["Slug", "/about/"],
              },
            ],
          },
          {
            _key: "starter-page-callout",
            _type: "callout",
            title: "Callout",
            body: "This tests the callout object.",
          },
        ],
      },
      // The image-and-text family: one of each design.
      ...[
        ["photoLeftAndText", "shaded", "landscape"],
        ["photoRightAndText", "shaded", "landscape"],
        ["boxedPhotoLeftAndText", "light", "landscape"],
        ["boxedPhotoRightAndText", "light", "landscape"],
        ["cutoutLeftAndText", "light", "square"],
        ["cutoutRightAndText", "light", "square"],
        ["badgeAndText", "shaded", "square"],
        ["videoLeftAndText", "light", "landscape"],
        ["videoRightAndText", "light", "landscape"],
        ["boxedVideoLeftAndText", "light", "landscape"],
        ["boxedVideoRightAndText", "light", "landscape"],
      ].map(([type, theme, image]) => ({
        _key: `starter-page-${type}`,
        _type: type,
        theme,
        eyebrow: "Image and text",
        title: `A ${type.replace(/([A-Z])/g, " $1").toLowerCase()} section`,
        richText: simpleText(
          `starter-page-${type}-copy`,
          "This tests one design of the image-and-text family.",
        ),
        ...(/^(boxedV|v)ideo/.test(type)
          ? { youTubeUrl: "https://youtu.be/Uil1c8p_jV0" }
          : {}),
        buttons: [
          button(`starter-page-${type}-button`, "Read more", "starter-page-about"),
        ],
        image: placeholder(image),
      })),
      // The three menus, each listing the seeded product of its kind.
      ...[
        ["hoagieMenu", "hoagie", "shaded"],
        ["pizzaMenu", "pizza", "light"],
        ["salsaMenu", "salsa", "shaded"],
      ].map(([type, kind, theme]) => ({
        _key: `starter-page-${type}`,
        _type: type,
        theme,
        products: [{ _key: `starter-${kind}`, ...ref(`starter-product-${kind}`) }],
      })),
      {
        _key: "starter-page-imageAndIconList",
        _type: "imageAndIconList",
        theme: "shaded",
        image: placeholder("square"),
        items: [
          ["phone-ringing", "Call us"],
          ["documents", "Send the forms"],
          ["envelope", "Receive the order forms"],
        ].map(([icon, heading], index) => ({
          _key: `starter-icon-list-item-${index + 1}`,
          _type: "iconListItem",
          icon,
          heading,
          text: simpleText(
            `starter-icon-list-item-${index + 1}-text`,
            "This tests one item of the icon list.",
          ),
        })),
      },
      {
        _key: "starter-page-twoTextColumns",
        _type: "twoTextColumns",
        theme: "shaded",
        leftText: simpleText(
          "starter-page-two-text-columns-left",
          "This tests the left text of two text columns.",
        ),
        rightText: simpleText(
          "starter-page-two-text-columns-right",
          "This tests the right text of two text columns.",
        ),
      },
      {
        _key: "starter-page-faqList",
        _type: "faqList",
        theme: "light",
        title: "Questions",
        faqs: [
          {
            _key: "starter-page-faq-getting-started",
            _type: "reference",
            _ref: "starter-faq-getting-started",
          },
        ],
      },
      {
        _key: "starter-page-cognitoForm",
        _type: "cognitoForm",
        theme: "shaded",
        formId: "114",
        title: "Contact form",
        intro: simpleText(
          "starter-page-cognito-form-intro",
          "This tests the introduction above a Cognito form.",
        ),
      },
      {
        _key: "starter-page-cognitoFormAndText",
        _type: "cognitoFormAndText",
        theme: "light",
        formId: "114",
        title: "Contact form beside text",
        richText: simpleText(
          "starter-page-cognito-form-and-text",
          "This tests the text beside a Cognito form.",
        ),
      },
      {
        _key: "starter-page-steps",
        _type: "steps",
        theme: "light",
        items: ["First", "Second", "Third"].map((title) => ({
          _key: `starter-page-step-${title.toLowerCase()}`,
          _type: "stepItem",
          image: placeholder("square"),
          title: `${title} step`,
          text: simpleText(
            `starter-page-step-${title.toLowerCase()}-copy`,
            "This tests the text of one step.",
          ),
        })),
      },
      {
        _key: "starter-page-testimonials",
        _type: "testimonials",
        theme: "muslin",
        eyebrow: "Quotes from our",
        title: "Readers",
        image: placeholder("square"),
        testimonials: [
          {
            _key: "starter-page-testimonial-reader",
            _type: "reference",
            _ref: "starter-testimonial-reader",
          },
        ],
      },
      {
        _key: "starter-page-callToActionWithImage",
        _type: "callToActionWithImage",
        theme: "shaded",
        title: "This tests the closing call to action.",
        richText: simpleText(
          "starter-page-call-to-action-copy",
          "A line of text under the heading.",
        ),
        buttons: [
          button("starter-page-call-to-action-button", "Contact us", "starter-page-about"),
        ],
        image: placeholder("square"),
      },
    ],
    // A replaced Scaffold lives here. The Website never renders this array.
    blocksArchive: [
      {
        _key: "starter-page-archived-scaffold",
        _type: "scaffold",
        name: "About page intro",
        proposedSectionShape: "Short intro with an eyebrow and one paragraph.",
        richText: simpleText(
          "starter-page-archived-copy",
          "This Scaffold was replaced by the rich text section above. It must not appear on the page.",
        ),
      },
    ],
    meta: meta(
      "About | Starter Example",
      "Example metadata for a normal seeded page.",
    ),
  },
  {
    _id: "starter-post-field-guide",
    _type: "post",
    ...marker,
    title: "Starter Field Guide",
    slug: slug("starter-field-guide"),
    excerpt: simpleText(
      "starter-post-excerpt",
      "A short neutral post that tests article lists, sidebars, and structured data.",
    ),
    author: ref("starter-author-editor"),
    publishedAt: "2026-01-15T12:00:00.000Z",
    image: { ...imageRef, caption: "Neutral placeholder image." },
    readingTime: 1,
    blocks: [
      {
        _key: "starter-post-rich-text",
        _type: "richTextBlock",
        theme: "light",
        richText: [
          block(
            "starter-post-intro",
            "This article proves news post rendering, author metadata, and the sidebar.",
          ),
          block("starter-post-heading", "What it covers", "h2"),
          block(
            "starter-post-body",
            "It is intentionally short so it can be deleted once real project content exists.",
          ),
        ],
      },
    ],
    meta: meta(
      "Starter Field Guide | Starter Example",
      "Example metadata for a seeded blog post.",
    ),
  },
  {
    _id: "blogPostSettings",
    _type: "blogPostSettings",
    ...marker,
    title: "Need a next step?",
    description:
      "Use this shared panel to point readers toward a relevant action.",
    actions: [
      {
        _key: "starter-sidebar-action",
        _type: "blogPostSidebarAction",
        title: "Explore the sample page",
        description: "Confirms internal links from the blog sidebar.",
        button: {
          _type: "button",
          text: "Open About",
          url: internalUrl("starter-page-about"),
        },
      },
    ],
  },
  {
    _id: "blogIndex",
    _type: "blogIndex",
    ...marker,
    title: "News",
    description: "Example articles for testing the news list.",
    blocks: [],
    meta: meta(
      "News | Starter Example",
      "Example metadata for the seeded News index.",
    ),
  },
  {
    _id: "homePage",
    _type: "homePage",
    ...marker,
    title: "Starter Example",
    description: "Neutral content that proves the retained Starter model.",
    blocks: [
      {
        _key: "starter-home-intro",
        _type: "richTextBlock",
        theme: "light",
        eyebrow: "Starter seed",
        title: "Neutral sample content for a clean project.",
        richText: simpleText(
          "starter-home-intro-copy",
          "Use this optional seed to inspect the editing model, then remove it before adding real content.",
        ),
      },
      {
        _key: "starter-home-seam",
        _type: "richTextBlock",
        theme: "light",
        title: "Matching themes join at a seam.",
        richText: simpleText(
          "starter-home-seam-copy",
          "This section shares the Light theme above it, so each side contributes half its padding.",
        ),
      },
      {
        _key: "starter-home-edge",
        _type: "richTextBlock",
        theme: "shaded",
        title: "A different theme forms an edge.",
        richText: simpleText(
          "starter-home-edge-copy",
          "This Shaded section keeps full padding on both sides of the join and paints a brushed edge across it.",
        ),
      },
      {
        _key: "starter-home-scaffold",
        _type: "scaffold",
        name: "Reader quotes",
        proposedSectionShape:
          "Two or three short quotes with the reader's name and role.",
        richText: simpleText(
          "starter-home-scaffold-copy",
          "The sample content made every editing surface easy to find. Example Reader, seed content reviewer.",
        ),
      },
    ],
    meta: meta(
      "Starter Example | Starter Example",
      "Neutral Starter seed content for testing page rendering and metadata.",
    ),
  },
  {
    _id: "navigation",
    _type: "navigation",
    ...marker,
    items: [
      {
        _key: "starter-nav-home",
        _type: "navigationLink",
        label: "Home",
        destination: {
          _type: "navigationDestination",
          kind: "internal",
          internal: ref("homePage"),
          openInNewTab: false,
        },
      },
      {
        _key: "starter-nav-about",
        _type: "navigationLink",
        label: "About",
        destination: {
          _type: "navigationDestination",
          kind: "internal",
          internal: ref("starter-page-about"),
          openInNewTab: false,
        },
      },
      {
        _key: "starter-nav-resources",
        _type: "navigationGroup",
        label: "Resources",
        links: [
          {
            _key: "starter-nav-blog",
            _type: "navigationChildLink",
            label: "News",
            description: "Article index",
            destination: {
              _type: "navigationDestination",
              kind: "internal",
              internal: ref("blogIndex"),
              openInNewTab: false,
            },
          },
        ],
      },
    ],
    actions: [
      {
        _key: "starter-nav-action",
        _type: "navigationAction",
        label: "Read guide",
        destination: {
          _type: "navigationDestination",
          kind: "internal",
          internal: ref("starter-post-field-guide"),
          openInNewTab: false,
        },
      },
    ],
  },
  {
    _id: "footer",
    _type: "footer",
    ...marker,
    intro: "Neutral footer copy for the optional Starter seed.",
    columns: [
      {
        _key: "starter-footer-main",
        _type: "footerColumn",
        heading: "Content",
        links: [
          {
            _key: "starter-footer-home",
            _type: "footerLink",
            label: "Home",
            destination: {
              _type: "footerDestination",
              kind: "internal",
              internal: ref("homePage"),
              openInNewTab: false,
            },
          },
          {
            _key: "starter-footer-blog",
            _type: "footerLink",
            label: "News",
            destination: {
              _type: "footerDestination",
              kind: "internal",
              internal: ref("blogIndex"),
              openInNewTab: false,
            },
          },
        ],
      },
    ],
    legalLinks: [],
    copyrightStartYear: 2026,
    copyrightOwner: "Starter Example",
  },
];

function requireEnv(name, value) {
  if (!value?.trim()) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function createSanitySeedClient() {
  return createClient({
    projectId: requireEnv("SANITY_STUDIO_PROJECT_ID", PROJECT_ID),
    dataset: requireEnv("SANITY_STUDIO_DATASET", DATASET),
    apiVersion: API_VERSION,
    token: requireEnv("SANITY_AUTH_TOKEN", TOKEN),
    useCdn: false,
  });
}

async function assertDatasetIsEmpty(client) {
  const count = await client.fetch('count(*[!(_id in path("_.**"))])');
  if (count !== 0) {
    throw new Error(
      `Seed refused: destination dataset is not empty (${count} documents found).`,
    );
  }
}

function assertOwnedDocument(document) {
  const expectedType =
    STARTER_DOCUMENT_TYPES.get(document?._id) ??
    LEGACY_STARTER_DOCUMENT_TYPES.get(document?._id);
  if (!expectedType || document._type !== expectedType) return false;
  return (
    document._starterSeed?.name === STARTER_SEED.name &&
    document._starterSeed?.version === STARTER_SEED.version
  );
}

async function getStarterDocuments(client) {
  return client.fetch("*[_id in $ids]{_id,_type,_starterSeed}", {
    ids: [
      ...STARTER_DOCUMENT_TYPES.keys(),
      ...LEGACY_STARTER_DOCUMENT_TYPES.keys(),
    ],
  });
}

async function assertOwnedSeedSet(client) {
  const documents = await getStarterDocuments(client);
  const foundIds = new Set(documents.map((document) => document._id));
  const missing = [...STARTER_DOCUMENT_TYPES.keys()].filter(
    (id) => !foundIds.has(id),
  );
  if (missing.length) {
    throw new Error(
      `Unseed refused: missing Starter seed documents: ${missing.join(", ")}.`,
    );
  }
  const unsafe = documents.filter((document) => !assertOwnedDocument(document));
  if (unsafe.length) {
    throw new Error(
      `Unseed refused: these IDs are not marked as Starter seed content: ${unsafe.map((document) => document._id).join(", ")}.`,
    );
  }
  return documents;
}

export async function seed(client) {
  await assertDatasetIsEmpty(client);
  let serialized = JSON.stringify(starterDocuments);
  const assetIds = [];
  for (const source of STARTER_ASSETS) {
    const asset = await client.assets.upload("image", source.buffer, {
      filename: `starter-${source.name}.png`,
      contentType: "image/png",
    });
    assetIds.push(asset._id);
    serialized = serialized.replaceAll(source.id, asset._id);
  }
  const documents = JSON.parse(serialized);
  let transaction = client.transaction();
  for (const document of documents) {
    transaction = transaction.createIfNotExists(document);
  }
  await transaction.commit();
  return { documents: documents.length, assetIds };
}

export async function unseed(client) {
  const documents = await assertOwnedSeedSet(client);
  const legacyIds = documents
    .map((document) => document._id)
    .filter((id) => LEGACY_STARTER_DOCUMENT_TYPES.has(id));
  // Never delete replacement images uploaded by an editor.
  const assetIds = STARTER_ASSETS.map((asset) => asset.id);
  const documentIds = [...STARTER_DOCUMENT_TYPES.keys(), ...legacyIds];
  let transaction = client.transaction();
  for (const id of [...documentIds, ...assetIds]) {
    transaction = transaction.delete(id);
  }
  await transaction.commit();
  return { documents: documentIds.length, assets: assetIds.length };
}

async function main() {
  const command = process.argv[2] ?? "seed";
  const client = createSanitySeedClient();
  if (command === "seed") {
    const result = await seed(client);
    console.log(`Seeded ${result.documents} Starter documents.`);
    return;
  }
  if (command === "unseed") {
    const result = await unseed(client);
    console.log(
      `Removed ${result.documents} Starter documents and ${result.assets} asset(s).`,
    );
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
