import assert from "node:assert/strict";
import test from "node:test";
import { checkDocument, formatPath, validateWithStudio } from "./check-document.mjs";

function run(argv, { documents = [], markers = [] } = {}) {
  const output = [];
  const checked = [];
  return checkDocument({
    argv,
    fetchDocuments: async (id) =>
      documents.filter((document) => [id, `drafts.${id}`].includes(document._id)),
    validate: async (document) => {
      checked.push(document._id);
      return markers;
    },
    log: (line) => output.push(line),
    error: (line) => output.push(line),
  }).then((code) => ({ code, output, checked }));
}

test("prints each problem with its path and fails on errors and warnings", async () => {
  const { code, output } = await run(["about"], {
    documents: [{ _id: "about", _type: "page" }],
    markers: [
      {
        level: "error",
        message: "Required",
        path: ["blocks", { _key: "a1" }, "buttons", 0, "text"],
      },
      { level: "warning", message: "Too long", path: ["title"] },
      { level: "warning", message: "Check the document", path: [] },
    ],
  });
  assert.equal(code, 1);
  assert.deepEqual(output, [
    "Checking about (page)",
    "error: blocks[a1].buttons[0].text: Required",
    "warning: title: Too long",
    "warning: (document): Check the document",
    "3 problem(s). Fix every one before handing the document over.",
  ]);
});

test("a warning alone fails the check", async () => {
  const { code } = await run(["about"], {
    documents: [{ _id: "about", _type: "page" }],
    markers: [{ level: "warning", message: "Too long", path: ["title"] }],
  });
  assert.equal(code, 1);
});

test("checks the draft when one exists and passes a valid document", async () => {
  const documents = [
    { _id: "about", _type: "page" },
    { _id: "drafts.other-about", _type: "page" },
    { _id: "drafts.about", _type: "page" },
  ];
  const fromPublishedId = await run(["about"], { documents });
  assert.equal(fromPublishedId.code, 0);
  assert.deepEqual(fromPublishedId.checked, ["drafts.about"]);
  assert.equal(fromPublishedId.output.at(-1), "Valid: no errors, no warnings.");

  const fromDraftId = await run(["drafts.about"], { documents });
  assert.deepEqual(fromDraftId.checked, ["drafts.about"]);
});

test("fails with a message when the id is missing or unknown", async () => {
  const noId = await run([]);
  assert.equal(noId.code, 1);
  assert.deepEqual(noId.output, ["Usage: pnpm page:check <document id>"]);

  const unknown = await run(["missing"]);
  assert.equal(unknown.code, 1);
  assert.deepEqual(unknown.output, ['No document with the id "missing", draft or published.']);
  assert.deepEqual(unknown.checked, []);
});

test("formats marker paths with keys and indexes", () => {
  assert.equal(formatPath(["slug", "current"]), "slug.current");
  assert.equal(formatPath(["blocks", { _key: "k" }, "rows", 2]), "blocks[k].rows[2]");
  assert.equal(formatPath([]), "");
});

test("runs Studio's own rules on a small draft", { timeout: 120_000 }, async () => {
  // The CLI needs a workspace and a token but contacts no service for a
  // document without references, so placeholder values work when no Studio
  // env or Sanity login is set.
  process.env.SANITY_AUTH_TOKEN ||= "page-check-placeholder";
  process.env.SANITY_STUDIO_PROJECT_ID ||= "pagecheck";
  process.env.SANITY_STUDIO_DATASET ||= "test";
  process.env.SANITY_STUDIO_TITLE ||= "page:check test";
  process.env.SANITY_STUDIO_PREVIEW_URL ||= "http://localhost:3000";

  const markers = await validateWithStudio({
    _id: "drafts.page-check-test",
    _type: "page",
    title: "   ",
  });
  const byPath = Object.fromEntries(
    markers.map((marker) => [formatPath(marker.path), marker.level]),
  );
  assert.equal(byPath.title, "error", JSON.stringify(markers));
  assert.equal(byPath["slug.current"], "error", JSON.stringify(markers));
});
