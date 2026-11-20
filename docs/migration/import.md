# Storyblok importer

The importer moves the old site's Storyblok content into the Sanity dataset
(spec decision 20, issue #3; built in ticket #13). It runs again at the
content freeze before go-live, so until then every fix to imported content
goes into the importer or its overrides file, never into the dataset by hand.

## Run it

From the repository root:

```sh
pnpm storyblok:export                # refresh the export folder from Storyblok
pnpm storyblok:import                # dry run: counts, and the report
pnpm storyblok:import --apply        # back up the dataset, then write
```

Both take `--export <folder>` (an absolute path). The default folder is
`~/backups/mfr/storyblok-export`, outside the repository; the export never goes
into git. To start from the export of 2026-11-20 instead of a fresh one, unzip
`/storage/backups/mfr/mfr-storyblok-export-2026-11-20.zip` into that folder.

- **Export** reads Storyblok's content API (EU region) with the read-only
  preview token, `MFR_STORYBLOK_PREVIEW_TOKEN`, from the shell,
  `studio/.env.local`, or the shared secrets file
  (`~/.config/ovs/secrets.env`, read by name). It writes the draft and
  published stories, the links and the two option lists. The draft version is
  the source, because that is what the old site shows.
- **Dry run** (the default) writes nothing to Sanity. It prints the counts per
  type and writes `docs/migration/import-report.md` and `.json`: what was
  found, what each page becomes, what was dropped, every image without alt
  text, and what needs a hand.
- **`--apply`** writes to the project and dataset in `studio/.env.local`, and
  only to `bgnqkzlg/production`. First it exports the dataset raw to
  `~/backups/mfr/sanity/<time>-production-storyblok-import.tar.gz` and checks
  it with `gzip -t`; it stops before any write if either fails. Then it
  uploads the files that are not in the dataset yet and writes the documents
  that are new or differ. A second `--apply` creates and changes nothing.

## What it does

- **IDs.** A document's ID comes from its story UUID: `page-<uuid>`
  (`product-<uuid>` and `post-<uuid>` for the later tickets); the home story
  is the `homePage` singleton. A section's `_key` is its row's `_uid`.
- **Files.** Every Storyblok file the stories use (158) is downloaded once and
  uploaded with `source.url` set to its Storyblok URL; later runs match it by
  that URL. An image field keeps its alt text and focal point (as the
  hotspot); the asset keeps the title and alt text. A file a link points at
  is uploaded as a file asset.
- **Pages.** The home story becomes `homePage`; every other page story a
  `page` with its nested slug. The story name is the title; the SEO title (when
  it differs), description, sharing photo and noindex go to `meta`. All are
  written published, including the two pages unpublished in Storyblok.
  `privacy-policy` and `terms-and-conditions` are skipped: the old site
  redirects them to iubenda (ticket #20).
- **Rows to sections** (spec decision 10). Each row becomes one section, in
  order, with its wrapper's background as theme; margins, paddings, widths and
  names are dropped and counted. The row-to-section rule is `pageRowSections`
  in `scripts/migration/block-inventory.mjs`. Built: the hero as **Page
  banner** (its edge colour as theme), **Page heading**, and **Rich Text**
  with its button row. Every other row becomes a **Scaffold** that holds the
  row's text and names its intended section; the home page also gets a
  "Latest news" Scaffold. A later ticket replaces them by mapping its rows in
  `studio/scripts/storyblok/transform.mjs`.
- **Rich text** (spec decision 14): paragraphs, headings (an old level n is
  h(n+1)), lists, bold, italic, underline, line breaks and links. Pasted colour
  and class marks are dropped and counted. A heading's anchor on the Website
  is its text in hyphenated words (`shared/heading-anchor.ts`), which matches
  every anchor the old headings carried.
- **Links.** A story link points at the document from that story, with its
  anchor; a link to a story that is not a document yet (a product page or news
  post until its ticket imports it) is its path. Email, phone and external
  links keep their kind; links to the old site's own address become site
  links; links to Storyblok files point at the uploaded file.
- **Not imported here:** product pages (ticket #16) and news posts (ticket
  #17). They are counted and listed in the report.

## Overrides

`studio/scripts/storyblok/overrides.json` holds fixes that must survive a
second run. Each link override names the story, the link's stored address and
where it goes instead. The report lists the overrides applied and those that
matched nothing in this run (for example in a news post, before its ticket).

## Code

| File | What it holds |
| --- | --- |
| `studio/scripts/export-storyblok.mjs` | The export step |
| `studio/scripts/import-storyblok.mjs` | The command: dry run, `--apply`, the report |
| `studio/scripts/storyblok/transform.mjs` | The pure mapping from stories to documents |
| `studio/scripts/storyblok/rich-text.mjs`, `links.mjs`, `files.mjs`, `scaffold-text.mjs` | Rich text, links, files and Scaffold text |
| `studio/scripts/storyblok/write.mjs`, `safety.mjs` | Uploads, idempotent writes, the target check and the backup |
| `studio/scripts/storyblok/fixtures/` | Stories and rich text cut from the real export, for the tests |
