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

- **IDs.** A document's ID comes from its story UUID: `page-<uuid>`,
  `post-<uuid>` (and `product-<uuid>` for ticket #16); the home story
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
  banner** (its edge colour as theme), **Page heading**, **Rich Text**
  with its button row, and the old "big image" rows as their image-and-text
  sections (below). Every other row becomes a **Scaffold** that holds the
  row's text and names its intended section. A later ticket replaces them by
  mapping its rows in `studio/scripts/storyblok/transform.mjs`. The home page
  ends with the **Latest news** section, which the old home page drew from
  code (ticket #17).
- **Big image rows** (spec decision 12, ticket #15). The old switches pick
  the section, in this order (`bigImageSection` in
  `scripts/migration/block-inventory.mjs`): a YouTube link makes **Video
  left/right and text**; else `badge_image` makes **Badge and text**; else
  feature group children make **Image and icon list**; else `contain_image`
  makes **Cutout left/right and text**; else **Photo left/right and text**.
  `is_reversed` puts the image on the left (the old code and the reference
  screenshots agree); `extra_padding` is dropped and counted. A leading
  heading group gives the eyebrow, heading and anchor ID; the text, any old
  table and the button rows go into the section's rich text and buttons; each
  feature group becomes an item of icon, heading and simple text. A row with
  no image, no text, or a video link that is not a YouTube link stays a
  Scaffold and is listed under "needs a hand". Rows inside product pages are
  left to ticket #16.
- **Rich text** (spec decision 14): paragraphs, headings (an old level n is
  h(n+1), then raised where a Rich Text section's headings would skip a
  level, so the page outline never jumps), lists, bold, italic, underline, line breaks and links. Pasted colour
  and class marks are dropped and counted. A heading's anchor on the Website
  is its text in hyphenated words (`shared/heading-anchor.ts`), which matches
  every anchor the old headings carried.
- **Links.** A story link points at the document from that story, with its
  anchor; a link to a story that is not a document yet (a product page or news
  post until its ticket imports it) is its path. Email, phone and external
  links keep their kind; links to the old site's own address become site
  links; links to Storyblok files point at the uploaded file.
- **Site shell** (spec decisions 16 and 17, ticket #14). The `settings`,
  `navigation` and `footer` documents come from the reference capture's seed
  file, `docs/migration/seed/hard-coded-content.json`, through
  `studio/scripts/storyblok/site-shell.mjs`: the three dropdown groups with
  their descriptions, each link with its description and icon (the old
  Heroicons mapped to the nearest Lucide icon), the action button, the three
  footer columns, the legal links, the tagline, the parent company sentence,
  the footer button, phone, email, address, social links, the copyright owner
  and start year, and the two logos (uploaded from the old repository at the
  seed's commit). Links the seed marks `dropped` (they went nowhere, or were
  commented out) are left out; the footer's stale `/blog/` link points at
  `/news`. A link to an imported page is a reference; `/news` and outside
  addresses stay URLs. `_key`s come from the labels, so a second run writes
  nothing. The Google Analytics measurement ID is read by name,
  `MFR_GA_MEASUREMENT_ID`, from the shell, `studio/.env.local` or the shared
  secrets file; without it the report says so, and `--apply` keeps the ID the
  dataset already holds.
- **News** (spec decisions 5, 9 and 21, ticket #17; `news.mjs`). Each news
  story becomes a `post`, `post-<uuid>`, written published. The story name is
  the title, as on pages (the old news cards showed it); where the story's own
  title field, which the old post page drew as its heading, differs, the
  report lists it. The excerpt, the date (Storyblok's UTC date, as a
  datetime), the main image, the reading time and the SEO fields carry over;
  `body_rte`, which the old template never drew, is dropped and counted. The
  author is a reference to one of the four `author` documents (below); a post
  whose author, date or main image is missing still imports, and the report
  says so. Its rows become its `blocks` by the page rules, but a post takes
  only Rich Text and the image-and-text sections and never a Scaffold: a row
  that cannot be one of them is left out and listed under "needs a hand".
- **News addresses.** A news slug that does not pass the Starter's slug rule
  (four end in a hyphen, one holds a colon) gets a clean one: lowercase words
  joined by single hyphens (`winner:-2024-…` becomes `winner-2024-…`). A
  `redirect` document, `redirect-post-<uuid>`, sends the old path to the post,
  permanently. Links to a post's old address point at the post. The report
  lists each address that changes.
- **Authors and the news list** come from the seed file: the four authors of
  the old code as `author-<key>` (`amy`, `amie`, `juls`, `todd`, the values a
  post's author field holds), each with the photo from the old repository at
  the seed's commit and the author's name as its alt text; and `blogIndex`
  with the list's eyebrow, title and SEO title and description.
- **Not imported here:** product pages (ticket #16). They are counted and
  listed in the report.

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
| `studio/scripts/storyblok/site-shell.mjs` | Settings, navigation and footer from the seed file |
| `studio/scripts/storyblok/news.mjs` | Clean news slugs and their redirects, authors, the news list and Latest news headings |
| `studio/scripts/storyblok/write.mjs`, `safety.mjs` | Uploads, idempotent writes, the target check and the backup |
| `studio/scripts/storyblok/fixtures/` | Stories and rich text cut from the real export, for the tests |
