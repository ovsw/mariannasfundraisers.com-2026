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
        { name: "richText", type: "richTextContent" },
      ],
    },
  ],
});

// No test document references another document, so no request is made.
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
