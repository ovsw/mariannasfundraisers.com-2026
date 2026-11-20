# Content model

The Website reads structured content from one Sanity project and dataset.

## Routed content

- `homePage` owns `/`.
- `page` owns normal page slugs such as `/about/`.
- `blogIndex` is the news index and owns `/news` (20 posts per page, then
  `/news/2` and onward).
- `post` is a news post and owns `/news/<slug>`.
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

The image-and-text sections below share their fields: an optional eyebrow
(the short line above the heading), an optional heading, text (headings,
lists and tables; required when there is no heading or eyebrow), up to four
buttons, an image with alt text (required), and an optional Anchor ID
(`/page#anchor-id`). No field picks the image's side or how it fills its
frame: choose the section that has the design you want. On a phone the image
sits under the text. Each is available on every page.

- `photoLeftAndText` (Photo left and text). A photo on the left, cropped to
  fill its frame (set the hotspot), beside the text. Use it for a real photo:
  people, food, the kitchen.
- `photoRightAndText` (Photo right and text). The same with the photo on the
  right.
- `cutoutLeftAndText` (Cutout left and text). An illustration or cutout on the
  left, shown whole and never cropped, beside the text. Use it for drawings,
  product shots on a transparent background and document previews.
- `cutoutRightAndText` (Cutout right and text). The same with the image on the
  right.
- `badgeAndText` (Badge and text). A smaller image on the right, shown whole,
  such as a logo, badge or product line-up, beside the text.
- `videoLeftAndText` (Video left and text). A YouTube video on the left, drawn
  as its poster image (the section's image) with a play button; it plays in a
  window over the page once the visitor's privacy choice allows it. Takes one
  YouTube link (required) besides the shared fields.
- `videoRightAndText` (Video right and text). The same with the video on the
  right.
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
  form for screen readers and is not shown. Use it for the contact, tasting
  and support forms. Available on pages, not the home page.

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
