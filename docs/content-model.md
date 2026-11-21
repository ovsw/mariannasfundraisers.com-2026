# Content model

The Website reads structured content from one Sanity project and dataset.

## Routed content

- `homePage` owns `/`.
- `page` owns normal page slugs such as `/about/`.
- `blogIndex` is the news index and owns `/news`: its eyebrow and title above
  every published post as a card, newest first by publish date, 20 per page,
  then `/news/2` and onward.
- `post` is a news post and owns `/news/<slug>`. It has a title (the name on
  its card, in search results and when shared), an optional headline for its
  own page (`heading`; the page shows the title when it is empty), slug,
  excerpt, author, publish date, main image (the card and sharing photo) and
  reading time in minutes (`readingTime`). The post page draws a fixed header
  (title, the author's photo and name, the date and the reading time) above
  its sections, `blocks`: the Rich Text section and the image-and-text
  sections only. A post card shows the main image, title, excerpt, author,
  date and reading time.
- `product` is a hoagie, pizza or salsa (spec decision 8). Its kind sets its
  address: hoagies and pizzas own `/products/<slug>`, salsas
  `/flavored-salsas/<slug>`. A page can own a path under the same prefix
  (`flavored-salsas/menu` is a page), so the slug rule rejects a product whose
  address a page already uses, and the other way round. One template in code
  draws every product page (see "Products" below); a product has no Page
  Builder.
- There are no categories: the site has no `category` type and no category
  routes.
- `redirect` maps an old path to routed content or an external URL.

## Shared content

- `settings`, `navigation`, `footer`, `blogPostSettings` and
  `productPageSettings` are global documents.
  The header and footer render only from `settings`, `navigation` and
  `footer`; no link list lives in code (spec decision 16).
  - `settings`: site name, the two logos (light backgrounds for the header,
    dark for the footer), phone, email, address, social links, and the Google
    Analytics measurement ID (`googleAnalyticsMeasurementId`, read by the
    layout; analytics runs only when the visitor's privacy choice allows it).
  - `navigation`: the header's direct links and dropdown groups (each with an
    optional `description` shown beside its links on wide screens; each link
    with a description and an icon), and the action button. The phone menu
    draws the same data.
  - `footer`: the tagline (`intro`), the parent company sentence with its
    linked name (`affiliation`), the button (`action`), the link columns, the
    legal links, and the copyright owner and start year. The copyright year is
    computed.
  - `productPageSettings`: what is the same on every product page: the
    Handmade food block (eyebrow, heading, text, buttons, photo), the
    "Preparing a fundraiser?" call to action (heading, text, buttons, photo),
    and for each kind (hoagies, pizzas, salsas) the two hero buttons and the
    optional "full ingredients list" button.
- `author`, `faq`, `teamMember`, and `testimonial` are reusable records. An
  `author` has a name, a slug and a photo; the photo's alt text is the
  author's name.
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

- `homeHero` (Home hero). The top of the home page: a full-width photo with a
  large title (required; the page's main heading), an optional smaller
  heading under it, an optional short text (paragraphs with bold, italic and
  links), up to two buttons, and an optional YouTube link that adds a "Watch
  the video" button opening the video on YouTube. The photo (required) sits
  behind the text, which stays on the left: set the hotspot on the part of the
  photo that must stay in view. Its theme is the colour of the band the photo
  sits in and of the brushed edge at its foot: choose the theme of the section
  below it. Use it as the first section of the home page. Available on the home page.
- `pageBanner` (Page banner). A wide photo at the top of an inner page, with
  an optional title over it and an optional short text (a sentence or two)
  under the title; the text shows only with a title, and not on a phone.
  When it has a title, the title is the page's
  main heading, and the banner is shorter than one without a title. Its theme
  is the colour of the band the photo sits in and of the brushed edge at its
  foot: choose the theme of the section below it. Use it as the
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

The image-and-text sections below share their fields: an optional eyebrow
(the short line above the heading), an optional heading, text (headings,
lists and tables; required when there is no heading or eyebrow), up to four
buttons, an image with alt text (required), and an optional Anchor ID
(`/page#anchor-id`). No field picks the image's side or how it fills its
frame: choose the section that has the design you want. On a phone the image
sits under the text. Each is available on every page.

- `photoLeftAndText` (Photo left and text (to page edge)). A photo on the
  left, running out to the page edge and cropped to fill its frame (set the
  hotspot), beside the text. Use it for a real photo:
  people, food, the kitchen.
- `photoRightAndText` (Photo right and text (to page edge)). The same with the
  photo on the right.
- `boxedPhotoLeftAndText` (Photo left and text (inside margins)). A photo on
  the left, kept inside the page margins (half the content width, rounded
  corners) and cropped to fill its frame (set the hotspot), beside the text.
  Use it for a real photo that should sit in line with the page's text
  rather than run to the edge, as the old site's "boxed" rows did.
- `boxedPhotoRightAndText` (Photo right and text (inside margins)). The same
  with the photo on the right.
- `cutoutLeftAndText` (Cutout left and text). An illustration or cutout on the
  left, shown whole and never cropped, beside the text. Use it for drawings,
  product shots on a transparent background and document previews.
- `cutoutRightAndText` (Cutout right and text). The same with the image on the
  right.
- `badgeAndText` (Badge and text). An image on the right, shown whole and
  kept short on phones, such as a logo, badge or product line-up, beside the
  text.
- `videoLeftAndText` (Video left and text (to page edge)). A YouTube video on
  the left, drawn as its poster image (the section's image, running to the
  page edge) with a play button; it plays in a
  window over the page once the visitor's privacy choice allows it. Takes one
  YouTube link (required) besides the shared fields.
- `videoRightAndText` (Video right and text (to page edge)). The same with the
  video on the right.
- `boxedVideoLeftAndText` (Video left and text (inside margins)). The same
  video and fields, but the poster stays inside the page margins (half the
  content width, rounded corners), as the boxed photo sections do. Use it for
  a video that should sit in line with the page's text, as the old site's
  "boxed" video rows did.
- `boxedVideoRightAndText` (Video right and text (inside margins)). The same
  with the video on the right.
- `imageAndIconList` (Image and icon list). An illustration on the left, shown
  whole, beside one to three items, each an icon from the site's icon list, a
  heading and a few sentences (paragraphs with bold, italic and links). The
  eyebrow, heading and text are optional here. Use it for a step's three
  parts, as on How it Works.

- `twoTextColumns` (Two text columns). Two blocks of text side by side
  (headings, lists, tables and links; both required); on a phone the left one
  comes first. Use it for two short texts that belong together, as under the
  menu headings on Products. Available on pages, not the home page.
- `faqList` (FAQ list). A centred title (required) over a list of FAQs that a
  visitor opens one by one. The FAQs are `faq` records (a question, and an
  answer of text, lists and links),
  picked in the order they are shown, so an FAQ used twice is edited once. Use
  one per topic, as Selling and Product Info on the FAQ page. Available on
  pages, not the home page.
- `cognitoForm` (Cognito form). One of the site's Cognito forms, drawn by
  Cognito, with an optional introduction (headings, text and links) above it.
  Takes the form ID (the number at the end of the form's address in Cognito
  Forms, as in 114; never embed code) and an accessible title that names the
  form for screen readers and is not shown. Use it for the contact
  and support forms. Available on pages, not the home page.
- `cognitoFormAndText` (Cognito form beside text). One of the site's Cognito
  forms in the right half of the page, with a text (headings, text and links;
  required) beside it on the left; on a phone the text comes first. Takes the
  form ID and the accessible title, as the Cognito form section does. Use it
  when a text explains the form, as on the free tasting page. Available on
  pages, not the home page.
- `latestNews` (Latest news). The three newest news posts as cards, newest
  first, under an optional eyebrow and a title (required). The posts are not
  chosen: the section always shows the newest. With no published posts it
  shows nothing. Use it once, near the end of the home page. Available on the
  home page.
- `steps` (Steps). One to three numbered steps side by side, joined by a
  dotted path; on a phone they stack. Each step has a square picture shown
  whole (required), a title shown after its number (required) and optional
  text (a few lines or a short list). The section has no heading of its own:
  put a Rich Text section with the heading above it. Use it for a short
  process, as "How it Works" on the home page. Available on every page.
- `menuTeaser` (Menu teaser). A heading (required) with an optional eyebrow
  and introduction (paragraphs with bold, italic and links), over exactly two
  parts. Each part is a large cut-out food photo shown whole (required) beside
  a heading (required), optional text and up to two buttons. The first part
  has its photo on the right, the second on the left; on a phone the photo
  sits above its text. Use it once on the home page to lead to the hoagie and
  pizza menus. Available on the home page.
- `callToActionWithImage` (Call to action with image). A heading (required),
  an optional line of text and up to two buttons beside a cut-out photo
  (required, shown whole) that stands out of the block's top. Use it as a
  page's one closing call to action, as on the home page and How it Works.
  The product pages draw the same design from Product Page Settings.
  Available on every page.
- `testimonials` (Testimonials). A heading (required) with an optional
  eyebrow, over customer quotes shown one at a time, with
  previous and next buttons beside the heading, and a cut-out photo of a
  person (required, shown whole) on the right on wide screens. The quotes are
  `testimonial` records (a name, an optional place or role, and the quote),
  picked in the order they are shown, so a quote used twice is edited once.
  Use it once on a page. Available on every page.

The three menus list products. Each holds an ordered list of references to
products of its kind and draws each product's menu card (short name, short
description, card photo and, for hoagies, the dressing) with a Details button
to the product's page. The card is edited on the product, once, and every menu
that lists the product shows it. Each is available on pages, not the home
page.

- `hoagieMenu` (Hoagie menu). The hoagies you choose, in your order: each card
  reads "<short name> Hoagie" with its dressing under it. Use it on the
  products page.
- `pizzaMenu` (Pizza menu). The pizzas you choose, in your order: each card
  reads "<short name> Pizza".
- `salsaMenu` (Salsa menu). The salsas you choose, in your order: each card
  shows the short name as written.

A news post's `blocks` take only Rich Text and the image-and-text sections
above; its header is drawn by the post page.

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

## Products

A product page is a template, not sections. From top to bottom: the hero (the
hero title as the page's main heading, the hero text, the two hero buttons of
the product's kind, the hero photo, on the dark table photo), the ingredients
(the ingredients label above an "Ingredients" heading, the ingredients text,
the kind's "full ingredients list" button and the ingredients image shown
whole), the optional note, the nutrition facts (the product's name above a
"Nutrition Facts" heading, the serving text, and the label drawn from the 26
typed values), then the Handmade food block and the call to action from
`productPageSettings`. The "full ingredients list" button lands on the heading
with the product's name on the page it points at (`Italian Hoagie` lands on
`#italian-hoagie`).

A product's fields: name, kind (Hoagie, Pizza or Salsa), slug, hero title,
hero text, hero photo, ingredients label, ingredients text, ingredients image,
note, nutrition facts (serving text and calories, total fat, saturated fat,
trans fat, cholesterol, sodium, total carbohydrates, dietary fiber, total
sugars, added sugars, protein, vitamin D, calcium, iron and potassium, with
the daily value of each that has one), the menu card (short name, short
description, card photo, and for hoagies the dressing, Italian or mayo) and
the SEO fields.

## Page Builder path

Each section has one shared `_type` across its Studio schema, Page Builder registration, GROQ projection, generated TypeScript type, and React renderer. See `docs/agents/page-builder.md` for the extension steps.

Sanity owns authored content. The repository owns schemas, queries, rendering, routing rules, and generated types.
