// Runs Studio's own validation on documents, with the Studio's real schema
// types, to check that a Section cannot publish without a field it needs to
// draw. See "A Section never hides silently" in docs/agents/page-builder.md.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const studioUrl = new URL("../../", import.meta.url).href;
const isStudioSource = (url) =>
  url?.startsWith(studioUrl) && !url.includes("/node_modules/");

// The Studio's schema files import without file extensions and import custom
// inputs written in TSX, as the Studio bundler allows. Node needs both
// resolved: try `.ts` and `.tsx`, and compile TSX with TypeScript.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (
        error?.code !== "ERR_MODULE_NOT_FOUND" ||
        !specifier.startsWith(".") ||
        !isStudioSource(context.parentURL)
      ) {
        throw error;
      }
      for (const extension of [".ts", ".tsx"]) {
        try {
          return nextResolve(`${specifier}${extension}`, context);
        } catch {
          // Try the next extension.
        }
      }
      throw error;
    }
  },
  load(url, context, nextLoad) {
    if (!url.endsWith(".tsx") || !isStudioSource(url)) {
      return nextLoad(url, context);
    }
    const source = ts.transpileModule(
      readFileSync(fileURLToPath(url), "utf8"),
      {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText;
    return { format: "module", shortCircuit: true, source };
  },
});

process.env.SANITY_STUDIO_TITLE ??= "Validation test";
const { schemaTypes } = await import("../../schema-types.ts");
const { createSchema, validateDocument } = await import("sanity");

// A test-only document that holds the shared objects and Sections, so each
// one is validated exactly as it is inside a page.
const schema = createSchema({
  name: "required-fields-test",
  types: [
    ...schemaTypes,
    {
      name: "testHost",
      type: "document",
      fields: [
        { name: "button", type: "button" },
        { name: "richTextBlock", type: "richTextBlock" },
        { name: "scaffold", type: "scaffold" },
        { name: "pageHeading", type: "pageHeading" },
        { name: "pageBanner", type: "pageBanner" },
        { name: "photoLeftAndText", type: "photoLeftAndText" },
        { name: "boxedPhotoRightAndText", type: "boxedPhotoRightAndText" },
        { name: "videoRightAndText", type: "videoRightAndText" },
        { name: "boxedVideoLeftAndText", type: "boxedVideoLeftAndText" },
        { name: "imageAndIconList", type: "imageAndIconList" },
        { name: "latestNews", type: "latestNews" },
        { name: "cognitoForm", type: "cognitoForm" },
        { name: "cognitoFormAndText", type: "cognitoFormAndText" },
        { name: "faqList", type: "faqList" },
        { name: "twoTextColumns", type: "twoTextColumns" },
        { name: "hoagieMenu", type: "hoagieMenu" },
        { name: "homeHero", type: "homeHero" },
        { name: "steps", type: "steps" },
        { name: "menuTeaser", type: "menuTeaser" },
        { name: "callToActionWithImage", type: "callToActionWithImage" },
        { name: "testimonials", type: "testimonials" },
        { name: "richText", type: "richTextContent" },
      ],
    },
  ],
});

// Every referenced document exists (getDocumentExists), so no request is made.
const client = {
  config: () => ({}),
  fetch: async () => null,
  withConfig: () => client,
};

/** Error messages by path, for example `{ "button.text": "Add the …" }`. */
async function errors(document) {
  const markers = await validateDocument({
    document: { _id: "drafts.test", ...document },
    // "cli" adds an unknown-fields check that turns object rules into
    // warnings; "studio" validates as the editor sees it.
    environment: "studio",
    getDocumentExists: async () => true,
    workspace: { getClient: () => client, schema },
  });
  return Object.fromEntries(
    markers
      .filter((marker) => marker.level === "error")
      .map((marker) => [
        marker.path
          .map((segment) =>
            typeof segment === "object" ? `[${segment._key}]` : segment,
          )
          .join("."),
        marker.message,
      ]),
  );
}

/** The paths with an error, sorted: Studio reports them in no fixed order. */
async function errorPaths(document) {
  return Object.keys(await errors(document)).sort();
}

const block = (text) => ({
  _key: "block",
  _type: "block",
  children: [{ _key: "span", _type: "span", marks: [], text }],
  markDefs: [],
  style: "normal",
});
const link = {
  _type: "customUrl",
  external: "https://example.com",
  type: "external",
};

