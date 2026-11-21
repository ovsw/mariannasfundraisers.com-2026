# URL and SEO parity report

Checked 2026-11-20T23:49:03.521Z by `node scripts/migration/parity.mjs http://localhost:3460` against the old-site inventory captured 2026-11-20T18:15:10.421Z ([`url-inventory.json`](url-inventory.json)).
The machine-readable version is [`parity-report.json`](parity-report.json).

Status, redirect target, title, description, noindex and sitemap membership compare by value; sharing images by presence only. A redirect compares by permanence (301 and 308 are both permanent) and target. Sitemap entries compare by path, so the host the build names does not matter.

67 URLs and 11 redirects compared. Sitemap: 62 URLs found, 62 expected. 8 differences, 55 on purpose.

## Differences

| Path | Field | Old | New |
| --- | --- | --- | --- |
| `/about-us/our-history` | redirect | permanent redirect to /our-story-and-promise | 404 |
| `/about-us/our-promise` | redirect | permanent redirect to /our-story-and-promise | 404 |
| `/about-us/our-team` | redirect | permanent redirect to /hoagie-heroes | 404 |
| `/testimonials` | redirect | permanent redirect to /success-stories | 404 |
| `/about-us/join-our-team` | redirect | permanent redirect to /jobs | 404 |
| `/about-us/in-the-news` | redirect | permanent redirect to /news | 404 |
| `/about-us/contact-us` | redirect | permanent redirect to /contact-us | 404 |
| `/selling-tools` | redirect | permanent redirect to /fundraiser-resources | 404 |

## Differences on purpose

| Path | Field | Old | New | Why |
| --- | --- | --- | --- | --- |
| `/news` | og:image | absent | present | a page without a sharing image falls back to the generated card (spec decision 19) |
| `/news` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/winner-2025-hometown-favorite-sandwich` | title | NOTITLE Marianna's Fundraisers | Winner: 2025 Hometown Favorite Sandwich \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/winner-2025-hometown-favorite-sandwich` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/salsa-sales-supporting-waly-warmth-` | redirect | 200 | 301 /news/salsa-sales-supporting-waly-warmth | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/salsa-sales-supporting-waly-warmth` | title | NOTITLE Marianna's Fundraisers | Salsa Sales Supporting Waly Warmth! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/salsa-sales-supporting-waly-warmth` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/fund-fiesta-is-here-` | redirect | 200 | 301 /news/fund-fiesta-is-here | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/fund-fiesta-is-here` | title | NOTITLE Marianna's Fundraisers | Fund Fiesta is Here! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/fund-fiesta-is-here` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/promotion-spotlight-` | redirect | 200 | 301 /news/promotion-spotlight | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/promotion-spotlight` | title | NOTITLE Marianna's Fundraisers | Promotion Spotlight! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/promotion-spotlight` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/exciting-promotion-` | redirect | 200 | 301 /news/exciting-promotion | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/exciting-promotion` | title | NOTITLE Marianna's Fundraisers | Exciting Promotion! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/exciting-promotion` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/winner:-2024-hometown-favorite-sandwich` | redirect | 200 | 301 /news/winner-2024-hometown-favorite-sandwich | malformed news address: the post moves to a clean address and the old one redirects to it permanently (spec decision 5) |
| `/news/winner-2024-hometown-favorite-sandwich` | title | NOTITLE Marianna's Fundraisers | Winner: 2024 Hometown Favorite Sandwich \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon` | title | NOTITLE Marianna's Fundraisers | Marianna's Teaming Up With The Four Diamonds Mini-THON \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/proud-to-partner-with-skillsusa-pennsylvania` | title | NOTITLE Marianna's Fundraisers | Proud To Partner With SkillsUSA Pennsylvania \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/proud-to-partner-with-skillsusa-pennsylvania` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas/menu` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas/menu` | sitemap | true | false | the sitemap leaves out noindex pages (spec decision 19) |
| `/news/winner-2023-hometown-favorite-sandwich` | title | NOTITLE Marianna's Fundraisers | Winner: 2023 Hometown Favorite Sandwich \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/flavored-salsas` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas` | sitemap | true | false | the sitemap leaves out noindex pages (spec decision 19) |
| `/news/a-scary-successful-sampling` | title | NOTITLE Marianna's Fundraisers | A "Scary" Successful Sampling \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/a-scary-successful-sampling` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/a-new-hoagie-is-joining-the-marianna-s-lineup` | title | NOTITLE Marianna's Fundraisers | A New Hoagie Is Joining The Marianna's Lineup \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/a-new-hoagie-is-joining-the-marianna-s-lineup` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/a-positive-partnership` | title | NOTITLE Marianna's Fundraisers | A Positive Partnership! \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/news/a-positive-partnership` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/order-received` | og:image | absent | present | a page without a sharing image falls back to the generated card (spec decision 19) |
| `/order-received` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/winner-2022-hometown-favorite-sandwich` | title | NOTITLE Marianna's Fundraisers | Winner: 2022 Hometown Favorite Sandwich \| Marianna's Fundraisers | the old site wrote NOTITLE where a news post has no SEO title; the new site names the post (spec decision 19) |
| `/flavored-salsas/sunset-salsa` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/hours-of-operation` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/products/smoked-ham-cheddar-hoagie` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/products/italian-hoagie` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/products/pepperoni-pizza` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas/salsa-pricing-info` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas/cowboy-salsa` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/national-pizza-day-february-9th-2022` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/flavored-salsas/mph-salsa` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/schedule-a-free-tasting` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/special-fundraising-events` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/fresh-and-clean-obsessed` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/hoagie-heroes` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/video-guides` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/documents-and-forms` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/fundraiser-frequently-asked-questions` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/jobs` | og:image:alt | absent | present | the new site gives every sharing image an alt text (spec decision 21) |
| `/ingredients-list` | sitemap | true | false | the sitemap leaves out noindex pages (spec decision 19) |
