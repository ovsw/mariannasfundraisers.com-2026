// The importer's writes: files matched by their Storyblok URL or uploaded
// once, and documents written only when they differ from the dataset, so a
// second run creates and changes nothing.

import { fileName } from "./files.mjs";

const SOURCE = "storyblok";

/** Object keys sorted at every level, so equal documents give equal JSON. */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .filter((key) => !["_rev", "_createdAt", "_updatedAt", "_system"].includes(key) && value[key] !== undefined)
      .sort()
      .map((key) => [key, canonical(value[key])]),
  );
}

export function sameDocument(a, b) {
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
}

/** Asset type for an upload kind. */
const ASSET_TYPE = { image: "sanity.imageAsset", file: "sanity.fileAsset" };

/** The uploads a set of files needs: an image asset for image fields, a file asset for links. */
export function uploadsFor(files) {
  const uploads = [];
  for (const file of files.values()) {
    if (file.asImage) uploads.push({ ...file, kind: "image" });
    if (file.asLink) uploads.push({ ...file, kind: "file" });
  }
  return uploads;
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index], index);
      }
    }),
  );
  return results;
}

/**
 * Matches every file to a Sanity asset by its Storyblok URL, downloading and
 * uploading the ones not in the dataset yet. Returns `fileRef(url, kind)` and
 * the counts. A file whose bytes are already in the dataset under another
 * URL comes back as that asset; Sanity keeps one copy.
 */
export async function importFiles(client, files, { fetchFile = fetch, log = () => {}, concurrency = 4 } = {}) {
  const existing = await client.fetch(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && source.name == $source]{_id, _type, "url": source.url, title, altText}`,
    { source: SOURCE },
  );
  const byKey = new Map(existing.map((asset) => [`${asset._type} ${asset.url}`, asset]));
  const knownIds = new Set(existing.map((asset) => asset._id));
  const refs = new Map();
  const downloads = new Map();
  const stats = { matched: 0, uploaded: 0, sameBytes: 0, patched: 0 };
  const uploads = uploadsFor(files);

  const download = (url) => {
    if (!downloads.has(url)) {
      downloads.set(url, (async () => {
        const response = await fetchFile(url);
        if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
        return Buffer.from(await response.arrayBuffer());
      })());
    }
    return downloads.get(url);
  };

  await mapLimit(uploads, concurrency, async (file, index) => {
    const type = ASSET_TYPE[file.kind];
    let asset = byKey.get(`${type} ${file.url}`);
    if (asset) stats.matched++;
    else {
      const buffer = await download(file.url);
      asset = await client.assets.upload(file.kind, buffer, {
        filename: fileName(file.url),
        source: { name: SOURCE, id: String(file.storyblokId ?? file.url), url: file.url },
        ...(file.title ? { title: file.title } : {}),
      });
      // Sanity keeps one asset per file content: a file whose bytes are
      // already in the dataset under another URL comes back as that asset.
      if (knownIds.has(asset._id) || asset.source?.url !== file.url) {
        asset = { ...asset, sameBytes: true };
        stats.sameBytes++;
      } else stats.uploaded++;
      knownIds.add(asset._id);
      log({ uploaded: `${index + 1}/${uploads.length}`, file: fileName(file.url) });
    }
    const patch = {};
    if (file.alt && !asset.altText) patch.altText = file.alt;
    if (file.title && !asset.title) patch.title = file.title;
    if (Object.keys(patch).length && !asset.sameBytes) {
      await client.patch(asset._id).set(patch).commit();
      stats.patched++;
    }
    refs.set(`${file.kind} ${file.url}`, asset._id);
  });

  const fileRef = (url, kind) => {
    const id = refs.get(`${kind} ${url}`);
    if (!id) throw new Error(`No ${kind} asset for ${url}`);
    return id;
  };
  return { fileRef, stats };
}

/**
 * Writes the documents that are new or differ from the dataset, in one
 * transaction, and returns the counts. Documents are written published; an
 * editor's draft of one is listed, because it would hide the import in Studio.
 */
export async function writeDocuments(client, documents) {
  const ids = documents.map((document) => document._id);
  const existing = await client.fetch(`*[_id in $ids]`, { ids });
  const drafts = await client.fetch(`*[_id in $ids]._id`, { ids: ids.map((id) => `drafts.${id}`) });
  const byId = new Map(existing.map((document) => [document._id, document]));
  const result = { created: [], changed: [], unchanged: [], drafts };
  let transaction = client.transaction();
  for (const document of documents) {
    const current = byId.get(document._id);
    if (current && sameDocument(current, document)) {
      result.unchanged.push(document._id);
      continue;
    }
    (current ? result.changed : result.created).push(document._id);
    transaction = transaction.createOrReplace(document);
  }
  if (result.created.length || result.changed.length) await transaction.commit({ visibility: "sync" });
  return result;
}