test("a button needs visible text and a destination", async () => {
  // An empty URL object also reports its own required `type` field.
  assert.deepEqual(
    await errorPaths({ _type: "testHost", button: { _type: "button" } }),
    ["button.text", "button.url", "button.url.type"],
  );
  assert.match(
    (
      await errors({
        _type: "testHost",
        button: { _type: "button", text: "   ", url: link },
      })
    )["button.text"],
    /Add the button text/,
  );
  assert.deepEqual(
    await errors({
      _type: "testHost",
      button: { _type: "button", text: "Book a visit", url: link },
    }),
    {},
  );
});

test("a rich text Section needs content", async () => {
  for (const richText of [undefined, [], [block("")], [block("   ")]]) {
    const found = await errors({
      _type: "testHost",
      richTextBlock: { _type: "richTextBlock", richText, theme: "light" },
    });
    assert.deepEqual(Object.keys(found), ["richTextBlock.richText"]);
    assert.match(found["richTextBlock.richText"], /Add the content/);
  }
  assert.deepEqual(
    await errors({
      _type: "testHost",
      richTextBlock: {
        _type: "richTextBlock",
        richText: [block("Visible text")],
        theme: "light",
      },
    }),
    {},
  );
  // The renderer draws a heading on its own, so a heading is enough.
  assert.deepEqual(
    await errors({
      _type: "testHost",
      richTextBlock: { _type: "richTextBlock", title: "Our hoagies", theme: "light" },
    }),
    {},
  );
});

test("a Page heading needs its title and a Page banner its photo", async () => {
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      pageHeading: { _type: "pageHeading", title: "  ", theme: "light" },
      pageBanner: { _type: "pageBanner", title: "Contact Us", theme: "light" },
    }),
    ["pageBanner.image", "pageHeading.title"],
  );
});

test("a rich text item needs the field its renderer draws", async () => {
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      richText: [
        { _key: "callout", _type: "callout", body: "  " },
        { _key: "image", _type: "image", alt: "A cabin" },
        { _key: "table", _type: "table", rows: [] },
        {
          _key: "row",
          _type: "table",
          rows: [{ _key: "r", _type: "tableRow", cells: [] }],
        },
      ],
    }),
    [
      "richText.[callout].body",
      "richText.[image]",
      "richText.[row].rows.[r].cells",
      "richText.[table].rows",
    ],
  );
});

test("required text rejects a value of only spaces", async () => {
  const cases = [
    [
      { _type: "testHost", scaffold: { _type: "scaffold", name: " " } },
      "scaffold.name",
    ],
    [{ _type: "faq", title: "  ", body: [block("Yes.")] }, "title"],
    [{ _type: "testimonial", name: "\t", body: [block("Great.")] }, "name"],
    [{ _type: "teamMember", name: "   " }, "name"],
    [{ _type: "author", name: " " }, "name"],
  ];
  for (const [document, path] of cases) {
    assert.ok(path in (await errors(document)), `${document._type} ${path}`);
  }
});

test("an FAQ needs its question and answer", async () => {
  for (const body of [[], [block("")], [block("  ")]]) {
    assert.deepEqual(await errorPaths({ _type: "faq", body }), [
      "body",
      "title",
    ]);
  }
  assert.deepEqual(
    await errors({
      _type: "faq",
      title: "Is parking free?",
      body: [block("Yes.")],
    }),
    {},
  );
});

test("rich text with only a non-text member counts as content", async () => {
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      richTextBlock: {
        _type: "richTextBlock",
        richText: [{ _key: "callout", _type: "callout", body: "Note" }],
        theme: "light",
      },
    }),
    [],
  );
});

const image = { _type: "image", asset: { _type: "reference", _ref: "image-abc-800x600-jpg" } };

test("an image-and-text Section needs its image and a heading or text", async () => {
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      photoLeftAndText: { _type: "photoLeftAndText", theme: "light", richText: [block("  ")] },
    }),
    ["photoLeftAndText.image", "photoLeftAndText.richText"],
  );
  // The renderer draws a heading on its own, so a heading is enough.
  assert.deepEqual(
    await errors({
      _type: "testHost",
      photoLeftAndText: { _type: "photoLeftAndText", theme: "light", title: "Freshest Ingredients", image },
    }),
    {},
  );
  // The boxed photo sections share the same fields and rules.
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      boxedPhotoRightAndText: { _type: "boxedPhotoRightAndText", theme: "light" },
    }),
    ["boxedPhotoRightAndText.image", "boxedPhotoRightAndText.richText"],
  );
});

