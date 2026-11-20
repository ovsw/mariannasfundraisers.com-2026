# Content model

The Website reads structured content from one Sanity project and dataset.

## Routed content

- `homePage` owns `/`.
- `page` owns normal page slugs such as `/about/`.
- `blogIndex` is the news index and owns `/news` (20 posts per page, then
  `/news/2` and onward).
- `post` is a news post and owns `/news/<slug>`.
- There are no categories: the site has no `category` type and no category
  routes.
- `redirect` maps an old path to routed content or an external URL.

## Shared content

- `settings`, `navigation`, `footer`, and `blogPostSettings` are global documents.
- `author`, `faq`, `teamMember`, and `testimonial` are reusable records.
- Pages compose top-level sections through their `blocks` array.
- `homePage`, `page`, and `blogIndex` also carry a `blocksArchive` array that
  accepts the same section types. Replaced Scaffolds move there. The Website
  reads only `blocks`.

## Section library

This is the text list of every section an editor can insert on a page. Agents
that edit content get this list, so keep it current: update it in the same
change that adds, removes, renames, or changes a section.
`studio/schemas/blocks/section-library.test.mjs` fails when it names different
sections than `studio/schemas/blocks/page-builder.ts`.

Each entry starts with the section's `_type`. Every section has one design;
the only look setting is `theme` (Light, Shaded, Muslin or Primary
background) where a section has one. A button inside a section also has a
colour and an optional icon; see `docs/design.md`.

- `pageBanner` (Page banner). A full-width photo at the top of an inner page,
  at one height, with an optional title over it. When it has a title, the
  title is the page's main heading. Its theme is the colour of the brushed
  edge at its foot: choose the theme of the section below it. Use it as the
  first section of a page. Available on pages, not the home page.
- `pageHeading` (Page heading). The page's main heading, centred, with an
  optional short introduction (paragraphs with bold, italic and links). Use it
  under the Page banner when the banner has no title. Available on every
  page.
- `richTextBlock` (Rich Text). One column of headings, text, lists and tables,
  with an optional label and heading above and an optional row of up to four
  buttons below. An optional Anchor ID lets a link land on the section
  (`/page#anchor-id`). Use it for running text, and as a valid final match
  for a Scaffold. Available on every page.
- `scaffold` (Scaffold). A placeholder with `name`, `richText`, and
  `proposedSectionShape`. It renders its rich text with a visible internal
  marker so nobody mistakes it for a finished section, and a published page
  must not contain one. Use it only while drafting a page. Available on every
  page.

The Starter ships Rich Text and the Scaffold. Every other section belongs to
this site. Generate one with `pnpm page-builder:new`, then add it to this
list.

A link (a button's destination, or a link in rich text) goes to a page on this
site, with an optional anchor (a section's Anchor ID, or a heading's text in
lowercase words with hyphens: "Ham & Swiss Hoagie" is `ham-and-swiss-hoagie`),
to an external address (a web address, `mailto:`, `tel:` or a path on this
site), or to an uploaded file.

The pages come from the old Storyblok site through the importer; see
`docs/migration/import.md`. Fix imported content in the importer or its
overrides file, never by hand in the dataset, until go-live.

## Page Builder path

Each section has one shared `_type` across its Studio schema, Page Builder registration, GROQ projection, generated TypeScript type, and React renderer. See `docs/agents/page-builder.md` for the extension steps.

Sanity owns authored content. The repository owns schemas, queries, rendering, routing rules, and generated types.
