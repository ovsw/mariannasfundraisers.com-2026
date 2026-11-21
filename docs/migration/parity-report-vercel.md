# URL and SEO parity report

Checked 2026-11-21T00:31:23.259Z by `node scripts/migration/parity.mjs https://mariannasfundraisers-com-2026-git-feat-imple-4fdc2b-del-grossos.vercel.app --report parity-report-vercel --preview` against the old-site inventory captured 2026-11-20T18:15:10.421Z ([`url-inventory.json`](url-inventory.json)).
The machine-readable version is [`parity-report-vercel.json`](parity-report-vercel.json).

Status, redirect target, title, description, noindex and sitemap membership compare by value; sharing images by presence only. A redirect compares by permanence (301 and 308 are both permanent) and target. Sitemap entries compare by path, so the host the build names does not matter.

67 URLs and 11 redirects compared. Sitemap: 62 URLs found, 62 expected. 0 differences, 117 on purpose.

## Differences

None.

## Differences on purpose

| Path | Field | Old | New | Why |
| --- | --- | --- | --- | --- |
| `/` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news` | og:image | absent | present | a page without a sharing image falls back to the generated card (spec decision 19) |
| `/news` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/winner-2025-hometown-favorite-sandwich` | title | NOTITLE Marianna's Fundraisers | Winner: 2025 Hometown Favorite Sandwich \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/winner-2025-hometown-favorite-sandwich` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/winner-2025-hometown-favorite-sandwich` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/salsa-sales-supporting-waly-warmth-` | redirect | 200 | 301 /news/salsa-sales-supporting-waly-warmth | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/salsa-sales-supporting-waly-warmth` | title | NOTITLE Marianna's Fundraisers | Salsa Sales Supporting Waly Warmth! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/salsa-sales-supporting-waly-warmth` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/salsa-sales-supporting-waly-warmth` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/fund-fiesta-is-here-` | redirect | 200 | 301 /news/fund-fiesta-is-here | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/fund-fiesta-is-here` | title | NOTITLE Marianna's Fundraisers | Fund Fiesta is Here! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/fund-fiesta-is-here` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/fund-fiesta-is-here` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/promotion-spotlight-` | redirect | 200 | 301 /news/promotion-spotlight | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/promotion-spotlight` | title | NOTITLE Marianna's Fundraisers | Promotion Spotlight! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/promotion-spotlight` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/promotion-spotlight` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/exciting-promotion-` | redirect | 200 | 301 /news/exciting-promotion | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/exciting-promotion` | title | NOTITLE Marianna's Fundraisers | Exciting Promotion! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/exciting-promotion` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/exciting-promotion` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/winner:-2024-hometown-favorite-sandwich` | redirect | 200 | 301 /news/winner-2024-hometown-favorite-sandwich | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/winner-2024-hometown-favorite-sandwich` | title | NOTITLE Marianna's Fundraisers | Winner: 2024 Hometown Favorite Sandwich \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/winner-2024-hometown-favorite-sandwich` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon` | title | NOTITLE Marianna's Fundraisers | Marianna's Teaming Up With The Four Diamonds Mini-THON \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/proud-to-partner-with-skillsusa-pennsylvania` | title | NOTITLE Marianna's Fundraisers | Proud To Partner With SkillsUSA Pennsylvania \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/proud-to-partner-with-skillsusa-pennsylvania` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/proud-to-partner-with-skillsusa-pennsylvania` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas/menu` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas/menu` | sitemap | true | false | the sitemap leaves out noindex pages (spec decision 19) |
| `/news/winner-2023-hometown-favorite-sandwich` | title | NOTITLE Marianna's Fundraisers | Winner: 2023 Hometown Favorite Sandwich \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/winner-2023-hometown-favorite-sandwich` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/flavored-salsas` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas` | sitemap | true | false | the sitemap leaves out noindex pages (spec decision 19) |
| `/products` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/a-scary-successful-sampling` | title | NOTITLE Marianna's Fundraisers | A "Scary" Successful Sampling \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/a-scary-successful-sampling` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/a-scary-successful-sampling` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/a-new-hoagie-is-joining-the-marianna-s-lineup` | title | NOTITLE Marianna's Fundraisers | A New Hoagie Is Joining The Marianna's Lineup \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/a-new-hoagie-is-joining-the-marianna-s-lineup` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/a-new-hoagie-is-joining-the-marianna-s-lineup` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/a-positive-partnership` | title | NOTITLE Marianna's Fundraisers | A Positive Partnership! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/a-positive-partnership` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/a-positive-partnership` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/order-received` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/order-received` | og:image | absent | present | a page without a sharing image falls back to the generated card (spec decision 19) |
| `/order-received` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/winner-2022-hometown-favorite-sandwich` | title | NOTITLE Marianna's Fundraisers | Winner: 2022 Hometown Favorite Sandwich \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/winner-2022-hometown-favorite-sandwich` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/national-hoagie-day` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/flavored-salsas/sunset-salsa` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/flavored-salsas/sunset-salsa` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/how-it-works` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/we-re-hiring-february-2022` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/ham-club-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/ham-and-swiss-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/mariannas-hoagies-on-tv` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/hours-of-operation` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/hours-of-operation` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/products/white-pizza` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/traditional-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/smoked-ham-cheddar-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/smoked-ham-cheddar-hoagie` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/products/roast-turkey-with-cheese-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/all-american-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/roast-beef-cheese-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/cheese-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/cheese-pizza` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/sweet-lebanon-bologna-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/italian-hoagie` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/italian-hoagie` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/products/pepperoni-pizza` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/products/pepperoni-pizza` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas/salsa-pricing-info` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/flavored-salsas/salsa-pricing-info` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/pricing-info` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/the-fundraiser-that-sells-itself` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/flavored-salsas/cowboy-salsa` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/flavored-salsas/cowboy-salsa` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/national-pizza-day-february-9th-2022` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/national-pizza-day-february-9th-2022` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas/mph-salsa` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/flavored-salsas/mph-salsa` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/fundraiser-resources` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/get-assistance` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/schedule-a-free-tasting` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/schedule-a-free-tasting` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/special-fundraising-events` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/special-fundraising-events` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/fresh-and-clean-obsessed` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/fresh-and-clean-obsessed` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/hoagie-heroes` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/hoagie-heroes` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/how-it-is-made` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/our-story-and-promise` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/our-leadership` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/success-stories` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/video-guides` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/video-guides` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/10-steps-to-success` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/submit-your-order` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/contact-us` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/find-a-sale` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/documents-and-forms` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/documents-and-forms` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/advertising-templates` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/fundraiser-frequently-asked-questions` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/fundraiser-frequently-asked-questions` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/jobs` | noindex | false | true | a preview deployment marks every page noindex, since NEXT_PUBLIC_SITE_ENV is production only on the live site (checked with --preview) |
| `/jobs` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/ingredients-list` | sitemap | true | false | the sitemap leaves out noindex pages (spec decision 19) |