test("a video Section needs a link to one YouTube video", async () => {
  for (const youTubeUrl of [undefined, "https://vimeo.com/123456", "https://www.youtube.com/channel/abc"]) {
    const found = await errors({
      _type: "testHost",
      videoRightAndText: { _type: "videoRightAndText", theme: "light", title: "How To", image, youTubeUrl },
    });
    assert.deepEqual(Object.keys(found), ["videoRightAndText.youTubeUrl"], String(youTubeUrl));
    assert.match(found["videoRightAndText.youTubeUrl"], /YouTube video/);
  }
  assert.deepEqual(
    await errors({
      _type: "testHost",
      videoRightAndText: {
        _type: "videoRightAndText",
        theme: "light",
        title: "How To",
        image,
        youTubeUrl: "https://youtu.be/Uil1c8p_jV0",
      },
    }),
    {},
  );
  // The boxed video sections share the same fields and rules.
  assert.deepEqual(
    Object.keys(
      await errors({
        _type: "testHost",
        boxedVideoLeftAndText: { _type: "boxedVideoLeftAndText", theme: "light", title: "How To", image },
      }),
    ),
    ["boxedVideoLeftAndText.youTubeUrl"],
  );
});

test("an Image and icon list needs items, each with an icon and a heading, but no heading of its own", async () => {
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      imageAndIconList: { _type: "imageAndIconList", theme: "light", image },
    }),
    ["imageAndIconList.items"],
  );
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      imageAndIconList: {
        _type: "imageAndIconList",
        theme: "light",
        image,
        items: [{ _key: "one", _type: "iconListItem", heading: "  " }],
      },
    }),
    ["imageAndIconList.items.[one].heading", "imageAndIconList.items.[one].icon"],
  );
  assert.deepEqual(
    await errors({
      _type: "testHost",
      imageAndIconList: {
        _type: "imageAndIconList",
        theme: "light",
        image,
        items: [{ _key: "one", _type: "iconListItem", icon: "phone-ringing", heading: "Call Us" }],
      },
    }),
    {},
  );
});

test("a Latest news section needs its title, not an eyebrow", async () => {
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      latestNews: { _type: "latestNews", eyebrow: "Marianna's", title: " ", theme: "light" },
    }),
    ["latestNews.title"],
  );
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      latestNews: { _type: "latestNews", title: "News & Events", theme: "light" },
    }),
    [],
  );
});

test("a news post needs a reading time in whole minutes and takes only post sections", async () => {
  const post = {
    _type: "post",
    title: "Fund Fiesta is Here!",
    slug: { _type: "slug", current: "fund-fiesta-is-here" },
    publishedAt: "2025-07-17T00:00:00.000Z",
  };
  const readingTimeErrors = async (readingTime) =>
    (await errorPaths({ ...post, readingTime })).filter((path) => path.startsWith("readingTime"));
  assert.deepEqual(await readingTimeErrors(undefined), ["readingTime"]);
  assert.deepEqual(await readingTimeErrors(0), ["readingTime"]);
  assert.deepEqual(await readingTimeErrors(1.5), ["readingTime"]);
  assert.deepEqual(await readingTimeErrors(2), []);

  const postType = schema.get("post");
  const blocks = postType.fields.find((field) => field.name === "blocks");
  assert.deepEqual(
    blocks.type.of.map((member) => member.name),
    [
      "richTextBlock",
      "photoLeftAndText",
      "photoRightAndText",
      "boxedPhotoLeftAndText",
      "boxedPhotoRightAndText",
      "cutoutLeftAndText",
      "cutoutRightAndText",
      "badgeAndText",
      "videoLeftAndText",
      "videoRightAndText",
      "boxedVideoLeftAndText",
      "boxedVideoRightAndText",
      "imageAndIconList",
    ],
  );
  assert.equal(postType.fields.some((field) => field.name === "body"), false);
});

