# Old site reference capture

This folder holds the old mariannasfundraisers.com (Next.js 12 and Storyblok),
captured on 2026-11-20 as input for the rebuild (issue #3, ticket #10). Later
tickets build from these files. No check compares the new site with the
screenshots: Ovi gives the visual verdict.

| File | What it holds | Who reads it |
| --- | --- | --- |
| `screenshots/` | Full-page WebP screenshots of the 67 URLs at 1440 px and 390 px. The name is the path, with `/` as `__`, `home` for `/`, and other characters percent-encoded (`:` is `%3A`). | Agents that build sections and the shell |
| `url-inventory.json` | For each URL: status, title, description, robots and noindex, canonical, which sharing tags are present, sitemap membership, page kind, malformed slug. Also the 11 redirects of the old Next config with their live response. | The parity script (ticket #20) |
| `url-inventory.md` | The same inventory as a table. | People |
| `block-inventory.json` | For each Storyblok story, its rows in order and the section, product field or post section each becomes; hidden blocks; dropped option values; the shared product rows check; the menu card of each product. | The importer tickets |
| `block-inventory.md` | The same inventory as tables. | People |
| `seed/hard-coded-content.json` | What the old code hard-codes: navigation groups, action buttons, phone menu, footer columns, legal links, privacy controls, social links, phone, email, address, copyright owner, the four authors, the news headings and the 11 redirects. Dropped links carry `dropped: true` and a reason. | The importer (tickets #13, #14, #17, #20) |
| `seed/authors/` | The four author photos from the old code. | The importer (ticket #17) |
| `import.md` | How to run the Storyblok importer and what it does. | People and the importer tickets |
| `import-report.md`, `import-report.json` | The importer's report: what it found, built, dropped and left for a hand, and every image without alt text. Rewritten by every run of `pnpm storyblok:import`. | Ovi, and the tickets that replace Scaffolds |

## Refresh

Run from the repository root. The Storyblok export is not in git; unzip
`/storage/backups/mfr/mfr-storyblok-export-2026-11-20.zip` (or a newer export)
to a folder first.

```sh
node scripts/migration/capture-url-inventory.mjs --export <export folder>
node scripts/migration/block-inventory.mjs --export <export folder>
node scripts/migration/capture-screenshots.mjs
```

The screenshot script reads the URL list from `url-inventory.json`, so run the
inventory first. It uses the repository's Playwright with headless Google
Chrome, scrolls each page once so lazy images load, pins the fixed header to
the top of the page, and closes the iubenda consent banner when iubenda shows
one (from some regions it shows none). Add `--only <path>` to capture one page.
`node --test scripts/migration-reference.test.mjs` checks the counts.

## Findings for later tickets

- 13 of the 18 news posts have no title or description in the old HTML: the
  title is `NOTITLE Marianna's Fundraisers`. The other five have a real title
  and description. The parity script must expect a real title on the new site.
- Five URLs are noindex: `/flavored-salsas`, `/flavored-salsas/menu`,
  `/ingredients-list`, `/accessibility-statement`, `/accessibility-policy`.
- The canonicals of `/flavored-salsas` and `/products` end in a slash; every
  other canonical is the path without one.
- The call-to-action row shared by the product pages is not the same on all 16:
  `products/pepperoni-pizza` has no line break where the other 15 have one.
  The importer stops on a difference (spec decision 20), so ticket #16 needs an
  override or a rule for it. The Handmade food row is the same on all 16.
- Copied stories keep their block `_uid`s: 80 rows share a `_uid` with a row in
  another story. A `_uid` is unique only inside one story, so document IDs must
  come from the story UUID (spec decision 20), and keys from the `_uid` stay
  unique only within one array.
- The stories `privacy-policy` and `terms-and-conditions` exist in Storyblok,
  but their URLs redirect to iubenda.
- `schedule-a-free-tasting` has a text column beside its Cognito form. The
  block inventory notes it as needing a hand; ticket #19 gave the Cognito form
  section an optional introduction, and the importer puts that text there.
- Three page banners carry text (`schedule-a-free-tasting`,
  `advertising-templates`, `ingredients-list`). The Page banner section has no
  text field, so the block inventory lists the text as dropped.
- The block inventory counts 29 Page banners (spec: 28) including the two
  stories above, and 1,143 blocks inside story bodies (spec: 1,181 block
  instances). The story, section wrapper and big image counts match the spec.
