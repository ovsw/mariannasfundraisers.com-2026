# Launch readiness report

The proof that the new site reproduces the old one from the Storyblok content
(issue #3, ticket #21), taken on 2026-11-21 from the code of the integration
branch `feat/implement-sub-issues-3`. The go-live steps that follow are in
[`go-live.md`](go-live.md).

## Import from a refreshed export

`pnpm storyblok:export` refreshed `~/backups/mfr/storyblok-export` from
Storyblok: 68 draft stories, 66 published, 71 links, 2 option lists. Then
`pnpm storyblok:import` (dry run) and `pnpm storyblok:import --apply` ran
against `bgnqkzlg/production`. Each `--apply` first wrote a raw dataset backup
to `~/backups/mfr/sanity/` and checked it with `gzip -t`. The report is
[`import-report.md`](import-report.md).

| What | Refreshed export | Import report |
| --- | --- | --- |
| Stories | 68 | 68 |
| Page stories (`page` component) | 34 | 34: 31 `page`, the `homePage`, and 2 skipped (`privacy-policy` and `terms-and-conditions` redirect to iubenda) |
| News stories (`blog-post`) | 18 | 18 `post` |
| Product stories (`menu-item-page`) | 16 | 16 `product` |
| Storyblok files the stories use | 158 | 158, plus 6 files from the old code (2 logos, 4 author photos) |

The dataset holds 105 documents, exactly the import's: the documents above,
plus 14 `faq`, 3 `testimonial`, 4 `author`, 13 `redirect` and the singletons
(`settings`, `navigation`, `footer`, `blogIndex`, `productPageSettings`). It
holds no drafts.

## A second run changes nothing

| Run | Created | Changed | Unchanged | Files uploaded |
| --- | --- | --- | --- | --- |
| `--apply` with this ticket's importer fix | 0 | 3 | 102 | 0 |
| `--apply` again | 0 | 0 | 105 | 0 |

The three changed documents are the news posts whose empty rows the fix
drops (below).

## No Scaffold

No published document holds a Scaffold: a scan of every document in the
dataset found no object of type `scaffold`, and the import report lists none.

## Document check

Studio's own rules (the check `pnpm page:check` runs, through
`sanity documents validate` at level warning) ran on all 105 documents.

The first run found 3 errors: Rich Text sections with neither content nor a
heading, in the posts `we-re-hiring-february-2022`, `a-positive-partnership`
and `mariannas-hoagies-on-tv`. Their old rows hold only empty paragraphs,
which the old site drew as blank space. The importer now drops such a row and
counts it under "empty rows" (`studio/scripts/storyblok/transform.mjs`).

10 warnings remain, kept on purpose because the spec rules them out:

| Document | Warning | Why it stays |
| --- | --- | --- |
| `/products` | The final 72-character title may be shortened in search results. | The title is the old site's ("Our 14" Famous Hoagies and Delicious 12" Pizzas"), and the parity check compares it by value. Spec decision 3: text stays as it is. |
| 8 news posts | The final 62- to 79-character title may be shortened in search results. | The title is the post's name, as the old site showed it. Spec decisions 3 and 19: text stays as it is, and the page title is "Page title \| Marianna's Fundraisers". |
| News Index | Add a description for the News Index header | The old news list has no text under its heading, so a description would add copy the old site does not have (spec decisions 2 and 3). Its SEO description is set. |

Images without alt text are not part of this check: the import report lists
173 image fields without one (spec: out of scope, a follow-up with the image
description flow).

## Parity

| Checked | Report | Differences | On purpose |
| --- | --- | --- | --- |
| Local production build (`NEXT_PUBLIC_SITE_ENV=production`, real site URL) | [`parity-report.md`](parity-report.md) | 0 | 55 |
| Vercel address of the integration branch | [`parity-report-vercel.md`](parity-report-vercel.md) | 0 | 117 |

The Vercel address is a preview deployment, and the Website marks every page
of a preview noindex. That run used `--preview`, which lists those 62 noindex
answers as on purpose and checks the sitemap against the old site's indexing.
Every other on-purpose difference is in both reports.

## Release gate

`pnpm verify` is green. Its first run failed on the home page, which had two
`h1`s: the Home hero's title and the hidden page title the template adds when
no section draws one. The template now counts the Home hero as drawing it
(`frontend/components/blocks/page-title.ts`).

## Studio

`pnpm deploy:studio` deployed the Studio and its schema to
https://mariannasfundraisers.sanity.studio/.