test("a Cognito form needs a form ID (the number only, never embed code) and an accessible title", async () => {
  assert.deepEqual(
    await errorPaths({ _type: "testHost", cognitoForm: { _type: "cognitoForm", theme: "light", title: "  " } }),
    ["cognitoForm.formId", "cognitoForm.title"],
  );
  for (const formId of [
    '<script src="https://www.cognitoforms.com/f/seamless.js" data-form="1"></script>',
    "https://www.cognitoforms.com/f/xPoircp7HEGoNo_tpFEirg/114",
    "114a",
  ]) {
    const found = await errors({ _type: "testHost", cognitoForm: { _type: "cognitoForm", theme: "light", title: "Contact form", formId } });
    assert.deepEqual(Object.keys(found), ["cognitoForm.formId"], formId);
    assert.match(found["cognitoForm.formId"], /number only/);
  }
  // The introduction is optional.
  assert.deepEqual(
    await errors({ _type: "testHost", cognitoForm: { _type: "cognitoForm", theme: "light", title: "Contact form", formId: "114" } }),
    {},
  );
});

test("a Cognito form beside text needs its text, a form ID and an accessible title", async () => {
  assert.deepEqual(
    await errorPaths({ _type: "testHost", cognitoFormAndText: { _type: "cognitoFormAndText", theme: "light", title: "  " } }),
    ["cognitoFormAndText.formId", "cognitoFormAndText.richText", "cognitoFormAndText.title"],
  );
});

test("an FAQ list needs a title and at least one FAQ", async () => {
  assert.deepEqual(
    await errorPaths({ _type: "testHost", faqList: { _type: "faqList", theme: "light", title: " ", faqs: [] } }),
    ["faqList.faqs", "faqList.title"],
  );
  assert.deepEqual(
    await errors({
      _type: "testHost",
      faqList: {
        _type: "faqList",
        theme: "light",
        title: "Selling",
        faqs: [{ _key: "one", _type: "reference", _ref: "faq-one" }],
      },
    }),
    {},
  );
});

test("Two text columns needs both texts, so it never draws one column", async () => {
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      twoTextColumns: { _type: "twoTextColumns", theme: "light", leftText: [block("Our hoagies")], rightText: [block("  ")] },
    }),
    ["twoTextColumns.rightText"],
  );
  assert.deepEqual(
    await errors({
      _type: "testHost",
      twoTextColumns: { _type: "twoTextColumns", theme: "light", leftText: [block("Our hoagies")], rightText: [block("Plus")] },
    }),
    {},
  );
});

// The home page sections (issue #18).
test("a Home hero needs its photo and title; its YouTube link must be one video", async () => {
  assert.deepEqual(
    await errorPaths({ _type: "testHost", homeHero: { _type: "homeHero", theme: "light", title: "  " } }),
    ["homeHero.image", "homeHero.title"],
  );
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      homeHero: { _type: "homeHero", theme: "light", image, title: "The Fundraiser That Sells Itself", youTubeUrl: "https://example.com/video" },
    }),
    ["homeHero.youTubeUrl"],
  );
  // The heading, text, buttons and video link are optional.
  assert.deepEqual(
    await errors({
      _type: "testHost",
      homeHero: {
        _type: "homeHero",
        theme: "light",
        image,
        title: "The Fundraiser That Sells Itself",
        youTubeUrl: "https://www.youtube.com/watch?v=3nQNiWdeH2Q",
      },
    }),
    {},
  );
});

test("Steps needs one to three steps, each with its picture and title", async () => {
  assert.deepEqual(
    await errorPaths({ _type: "testHost", steps: { _type: "steps", theme: "light", items: [] } }),
    ["steps.items"],
  );
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      steps: { _type: "steps", theme: "light", items: [{ _key: "one", _type: "stepItem", title: " " }] },
    }),
    ["steps.items.[one].image", "steps.items.[one].title"],
  );
  const step = (key) => ({ _key: key, _type: "stepItem", image, title: "Contact Us" });
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      steps: { _type: "steps", theme: "light", items: ["a", "b", "c", "d"].map(step) },
    }),
    ["steps.items"],
  );
  assert.deepEqual(
    await errors({ _type: "testHost", steps: { _type: "steps", theme: "light", items: ["a", "b", "c"].map(step) } }),
    {},
  );
});

