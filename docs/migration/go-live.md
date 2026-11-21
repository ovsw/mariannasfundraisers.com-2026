# Go-live checklist

For Ovi, after his visual check of the new site (issue #3, ticket #21). The
proof that the new site matches the old one is in
[`launch-report.md`](launch-report.md). Run every command from the repository
root, on `main` once the final pull request is merged.

The old site is the Vercel project `mfr-web-next` in the `del-grossos` team.
The new site is the Vercel project `mariannasfundraisers-com-2026` in the same
team, and the Sanity project `bgnqkzlg`, dataset `production`, Studio
https://mariannasfundraisers.sanity.studio/.

## 1. Visual check

- [ ] Check the new site against the old one, page by page, on the final pull
      request's local review link. The reference screenshots are in
      `docs/migration/screenshots/`. The differences on purpose are listed at
      the end of this file.
- [ ] Merge the final pull request into `main`.

## 2. Content freeze and final import

- [ ] Agree the content freeze date with the client: from then on, nobody
      edits Storyblok.
- [ ] Refresh the export and preview the import:

      ```sh
      pnpm storyblok:export
      pnpm storyblok:import
      ```

      Read `docs/migration/import-report.md`: the counts must equal the
      export, "Scaffolds" must say None, and "Needs a hand" must hold nothing
      new.
- [ ] Write it: `pnpm storyblok:import --apply`. It backs the dataset up to
      `~/backups/mfr/sanity/` first.
- [ ] Run `pnpm storyblok:import --apply` once more. It must print
      `"created": 0`, `"changed": 0` and an empty `draftsThatHideTheImport`.
- [ ] While the old site is still live, refresh its URL inventory, so pages
      published since the last capture are part of the parity check in step 6:

      ```sh
      node scripts/migration/capture-url-inventory.mjs --export ~/backups/mfr/storyblok-export
      ```

- [ ] Commit the refreshed import report and `docs/migration/url-inventory.*`.
- [ ] From now on, content changes happen in Studio only.

## 3. Production settings on Vercel

In Vercel, project `mariannasfundraisers-com-2026`, Settings > Environment
Variables, Production:

- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.mariannasfundraisers.com`
- [ ] `NEXT_PUBLIC_SITE_ENV` = `production` (without it every page stays
      noindex)
- [ ] Redeploy production, so the build reads both and the redirects
      imported in step 2.

## 4. Move the domains

- [ ] In the old project `mfr-web-next`, Settings > Domains: remove
      `www.mariannasfundraisers.com` and `mariannasfundraisers.com`.
- [ ] In `mariannasfundraisers-com-2026`, Settings > Domains: add
      `www.mariannasfundraisers.com`, and `mariannasfundraisers.com` as a
      redirect to it (as the old project has them). Both projects are in the
      same team, so DNS does not change.
- [ ] Open https://www.mariannasfundraisers.com and
      https://mariannasfundraisers.com and check both land on the new site.

## 5. Publish-time refresh and redirects

- [ ] Point the Sanity function at the real domain:

      ```sh
      pnpm --dir studio exec sanity functions env add invalidate-tags REVALIDATE_TAGS_URL https://www.mariannasfundraisers.com/api/revalidate-tags
      ```

- [ ] Publish a small change in Studio, then check the function log shows that
      the Website expired the sync tags:

      ```sh
      pnpm --dir studio exec sanity functions logs invalidate-tags
      ```

- [ ] Add the real domain to the Sanity project's CORS origins:
      `pnpm setup:sanity-cors`.
- [ ] Connect published redirects to production deploys: `pnpm setup:redirects`
      (it needs `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID` in
      `studio/.env.local`; see `docs/deployment.md`, "Published redirects go
      live in minutes"). Then publish a test redirect and check it works.

## 6. Parity on the live domain

- [ ] Run the parity check against the live site:

      ```sh
      node scripts/migration/parity.mjs https://www.mariannasfundraisers.com --report parity-report-live
      ```

      It must report 0 differences. Commit `docs/migration/parity-report-live.md`
      and `.json`.

## 7. Switch Storyblok off

- [ ] In Storyblok, space "Marianna's Fundraisers", Settings > Webhooks:
      switch off the publish webhook, so a publish there no longer reaches
      the old site.
- [ ] Keep the latest export (`~/backups/mfr/storyblok-export`) and the zip in
      `/storage/backups/mfr/`, then end the Storyblok subscription.

## Differences on purpose

From the spec ("Differences Ovi will see"):

- Page banners have one height; the old site had three on desktop (about a
  dozen banners were shorter).
- Section spacing is one value per section; the old site set margins and
  paddings per section.
- A button icon on the right stays only for `chevron-right` (one "people" icon
  moves to the left).
- Two news posts from early 2022 swap places in the list: the list is ordered
  by publish date.
- Five news URLs change to a clean address, with a permanent redirect from the
  old one: `exciting-promotion-`, `fund-fiesta-is-here-`,
  `promotion-spotlight-`, `salsa-sales-supporting-waly-warmth-` and
  `winner:-2024-hometown-favorite-sandwich`.

From the parity check (`parity-report.md`, "Differences on purpose"):

- The 13 news posts the old site titled "NOTITLE" carry the post's name.
- Pages without a sharing image use the generated sharing card, and every
  sharing image has an alt text.
- The three noindex pages the old sitemap listed are left out of the sitemap.

From the import (`import-report.md`) and the launch check:

- The fixes of spec decision 21: the old `/menu/` links point at the menu, the
  author photos and sharing images have correct alt text, the footer year is
  current, and no Storyblok token or editor script is in the pages.
- The text of three page banners (`schedule-a-free-tasting`,
  `advertising-templates`, `ingredients-list`) is not shown: the Page banner
  section has no text.
- The "Our Team" button on `/our-leadership` has no destination in Storyblok
  and is not shown.
- The pizza pages share one set of hero buttons, the most common one (more
  selections, Pricing Info).
- Three empty rows at the top or middle of three news posts are gone; on the
  old site they were blank space.
- Nine page titles and the News Index stay as the old site had them, although
  Studio warns that the titles are long and the News Index has no header
  text (`launch-report.md`, "Document check").
