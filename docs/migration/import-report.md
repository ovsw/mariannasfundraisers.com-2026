# Storyblok import report

What the importer (`pnpm storyblok:import`, ticket #13) found in the Storyblok export, what it builds, and what it drops or leaves for a hand. Source: 68 draft stories from the Storyblok export. A dry run and `--apply` write the same report; see `docs/migration/import.md`.

## Found

| What | Count |
| --- | --- |
| Stories | 68 |
| Page stories | 34 |
| Product stories | 16 |
| News stories | 18 |
| Files | 164 (160 images, 4 documents) |

## Documents

| Type | Count |
| --- | --- |
| author | 4 |
| blogIndex | 1 |
| footer | 1 |
| homePage | 1 |
| navigation | 1 |
| page | 31 |
| post | 18 |
| redirect | 5 |
| settings | 1 |

Imported as published although unpublished in Storyblok (spec decision 4): /flavored-salsas/menu, /special-fundraising-events.

## Sections

| Section | Count |
| --- | --- |
| badgeAndText | 2 |
| cutoutLeftAndText | 23 |
| cutoutRightAndText | 12 |
| imageAndIconList | 6 |
| latestNews | 1 |
| pageBanner | 27 |
| pageHeading | 21 |
| photoLeftAndText | 19 |
| photoRightAndText | 14 |
| richTextBlock | 27 |
| scaffold | 18 |
| videoLeftAndText | 3 |
| videoRightAndText | 4 |

Scaffolds by the section that will replace them:

| Intended section | Scaffolds |
| --- | --- |
| Call to action with image | 2 |
| Cognito form | 4 |
| FAQ list | 2 |
| Hoagie menu | 1 |
| Home hero | 1 |
| Menu teaser | 1 |
| Pizza menu | 1 |
| Salsa menu | 2 |
| Steps | 1 |
| Testimonials | 1 |
| Two text columns | 2 |

## News addresses that change

Malformed old news slugs get a clean one and a permanent redirect from the old address (spec decision 5).

| Old address | New address |
| --- | --- |
| /news/exciting-promotion- | /news/exciting-promotion |
| /news/fund-fiesta-is-here- | /news/fund-fiesta-is-here |
| /news/promotion-spotlight- | /news/promotion-spotlight |
| /news/salsa-sales-supporting-waly-warmth- | /news/salsa-sales-supporting-waly-warmth |
| /news/winner:-2024-hometown-favorite-sandwich | /news/winner-2024-hometown-favorite-sandwich |

## Not imported here

| Story | Why |
| --- | --- |
| /flavored-salsas/cowboy-salsa | product page: imported by ticket #16 |
| /flavored-salsas/mph-salsa | product page: imported by ticket #16 |
| /flavored-salsas/sunset-salsa | product page: imported by ticket #16 |
| /privacy-policy | the old site redirects this URL to iubenda; it becomes a redirect (ticket #20) |
| /products/all-american-hoagie | product page: imported by ticket #16 |
| /products/cheese-hoagie | product page: imported by ticket #16 |
| /products/cheese-pizza | product page: imported by ticket #16 |
| /products/ham-and-swiss-hoagie | product page: imported by ticket #16 |
| /products/ham-club-hoagie | product page: imported by ticket #16 |
| /products/italian-hoagie | product page: imported by ticket #16 |
| /products/pepperoni-pizza | product page: imported by ticket #16 |
| /products/roast-beef-cheese-hoagie | product page: imported by ticket #16 |
| /products/roast-turkey-with-cheese-hoagie | product page: imported by ticket #16 |
| /products/smoked-ham-cheddar-hoagie | product page: imported by ticket #16 |
| /products/sweet-lebanon-bologna-hoagie | product page: imported by ticket #16 |
| /products/traditional-hoagie | product page: imported by ticket #16 |
| /products/white-pizza | product page: imported by ticket #16 |
| /terms-and-conditions | the old site redirects this URL to iubenda; it becomes a redirect (ticket #20) |

## Needs a hand

| Story | Where | What |
| --- | --- | --- |
| /our-leadership | body[7] section > content[0] row-big-image | button "Our Team" has no destination; it is not imported |
| /schedule-a-free-tasting | body[1] section > content[1] row-two-columns | the text column beside the Cognito form has no field in the Cognito form section |

## Overrides

Applied:

| Story | Where | From | To |
| --- | --- | --- | --- |
| /how-it-is-made | body[3] section > content[0] row-big-image | /menu/ | {"story":"products/","anchor":"hoagies"} |
| /news/national-pizza-day-february-9th-2022 | body[0] section > content[2] row-single-column | /menu/ | {"story":"products/"} |

Not applied in this run:

| Story | From | Why |
| --- | --- | --- |
| products/smoked-ham-cheddar-hoagie | menu/ | product page: imported by ticket #16 |

## Story links stored under an old address

Imported by story UUID, so they point at the story's current page.

None.

## Dropped, by kind

| What | Count |
| --- | --- |
| hero text | 3 |
| links that go nowhere | 1 |
| news: body_rte | 5 |
| news: post heading unlike the story name | 10 |
| option: button.icon_position | 44 |
| option: feature-group.heading_level | 18 |
| option: form_cognito.embed_code | 1 |
| option: heading-group.heading_level | 34 |
| option: heading.style | 17 |
| option: hero.background_color | 28 |
| option: hero.content | 8 |
| option: hero.height | 28 |
| option: hero.is_tall | 4 |
| option: hero.type | 3 |
| option: row-big-image.extra_padding | 50 |
| option: row-big-image.name | 19 |
| option: row-menu-listing.menu_items | 1 |
| option: row-menu-listing.menu_listing | 1 |
| option: row-single-column.name | 8 |
| option: row-two-columns-cta.name | 2 |
| option: row-two-columns.name | 2 |
| option: section.decoration_bottom | 95 |
| option: section.decoration_top | 98 |
| option: section.margin_bottom | 108 |
| option: section.margin_top | 108 |
| option: section.name | 103 |
| option: section.overflow_hidden | 5 |
| option: section.padding_bottom | 100 |
| option: section.padding_top | 99 |
| option: section.width | 108 |
| option: table.remove_margins | 2 |
| rich text: pasted class | 13 |
| rich text: pasted text colour | 66 |

## Images without alt text (124)

Writing these is a follow-up with the Starter's image-description flow (spec, out of scope).

| Story | Where | File |
| --- | --- | --- |
| /10-steps-to-success | body[3] section > content[0] row-big-image | https://a.storyblok.com/f/133593/676x399/18a60ebf73/renee-in-front-of-truck.png |
| /advertising-templates | body[1] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2550x3300/d1ec8edbbb/mfs_sales_info_flyer_2022-01.jpg |
| /advertising-templates | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1800x1200/14f86d4e8f/mfs_social_media_seller_ad_2022.jpg |
| /advertising-templates | body[2] section > content[1] row-big-image | https://a.storyblok.com/f/133593/2400x1920/41339e04de/mfs-social-media-we-are-hosting-a-sale.jpg |
| /advertising-templates | body[2] section > content[2] row-big-image | https://a.storyblok.com/f/133593/2550x1650/dce503efb5/mfs-social-media-order-descriptions.jpg |
| /advertising-templates | body[2] section > content[3] row-big-image | https://a.storyblok.com/f/133593/2400x1920/9090c169d3/mfs-social-media-be-a-hoagie-hero.jpg |
| /advertising-templates | body[2] section > content[4] row-big-image | https://a.storyblok.com/f/133593/2400x1920/99f726dbec/mfs-social-media-eat-good-do-good.jpg |
| /advertising-templates | body[2] section > content[5] row-big-image | https://a.storyblok.com/f/133593/2400x1920/e4dd9243fd/mfs-social-contact-us-to-place-an-order.jpg |
| /advertising-templates | body[2] section > content[6] row-big-image | https://a.storyblok.com/f/133593/2400x1920/6a4b8e3e72/mfs-social-media-contact-us-for-a-sale.jpg |
| /advertising-templates | body[2] section > content[7] row-big-image | https://a.storyblok.com/f/133593/2400x1920/01846e12b4/mfs-social-media-every-order-counts.jpg |
| /advertising-templates | body[3] section > content[0] row-big-image | https://a.storyblok.com/f/133593/797x717/8b6c6b67a4/salsa-flyer.jpg |
| /advertising-templates | body[4] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1800x1200/40685008bd/mfs_salsa_social_seller_ad_2025.jpg |
| /advertising-templates | body[4] section > content[1] row-big-image | https://a.storyblok.com/f/133593/2400x1920/39397d96e2/mfs-social-media-saddle-up-for-a-salsa-sale.jpg |
| /advertising-templates | body[4] section > content[2] row-big-image | https://a.storyblok.com/f/133593/2400x1920/ad08c16ed2/mfs-social-media-turn-up-fundraising-heat.jpg |
| /advertising-templates | body[4] section > content[3] row-big-image | https://a.storyblok.com/f/133593/2400x1920/be64c30f6c/mfs-social-media-salsa-suns-out-salsa-sale.jpg |
| /contact-us | body[1] section > content[0] row-big-image | https://a.storyblok.com/f/133593/632x632/0714d60d8a/diane-on-the-phone.png |
| /documents-and-forms | body[0] hero | https://a.storyblok.com/f/133593/7500x2468/ce0e936612/mfs-group-centered.jpg |
| /documents-and-forms | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/5554x3703/2584932773/mfs_form_fill.jpg |
| /documents-and-forms | body[2] section > content[1] row-big-image | https://a.storyblok.com/f/133593/562x511/3e6bcebc1a/mariannas-how-it-works-start-selling.png |
| /documents-and-forms | body[2] section > content[2] row-big-image | https://a.storyblok.com/f/133593/1677x1808/5a2487e06b/mfs_delivery_2.png |
| /documents-and-forms | body[2] section > content[3] row-big-image | https://a.storyblok.com/f/133593/1471x1071/e88ef4802d/mfs_products_iso.png |
| /find-a-sale | body[1] section > content[0] row-big-image | https://a.storyblok.com/f/133593/632x632/0714d60d8a/diane-on-the-phone.png |
| /flavored-salsas | body[0] hero | https://a.storyblok.com/f/133593/3300x2550/ef12cf3b02/mfs-salsa-presentation-slide-2.jpg |
| /flavored-salsas | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/3300x2550/ef12cf3b02/mfs-salsa-presentation-slide-2.jpg |
| /flavored-salsas | body[2] section > content[1] row-menu-listing | https://a.storyblok.com/f/133593/591x718/439d8061df/2025-mfs-cowboy-salsa.png |
| /flavored-salsas | body[2] section > content[1] row-menu-listing | https://a.storyblok.com/f/133593/591x718/2dfb8391f2/2025-mfs-mph-salsa.png |
| /flavored-salsas | body[2] section > content[1] row-menu-listing | https://a.storyblok.com/f/133593/591x718/ae0d071575/2025-mfs-sunset-salsa.png |
| /flavored-salsas/menu | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/3300x2550/ef12cf3b02/mfs-salsa-presentation-slide-2.jpg |
| /flavored-salsas/menu | body[0] section > content[1] row-menu-listing | https://a.storyblok.com/f/133593/591x718/439d8061df/2025-mfs-cowboy-salsa.png |
| /flavored-salsas/menu | body[0] section > content[1] row-menu-listing | https://a.storyblok.com/f/133593/591x718/2dfb8391f2/2025-mfs-mph-salsa.png |
| /flavored-salsas/menu | body[0] section > content[1] row-menu-listing | https://a.storyblok.com/f/133593/591x718/ae0d071575/2025-mfs-sunset-salsa.png |
| /flavored-salsas/salsa-pricing-info | body[0] hero | https://a.storyblok.com/f/133593/3300x2550/ef12cf3b02/mfs-salsa-presentation-slide-2.jpg |
| /flavored-salsas/salsa-pricing-info | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1466x1304/46b25bb078/mfs_value.png |
| /fresh-and-clean-obsessed | body[0] hero | https://a.storyblok.com/f/133593/5712x4284/76b17f161b/rev-hoagie-heroes-in-front-of-truck.jpg |
| /fresh-and-clean-obsessed | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2400x1602/fb09cdecd2/slicing-machine-close-up.jpg |
| /fresh-and-clean-obsessed | body[3] section > content[0] row-big-image | https://a.storyblok.com/f/133593/4124x3196/a6ce55b601/rev-jeannie-w-lettuce.jpg |
| /fundraiser-frequently-asked-questions | body[0] hero | https://a.storyblok.com/f/133593/6650x3117/9b0ade146d/mfs-truck-in-town.jpg |
| /fundraiser-resources | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/562x511/3e6bcebc1a/mariannas-how-it-works-start-selling.png |
| /hoagie-heroes | body[0] hero | https://a.storyblok.com/f/133593/2400x1602/49523e0d82/hoagie-heroes-group-1.jpg |
| /hoagie-heroes | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/3838x3024/10135eb001/rev-two-men-holding-product.jpg |
| /hoagie-heroes | body[3] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2400x1602/8edc5d0305/mariannas-hoagie-hero-worker-man-3-paper-bag-traditional-hoagies.jpg |
| /hoagie-heroes | body[4] section > content[0] row-big-image | https://a.storyblok.com/f/133593/3828x3024/57b8e69b8b/mfs-girl-wrapping-hoagies.jpg |
| / | body[0] hero | https://a.storyblok.com/f/133593/2500x1669/ef680a23a1/mfs-2024-boys-football-team.jpg |
| / | body[2] section > content[0] row-menu-teaser-one-off | https://a.storyblok.com/f/133593/1717x1087/b6573073a1/hoagie-image-group-badge-3.jpg |
| / | body[3] section > content[0] row-two-columns-cta | https://a.storyblok.com/f/133593/632x632/0714d60d8a/diane-on-the-phone.png |
| / | body[4] section > content[0] row-big-image | https://a.storyblok.com/f/133593/5712x4284/76b17f161b/rev-hoagie-heroes-in-front-of-truck.jpg |
| / | body[5] section > content[0] row-testimonials | https://a.storyblok.com/f/133593/668x872/2c64f1706a/mfs-nov-21-37web.png |
| /hours-of-operation | body[0] hero | https://a.storyblok.com/f/133593/4032x3024/a3f6c5fa9d/truck-unloading-2.jpeg |
| /how-it-is-made | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/4256x2832/1a87192045/mfs-hoagie-pizza.jpg |
| /how-it-is-made | body[3] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2400x1602/fb09cdecd2/slicing-machine-close-up.jpg |
| /how-it-is-made | body[4] section > content[0] row-big-image | https://a.storyblok.com/f/133593/4256x2832/27cb36e3fb/group-2-propped-a.jpg |
| /how-it-is-made | body[5] section > content[0] row-big-image | https://a.storyblok.com/f/133593/4032x3024/29ba871a26/rev-man-holding-mfs-hoagie-stickers.jpg |
| /how-it-works | body[3] section > content[1] row-big-image | https://a.storyblok.com/f/133593/562x511/3e6bcebc1a/mariannas-how-it-works-start-selling.png |
| /how-it-works | body[4] section > content[1] row-big-image | https://a.storyblok.com/f/133593/562x511/1929bdc0c6/mariannas-how-it-works-place-order.png |
| /how-it-works | body[5] section > content[0] row-two-columns-cta | https://a.storyblok.com/f/133593/632x632/0714d60d8a/diane-on-the-phone.png |
| /jobs | body[0] hero | https://a.storyblok.com/f/133593/2400x1602/ecaab0f15e/mariannas-hoagie-hero-worker-woman-pizza-boxes.jpg |
| /jobs | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/5712x4284/76b17f161b/rev-hoagie-heroes-in-front-of-truck.jpg |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | main_image | https://a.storyblok.com/f/133593/3000x2159/a446f0adc2/mfs-lebanon-group-1.jpg |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/3000x2178/1b2f253585/mfs-lebanon-half-hoagie-smoky.jpg |
| /news/a-positive-partnership | main_image | https://a.storyblok.com/f/133593/2382x1822/91922c922f/always-be-loco-assembly.jpeg |
| /news/a-positive-partnership | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1537x2048/8613617386/buddy-loco-school-visit.jpg |
| /news/a-positive-partnership | body[0] section > content[2] row-big-image | https://a.storyblok.com/f/133593/1536x2048/d7fe917d21/buddy-district-sales-manager.jpg |
| /news/a-scary-successful-sampling | main_image | https://a.storyblok.com/f/133593/1778x1073/3c34b3a259/mfs-south-side-elem-pic-for-news-page-cover.jpg |
| /news/a-scary-successful-sampling | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2047x1563/05c2f5eaed/mfs-south-side-elementary-rev.jpg |
| /news/exciting-promotion- | main_image | https://a.storyblok.com/f/133593/960x504/b952265ffb/congratulations.jpeg |
| /news/exciting-promotion- | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2400x3619/63535440f3/dianne-pizza-box-hoagie-wrapped.jpg |
| /news/fund-fiesta-is-here- | main_image | https://a.storyblok.com/f/133593/1800x1200/40685008bd/mfs_salsa_social_seller_ad_2025.jpg |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/3300x2550/ef12cf3b02/mfs-salsa-presentation-slide-2.jpg |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | main_image | https://a.storyblok.com/f/133593/1200x900/abccbdec8e/mini-thon-1.png |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1000x768/f083297f74/best-of-mini-thon-2015-1-nr-1.jpeg |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | main_image | https://a.storyblok.com/f/133593/1485x1020/2f1b46c4a9/mfs-hometown.jpg |
| /news/national-hoagie-day | main_image | https://a.storyblok.com/f/133593/2550x3300/63562393e0/hoagie-dude-01.jpg |
| /news/national-hoagie-day | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1280x962/b484790fad/hoagie-day-juls-and-kc-o-day-pic.jpg |
| /news/national-hoagie-day | body[1] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1512x2016/0b819f6c0b/hoagie-day-ba-school-pic.jpg |
| /news/national-hoagie-day | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1512x2016/645a0e32c5/hoagie-day-psp-pic.jpg |
| /news/national-pizza-day-february-9th-2022 | main_image | https://a.storyblok.com/f/133593/720x960/7edea82237/national-pizza-day-froggy-98.jpg |
| /news/promotion-spotlight- | main_image | https://a.storyblok.com/f/133593/960x504/19b0c4e299/marianna-s-congratulations.jpg |
| /news/promotion-spotlight- | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2991x2868/9fed14431e/arlana-mccracken-promotion.jpg |
| /news/proud-to-partner-with-skillsusa-pennsylvania | main_image | https://a.storyblok.com/f/133593/1200x900/14c4a78b61/skillsusa-pa.jpg |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/600x450/a47c060687/untitled-design-2.png |
| /news/salsa-sales-supporting-waly-warmth- | main_image | https://a.storyblok.com/f/133593/4032x3024/53a66cb7e2/amy-diane-waly-warmth-salsa-fundraiser.jpg |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/5712x4284/86eb002d08/mfs-salsa-waly.jpg |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/3945x4847/431d31291f/juls-bratton-mark-mccraken-todd-hill-hometown-favorites.jpg |
| /news/winner-2025-hometown-favorite-sandwich | main_image | https://a.storyblok.com/f/133593/3033x1042/aab692d039/728x250-mfs-hometown-2025-winner-ad-01.jpg |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/3800x4305/f627c090ca/hometown-favorite-awards-representatives.JPG |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/4032x3024/c866d1b2c4/2024-hometown-favorites-award.jpeg |
| /order-received | body[0] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1956x1602/f18f74712a/eblh64cc.jpg |
| /our-leadership | body[1] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1800x2714/6ca2afe68d/arlana-m-003ret-website.jpg |
| /our-leadership | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1800x2714/44dc07ad9b/diane-harris-169ret-web.jpg |
| /our-leadership | body[3] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1800x2714/dcfc4dcdad/renee-swogger-0040ret-web.jpg |
| /our-leadership | body[4] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1800x2714/91e1697636/kris-wolfe-0072ret-web.jpg |
| /our-leadership | body[5] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1800x2714/49d7f25c59/mark-m-016ret-website.jpg |
| /our-leadership | body[6] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1023x1537/47b9d48f32/todd-hill-rev-pic.png |
| /our-leadership | body[7] section > content[0] row-big-image | https://a.storyblok.com/f/133593/5712x4284/76b17f161b/rev-hoagie-heroes-in-front-of-truck.jpg |
| /our-story-and-promise | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/3600x2790/ed1128ab47/fred-and-murf-sans-text.png |
| /our-story-and-promise | body[3] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1159x853/f5f24f97e3/marianna-pulcino-web.png |
| /our-story-and-promise | body[4] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2400x1602/d67c74c998/firemen-truck-2.jpg |
| /our-story-and-promise | body[6] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2400x3597/e245d7c864/hoagie-hero-kid-pizza-box-2.jpg |
| /pricing-info | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1466x1304/46b25bb078/mfs_value.png |
| /pricing-info | body[3] section > content[0] row-big-image | https://a.storyblok.com/f/133593/562x511/e76e4f06fd/mariannas-how-it-works-call-us.png |
| /products | body[0] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/1717x784/eefd5a43c7/italian-hoagie.jpg |
| /products | body[0] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/1717x784/9dfac8c1cb/ham-club-hoagie.jpg |
| /products | body[0] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/1717x784/6be94de5ff/ham-and-swiss-hoagie.jpg |
| /products | body[0] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/1717x784/c890246c8e/roast-beef-hoagie.jpg |
| /products | body[0] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/1717x784/27b762a603/all-american-hoagie.jpg |
| /products | body[0] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/1717x784/7f64f14461/turkey-hoagie.jpg |
| /products | body[0] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/1717x784/eb8f1bb947/traditional-hoagie.jpg |
| /products | body[0] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/1717x784/6032d89de2/three-cheese-hoagie.jpg |
| /products | body[0] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/1717x784/3639a14baf/ham-and-cheddar-hoagie.jpg |
| /products | body[1] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/948x800/a0ef615e91/mariannas-fundraisers-pepperoni-pizza.jpg |
| /products | body[1] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/948x800/1d119081f4/mariannas-fundraisers-cheese-pizza.jpg |
| /products | body[1] section > content[2] row-menu-listing | https://a.storyblok.com/f/133593/948x800/22ad63b56d/mariannas-fundraisers-white-pizza.jpg |
| /schedule-a-free-tasting | body[0] hero | https://a.storyblok.com/f/133593/2500x1669/bb928c70f4/wresler-hoagie-focus.jpg |
| /special-fundraising-events | body[0] hero | https://a.storyblok.com/f/133593/7360x4912/e802abafe8/girls-with-pizza-and-hoagies.jpg |
| /special-fundraising-events | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/1471x1071/e88ef4802d/mfs_products_iso.png |
| /success-stories | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/4800x3203/95faa88db3/sports-shot-with-product.jpg |
| /success-stories | body[3] section > content[0] row-big-image | https://a.storyblok.com/f/133593/2400x1602/a7d40defe3/hoagie-hero-kid-football-pizza-slice-1.jpg |
| /the-fundraiser-that-sells-itself | body[2] section > content[1] row-big-image | https://a.storyblok.com/f/133593/1466x1304/46b25bb078/mfs_value.png |
| /the-fundraiser-that-sells-itself | body[3] section > content[1] row-big-image | https://a.storyblok.com/f/133593/1471x1071/e88ef4802d/mfs_products_iso.png |
| /the-fundraiser-that-sells-itself | body[4] section > content[1] row-big-image | https://a.storyblok.com/f/133593/1677x1808/5a2487e06b/mfs_delivery_2.png |
| /video-guides | body[0] hero | https://a.storyblok.com/f/133593/4284x5712/ecd755f00f/mfs-renee-swogger-unloading-truck.jpeg |
| /video-guides | body[2] section > content[0] row-big-image | https://a.storyblok.com/f/133593/676x399/18a60ebf73/renee-in-front-of-truck.png |
| /video-guides | body[2] section > content[1] row-big-image | https://a.storyblok.com/f/133593/3024x4032/c5205c3c67/mfs-delivery-day.jpeg |
| /video-guides | body[2] section > content[2] row-big-image | https://a.storyblok.com/f/133593/562x511/e76e4f06fd/mariannas-how-it-works-call-us.png |

## Every dropped item (1192)

| Story | Where | Item |
| --- | --- | --- |
| /10-steps-to-success | body[0] hero hero | hero.height = "empty" |
| /10-steps-to-success | body[0] hero hero | hero.background_color = "shaded" |
| /10-steps-to-success | body[1] section section | section.name = "Main Page Heading" |
| /10-steps-to-success | body[1] section section | section.width = "default" |
| /10-steps-to-success | body[1] section section | section.margin_top = "none" |
| /10-steps-to-success | body[1] section section | section.margin_bottom = "default" |
| /10-steps-to-success | body[1] section section | section.padding_top = "small" |
| /10-steps-to-success | body[1] section section | section.padding_bottom = "small" |
| /10-steps-to-success | body[1] section section | section.decoration_top = "default" |
| /10-steps-to-success | body[1] section section | section.decoration_bottom = "brushed2" |
| /10-steps-to-success | body[2] section section | section.name = "10 steps to success" |
| /10-steps-to-success | body[2] section section | section.width = "narrow" |
| /10-steps-to-success | body[2] section section | section.margin_top = "none" |
| /10-steps-to-success | body[2] section section | section.margin_bottom = "none" |
| /10-steps-to-success | body[2] section section | section.padding_top = "small" |
| /10-steps-to-success | body[2] section section | section.padding_bottom = "large" |
| /10-steps-to-success | body[2] section section | section.decoration_top = "default" |
| /10-steps-to-success | body[2] section section | section.decoration_bottom = "none" |
| /10-steps-to-success | body[3] section section | section.name = "Hoagie Heroes" |
| /10-steps-to-success | body[3] section section | section.width = "full" |
| /10-steps-to-success | body[3] section section | section.margin_top = "default" |
| /10-steps-to-success | body[3] section section | section.margin_bottom = "default" |
| /10-steps-to-success | body[3] section section | section.padding_top = "default" |
| /10-steps-to-success | body[3] section section | section.padding_bottom = "default" |
| /10-steps-to-success | body[3] section section | section.decoration_top = "default" |
| /10-steps-to-success | body[3] section section | section.decoration_bottom = "none" |
| /10-steps-to-success | body[3] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /10-steps-to-success | body[3] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "right" |
| /10-steps-to-success | body[3] section > content[0] row-big-image | rich text mark: pasted text colour |
| /10-steps-to-success | body[3] section > content[0] row-big-image | rich text mark: pasted text colour |
| /accessibility-policy | body[0] hero hero | hero.height = "default" |
| /accessibility-policy | body[0] hero hero | hero.background_color = "white" |
| /accessibility-policy | body[1] section section | section.name = "Hoagie Heroes" |
| /accessibility-policy | body[1] section section | section.width = "narrow" |
| /accessibility-policy | body[1] section section | section.margin_top = "none" |
| /accessibility-policy | body[1] section section | section.margin_bottom = "none" |
| /accessibility-policy | body[1] section section | section.padding_top = "default" |
| /accessibility-policy | body[1] section section | section.padding_bottom = "large" |
| /accessibility-policy | body[1] section section | section.decoration_top = "default" |
| /accessibility-policy | body[1] section section | section.decoration_bottom = "none" |
| /accessibility-policy | body[1] section > content[0] row-single-column row-single-column.content[0] heading-group | heading-group.heading_level = "h1" |
| /accessibility-statement | body[0] hero hero | hero.height = "default" |
| /accessibility-statement | body[0] hero hero | hero.background_color = "white" |
| /accessibility-statement | body[1] section section | section.width = "narrow" |
| /accessibility-statement | body[1] section section | section.margin_top = "none" |
| /accessibility-statement | body[1] section section | section.margin_bottom = "none" |
| /accessibility-statement | body[1] section section | section.padding_top = "default" |
| /accessibility-statement | body[1] section section | section.padding_bottom = "large" |
| /accessibility-statement | body[1] section section | section.decoration_top = "default" |
| /accessibility-statement | body[1] section section | section.decoration_bottom = "none" |
| /accessibility-statement | body[1] section > content[0] row-single-column row-single-column.content[0] heading-group | heading-group.heading_level = "h1" |
| /advertising-templates | body[0] hero hero | hero.height = "short" |
| /advertising-templates | body[0] hero hero | hero.background_color = "white" |
| /advertising-templates | body[0] hero | hero text (the Page banner has no text field) |
| /advertising-templates | body[1] section section | section.name = "Hoagie Heroes" |
| /advertising-templates | body[1] section section | section.width = "default" |
| /advertising-templates | body[1] section section | section.margin_top = "none" |
| /advertising-templates | body[1] section section | section.margin_bottom = "default" |
| /advertising-templates | body[1] section section | section.padding_top = "default" |
| /advertising-templates | body[1] section section | section.padding_bottom = "default" |
| /advertising-templates | body[1] section section | section.decoration_top = "default" |
| /advertising-templates | body[1] section section | section.decoration_bottom = "none" |
| /advertising-templates | body[1] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[1] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[1] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[2] section section | section.name = "Hoagie Heroes" |
| /advertising-templates | body[2] section section | section.width = "default" |
| /advertising-templates | body[2] section section | section.margin_top = "none" |
| /advertising-templates | body[2] section section | section.margin_bottom = "default" |
| /advertising-templates | body[2] section section | section.padding_top = "default" |
| /advertising-templates | body[2] section section | section.padding_bottom = "default" |
| /advertising-templates | body[2] section section | section.decoration_top = "default" |
| /advertising-templates | body[2] section section | section.decoration_bottom = "none" |
| /advertising-templates | body[2] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[2] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[2] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[2] section > content[1] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[2] section > content[1] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[2] section > content[1] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[2] section > content[2] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[2] section > content[2] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[2] section > content[2] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[2] section > content[3] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[2] section > content[3] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[2] section > content[3] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[2] section > content[4] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[2] section > content[4] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[2] section > content[4] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[2] section > content[5] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[2] section > content[5] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[2] section > content[5] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[2] section > content[6] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[2] section > content[6] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[2] section > content[6] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[2] section > content[7] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[2] section > content[7] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[2] section > content[7] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[3] section section | section.name = "Hoagie Heroes" |
| /advertising-templates | body[3] section section | section.width = "default" |
| /advertising-templates | body[3] section section | section.margin_top = "none" |
| /advertising-templates | body[3] section section | section.margin_bottom = "default" |
| /advertising-templates | body[3] section section | section.padding_top = "default" |
| /advertising-templates | body[3] section section | section.padding_bottom = "default" |
| /advertising-templates | body[3] section section | section.decoration_top = "default" |
| /advertising-templates | body[3] section section | section.decoration_bottom = "none" |
| /advertising-templates | body[3] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[3] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[3] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[4] section section | section.name = "Hoagie Heroes" |
| /advertising-templates | body[4] section section | section.width = "default" |
| /advertising-templates | body[4] section section | section.margin_top = "none" |
| /advertising-templates | body[4] section section | section.margin_bottom = "default" |
| /advertising-templates | body[4] section section | section.padding_top = "default" |
| /advertising-templates | body[4] section section | section.padding_bottom = "default" |
| /advertising-templates | body[4] section section | section.decoration_top = "default" |
| /advertising-templates | body[4] section section | section.decoration_bottom = "none" |
| /advertising-templates | body[4] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[4] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[4] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[4] section > content[1] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[4] section > content[1] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[4] section > content[1] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[4] section > content[2] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[4] section > content[2] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[4] section > content[2] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /advertising-templates | body[4] section > content[3] row-big-image row-big-image | row-big-image.extra_padding = true |
| /advertising-templates | body[4] section > content[3] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /advertising-templates | body[4] section > content[3] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /contact-us | body[0] hero hero | hero.height = "short" |
| /contact-us | body[0] hero hero | hero.background_color = "shaded" |
| /contact-us | body[1] section section | section.name = "Hoagie Heroes" |
| /contact-us | body[1] section section | section.width = "default" |
| /contact-us | body[1] section section | section.margin_top = "none" |
| /contact-us | body[1] section section | section.margin_bottom = "none" |
| /contact-us | body[1] section section | section.padding_top = "default" |
| /contact-us | body[1] section section | section.padding_bottom = "large" |
| /contact-us | body[1] section section | section.decoration_top = "default" |
| /contact-us | body[1] section section | section.decoration_bottom = "none" |
| /contact-us | body[1] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /contact-us | body[1] section > content[0] row-big-image | rich text mark: pasted class |
| /contact-us | body[1] section > content[0] row-big-image | rich text mark: pasted class |
| /contact-us | body[1] section > content[1] row-single-column row-single-column | row-single-column.name = "Support Form" |
| /documents-and-forms | body[0] hero hero | hero.height = "default" |
| /documents-and-forms | body[0] hero hero | hero.type = "normal" |
| /documents-and-forms | body[0] hero hero | hero.background_color = "shaded" |
| /documents-and-forms | body[1] section section | section.name = "Main Page Heading" |
| /documents-and-forms | body[1] section section | section.width = "default" |
| /documents-and-forms | body[1] section section | section.margin_top = "none" |
| /documents-and-forms | body[1] section section | section.margin_bottom = "default" |
| /documents-and-forms | body[1] section section | section.padding_top = "small" |
| /documents-and-forms | body[1] section section | section.padding_bottom = "small" |
| /documents-and-forms | body[1] section section | section.decoration_top = "default" |
| /documents-and-forms | body[1] section section | section.decoration_bottom = "brushed2" |
| /documents-and-forms | body[2] section section | section.name = "Hoagie Heroes" |
| /documents-and-forms | body[2] section section | section.width = "default" |
| /documents-and-forms | body[2] section section | section.margin_top = "none" |
| /documents-and-forms | body[2] section section | section.margin_bottom = "none" |
| /documents-and-forms | body[2] section section | section.padding_top = "default" |
| /documents-and-forms | body[2] section section | section.padding_bottom = "large" |
| /documents-and-forms | body[2] section section | section.decoration_top = "default" |
| /documents-and-forms | body[2] section section | section.decoration_bottom = "none" |
| /documents-and-forms | body[2] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /documents-and-forms | body[2] section > content[1] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "right" |
| /documents-and-forms | body[2] section > content[1] row-big-image row-big-image.content[3] button-group.content[0] button | button.icon_position = "right" |
| /documents-and-forms | body[2] section > content[2] row-big-image row-big-image | row-big-image.name = "Sorting Sheets" |
| /documents-and-forms | body[2] section > content[2] row-big-image row-big-image | row-big-image.extra_padding = true |
| /documents-and-forms | body[2] section > content[2] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /documents-and-forms | body[2] section > content[2] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "right" |
| /documents-and-forms | body[2] section > content[3] row-big-image row-big-image | row-big-image.name = "Large Groups?" |
| /documents-and-forms | body[2] section > content[3] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /find-a-sale | body[0] hero hero | hero.height = "short" |
| /find-a-sale | body[0] hero hero | hero.background_color = "shaded" |
| /find-a-sale | body[1] section section | section.name = "Hoagie Heroes" |
| /find-a-sale | body[1] section section | section.width = "default" |
| /find-a-sale | body[1] section section | section.margin_top = "none" |
| /find-a-sale | body[1] section section | section.margin_bottom = "none" |
| /find-a-sale | body[1] section section | section.padding_top = "default" |
| /find-a-sale | body[1] section section | section.padding_bottom = "large" |
| /find-a-sale | body[1] section section | section.decoration_top = "default" |
| /find-a-sale | body[1] section section | section.decoration_bottom = "none" |
| /find-a-sale | body[1] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /find-a-sale | body[1] section > content[1] row-single-column row-single-column | row-single-column.name = "Contact Form" |
| /find-a-sale | body[1] section > content[1] row-single-column row-single-column.content[0] heading-group | heading-group.heading_level = "h2" |
| /find-a-sale | body[1] section > content[2] row-single-column row-single-column | row-single-column.name = "Support Form" |
| /flavored-salsas | body[0] hero hero | hero.height = "empty" |
| /flavored-salsas | body[0] hero hero | hero.background_color = "green" |
| /flavored-salsas | body[0] hero hero | hero.content = ["heading"] |
| /flavored-salsas | body[1] section section | section.name = "Main Page Heading" |
| /flavored-salsas | body[1] section section | section.width = "default" |
| /flavored-salsas | body[1] section section | section.margin_top = "none" |
| /flavored-salsas | body[1] section section | section.margin_bottom = "default" |
| /flavored-salsas | body[1] section section | section.padding_top = "none" |
| /flavored-salsas | body[1] section section | section.padding_bottom = "small" |
| /flavored-salsas | body[1] section section | section.decoration_top = "default" |
| /flavored-salsas | body[1] section section | section.decoration_bottom = "brushed2" |
| /flavored-salsas | body[2] section section | section.name = "Salsas" |
| /flavored-salsas | body[2] section section | section.width = "default" |
| /flavored-salsas | body[2] section section | section.margin_top = "none" |
| /flavored-salsas | body[2] section section | section.margin_bottom = "none" |
| /flavored-salsas | body[2] section section | section.padding_top = "none" |
| /flavored-salsas | body[2] section section | section.padding_bottom = "large" |
| /flavored-salsas | body[2] section section | section.overflow_hidden = true |
| /flavored-salsas | body[2] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /flavored-salsas | body[2] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "right" |
| /flavored-salsas/menu | body[0] section section | section.name = "Salsas" |
| /flavored-salsas/menu | body[0] section section | section.width = "default" |
| /flavored-salsas/menu | body[0] section section | section.margin_top = "none" |
| /flavored-salsas/menu | body[0] section section | section.margin_bottom = "none" |
| /flavored-salsas/menu | body[0] section section | section.padding_top = "large" |
| /flavored-salsas/menu | body[0] section section | section.overflow_hidden = true |
| /flavored-salsas/menu | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /flavored-salsas/menu | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /flavored-salsas/menu | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /flavored-salsas/salsa-pricing-info | body[0] hero hero | hero.height = "empty" |
| /flavored-salsas/salsa-pricing-info | body[0] hero hero | hero.background_color = "green" |
| /flavored-salsas/salsa-pricing-info | body[0] hero hero | hero.content = ["heading"] |
| /flavored-salsas/salsa-pricing-info | body[1] section section | section.name = "Main Page Heading" |
| /flavored-salsas/salsa-pricing-info | body[1] section section | section.width = "default" |
| /flavored-salsas/salsa-pricing-info | body[1] section section | section.margin_top = "none" |
| /flavored-salsas/salsa-pricing-info | body[1] section section | section.margin_bottom = "default" |
| /flavored-salsas/salsa-pricing-info | body[1] section section | section.padding_top = "none" |
| /flavored-salsas/salsa-pricing-info | body[1] section section | section.padding_bottom = "small" |
| /flavored-salsas/salsa-pricing-info | body[1] section section | section.decoration_top = "default" |
| /flavored-salsas/salsa-pricing-info | body[1] section section | section.decoration_bottom = "brushed2" |
| /flavored-salsas/salsa-pricing-info | body[2] section section | section.name = "Hoagie Heroes" |
| /flavored-salsas/salsa-pricing-info | body[2] section section | section.width = "default" |
| /flavored-salsas/salsa-pricing-info | body[2] section section | section.margin_top = "none" |
| /flavored-salsas/salsa-pricing-info | body[2] section section | section.margin_bottom = "none" |
| /flavored-salsas/salsa-pricing-info | body[2] section section | section.padding_top = "none" |
| /flavored-salsas/salsa-pricing-info | body[2] section section | section.padding_bottom = "default" |
| /flavored-salsas/salsa-pricing-info | body[2] section section | section.decoration_top = "default" |
| /flavored-salsas/salsa-pricing-info | body[2] section section | section.decoration_bottom = "none" |
| /flavored-salsas/salsa-pricing-info | body[2] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /flavored-salsas/salsa-pricing-info | body[2] section > content[0] row-big-image row-big-image.content[2] table | table.remove_margins = true |
| /fresh-and-clean-obsessed | body[0] hero hero | hero.height = "empty" |
| /fresh-and-clean-obsessed | body[0] hero hero | hero.background_color = "white" |
| /fresh-and-clean-obsessed | body[1] section section | section.name = "Main Page Heading" |
| /fresh-and-clean-obsessed | body[1] section section | section.width = "default" |
| /fresh-and-clean-obsessed | body[1] section section | section.margin_top = "none" |
| /fresh-and-clean-obsessed | body[1] section section | section.margin_bottom = "default" |
| /fresh-and-clean-obsessed | body[1] section section | section.padding_top = "small" |
| /fresh-and-clean-obsessed | body[1] section section | section.padding_bottom = "small" |
| /fresh-and-clean-obsessed | body[1] section section | section.decoration_top = "default" |
| /fresh-and-clean-obsessed | body[1] section section | section.decoration_bottom = "brushed2" |
| /fresh-and-clean-obsessed | body[2] section section | section.name = "Fresh" |
| /fresh-and-clean-obsessed | body[2] section section | section.width = "default" |
| /fresh-and-clean-obsessed | body[2] section section | section.margin_top = "none" |
| /fresh-and-clean-obsessed | body[2] section section | section.margin_bottom = "none" |
| /fresh-and-clean-obsessed | body[2] section section | section.padding_bottom = "large" |
| /fresh-and-clean-obsessed | body[2] section > content[0] row-big-image row-big-image | row-big-image.name = "Fresh" |
| /fresh-and-clean-obsessed | body[2] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /fresh-and-clean-obsessed | body[3] section section | section.name = "Clean" |
| /fresh-and-clean-obsessed | body[3] section section | section.width = "default" |
| /fresh-and-clean-obsessed | body[3] section section | section.margin_top = "none" |
| /fresh-and-clean-obsessed | body[3] section section | section.margin_bottom = "none" |
| /fresh-and-clean-obsessed | body[3] section section | section.padding_top = "default" |
| /fresh-and-clean-obsessed | body[3] section section | section.padding_bottom = "large" |
| /fresh-and-clean-obsessed | body[3] section section | section.decoration_top = "brushed2" |
| /fresh-and-clean-obsessed | body[3] section > content[0] row-big-image row-big-image | row-big-image.name = "Fresh" |
| /fresh-and-clean-obsessed | body[3] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /fresh-and-clean-obsessed | body[3] section > content[0] row-big-image | rich text mark: pasted class |
| /fresh-and-clean-obsessed | body[3] section > content[0] row-big-image | rich text mark: pasted class |
| /fundraiser-frequently-asked-questions | body[0] hero hero | hero.height = "tall" |
| /fundraiser-frequently-asked-questions | body[0] hero hero | hero.background_color = "shaded" |
| /fundraiser-frequently-asked-questions | body[1] section section | section.name = "Main Page Heading" |
| /fundraiser-frequently-asked-questions | body[1] section section | section.width = "default" |
| /fundraiser-frequently-asked-questions | body[1] section section | section.margin_top = "none" |
| /fundraiser-frequently-asked-questions | body[1] section section | section.margin_bottom = "default" |
| /fundraiser-frequently-asked-questions | body[1] section section | section.padding_top = "small" |
| /fundraiser-frequently-asked-questions | body[1] section section | section.padding_bottom = "small" |
| /fundraiser-frequently-asked-questions | body[1] section section | section.decoration_top = "default" |
| /fundraiser-frequently-asked-questions | body[1] section section | section.decoration_bottom = "brushed2" |
| /fundraiser-frequently-asked-questions | body[2] section section | section.name = "Hoagie Heroes" |
| /fundraiser-frequently-asked-questions | body[2] section section | section.width = "narrow" |
| /fundraiser-frequently-asked-questions | body[2] section section | section.margin_top = "none" |
| /fundraiser-frequently-asked-questions | body[2] section section | section.margin_bottom = "default" |
| /fundraiser-frequently-asked-questions | body[2] section section | section.padding_top = "small" |
| /fundraiser-frequently-asked-questions | body[2] section section | section.padding_bottom = "default" |
| /fundraiser-frequently-asked-questions | body[2] section section | section.decoration_top = "default" |
| /fundraiser-frequently-asked-questions | body[2] section section | section.decoration_bottom = "none" |
| /fundraiser-frequently-asked-questions | body[2] section > content[0] row-single-column row-single-column | row-single-column.name = "FAQs" |
| /fundraiser-frequently-asked-questions | body[2] section > content[0] row-single-column | rich text mark: pasted text colour |
| /fundraiser-frequently-asked-questions | body[2] section > content[0] row-single-column | rich text mark: pasted text colour |
| /fundraiser-frequently-asked-questions | body[2] section > content[0] row-single-column | rich text mark: pasted text colour |
| /fundraiser-frequently-asked-questions | body[2] section > content[0] row-single-column | rich text mark: pasted text colour |
| /fundraiser-frequently-asked-questions | body[2] section > content[0] row-single-column | rich text mark: pasted text colour |
| /fundraiser-frequently-asked-questions | body[2] section > content[0] row-single-column | rich text mark: pasted text colour |
| /fundraiser-resources | body[0] hero hero | hero.height = "short" |
| /fundraiser-resources | body[0] hero hero | hero.is_tall = true |
| /fundraiser-resources | body[0] hero hero | hero.background_color = "shaded" |
| /fundraiser-resources | body[0] hero hero | hero.content = ["heading"] |
| /fundraiser-resources | body[1] section section | section.name = "Main Page Heading" |
| /fundraiser-resources | body[1] section section | section.width = "default" |
| /fundraiser-resources | body[1] section section | section.margin_top = "none" |
| /fundraiser-resources | body[1] section section | section.margin_bottom = "default" |
| /fundraiser-resources | body[1] section section | section.padding_top = "small" |
| /fundraiser-resources | body[1] section section | section.padding_bottom = "small" |
| /fundraiser-resources | body[1] section section | section.decoration_top = "default" |
| /fundraiser-resources | body[1] section section | section.decoration_bottom = "brushed2" |
| /fundraiser-resources | body[2] section section | section.name = "Hoagie Heroes" |
| /fundraiser-resources | body[2] section section | section.width = "full" |
| /fundraiser-resources | body[2] section section | section.margin_top = "none" |
| /fundraiser-resources | body[2] section section | section.margin_bottom = "none" |
| /fundraiser-resources | body[2] section section | section.padding_top = "default" |
| /fundraiser-resources | body[2] section section | section.padding_bottom = "large" |
| /fundraiser-resources | body[2] section section | section.decoration_top = "default" |
| /fundraiser-resources | body[2] section section | section.decoration_bottom = "none" |
| /fundraiser-resources | body[2] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /fundraiser-resources | body[2] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "right" |
| /fundraiser-resources | body[2] section > content[0] row-big-image row-big-image.content[2] button-group.content[1] button | button.icon_position = "right" |
| /fundraiser-resources | body[2] section > content[0] row-big-image row-big-image.content[3] button-group.content[0] button | button.icon_position = "right" |
| /fundraiser-resources | body[2] section > content[0] row-big-image row-big-image.content[3] button-group.content[1] button | button.icon_position = "right" |
| /get-assistance | body[0] hero hero | hero.height = "empty" |
| /get-assistance | body[0] hero hero | hero.background_color = "shaded" |
| /get-assistance | body[1] section section | section.name = "Main Page Heading" |
| /get-assistance | body[1] section section | section.width = "default" |
| /get-assistance | body[1] section section | section.margin_top = "none" |
| /get-assistance | body[1] section section | section.margin_bottom = "default" |
| /get-assistance | body[1] section section | section.padding_top = "small" |
| /get-assistance | body[1] section section | section.padding_bottom = "small" |
| /get-assistance | body[1] section section | section.decoration_top = "default" |
| /get-assistance | body[1] section section | section.decoration_bottom = "brushed2" |
| /get-assistance | body[2] section section | section.name = "Hoagie Heroes" |
| /get-assistance | body[2] section section | section.width = "narrow" |
| /get-assistance | body[2] section section | section.margin_top = "none" |
| /get-assistance | body[2] section section | section.margin_bottom = "default" |
| /get-assistance | body[2] section section | section.padding_top = "default" |
| /get-assistance | body[2] section section | section.padding_bottom = "default" |
| /get-assistance | body[2] section section | section.decoration_top = "default" |
| /get-assistance | body[2] section section | section.decoration_bottom = "none" |
| /get-assistance | body[3] section section | section.name = "Support Form" |
| /get-assistance | body[3] section section | section.width = "narrow" |
| /get-assistance | body[3] section section | section.margin_top = "none" |
| /get-assistance | body[3] section section | section.margin_bottom = "none" |
| /get-assistance | body[3] section section | section.padding_top = "default" |
| /get-assistance | body[3] section section | section.padding_bottom = "default" |
| /get-assistance | body[3] section section | section.decoration_top = "brushed1" |
| /get-assistance | body[3] section section | section.decoration_bottom = "none" |
| /get-assistance | body[3] section > content[0] row-single-column row-single-column.content[1] form_cognito | form_cognito.embed_code = "(pasted embed code; the form is imported by its form ID)" |
| /hoagie-heroes | body[0] hero hero | hero.height = "empty" |
| /hoagie-heroes | body[0] hero hero | hero.background_color = "shaded" |
| /hoagie-heroes | body[1] section section | section.name = "Main Page Heading" |
| /hoagie-heroes | body[1] section section | section.width = "default" |
| /hoagie-heroes | body[1] section section | section.margin_top = "none" |
| /hoagie-heroes | body[1] section section | section.margin_bottom = "default" |
| /hoagie-heroes | body[1] section section | section.padding_top = "small" |
| /hoagie-heroes | body[1] section section | section.padding_bottom = "small" |
| /hoagie-heroes | body[1] section section | section.decoration_top = "default" |
| /hoagie-heroes | body[1] section section | section.decoration_bottom = "brushed2" |
| /hoagie-heroes | body[2] section section | section.name = "Hoagie Heroes" |
| /hoagie-heroes | body[2] section section | section.width = "full" |
| /hoagie-heroes | body[2] section section | section.margin_top = "none" |
| /hoagie-heroes | body[2] section section | section.margin_bottom = "none" |
| /hoagie-heroes | body[2] section section | section.padding_top = "default" |
| /hoagie-heroes | body[2] section section | section.padding_bottom = "large" |
| /hoagie-heroes | body[2] section section | section.decoration_top = "default" |
| /hoagie-heroes | body[2] section section | section.decoration_bottom = "none" |
| /hoagie-heroes | body[2] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /hoagie-heroes | body[3] section section | section.name = "Hoagie Heroes" |
| /hoagie-heroes | body[3] section section | section.width = "full" |
| /hoagie-heroes | body[3] section section | section.margin_top = "default" |
| /hoagie-heroes | body[3] section section | section.margin_bottom = "default" |
| /hoagie-heroes | body[3] section section | section.padding_top = "large" |
| /hoagie-heroes | body[3] section section | section.padding_bottom = "large" |
| /hoagie-heroes | body[3] section section | section.decoration_top = "brushed2" |
| /hoagie-heroes | body[3] section section | section.decoration_bottom = "brushed2" |
| /hoagie-heroes | body[3] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /hoagie-heroes | body[4] section section | section.name = "Hoagie Heroes" |
| /hoagie-heroes | body[4] section section | section.width = "full" |
| /hoagie-heroes | body[4] section section | section.margin_top = "none" |
| /hoagie-heroes | body[4] section section | section.margin_bottom = "none" |
| /hoagie-heroes | body[4] section section | section.padding_top = "large" |
| /hoagie-heroes | body[4] section section | section.padding_bottom = "large" |
| /hoagie-heroes | body[4] section section | section.decoration_top = "default" |
| /hoagie-heroes | body[4] section section | section.decoration_bottom = "none" |
| /hoagie-heroes | body[4] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /hoagie-heroes | body[4] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| /hoagie-heroes | body[4] section > content[0] row-big-image row-big-image.content[2] button-group.content[1] button | button.icon_position = "right" |
| / | body[0] hero hero | hero.height = "tall" |
| / | body[0] hero hero | hero.is_tall = true |
| / | body[0] hero hero | hero.type = "normal" |
| / | body[0] hero hero | hero.background_color = "white" |
| / | body[0] hero hero | hero.content = ["heading"] |
| / | body[1] section section | section.name = "How it works 1" |
| / | body[1] section section | section.width = "default" |
| / | body[1] section section | section.margin_top = "none" |
| / | body[1] section section | section.margin_bottom = "default" |
| / | body[1] section section | section.padding_bottom = "default" |
| / | body[1] section section | section.decoration_top = "default" |
| / | body[1] section > content[0] row-single-column row-single-column | row-single-column.name = "Section Heading" |
| / | body[1] section > content[2] row-big-image row-big-image | row-big-image.name = "It's that Easy" |
| / | body[1] section > content[2] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| / | body[1] section > content[2] row-big-image row-big-image.content[2] button-group.content[1] button | button.icon_position = "left" |
| / | body[1] section > content[2] row-big-image | rich text mark: pasted class |
| / | body[1] section > content[2] row-big-image | rich text mark: pasted class |
| / | body[1] section > content[2] row-big-image | rich text mark: pasted class |
| / | body[2] section section | section.name = "Menu" |
| / | body[2] section section | section.width = "default" |
| / | body[2] section section | section.margin_top = "default" |
| / | body[2] section section | section.margin_bottom = "none" |
| / | body[2] section section | section.padding_top = "default" |
| / | body[2] section section | section.padding_bottom = "default" |
| / | body[2] section section | section.decoration_top = "brushed2" |
| / | body[2] section section | section.overflow_hidden = true |
| / | body[2] section > content[0] row-menu-teaser-one-off row-menu-teaser-one-off.content_1[0] heading | heading.style = "h1" |
| / | body[2] section > content[0] row-menu-teaser-one-off row-menu-teaser-one-off.content_1[2] button-group.content[0] button | button.icon_position = "left" |
| / | body[2] section > content[0] row-menu-teaser-one-off row-menu-teaser-one-off.content_2[0] heading | heading.style = "h1" |
| / | body[2] section > content[0] row-menu-teaser-one-off row-menu-teaser-one-off.content_2[2] button-group.content[0] button | button.icon_position = "left" |
| / | body[2] section > content[0] row-menu-teaser-one-off | rich text mark: pasted class |
| / | body[2] section > content[0] row-menu-teaser-one-off | rich text mark: pasted class |
| / | body[2] section > content[0] row-menu-teaser-one-off | rich text mark: pasted class |
| / | body[2] section > content[0] row-menu-teaser-one-off | rich text mark: pasted class |
| / | body[3] section section | section.name = "CTA - 40 Years of Experience" |
| / | body[3] section section | section.width = "default" |
| / | body[3] section section | section.margin_top = "none" |
| / | body[3] section section | section.margin_bottom = "default" |
| / | body[3] section section | section.padding_top = "default" |
| / | body[3] section section | section.padding_bottom = "default" |
| / | body[3] section section | section.decoration_top = "default" |
| / | body[3] section section | section.decoration_bottom = "brushed2" |
| / | body[3] section > content[0] row-two-columns-cta row-two-columns-cta | row-two-columns-cta.name = "Over 40 Years of Experience" |
| / | body[3] section > content[0] row-two-columns-cta row-two-columns-cta.content_main[0] heading | heading.style = "h1" |
| / | body[3] section > content[0] row-two-columns-cta row-two-columns-cta.content_buttons[0] button | button.icon_position = "left" |
| / | body[4] section section | section.name = "Hoagie Heroes" |
| / | body[4] section section | section.width = "full" |
| / | body[4] section section | section.margin_top = "none" |
| / | body[4] section section | section.margin_bottom = "overlapping" |
| / | body[4] section section | section.padding_top = "default" |
| / | body[4] section section | section.padding_bottom = "large" |
| / | body[4] section section | section.decoration_top = "default" |
| / | body[4] section section | section.decoration_bottom = "brushed2" |
| / | body[4] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| / | body[4] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "left" |
| / | body[4] section > content[0] row-big-image row-big-image.content[2] button-group.content[1] button | button.icon_position = "left" |
| / | body[5] section section | section.name = "Featured Testimonials" |
| / | body[5] section section | section.width = "default" |
| / | body[5] section section | section.margin_top = "default" |
| / | body[5] section section | section.margin_bottom = "default" |
| / | body[5] section section | section.decoration_top = "default" |
| /hours-of-operation | body[0] hero hero | hero.height = "empty" |
| /hours-of-operation | body[0] hero hero | hero.background_color = "green" |
| /hours-of-operation | body[0] hero hero | hero.content = ["heading"] |
| /hours-of-operation | body[1] section section | section.name = "Main Page Heading" |
| /hours-of-operation | body[1] section section | section.width = "default" |
| /hours-of-operation | body[1] section section | section.margin_top = "none" |
| /hours-of-operation | body[1] section section | section.margin_bottom = "default" |
| /hours-of-operation | body[1] section section | section.padding_top = "none" |
| /hours-of-operation | body[1] section section | section.padding_bottom = "small" |
| /hours-of-operation | body[1] section section | section.decoration_top = "default" |
| /hours-of-operation | body[1] section section | section.decoration_bottom = "brushed2" |
| /hours-of-operation | body[2] section section | section.name = "Main Page Heading" |
| /hours-of-operation | body[2] section section | section.width = "default" |
| /hours-of-operation | body[2] section section | section.margin_top = "none" |
| /hours-of-operation | body[2] section section | section.margin_bottom = "default" |
| /hours-of-operation | body[2] section section | section.padding_top = "none" |
| /hours-of-operation | body[2] section section | section.padding_bottom = "small" |
| /hours-of-operation | body[2] section section | section.decoration_top = "default" |
| /hours-of-operation | body[2] section section | section.decoration_bottom = "brushed2" |
| /how-it-is-made | body[0] hero hero | hero.height = "empty" |
| /how-it-is-made | body[0] hero hero | hero.background_color = "shaded" |
| /how-it-is-made | body[1] section section | section.name = "Main Page Heading" |
| /how-it-is-made | body[1] section section | section.width = "default" |
| /how-it-is-made | body[1] section section | section.margin_top = "none" |
| /how-it-is-made | body[1] section section | section.margin_bottom = "default" |
| /how-it-is-made | body[1] section section | section.padding_top = "small" |
| /how-it-is-made | body[1] section section | section.padding_bottom = "small" |
| /how-it-is-made | body[1] section section | section.decoration_top = "default" |
| /how-it-is-made | body[1] section section | section.decoration_bottom = "brushed2" |
| /how-it-is-made | body[2] section section | section.name = "Hoagie Heroes" |
| /how-it-is-made | body[2] section section | section.width = "full" |
| /how-it-is-made | body[2] section section | section.margin_top = "none" |
| /how-it-is-made | body[2] section section | section.margin_bottom = "default" |
| /how-it-is-made | body[2] section section | section.padding_top = "none" |
| /how-it-is-made | body[2] section section | section.padding_bottom = "default" |
| /how-it-is-made | body[2] section section | section.decoration_top = "default" |
| /how-it-is-made | body[2] section section | section.decoration_bottom = "none" |
| /how-it-is-made | body[3] section section | section.name = "Hoagie Heroes" |
| /how-it-is-made | body[3] section section | section.width = "full" |
| /how-it-is-made | body[3] section section | section.margin_top = "none" |
| /how-it-is-made | body[3] section section | section.margin_bottom = "default" |
| /how-it-is-made | body[3] section section | section.padding_top = "large" |
| /how-it-is-made | body[3] section section | section.padding_bottom = "large" |
| /how-it-is-made | body[3] section section | section.decoration_top = "brushed1" |
| /how-it-is-made | body[3] section section | section.decoration_bottom = "brushed2" |
| /how-it-is-made | body[4] section section | section.name = "Hoagie Heroes" |
| /how-it-is-made | body[4] section section | section.width = "full" |
| /how-it-is-made | body[4] section section | section.margin_top = "none" |
| /how-it-is-made | body[4] section section | section.margin_bottom = "default" |
| /how-it-is-made | body[4] section section | section.padding_top = "default" |
| /how-it-is-made | body[4] section section | section.padding_bottom = "default" |
| /how-it-is-made | body[4] section section | section.decoration_top = "default" |
| /how-it-is-made | body[4] section section | section.decoration_bottom = "none" |
| /how-it-is-made | body[5] section section | section.name = "Hoagie Heroes" |
| /how-it-is-made | body[5] section section | section.width = "full" |
| /how-it-is-made | body[5] section section | section.margin_top = "none" |
| /how-it-is-made | body[5] section section | section.margin_bottom = "none" |
| /how-it-is-made | body[5] section section | section.padding_top = "default" |
| /how-it-is-made | body[5] section section | section.padding_bottom = "large" |
| /how-it-is-made | body[5] section section | section.decoration_top = "brushed2" |
| /how-it-is-made | body[5] section section | section.decoration_bottom = "none" |
| /how-it-is-made | body[5] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /how-it-works | body[0] hero hero | hero.height = "empty" |
| /how-it-works | body[0] hero hero | hero.is_tall = true |
| /how-it-works | body[0] hero hero | hero.type = "product" |
| /how-it-works | body[0] hero hero | hero.background_color = "shaded" |
| /how-it-works | body[0] hero hero | hero.content = ["heading"] |
| /how-it-works | body[1] section section | section.name = "Main Page Heading" |
| /how-it-works | body[1] section section | section.width = "default" |
| /how-it-works | body[1] section section | section.margin_top = "none" |
| /how-it-works | body[1] section section | section.margin_bottom = "default" |
| /how-it-works | body[1] section section | section.padding_top = "small" |
| /how-it-works | body[1] section section | section.padding_bottom = "small" |
| /how-it-works | body[1] section section | section.decoration_top = "default" |
| /how-it-works | body[1] section section | section.decoration_bottom = "brushed2" |
| /how-it-works | body[2] section section | section.name = "Step 1" |
| /how-it-works | body[2] section section | section.width = "default" |
| /how-it-works | body[2] section section | section.margin_top = "default" |
| /how-it-works | body[2] section section | section.margin_bottom = "default" |
| /how-it-works | body[2] section > content[1] row-big-image row-big-image | row-big-image.name = "1 Contact Us" |
| /how-it-works | body[2] section > content[1] row-big-image row-big-image.content[0] feature-group | feature-group.heading_level = "h3" |
| /how-it-works | body[2] section > content[1] row-big-image row-big-image.content[1] feature-group | feature-group.heading_level = "h3" |
| /how-it-works | body[2] section > content[1] row-big-image row-big-image.content[2] feature-group | feature-group.heading_level = "h3" |
| /how-it-works | body[3] section section | section.name = "Step 1" |
| /how-it-works | body[3] section section | section.width = "default" |
| /how-it-works | body[3] section section | section.margin_top = "default" |
| /how-it-works | body[3] section section | section.margin_bottom = "default" |
| /how-it-works | body[3] section section | section.decoration_top = "brushed2" |
| /how-it-works | body[3] section section | section.decoration_bottom = "brushed2" |
| /how-it-works | body[3] section > content[1] row-big-image row-big-image | row-big-image.name = "1 Contact Us" |
| /how-it-works | body[3] section > content[1] row-big-image row-big-image.content[0] feature-group | feature-group.heading_level = "h3" |
| /how-it-works | body[3] section > content[1] row-big-image row-big-image.content[1] feature-group | feature-group.heading_level = "h3" |
| /how-it-works | body[3] section > content[1] row-big-image row-big-image.content[2] feature-group | feature-group.heading_level = "h3" |
| /how-it-works | body[4] section section | section.name = "Step 1" |
| /how-it-works | body[4] section section | section.width = "default" |
| /how-it-works | body[4] section section | section.margin_top = "default" |
| /how-it-works | body[4] section section | section.margin_bottom = "default" |
| /how-it-works | body[4] section > content[1] row-big-image row-big-image | row-big-image.name = "1 Contact Us" |
| /how-it-works | body[4] section > content[1] row-big-image row-big-image.content[0] feature-group | feature-group.heading_level = "h3" |
| /how-it-works | body[4] section > content[1] row-big-image row-big-image.content[1] feature-group | feature-group.heading_level = "h3" |
| /how-it-works | body[4] section > content[1] row-big-image row-big-image.content[2] feature-group | feature-group.heading_level = "h3" |
| /how-it-works | body[5] section section | section.name = "CTA - 40 Years of Experience" |
| /how-it-works | body[5] section section | section.width = "default" |
| /how-it-works | body[5] section section | section.margin_top = "default" |
| /how-it-works | body[5] section section | section.margin_bottom = "none" |
| /how-it-works | body[5] section section | section.padding_top = "default" |
| /how-it-works | body[5] section section | section.padding_bottom = "default" |
| /how-it-works | body[5] section section | section.decoration_top = "default" |
| /how-it-works | body[5] section section | section.decoration_bottom = "brushed2" |
| /how-it-works | body[5] section > content[0] row-two-columns-cta row-two-columns-cta | row-two-columns-cta.name = "Over 40 Years of Experience" |
| /how-it-works | body[5] section > content[0] row-two-columns-cta row-two-columns-cta.content_main[0] heading | heading.style = "h1" |
| /how-it-works | body[5] section > content[0] row-two-columns-cta row-two-columns-cta.content_buttons[0] button | button.icon_position = "left" |
| /ingredients-list | body[0] hero hero | hero.height = "short" |
| /ingredients-list | body[0] hero hero | hero.background_color = "white" |
| /ingredients-list | body[0] hero | hero text (the Page banner has no text field) |
| /ingredients-list | body[1] section section | section.name = "Italian Hoagie" |
| /ingredients-list | body[1] section section | section.width = "narrow" |
| /ingredients-list | body[1] section section | section.margin_top = "none" |
| /ingredients-list | body[1] section section | section.margin_bottom = "default" |
| /ingredients-list | body[1] section section | section.padding_top = "default" |
| /ingredients-list | body[1] section section | section.padding_bottom = "default" |
| /ingredients-list | body[1] section section | section.decoration_top = "default" |
| /ingredients-list | body[1] section section | section.decoration_bottom = "none" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[0] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[2] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[4] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[6] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[8] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[10] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[12] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[14] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[16] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[18] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[20] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[22] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column row-single-column.content[24] heading | heading.style = "h1" |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted class |
| /ingredients-list | body[1] section > content[0] row-single-column | rich text mark: pasted class |
| /jobs | body[0] hero hero | hero.height = "empty" |
| /jobs | body[0] hero hero | hero.background_color = "shaded" |
| /jobs | body[1] section section | section.name = "Main Page Heading" |
| /jobs | body[1] section section | section.width = "default" |
| /jobs | body[1] section section | section.margin_top = "none" |
| /jobs | body[1] section section | section.margin_bottom = "default" |
| /jobs | body[1] section section | section.padding_top = "small" |
| /jobs | body[1] section section | section.padding_bottom = "small" |
| /jobs | body[1] section section | section.decoration_top = "default" |
| /jobs | body[1] section section | section.decoration_bottom = "brushed2" |
| /jobs | body[2] section section | section.name = "Hoagie Heroes" |
| /jobs | body[2] section section | section.width = "full" |
| /jobs | body[2] section section | section.margin_top = "none" |
| /jobs | body[2] section section | section.margin_bottom = "none" |
| /jobs | body[2] section section | section.padding_top = "default" |
| /jobs | body[2] section section | section.padding_bottom = "large" |
| /jobs | body[2] section section | section.decoration_top = "default" |
| /jobs | body[2] section section | section.decoration_bottom = "none" |
| /jobs | body[2] section > content[0] row-big-image row-big-image.content[1] button-group.content[0] button | button.icon_position = "left" |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | title | post heading "A New Hoagie Is Coming To Fall Fundraising!" (the old post page's heading; the post's title is the story name "A New Hoagie Is Joining The Marianna's Lineup") |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section section | section.name = "heading" |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section section | section.width = "full" |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section section | section.margin_top = "default" |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section section | section.margin_bottom = "default" |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section section | section.padding_top = "default" |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section section | section.padding_bottom = "default" |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section section | section.decoration_top = "default" |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section section | section.decoration_bottom = "none" |
| /news/a-new-hoagie-is-joining-the-marianna-s-lineup | body[0] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /news/a-positive-partnership | body[0] section section | section.name = "Main Page Heading" |
| /news/a-positive-partnership | body[0] section section | section.width = "default" |
| /news/a-positive-partnership | body[0] section section | section.margin_top = "none" |
| /news/a-positive-partnership | body[0] section section | section.margin_bottom = "default" |
| /news/a-positive-partnership | body[0] section section | section.padding_top = "small" |
| /news/a-positive-partnership | body[0] section section | section.padding_bottom = "small" |
| /news/a-positive-partnership | body[0] section section | section.decoration_top = "default" |
| /news/a-positive-partnership | body[0] section section | section.decoration_bottom = "brushed2" |
| /news/a-positive-partnership | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/a-positive-partnership | body[0] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /news/a-positive-partnership | body[0] section > content[2] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/a-scary-successful-sampling | body[0] section section | section.name = "Hoagie Heroes" |
| /news/a-scary-successful-sampling | body[0] section section | section.width = "full" |
| /news/a-scary-successful-sampling | body[0] section section | section.margin_top = "default" |
| /news/a-scary-successful-sampling | body[0] section section | section.margin_bottom = "default" |
| /news/a-scary-successful-sampling | body[0] section section | section.padding_top = "default" |
| /news/a-scary-successful-sampling | body[0] section section | section.padding_bottom = "default" |
| /news/a-scary-successful-sampling | body[0] section section | section.decoration_top = "default" |
| /news/a-scary-successful-sampling | body[0] section section | section.decoration_bottom = "none" |
| /news/a-scary-successful-sampling | body[0] section > content[0] row-big-image row-big-image | row-big-image.name = "A \"Scary\" Successful Sampling" |
| /news/a-scary-successful-sampling | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/exciting-promotion- | title | post heading "Promotion Announcement!" (the old post page's heading; the post's title is the story name "Exciting Promotion!") |
| /news/exciting-promotion- | body[0] section section | section.name = "Hoagie Heroes" |
| /news/exciting-promotion- | body[0] section section | section.width = "full" |
| /news/exciting-promotion- | body[0] section section | section.margin_top = "default" |
| /news/exciting-promotion- | body[0] section section | section.margin_bottom = "default" |
| /news/exciting-promotion- | body[0] section section | section.padding_top = "default" |
| /news/exciting-promotion- | body[0] section section | section.padding_bottom = "default" |
| /news/exciting-promotion- | body[0] section section | section.decoration_top = "default" |
| /news/exciting-promotion- | body[0] section section | section.decoration_bottom = "none" |
| /news/exciting-promotion- | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/exciting-promotion- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/exciting-promotion- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/exciting-promotion- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/exciting-promotion- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/exciting-promotion- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | title | post heading "Join The Fund Fiesta!" (the old post page's heading; the post's title is the story name "Fund Fiesta is Here!") |
| /news/fund-fiesta-is-here- | body[0] section section | section.name = "Fund Fiesta" |
| /news/fund-fiesta-is-here- | body[0] section section | section.width = "full" |
| /news/fund-fiesta-is-here- | body[0] section section | section.margin_top = "default" |
| /news/fund-fiesta-is-here- | body[0] section section | section.margin_bottom = "default" |
| /news/fund-fiesta-is-here- | body[0] section section | section.padding_top = "default" |
| /news/fund-fiesta-is-here- | body[0] section section | section.padding_bottom = "default" |
| /news/fund-fiesta-is-here- | body[0] section section | section.decoration_top = "default" |
| /news/fund-fiesta-is-here- | body[0] section section | section.decoration_bottom = "none" |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image row-big-image | row-big-image.name = "Fund Fiesta" |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/fund-fiesta-is-here- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | title | post heading "Proud to Partner with Four Diamonds Mini-THON®" (the old post page's heading; the post's title is the story name "Marianna's Teaming Up With The Four Diamonds Mini-THON") |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section section | section.name = "Hoagie Heroes" |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section section | section.width = "full" |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section section | section.margin_top = "default" |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section section | section.margin_bottom = "default" |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section section | section.padding_top = "default" |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section section | section.padding_bottom = "default" |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section section | section.decoration_top = "default" |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section section | section.decoration_bottom = "none" |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section > content[0] row-big-image row-big-image | row-big-image.name = "Mini-THON" |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/marianna-s-teaming-up-with-the-four-diamonds-mini-thon | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | body_rte | body_rte (the old news template never drew it) |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | body[0] section section | section.name = "Hoagie Heroes" |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | body[0] section section | section.width = "narrow" |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | body[0] section section | section.margin_top = "default" |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | body[0] section section | section.margin_bottom = "default" |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | body[0] section section | section.padding_top = "none" |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | body[0] section section | section.padding_bottom = "default" |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | body[0] section section | section.decoration_top = "default" |
| /news/mariannas-fundraisers-wins-hometown-favorite-sandwich-2021 | body[0] section section | section.decoration_bottom = "none" |
| /news/mariannas-hoagies-on-tv | title | post heading "As seen on TV :)" (the old post page's heading; the post's title is the story name "Hoagies on TV") |
| /news/mariannas-hoagies-on-tv | body_rte | body_rte (the old news template never drew it) |
| /news/mariannas-hoagies-on-tv | body[0] section section | section.name = "Hoagie Heroes" |
| /news/mariannas-hoagies-on-tv | body[0] section section | section.width = "default" |
| /news/mariannas-hoagies-on-tv | body[0] section section | section.margin_top = "default" |
| /news/mariannas-hoagies-on-tv | body[0] section section | section.margin_bottom = "default" |
| /news/mariannas-hoagies-on-tv | body[0] section section | section.padding_top = "small" |
| /news/mariannas-hoagies-on-tv | body[0] section section | section.padding_bottom = "small" |
| /news/mariannas-hoagies-on-tv | body[0] section section | section.decoration_top = "default" |
| /news/mariannas-hoagies-on-tv | body[0] section section | section.decoration_bottom = "none" |
| /news/mariannas-hoagies-on-tv | body[1] section section | section.name = "Hoagie Heroes" |
| /news/mariannas-hoagies-on-tv | body[1] section section | section.width = "narrow" |
| /news/mariannas-hoagies-on-tv | body[1] section section | section.margin_top = "default" |
| /news/mariannas-hoagies-on-tv | body[1] section section | section.margin_bottom = "default" |
| /news/mariannas-hoagies-on-tv | body[1] section section | section.padding_top = "none" |
| /news/mariannas-hoagies-on-tv | body[1] section section | section.padding_bottom = "default" |
| /news/mariannas-hoagies-on-tv | body[1] section section | section.decoration_top = "default" |
| /news/mariannas-hoagies-on-tv | body[1] section section | section.decoration_bottom = "none" |
| /news/mariannas-hoagies-on-tv | body[1] section > content[0] row-single-column row-single-column.content[1] button-group.content[0] button | button.icon_position = "right" |
| /news/national-hoagie-day | title | post heading "Marianna’s Fundraisers Celebrates National Hoagie Day!" (the old post page's heading; the post's title is the story name "National Hoagie Day") |
| /news/national-hoagie-day | body_rte | body_rte (the old news template never drew it) |
| /news/national-hoagie-day | body[0] section section | section.width = "default" |
| /news/national-hoagie-day | body[0] section section | section.margin_top = "default" |
| /news/national-hoagie-day | body[0] section section | section.margin_bottom = "default" |
| /news/national-hoagie-day | body[0] section section | section.padding_top = "small" |
| /news/national-hoagie-day | body[0] section section | section.padding_bottom = "small" |
| /news/national-hoagie-day | body[0] section section | section.decoration_top = "default" |
| /news/national-hoagie-day | body[0] section section | section.decoration_bottom = "none" |
| /news/national-hoagie-day | body[0] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /news/national-hoagie-day | body[1] section section | section.width = "default" |
| /news/national-hoagie-day | body[1] section section | section.margin_top = "default" |
| /news/national-hoagie-day | body[1] section section | section.margin_bottom = "default" |
| /news/national-hoagie-day | body[1] section section | section.padding_top = "small" |
| /news/national-hoagie-day | body[1] section section | section.padding_bottom = "small" |
| /news/national-hoagie-day | body[1] section section | section.decoration_top = "default" |
| /news/national-hoagie-day | body[1] section section | section.decoration_bottom = "none" |
| /news/national-hoagie-day | body[1] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/national-hoagie-day | body[1] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /news/national-hoagie-day | body[2] section section | section.width = "default" |
| /news/national-hoagie-day | body[2] section section | section.margin_top = "default" |
| /news/national-hoagie-day | body[2] section section | section.margin_bottom = "default" |
| /news/national-hoagie-day | body[2] section section | section.padding_top = "small" |
| /news/national-hoagie-day | body[2] section section | section.padding_bottom = "small" |
| /news/national-hoagie-day | body[2] section section | section.decoration_top = "default" |
| /news/national-hoagie-day | body[2] section section | section.decoration_bottom = "none" |
| /news/national-hoagie-day | body[2] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/national-hoagie-day | body[2] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /news/national-hoagie-day | body[2] section > content[0] row-big-image row-big-image.content[2] button | button.icon_position = "right" |
| /news/national-pizza-day-february-9th-2022 | title | post heading "National Pizza Day – February 9, 2022" (the old post page's heading; the post's title is the story name "National Pizza Day – February 9th 2022") |
| /news/national-pizza-day-february-9th-2022 | body_rte | body_rte (the old news template never drew it) |
| /news/national-pizza-day-february-9th-2022 | body[0] section section | section.name = "Hoagie Heroes" |
| /news/national-pizza-day-february-9th-2022 | body[0] section section | section.width = "narrow" |
| /news/national-pizza-day-february-9th-2022 | body[0] section section | section.margin_top = "default" |
| /news/national-pizza-day-february-9th-2022 | body[0] section section | section.margin_bottom = "default" |
| /news/national-pizza-day-february-9th-2022 | body[0] section section | section.padding_top = "none" |
| /news/national-pizza-day-february-9th-2022 | body[0] section section | section.padding_bottom = "default" |
| /news/national-pizza-day-february-9th-2022 | body[0] section section | section.decoration_top = "default" |
| /news/national-pizza-day-february-9th-2022 | body[0] section section | section.decoration_bottom = "none" |
| /news/promotion-spotlight- | body[0] section section | section.name = "Hoagie Heroes" |
| /news/promotion-spotlight- | body[0] section section | section.width = "full" |
| /news/promotion-spotlight- | body[0] section section | section.margin_top = "default" |
| /news/promotion-spotlight- | body[0] section section | section.margin_bottom = "default" |
| /news/promotion-spotlight- | body[0] section section | section.padding_top = "default" |
| /news/promotion-spotlight- | body[0] section section | section.padding_bottom = "default" |
| /news/promotion-spotlight- | body[0] section section | section.decoration_top = "default" |
| /news/promotion-spotlight- | body[0] section section | section.decoration_bottom = "none" |
| /news/promotion-spotlight- | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/promotion-spotlight- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/promotion-spotlight- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/promotion-spotlight- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/promotion-spotlight- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/promotion-spotlight- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/proud-to-partner-with-skillsusa-pennsylvania | title | post heading "Proud To Partner With SkillsUSA PA!" (the old post page's heading; the post's title is the story name "Proud To Partner With SkillsUSA Pennsylvania") |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section section | section.name = "Hoagie Heroes" |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section section | section.width = "full" |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section section | section.margin_top = "default" |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section section | section.margin_bottom = "default" |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section section | section.padding_top = "default" |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section section | section.padding_bottom = "default" |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section section | section.decoration_top = "default" |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section section | section.decoration_bottom = "none" |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section > content[0] row-big-image row-big-image | row-big-image.name = "SkillsUSA PA article" |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/proud-to-partner-with-skillsusa-pennsylvania | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/salsa-sales-supporting-waly-warmth- | title | post heading "Raising Funds with Fund Fiesta!" (the old post page's heading; the post's title is the story name "Salsa Sales Supporting Waly Warmth!") |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section section | section.name = "Hoagie Heroes" |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section section | section.width = "full" |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section section | section.margin_top = "default" |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section section | section.margin_bottom = "default" |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section section | section.padding_top = "default" |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section section | section.padding_bottom = "default" |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section section | section.decoration_top = "default" |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section section | section.decoration_bottom = "none" |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/salsa-sales-supporting-waly-warmth- | body[0] section > content[0] row-big-image | rich text mark: pasted text colour |
| /news/we-re-hiring-february-2022 | title | post heading "Marianna’s Fundraisers is growing and we're adding members to our team." (the old post page's heading; the post's title is the story name "We're hiring!") |
| /news/we-re-hiring-february-2022 | body_rte | body_rte (the old news template never drew it) |
| /news/we-re-hiring-february-2022 | body[0] section section | section.name = "Hoagie Heroes" |
| /news/we-re-hiring-february-2022 | body[0] section section | section.width = "default" |
| /news/we-re-hiring-february-2022 | body[0] section section | section.margin_top = "default" |
| /news/we-re-hiring-february-2022 | body[0] section section | section.margin_bottom = "default" |
| /news/we-re-hiring-february-2022 | body[0] section section | section.padding_top = "none" |
| /news/we-re-hiring-february-2022 | body[0] section section | section.padding_bottom = "default" |
| /news/we-re-hiring-february-2022 | body[0] section section | section.decoration_top = "default" |
| /news/we-re-hiring-february-2022 | body[0] section section | section.decoration_bottom = "none" |
| /news/we-re-hiring-february-2022 | body[0] section > content[1] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/we-re-hiring-february-2022 | body[0] section > content[1] row-big-image row-big-image.content[1] button-group.content[0] button | button.icon_position = "right" |
| /news/winner-2022-hometown-favorite-sandwich | body[0] section section | section.name = "Hoagie Heroes" |
| /news/winner-2022-hometown-favorite-sandwich | body[0] section section | section.width = "full" |
| /news/winner-2022-hometown-favorite-sandwich | body[0] section section | section.margin_top = "default" |
| /news/winner-2022-hometown-favorite-sandwich | body[0] section section | section.margin_bottom = "default" |
| /news/winner-2022-hometown-favorite-sandwich | body[0] section section | section.padding_top = "default" |
| /news/winner-2022-hometown-favorite-sandwich | body[0] section section | section.padding_bottom = "default" |
| /news/winner-2022-hometown-favorite-sandwich | body[0] section section | section.decoration_top = "default" |
| /news/winner-2022-hometown-favorite-sandwich | body[0] section section | section.decoration_bottom = "none" |
| /news/winner-2022-hometown-favorite-sandwich | body[0] section > content[0] row-single-column row-single-column | row-single-column.name = "2022 Hometown Favorite Sandwich" |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section section | section.name = "Hoagie Heroes" |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section section | section.width = "full" |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section section | section.margin_top = "default" |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section section | section.margin_bottom = "default" |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section section | section.padding_top = "default" |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section section | section.padding_bottom = "default" |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section section | section.decoration_top = "default" |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section section | section.decoration_bottom = "none" |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/winner-2023-hometown-favorite-sandwich | body[0] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section section | section.name = "Hoagie Heroes" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section section | section.width = "full" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section section | section.margin_top = "default" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section section | section.margin_bottom = "default" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section section | section.padding_top = "default" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section section | section.padding_bottom = "default" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section section | section.decoration_top = "default" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section section | section.decoration_bottom = "none" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section > content[0] row-big-image row-big-image | row-big-image.name = "Winner" |
| /news/winner-2025-hometown-favorite-sandwich | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section section | section.name = "Hoagie Heroes" |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section section | section.width = "full" |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section section | section.margin_top = "default" |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section section | section.margin_bottom = "default" |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section section | section.padding_top = "default" |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section section | section.padding_bottom = "default" |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section section | section.decoration_top = "default" |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section section | section.decoration_bottom = "none" |
| /news/winner:-2024-hometown-favorite-sandwich | body[0] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /order-received | body[0] section section | section.name = "Hoagie Heroes" |
| /order-received | body[0] section section | section.width = "full" |
| /order-received | body[0] section section | section.margin_top = "none" |
| /order-received | body[0] section section | section.margin_bottom = "none" |
| /order-received | body[0] section section | section.padding_top = "default" |
| /order-received | body[0] section section | section.padding_bottom = "default" |
| /order-received | body[0] section section | section.decoration_top = "default" |
| /order-received | body[0] section section | section.decoration_bottom = "none" |
| /order-received | body[0] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /our-leadership | body[0] section section | section.name = "Main Page Heading" |
| /our-leadership | body[0] section section | section.width = "default" |
| /our-leadership | body[0] section section | section.margin_top = "none" |
| /our-leadership | body[0] section section | section.margin_bottom = "default" |
| /our-leadership | body[0] section section | section.padding_top = "default" |
| /our-leadership | body[0] section section | section.padding_bottom = "default" |
| /our-leadership | body[0] section section | section.decoration_top = "default" |
| /our-leadership | body[0] section section | section.decoration_bottom = "brushed2" |
| /our-leadership | body[1] section section | section.name = "Renee Swogger" |
| /our-leadership | body[1] section section | section.width = "default" |
| /our-leadership | body[1] section section | section.margin_top = "default" |
| /our-leadership | body[1] section section | section.margin_bottom = "default" |
| /our-leadership | body[1] section section | section.padding_top = "default" |
| /our-leadership | body[1] section section | section.padding_bottom = "default" |
| /our-leadership | body[1] section section | section.decoration_top = "brushed2" |
| /our-leadership | body[1] section section | section.decoration_bottom = "brushed2" |
| /our-leadership | body[2] section section | section.name = "Diane Harris" |
| /our-leadership | body[2] section section | section.width = "default" |
| /our-leadership | body[2] section section | section.margin_top = "none" |
| /our-leadership | body[2] section section | section.margin_bottom = "default" |
| /our-leadership | body[2] section section | section.padding_top = "default" |
| /our-leadership | body[2] section section | section.padding_bottom = "default" |
| /our-leadership | body[2] section section | section.decoration_top = "brushed2" |
| /our-leadership | body[2] section section | section.decoration_bottom = "brushed2" |
| /our-leadership | body[3] section section | section.name = "Renee Swogger" |
| /our-leadership | body[3] section section | section.width = "default" |
| /our-leadership | body[3] section section | section.margin_top = "default" |
| /our-leadership | body[3] section section | section.margin_bottom = "default" |
| /our-leadership | body[3] section section | section.padding_top = "default" |
| /our-leadership | body[3] section section | section.padding_bottom = "default" |
| /our-leadership | body[3] section section | section.decoration_top = "brushed2" |
| /our-leadership | body[3] section section | section.decoration_bottom = "brushed2" |
| /our-leadership | body[4] section section | section.name = "Kris Wolfe" |
| /our-leadership | body[4] section section | section.width = "default" |
| /our-leadership | body[4] section section | section.margin_top = "default" |
| /our-leadership | body[4] section section | section.margin_bottom = "default" |
| /our-leadership | body[4] section section | section.padding_top = "default" |
| /our-leadership | body[4] section section | section.padding_bottom = "default" |
| /our-leadership | body[4] section section | section.decoration_top = "brushed2" |
| /our-leadership | body[4] section section | section.decoration_bottom = "brushed2" |
| /our-leadership | body[4] section > content[0] row-big-image row-big-image | row-big-image.name = "Kris Wolfe" |
| /our-leadership | body[4] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /our-leadership | body[5] section section | section.name = "Mark McCracken" |
| /our-leadership | body[5] section section | section.width = "default" |
| /our-leadership | body[5] section section | section.margin_top = "default" |
| /our-leadership | body[5] section section | section.margin_bottom = "default" |
| /our-leadership | body[5] section section | section.padding_top = "default" |
| /our-leadership | body[5] section section | section.padding_bottom = "default" |
| /our-leadership | body[5] section section | section.decoration_top = "brushed2" |
| /our-leadership | body[5] section section | section.decoration_bottom = "brushed2" |
| /our-leadership | body[6] section section | section.name = "Todd Hill" |
| /our-leadership | body[6] section section | section.width = "default" |
| /our-leadership | body[6] section section | section.margin_top = "default" |
| /our-leadership | body[6] section section | section.margin_bottom = "default" |
| /our-leadership | body[6] section section | section.padding_top = "default" |
| /our-leadership | body[6] section section | section.padding_bottom = "default" |
| /our-leadership | body[6] section section | section.decoration_top = "brushed2" |
| /our-leadership | body[6] section section | section.decoration_bottom = "brushed2" |
| /our-leadership | body[6] section > content[0] row-big-image row-big-image | row-big-image.name = "Todd Hill" |
| /our-leadership | body[6] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /our-leadership | body[6] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /our-leadership | body[6] section > content[0] row-big-image | rich text mark: pasted text colour |
| /our-leadership | body[6] section > content[0] row-big-image | rich text mark: pasted text colour |
| /our-leadership | body[6] section > content[0] row-big-image | rich text mark: pasted text colour |
| /our-leadership | body[6] section > content[0] row-big-image | rich text mark: pasted text colour |
| /our-leadership | body[7] section section | section.name = "Hoagie Heroes" |
| /our-leadership | body[7] section section | section.width = "default" |
| /our-leadership | body[7] section section | section.margin_top = "default" |
| /our-leadership | body[7] section section | section.margin_bottom = "default" |
| /our-leadership | body[7] section section | section.padding_top = "default" |
| /our-leadership | body[7] section section | section.padding_bottom = "default" |
| /our-leadership | body[7] section section | section.decoration_top = "brushed2" |
| /our-leadership | body[7] section section | section.decoration_bottom = "brushed2" |
| /our-leadership | body[7] section > content[0] row-big-image | a link to "#", which goes nowhere |
| /our-story-and-promise | body[0] hero hero | hero.height = "empty" |
| /our-story-and-promise | body[0] hero hero | hero.background_color = "shaded" |
| /our-story-and-promise | body[1] section section | section.name = "Main Page Heading" |
| /our-story-and-promise | body[1] section section | section.width = "default" |
| /our-story-and-promise | body[1] section section | section.margin_top = "none" |
| /our-story-and-promise | body[1] section section | section.margin_bottom = "default" |
| /our-story-and-promise | body[1] section section | section.padding_top = "small" |
| /our-story-and-promise | body[1] section section | section.padding_bottom = "small" |
| /our-story-and-promise | body[1] section section | section.decoration_top = "default" |
| /our-story-and-promise | body[1] section section | section.decoration_bottom = "brushed2" |
| /our-story-and-promise | body[2] section section | section.name = "Hoagie Heroes" |
| /our-story-and-promise | body[2] section section | section.width = "full" |
| /our-story-and-promise | body[2] section section | section.margin_top = "default" |
| /our-story-and-promise | body[2] section section | section.margin_bottom = "none" |
| /our-story-and-promise | body[2] section section | section.padding_top = "small" |
| /our-story-and-promise | body[2] section section | section.padding_bottom = "small" |
| /our-story-and-promise | body[2] section section | section.decoration_top = "brushed2" |
| /our-story-and-promise | body[2] section section | section.decoration_bottom = "none" |
| /our-story-and-promise | body[2] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /our-story-and-promise | body[3] section section | section.name = "Hoagie Heroes" |
| /our-story-and-promise | body[3] section section | section.width = "default" |
| /our-story-and-promise | body[3] section section | section.margin_top = "default" |
| /our-story-and-promise | body[3] section section | section.margin_bottom = "default" |
| /our-story-and-promise | body[3] section section | section.padding_top = "default" |
| /our-story-and-promise | body[3] section section | section.padding_bottom = "default" |
| /our-story-and-promise | body[3] section section | section.decoration_top = "brushed2" |
| /our-story-and-promise | body[3] section section | section.decoration_bottom = "brushed2" |
| /our-story-and-promise | body[4] section section | section.name = "Hoagie Heroes" |
| /our-story-and-promise | body[4] section section | section.width = "default" |
| /our-story-and-promise | body[4] section section | section.margin_top = "none" |
| /our-story-and-promise | body[4] section section | section.margin_bottom = "default" |
| /our-story-and-promise | body[4] section section | section.padding_top = "default" |
| /our-story-and-promise | body[4] section section | section.padding_bottom = "large" |
| /our-story-and-promise | body[4] section section | section.decoration_top = "default" |
| /our-story-and-promise | body[4] section section | section.decoration_bottom = "none" |
| /our-story-and-promise | body[4] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /our-story-and-promise | body[5] section section | section.name = "Hoagie Heroes" |
| /our-story-and-promise | body[5] section section | section.width = "default" |
| /our-story-and-promise | body[5] section section | section.margin_top = "default" |
| /our-story-and-promise | body[5] section section | section.margin_bottom = "overlapping" |
| /our-story-and-promise | body[5] section section | section.padding_top = "default" |
| /our-story-and-promise | body[5] section section | section.padding_bottom = "default" |
| /our-story-and-promise | body[5] section section | section.decoration_top = "brushed2" |
| /our-story-and-promise | body[5] section section | section.decoration_bottom = "brushed2" |
| /our-story-and-promise | body[5] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /our-story-and-promise | body[6] section section | section.name = "Hoagie Heroes" |
| /our-story-and-promise | body[6] section section | section.width = "default" |
| /our-story-and-promise | body[6] section section | section.margin_top = "default" |
| /our-story-and-promise | body[6] section section | section.margin_bottom = "default" |
| /our-story-and-promise | body[6] section section | section.padding_top = "large" |
| /our-story-and-promise | body[6] section section | section.padding_bottom = "large" |
| /our-story-and-promise | body[6] section section | section.decoration_top = "default" |
| /our-story-and-promise | body[6] section section | section.decoration_bottom = "none" |
| /our-story-and-promise | body[6] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /pricing-info | body[0] hero hero | hero.height = "empty" |
| /pricing-info | body[0] hero hero | hero.background_color = "green" |
| /pricing-info | body[0] hero hero | hero.content = ["heading"] |
| /pricing-info | body[1] section section | section.name = "Main Page Heading" |
| /pricing-info | body[1] section section | section.width = "default" |
| /pricing-info | body[1] section section | section.margin_top = "none" |
| /pricing-info | body[1] section section | section.margin_bottom = "default" |
| /pricing-info | body[1] section section | section.padding_top = "none" |
| /pricing-info | body[1] section section | section.padding_bottom = "small" |
| /pricing-info | body[1] section section | section.decoration_top = "default" |
| /pricing-info | body[1] section section | section.decoration_bottom = "brushed2" |
| /pricing-info | body[2] section section | section.name = "Hoagie Heroes" |
| /pricing-info | body[2] section section | section.width = "default" |
| /pricing-info | body[2] section section | section.margin_top = "none" |
| /pricing-info | body[2] section section | section.margin_bottom = "none" |
| /pricing-info | body[2] section section | section.padding_top = "none" |
| /pricing-info | body[2] section section | section.padding_bottom = "default" |
| /pricing-info | body[2] section section | section.decoration_top = "default" |
| /pricing-info | body[2] section section | section.decoration_bottom = "none" |
| /pricing-info | body[2] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /pricing-info | body[2] section > content[0] row-big-image row-big-image.content[2] table | table.remove_margins = true |
| /pricing-info | body[3] section section | section.name = "Notes" |
| /pricing-info | body[3] section section | section.width = "default" |
| /pricing-info | body[3] section section | section.margin_top = "none" |
| /pricing-info | body[3] section section | section.margin_bottom = "none" |
| /pricing-info | body[3] section section | section.padding_top = "default" |
| /pricing-info | body[3] section section | section.padding_bottom = "large" |
| /pricing-info | body[3] section section | section.decoration_top = "brushed2" |
| /pricing-info | body[3] section section | section.decoration_bottom = "none" |
| /pricing-info | body[3] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /pricing-info | body[3] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "right" |
| /products | body[0] section section | section.name = "Hoagies" |
| /products | body[0] section section | section.width = "default" |
| /products | body[0] section section | section.margin_top = "none" |
| /products | body[0] section section | section.margin_bottom = "default" |
| /products | body[0] section section | section.padding_top = "large" |
| /products | body[0] section section | section.padding_bottom = "large" |
| /products | body[0] section section | section.decoration_bottom = "brushed2" |
| /products | body[0] section section | section.overflow_hidden = true |
| /products | body[0] section > content[0] row-single-column row-single-column | row-single-column.name = "Hoagies Heading" |
| /products | body[0] section > content[0] row-single-column row-single-column.content[0] heading-group | heading-group.heading_level = "h1" |
| /products | body[0] section > content[1] row-two-columns row-two-columns | row-two-columns.name = "Hoagies text" |
| /products | body[0] section > content[2] row-menu-listing row-menu-listing | row-menu-listing.menu_items = ["c9a9553e-a716-45ef-8218-a4cfa6a2432b"] |
| /products | body[0] section > content[2] row-menu-listing row-menu-listing | row-menu-listing.menu_listing = ["menu_item_ref"] |
| /products | body[1] section section | section.name = "Pizzas" |
| /products | body[1] section section | section.width = "default" |
| /products | body[1] section section | section.margin_top = "default" |
| /products | body[1] section section | section.margin_bottom = "default" |
| /products | body[1] section section | section.overflow_hidden = true |
| /products | body[1] section > content[0] row-single-column row-single-column | row-single-column.name = "Hoagies Heading" |
| /products | body[1] section > content[1] row-two-columns row-two-columns | row-two-columns.name = "Hoagies text" |
| /schedule-a-free-tasting | body[0] hero hero | hero.height = "short" |
| /schedule-a-free-tasting | body[0] hero hero | hero.background_color = "white" |
| /schedule-a-free-tasting | body[0] hero | hero text (the Page banner has no text field) |
| /schedule-a-free-tasting | body[1] section section | section.name = "Hoagie Heroes" |
| /schedule-a-free-tasting | body[1] section section | section.width = "default" |
| /schedule-a-free-tasting | body[1] section section | section.margin_top = "none" |
| /schedule-a-free-tasting | body[1] section section | section.margin_bottom = "large" |
| /schedule-a-free-tasting | body[1] section section | section.padding_top = "default" |
| /schedule-a-free-tasting | body[1] section section | section.padding_bottom = "none" |
| /schedule-a-free-tasting | body[1] section section | section.decoration_top = "default" |
| /schedule-a-free-tasting | body[1] section section | section.decoration_bottom = "none" |
| /schedule-a-free-tasting | body[1] section > content[1] row-two-columns | rich text mark: pasted text colour |
| /special-fundraising-events | body[0] hero hero | hero.height = "tall" |
| /special-fundraising-events | body[0] hero hero | hero.background_color = "shaded" |
| /special-fundraising-events | body[1] section section | section.name = "Main Page Heading" |
| /special-fundraising-events | body[1] section section | section.width = "default" |
| /special-fundraising-events | body[1] section section | section.margin_top = "none" |
| /special-fundraising-events | body[1] section section | section.margin_bottom = "default" |
| /special-fundraising-events | body[1] section section | section.padding_top = "small" |
| /special-fundraising-events | body[1] section section | section.padding_bottom = "small" |
| /special-fundraising-events | body[1] section section | section.decoration_top = "default" |
| /special-fundraising-events | body[1] section section | section.decoration_bottom = "brushed2" |
| /special-fundraising-events | body[2] section section | section.name = "Fresh" |
| /special-fundraising-events | body[2] section section | section.width = "default" |
| /special-fundraising-events | body[2] section section | section.margin_top = "none" |
| /special-fundraising-events | body[2] section section | section.margin_bottom = "none" |
| /special-fundraising-events | body[2] section section | section.padding_bottom = "large" |
| /special-fundraising-events | body[2] section > content[0] row-big-image row-big-image | row-big-image.name = "Fresh" |
| /special-fundraising-events | body[2] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /special-fundraising-events | body[2] section > content[0] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
| /special-fundraising-events | body[2] section > content[0] row-big-image row-big-image.content[2] button-group.content[0] button | button.icon_position = "right" |
| /submit-your-order | body[0] hero hero | hero.height = "tall" |
| /submit-your-order | body[0] hero hero | hero.background_color = "shaded" |
| /submit-your-order | body[1] section section | section.name = "Main Page Heading" |
| /submit-your-order | body[1] section section | section.width = "default" |
| /submit-your-order | body[1] section section | section.margin_top = "none" |
| /submit-your-order | body[1] section section | section.margin_bottom = "default" |
| /submit-your-order | body[1] section section | section.padding_top = "small" |
| /submit-your-order | body[1] section section | section.padding_bottom = "small" |
| /submit-your-order | body[1] section section | section.decoration_top = "default" |
| /submit-your-order | body[1] section section | section.decoration_bottom = "brushed2" |
| /submit-your-order | body[2] section section | section.name = "Submit Order" |
| /submit-your-order | body[2] section section | section.width = "narrow" |
| /submit-your-order | body[2] section section | section.margin_top = "none" |
| /submit-your-order | body[2] section section | section.margin_bottom = "none" |
| /submit-your-order | body[2] section section | section.padding_top = "small" |
| /submit-your-order | body[2] section section | section.padding_bottom = "default" |
| /submit-your-order | body[2] section section | section.decoration_top = "default" |
| /submit-your-order | body[2] section section | section.decoration_bottom = "none" |
| /submit-your-order | body[2] section > content[0] row-single-column row-single-column.content[1] button-group.content[0] button | button.icon_position = "right" |
| /submit-your-order | body[2] section > content[0] row-single-column row-single-column.content[1] button-group.content[1] button | button.icon_position = "right" |
| /success-stories | body[0] hero hero | hero.height = "default" |
| /success-stories | body[0] hero hero | hero.background_color = "shaded" |
| /success-stories | body[1] section section | section.name = "Main Page Heading" |
| /success-stories | body[1] section section | section.width = "default" |
| /success-stories | body[1] section section | section.margin_top = "none" |
| /success-stories | body[1] section section | section.margin_bottom = "default" |
| /success-stories | body[1] section section | section.padding_top = "small" |
| /success-stories | body[1] section section | section.padding_bottom = "small" |
| /success-stories | body[1] section section | section.decoration_top = "default" |
| /success-stories | body[1] section section | section.decoration_bottom = "brushed2" |
| /success-stories | body[2] section section | section.name = "image" |
| /success-stories | body[2] section section | section.width = "full" |
| /success-stories | body[2] section section | section.margin_top = "default" |
| /success-stories | body[2] section section | section.margin_bottom = "default" |
| /success-stories | body[2] section section | section.padding_top = "default" |
| /success-stories | body[2] section section | section.padding_bottom = "default" |
| /success-stories | body[2] section section | section.decoration_top = "default" |
| /success-stories | body[2] section section | section.decoration_bottom = "none" |
| /success-stories | body[3] section section | section.name = "image" |
| /success-stories | body[3] section section | section.width = "full" |
| /success-stories | body[3] section section | section.margin_top = "default" |
| /success-stories | body[3] section section | section.margin_bottom = "default" |
| /success-stories | body[3] section section | section.padding_top = "default" |
| /success-stories | body[3] section section | section.padding_bottom = "default" |
| /success-stories | body[3] section section | section.decoration_top = "default" |
| /success-stories | body[3] section section | section.decoration_bottom = "none" |
| /success-stories | body[3] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /success-stories | body[4] section section | section.width = "narrow" |
| /success-stories | body[4] section section | section.margin_top = "none" |
| /success-stories | body[4] section section | section.margin_bottom = "default" |
| /success-stories | body[4] section section | section.padding_top = "default" |
| /success-stories | body[4] section section | section.padding_bottom = "default" |
| /success-stories | body[4] section section | section.decoration_top = "default" |
| /success-stories | body[4] section section | section.decoration_bottom = "none" |
| /the-fundraiser-that-sells-itself | body[0] hero hero | hero.height = "empty" |
| /the-fundraiser-that-sells-itself | body[0] hero hero | hero.is_tall = true |
| /the-fundraiser-that-sells-itself | body[0] hero hero | hero.background_color = "white" |
| /the-fundraiser-that-sells-itself | body[0] hero hero | hero.content = ["heading"] |
| /the-fundraiser-that-sells-itself | body[1] section section | section.name = "Main Page Heading" |
| /the-fundraiser-that-sells-itself | body[1] section section | section.width = "default" |
| /the-fundraiser-that-sells-itself | body[1] section section | section.margin_top = "none" |
| /the-fundraiser-that-sells-itself | body[1] section section | section.margin_bottom = "default" |
| /the-fundraiser-that-sells-itself | body[1] section section | section.padding_top = "small" |
| /the-fundraiser-that-sells-itself | body[1] section section | section.padding_bottom = "small" |
| /the-fundraiser-that-sells-itself | body[1] section section | section.decoration_top = "default" |
| /the-fundraiser-that-sells-itself | body[1] section section | section.decoration_bottom = "brushed2" |
| /the-fundraiser-that-sells-itself | body[2] section section | section.name = "Amazing Value & Support" |
| /the-fundraiser-that-sells-itself | body[2] section section | section.width = "default" |
| /the-fundraiser-that-sells-itself | body[2] section section | section.margin_top = "default" |
| /the-fundraiser-that-sells-itself | body[2] section section | section.margin_bottom = "default" |
| /the-fundraiser-that-sells-itself | body[2] section > content[1] row-big-image row-big-image | row-big-image.name = "1 Contact Us" |
| /the-fundraiser-that-sells-itself | body[2] section > content[1] row-big-image row-big-image.content[0] feature-group | feature-group.heading_level = "h3" |
| /the-fundraiser-that-sells-itself | body[2] section > content[1] row-big-image row-big-image.content[1] feature-group | feature-group.heading_level = "h3" |
| /the-fundraiser-that-sells-itself | body[2] section > content[1] row-big-image row-big-image.content[2] feature-group | feature-group.heading_level = "h3" |
| /the-fundraiser-that-sells-itself | body[3] section section | section.name = "Famous Food" |
| /the-fundraiser-that-sells-itself | body[3] section section | section.width = "default" |
| /the-fundraiser-that-sells-itself | body[3] section section | section.margin_top = "large" |
| /the-fundraiser-that-sells-itself | body[3] section section | section.margin_bottom = "default" |
| /the-fundraiser-that-sells-itself | body[3] section section | section.padding_top = "default" |
| /the-fundraiser-that-sells-itself | body[3] section section | section.padding_bottom = "large" |
| /the-fundraiser-that-sells-itself | body[3] section section | section.decoration_top = "brushed2" |
| /the-fundraiser-that-sells-itself | body[3] section section | section.decoration_bottom = "brushed2" |
| /the-fundraiser-that-sells-itself | body[3] section > content[1] row-big-image row-big-image | row-big-image.name = "1 Contact Us" |
| /the-fundraiser-that-sells-itself | body[3] section > content[1] row-big-image row-big-image.content[0] feature-group | feature-group.heading_level = "h3" |
| /the-fundraiser-that-sells-itself | body[3] section > content[1] row-big-image row-big-image.content[1] feature-group | feature-group.heading_level = "h3" |
| /the-fundraiser-that-sells-itself | body[3] section > content[1] row-big-image row-big-image.content[2] feature-group | feature-group.heading_level = "h3" |
| /the-fundraiser-that-sells-itself | body[4] section section | section.name = "Fresh & Clean Obsessed" |
| /the-fundraiser-that-sells-itself | body[4] section section | section.width = "default" |
| /the-fundraiser-that-sells-itself | body[4] section section | section.margin_top = "default" |
| /the-fundraiser-that-sells-itself | body[4] section section | section.margin_bottom = "default" |
| /the-fundraiser-that-sells-itself | body[4] section section | section.padding_top = "default" |
| /the-fundraiser-that-sells-itself | body[4] section > content[1] row-big-image row-big-image | row-big-image.name = "1 Contact Us" |
| /the-fundraiser-that-sells-itself | body[4] section > content[1] row-big-image row-big-image.content[0] feature-group | feature-group.heading_level = "h3" |
| /the-fundraiser-that-sells-itself | body[4] section > content[1] row-big-image row-big-image.content[1] feature-group | feature-group.heading_level = "h3" |
| /the-fundraiser-that-sells-itself | body[4] section > content[1] row-big-image row-big-image.content[2] feature-group | feature-group.heading_level = "h3" |
| /video-guides | body[0] hero hero | hero.height = "empty" |
| /video-guides | body[0] hero hero | hero.background_color = "shaded" |
| /video-guides | body[1] section section | section.name = "Main Page Heading" |
| /video-guides | body[1] section section | section.width = "default" |
| /video-guides | body[1] section section | section.margin_top = "none" |
| /video-guides | body[1] section section | section.margin_bottom = "default" |
| /video-guides | body[1] section section | section.padding_top = "small" |
| /video-guides | body[1] section section | section.padding_bottom = "small" |
| /video-guides | body[1] section section | section.decoration_top = "default" |
| /video-guides | body[1] section section | section.decoration_bottom = "brushed2" |
| /video-guides | body[1] section > content[0] row-single-column | rich text mark: pasted text colour |
| /video-guides | body[2] section section | section.name = "How To Videos" |
| /video-guides | body[2] section section | section.width = "full" |
| /video-guides | body[2] section section | section.margin_top = "default" |
| /video-guides | body[2] section section | section.margin_bottom = "default" |
| /video-guides | body[2] section section | section.padding_top = "default" |
| /video-guides | body[2] section section | section.padding_bottom = "default" |
| /video-guides | body[2] section section | section.decoration_top = "default" |
| /video-guides | body[2] section section | section.decoration_bottom = "none" |
| /video-guides | body[2] section > content[0] row-big-image row-big-image | row-big-image.extra_padding = true |
| /video-guides | body[2] section > content[1] row-big-image row-big-image | row-big-image.extra_padding = true |
| /video-guides | body[2] section > content[2] row-big-image row-big-image | row-big-image.extra_padding = true |
| /video-guides | body[2] section > content[2] row-big-image row-big-image.content[0] heading-group | heading-group.heading_level = "h2" |