test("a Menu teaser needs its heading and exactly two parts, each with its photo and heading", async () => {
  const part = (key, heading = "14'' Famous Hoagies") => ({ _key: key, _type: "menuTeaserItem", image, heading });
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      menuTeaser: { _type: "menuTeaser", theme: "shaded", title: " ", items: [part("one")] },
    }),
    ["menuTeaser.items", "menuTeaser.title"],
  );
  assert.deepEqual(
    await errorPaths({
      _type: "testHost",
      menuTeaser: {
        _type: "menuTeaser",
        theme: "shaded",
        title: "Fresh & Clean Obsessed",
        items: [part("one"), { _key: "two", _type: "menuTeaserItem", heading: " " }],
      },
    }),
    ["menuTeaser.items.[two].heading", "menuTeaser.items.[two].image"],
  );
  assert.deepEqual(
    await errors({
      _type: "testHost",
      menuTeaser: { _type: "menuTeaser", theme: "shaded", title: "Fresh & Clean Obsessed", items: [part("one"), part("two", "12'' Delicious Pizzas")] },
    }),
    {},
  );
});

test("a Call to action with image needs its heading and photo", async () => {
  assert.deepEqual(
    await errorPaths({ _type: "testHost", callToActionWithImage: { _type: "callToActionWithImage", theme: "muslin", title: " " } }),
    ["callToActionWithImage.image", "callToActionWithImage.title"],
  );
  assert.deepEqual(
    await errors({
      _type: "testHost",
      callToActionWithImage: { _type: "callToActionWithImage", theme: "muslin", title: "Over 40 years of experience", image },
    }),
    {},
  );
});

test("Testimonials needs its heading, photo and at least one testimonial; a testimonial needs a name and a quote", async () => {
  assert.deepEqual(
    await errorPaths({ _type: "testHost", testimonials: { _type: "testimonials", theme: "muslin", title: " ", testimonials: [] } }),
    ["testimonials.image", "testimonials.testimonials", "testimonials.title"],
  );
  assert.deepEqual(
    await errors({
      _type: "testHost",
      testimonials: {
        _type: "testimonials",
        theme: "muslin",
        title: "Hoagie Heroes",
        image,
        testimonials: [{ _key: "one", _type: "reference", _ref: "testimonial-one" }],
      },
    }),
    {},
  );
  assert.deepEqual((await errorPaths({ _type: "testimonial", name: " " })).sort(), ["body", "name"]);
});

// Products (issue #16): the product template draws every product from these
// fields, so a product cannot publish without them.
const { starterDocuments } = await import("../../scripts/seed.mjs");
const seeded = (id) => starterDocuments.find((document) => document._id === id);

test("a complete product and the Product Page Settings validate", async () => {
  for (const id of ["starter-product-hoagie", "starter-product-pizza", "starter-product-salsa", "productPageSettings"]) {
    assert.deepEqual(await errorPaths(seeded(id)), [], id);
  }
});

test("a product needs what its page and its menu card draw", async () => {
  const empty = await errorPaths({ _type: "product" });
  for (const path of [
    "heroImage",
    "heroTitle",
    "ingredientsImage",
    "ingredientsText",
    "kind",
    "menuCard",
    "name",
    "nutritionFacts",
    "slug",
  ]) {
    assert.ok(empty.includes(path), path);
  }
  const hoagie = seeded("starter-product-hoagie");
  const { calories, ...withoutCalories } = hoagie.nutritionFacts;
  assert.equal(typeof calories, "number");
  assert.deepEqual(
    await errorPaths({
      ...hoagie,
      nutritionFacts: withoutCalories,
      menuCard: { _type: "productMenuCard", shortName: " " },
    }),
    [
      "menuCard.dressing",
      "menuCard.image",
      "menuCard.shortDescription",
      "menuCard.shortName",
      "nutritionFacts.calories",
    ],
  );
  // Only a hoagie's card names a dressing.
  const salsa = seeded("starter-product-salsa");
  assert.deepEqual(await errorPaths(salsa), []);
});

test("a menu section needs at least one product", async () => {
  assert.deepEqual(
    await errorPaths({ _type: "testHost", hoagieMenu: { _type: "hoagieMenu", theme: "light", products: [] } }),
    ["hoagieMenu.products"],
  );
});

test("Product Page Settings need both shared blocks and two hero buttons per kind", async () => {
  const settings = seeded("productPageSettings");
  const { handmade, ...withoutHandmade } = settings;
  assert.ok(handmade);
  assert.deepEqual(
    await errorPaths({
      ...withoutHandmade,
      pizza: { ...settings.pizza, heroButtons: settings.pizza.heroButtons.slice(0, 1) },
    }),
    ["handmade", "handmade.image", "handmade.title", "pizza.heroButtons"],
  );
});
