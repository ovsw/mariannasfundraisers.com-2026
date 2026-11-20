import assert from 'node:assert/strict';
import test from 'node:test';
import { syncRaster } from './sync-raster-descriptions.mjs';

function fixture(raster, assets) {
  const logs = [];
  let commits = 0;
  const env = Object.fromEntries(['SANITY_STUDIO_PROJECT_ID', 'SANITY_STUDIO_DATASET', 'SANITY_AUTH_TOKEN', 'RASTER_API_KEY', 'RASTER_ORG_ID'].map(key => [key, 'test']));
  const clientFactory = () => ({
    fetch: async () => assets,
    transaction() {
      const pending = [];
      return {
        patch(id, configure) {
          const patch = { ifRevisionId(revision) { assert.equal(revision, 'rev'); return patch; }, set(value) { pending.push([id, value]); return patch; } };
          configure(patch);
          return this;
        },
        async commit() { commits++; for (const [id, value] of pending) Object.assign(assets.find(asset => asset._id === id), value); },
      };
    },
  });
  const fetchImpl = async () => ({ ok: true, json: async () => ({ data: raster }) });
  return { run: args => syncRaster({ args: ['--library', 'library', ...args], env, clientFactory, fetchImpl, log: value => logs.push(value) }), logs, commits: () => commits };
}
const asset = (filename, description = '') => ({ _id: filename, _rev: 'rev', originalFilename: filename, description });

test('dry run lists a case-insensitive dotted stem; apply is repeatable and preserves existing text', async () => {
  const assets = [asset('Camp.Day.JPG'), asset('Other.png', 'Hand written')];
  const f = fixture([{ name: 'camp.day', description: ' Children play. ' }, { name: 'other', description: 'Other text' }], assets);
  await f.run([]);
  assert.equal(f.commits(), 0);
  assert.ok(f.logs.some(line => line.includes('Camp.Day.JPG')));
  await f.run(['--apply']);
  assert.equal(assets[0].description, 'Children play.');
  assert.equal(assets[1].description, 'Hand written');
  await f.run(['--apply']);
  assert.equal(f.commits(), 1);
  assert.ok(f.logs.includes('To patch: 0'));
  await f.run(['--apply', '--overwrite']);
  assert.equal(assets[1].description, 'Other text');
});

test('duplicates on either side are listed and never patched, including undescribed duplicates', async () => {
  const f = fixture([
    { name: 'same', description: 'One' }, { name: 'SAME', description: 'One' },
    { name: 'pending', description: 'Ready' }, { name: 'pending' },
    { name: 'two', description: 'Two' },
  ], [asset('same.jpg'), asset('pending.jpg'), asset('two.jpg'), asset('two.png')]);
  await f.run(['--apply']);
  assert.equal(f.commits(), 0);
  for (const name of ['same', 'pending', 'two']) assert.ok(f.logs.some(line => line.includes(name)));
});

test('rejects malformed flags before contacting services', async () => {
  for (const args of [['--library'], ['--library', '--apply'], ['--library', '   '], ['--aply']]) {
    await assert.rejects(syncRaster({ args, env: {} }), /Usage/);
  }
});

function libraryRun({ args = [], library }) {
  const calls = [];
  const logs = [];
  const env = Object.fromEntries(['SANITY_STUDIO_PROJECT_ID', 'SANITY_STUDIO_DATASET', 'SANITY_AUTH_TOKEN', 'RASTER_API_KEY', 'RASTER_ORG_ID'].map(key => [key, 'test']));
  if (library !== undefined) env.RASTER_LIBRARY_ID = library;
  const run = syncRaster({
    args, env, log: line => logs.push(line),
    clientFactory: () => ({ fetch: async () => [asset('latest.jpg')] }),
    fetchImpl: async url => {
      calls.push(new URL(url).pathname);
      return { ok: true, json: async () => ({ data: [{ name: 'latest', description: 'Latest image' }] }) };
    },
  });
  return { run, calls, logs };
}

test('the library comes from RASTER_LIBRARY_ID and never from a library listing', async () => {
  const f = libraryRun({ library: ' website-library ' });
  await f.run;
  assert.deepEqual(f.calls, ['/organizations/test/libraries/website-library/assets']);
  assert.ok(f.logs.some(line => line.includes('Raster library "website-library" from RASTER_LIBRARY_ID')));
  assert.ok(f.logs.includes('To patch: 1'));
});

test('--library overrides RASTER_LIBRARY_ID', async () => {
  const f = libraryRun({ args: ['--library', 'other-library'], library: 'website-library' });
  await f.run;
  assert.deepEqual(f.calls, ['/organizations/test/libraries/other-library/assets']);
  assert.ok(f.logs.some(line => line.includes('Raster library "other-library" from --library')));
});

test('with no library setting and no --library it stops, names the setting and contacts no service', async () => {
  for (const library of [undefined, '', '  ']) {
    const f = libraryRun({ library });
    await assert.rejects(f.run, /RASTER_LIBRARY_ID.*--library <id>/);
    assert.deepEqual(f.calls, []);
  }
});

test('reads every asset page of the library', async () => {
  const pages = [];
  const logs = [];
  const env = Object.fromEntries(['SANITY_STUDIO_PROJECT_ID', 'SANITY_STUDIO_DATASET', 'SANITY_AUTH_TOKEN', 'RASTER_API_KEY', 'RASTER_ORG_ID', 'RASTER_LIBRARY_ID'].map(key => [key, 'test']));
  await syncRaster({
    args: [], env, log: line => logs.push(line),
    clientFactory: () => ({ fetch: async () => [asset('latest.jpg')] }),
    fetchImpl: async url => {
      const page = new URL(url).searchParams.get('page');
      pages.push(page);
      const data = page === '1'
        ? Array.from({ length: 50 }, (_, i) => ({ name: `image-${i}` }))
        : [{ name: 'latest', description: 'Latest image' }];
      return { ok: true, json: async () => ({ data }) };
    },
  });
  assert.deepEqual(pages, ['1', '2']);
  assert.ok(logs.includes('To patch: 1'));
});
