// The importer's writes and dataset safety, against an in-memory client: a
// second run creates and changes nothing, files are matched by their source
// URL, and no write happens without a verified backup outside the repository.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { backupDataset, verifyTarget } from "./safety.mjs";
import { importFiles, sameDocument, uploadsFor, writeDocuments } from "./write.mjs";

function memoryClient(config = { projectId: "bgnqkzlg", dataset: "production" }) {
  const documents = new Map();
  const uploads = [];
  let commits = 0;
  const client = {
    documents,
    uploads,
    get commits() {
      return commits;
    },
    config: () => config,
    datasets: { list: async () => [{ name: "production" }] },
    async fetch(query, params) {
      if (query.includes("source.name")) {
        return [...documents.values()]
          .filter((d) => d.source?.name === params.source)
          .map((d) => ({ _id: d._id, _type: d._type, url: d.source.url, title: d.title, altText: d.altText }));
      }
      if (query.endsWith("._id`") || query.includes("]._id")) return params.ids.filter((id) => documents.has(id));
      return params.ids.filter((id) => documents.has(id)).map((id) => ({ ...documents.get(id), _rev: "r1", _updatedAt: "now" }));
    },
    transaction() {
      const pending = [];
      const transaction = {
        createOrReplace(document) {
          pending.push(document);
          return transaction;
        },
        async commit() {
          commits++;
          for (const document of pending) documents.set(document._id, structuredClone(document));
        },
      };
      return transaction;
    },
    assets: {
      async upload(kind, buffer, options) {
        const asset = { _id: `${kind}-${uploads.length}`, _type: kind === "image" ? "sanity.imageAsset" : "sanity.fileAsset", source: options.source, title: options.title };
        uploads.push({ kind, size: buffer.length, options });
        documents.set(asset._id, asset);
        return asset;
      },
    },
    patch(id) {
      const set = {};
      return {
        set(values) {
          Object.assign(set, values);
          return this;
        },
        async commit() {
          Object.assign(documents.get(id), set);
        },
      };
    },
  };
  return client;
}

const page = { _id: "page-1", _type: "page", title: "Jobs", slug: { _type: "slug", current: "jobs" }, blocks: [] };

test("a second write creates and changes nothing", async () => {
  const client = memoryClient();
  const first = await writeDocuments(client, [page]);
  assert.deepEqual([first.created, first.changed], [["page-1"], []]);
  const second = await writeDocuments(client, [structuredClone(page)]);
  assert.deepEqual([second.created, second.changed, second.unchanged], [[], [], ["page-1"]]);
  assert.equal(client.commits, 1);
  const third = await writeDocuments(client, [{ ...page, title: "Careers" }]);
  assert.deepEqual(third.changed, ["page-1"]);
});

test("documents compare without system fields or key order", () => {
  assert.ok(sameDocument({ a: 1, b: { c: 2, d: 3 }, _rev: "x" }, { b: { d: 3, c: 2 }, a: 1, _updatedAt: "y" }));
  assert.ok(!sameDocument({ a: [1, 2] }, { a: [2, 1] }));
});

test("files upload once and match by their Storyblok URL on the next run", async () => {
  const client = memoryClient();
  const url = "https://a.storyblok.com/f/133593/x/089b6d6939/flyer.pdf";
  const photo = "https://a.storyblok.com/f/133593/100x80/aa/photo.jpg";
  const files = new Map([
    [url, { url, asImage: false, asLink: true, alt: "", title: "", storyblokId: 1 }],
    [photo, { url: photo, asImage: true, asLink: true, alt: "A truck", title: "", storyblokId: 2 }],
  ]);
  assert.deepEqual(uploadsFor(files).map((u) => `${u.kind} ${u.url}`), [`file ${url}`, `image ${photo}`, `file ${photo}`]);
  let downloads = 0;
  const fetchFile = async () => {
    downloads++;
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
  };
  const first = await importFiles(client, files, { fetchFile });
  assert.equal(first.stats.uploaded, 3);
  assert.equal(downloads, 2, "each file is downloaded once");
  assert.equal(client.documents.get(first.fileRef(photo, "image")).altText, "A truck");
  const second = await importFiles(client, files, { fetchFile });
  assert.deepEqual(second.stats, { matched: 3, uploaded: 0, sameBytes: 0, patched: 0 });
  assert.equal(second.fileRef(url, "file"), first.fileRef(url, "file"));
  assert.equal(downloads, 2);
});

test("the importer writes only to this site's project and dataset", async () => {
  await verifyTarget(memoryClient());
  await assert.rejects(verifyTarget(memoryClient({ projectId: "other", dataset: "production" })), /writes only to bgnqkzlg\/production/);
});

test("a backup outside the repository must export and pass its gzip check before any write", async () => {
  const studioDirectory = path.resolve(import.meta.dirname, "..", "..");
  await assert.rejects(backupDataset({ studioDirectory, root: path.join(studioDirectory, "backups") }), /outside the repository/);
  const root = await mkdtemp(path.join(tmpdir(), "mfr-backup-"));
  const calls = [];
  const failingExport = (command, args) => {
    calls.push([command, ...args].join(" "));
    return { status: 1, stderr: "no access" };
  };
  await assert.rejects(backupDataset({ studioDirectory, root, run: failingExport }), /nothing was written/);
  assert.match(calls[0], /^pnpm exec sanity datasets export production .+\.tar\.gz --raw/);
  const exportOk = (command, args) => {
    if (command === "pnpm") return { status: 0 };
    return { status: 1 };
  };
  await assert.rejects(backupDataset({ studioDirectory, root, run: exportOk }), /gzip check/);
  const passing = (command, args) => {
    if (command === "pnpm") writeFileSync(args[5], "");
    return { status: 0 };
  };
  const filename = await backupDataset({ studioDirectory, root, run: passing });
  assert.ok(filename.startsWith(root) && filename.endsWith("-production-storyblok-import.tar.gz"));
});
