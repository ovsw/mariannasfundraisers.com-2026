# Design system

The look of the old mariannasfundraisers.com, rebuilt with the Starter's
tokens (spec #3, decisions 2, 10, 11 and 13). The old styling is not ported:
the values below come from the old site's Tailwind config, stylesheet,
dividers and icons (`ovsw/mfr-web-next2`), and the code that uses them
follows the Starter's colour rule in `docs/agents/page-builder.md`.

## Palette

Brand colours are `--brand-*` variables in `frontend/app/globals.css`.
Component code never names them; it uses job tokens.

| Brand colour | Value | Old name |
| --- | --- | --- |
| `--brand-green` | `#00764F` | `primary` |
| `--brand-green-dark` | `#006243` | `primary-600` |
| `--brand-red` | `#CC083E` | `accent` |
| `--brand-red-bright` | `#CC081C` | `accent-500` (focus ring, errors) |
| `--brand-red-dark` | `#AF0726` | `accent-600` (red hover) |
| `--brand-cream` | `#FEF7C1` | `tertiary` |
| `--brand-cream-light` | `#FFFDEE` | `tertiary-200` (menu hover) |
| `--brand-off-white` | `#FAF7EA` | `tertiary-0`, `offWhite` |
| `--brand-ink` | `#363232` | text `base`: headings |
| `--brand-grey` | `#707070` | text `body`: running text |
| `--brand-grey-light` | `#D4D4D4` | running text on Muslin |
| `--brand-line`, `--brand-line-strong` | `#E7E5E4`, `#A8A29E` | hairlines |
| `--brand-muslin` | `#1D1D24` | the average colour of the muslin photo |
| `--brand-white`, `--brand-black` | `#FFFFFF`, `#000000` | |

## Job tokens

The job tokens (`--color-*` in `@theme`) keep the Starter's names. The ones
whose meaning is particular to this site:

- `foreground` is ink (headings); `muted-foreground` is the grey of running
  text and descriptions.
- `link` is red on light grounds: eyebrows, small accent text and links
  outside running text. `prose-link` is green: links inside running text.
- `emphasis` is green on light grounds: section headings and the emphasised
  phrase of a headline, as the old heading blocks drew them.
- `primary` is red, the main action (the old `accent` button). `secondary`
  is green (the old `primary` button). Each has a `-hover` and a
  `-foreground` token.
- `mark` is red on light grounds and cream on dark ones: bullets and rules.
- `ring` is the old focus colour, `#CC081C`.

## Fonts

The Adobe Fonts kit the old site loads, `https://use.typekit.net/ops4vzn.css`,
linked in `frontend/app/layout.tsx`. It serves Acumin Pro (400, 500, 700,
800), Acumin Pro Condensed (400, 600, 700) and Acumin Pro Extra Condensed
(400, 700). The Tailwind theme names them:

- `font-sans`: `acumin-pro`, the body and heading face.
- `font-condensed`: `acumin-pro-condensed`, the old eyebrows (bold italic).
- `font-extra-condensed`: `acumin-pro-extra-condensed`.

## Section themes

The shared `theme` field (`studio/schemas/blocks/shared/section-theme.ts`)
offers the old site's four section backgrounds. The values and their titles
live in `shared/site-design.ts`, which the Studio and the Website both read.

| Theme | Value | Ground | Text |
| --- | --- | --- | --- |
| Light | `light` | white | ink headings, grey text, red eyebrows, green headings |
| Shaded | `shaded` | off-white `#FAF7EA` | as Light |
| Muslin | `muslin` | the old dark muslin photo (`frontend/public/images/muslin.webp`) over `#1D1D24` | white headings, light grey text, off-white eyebrows |
| Primary | `primary` | green `#00764F` | white headings, off-white text and eyebrows |

Each theme is a class, `.section-scene-<value>`, that re-points every ground
token, so one piece of markup is right on all four. Buttons keep their
colours on every theme, because the editor picks a button's colour for the
background it sits on, as on the old site. An unknown or missing value is
drawn as Light.

The old Storyblok model called the muslin background `muslin` and drew it as
a dark textured photo, not as cream; the theme keeps that look. Cream stays
in the palette for small accents.

## Brushed edges

The old site joined sections of different colours with a painted, ragged
brush stroke. Here code draws it; no field stores an edge.

**The rule** (`resolveSectionBrushes` in
`frontend/components/blocks/section-brush.tsx`, tested in
`section-brush.test.tsx`):

- Two neighbouring sections with the same theme meet at a plain seam.
- Where the themes differ, the section whose theme ranks higher, in the order
  Primary, Shaded, Light, Muslin, paints a stroke in its own background colour
  across the join, into its neighbour: down from its bottom, or up from its
  top. A Shaded section between two Light ones paints both edges.
- Muslin never paints: a flat stroke cannot carry its photo. Its neighbour
  paints into it.
- Nothing is drawn above the first section, below the last, or next to a
  section without a theme (a hero, a Scaffold), which draw their own edges.
- An edge a section keeps straight takes no stroke, from the section or from
  its neighbour. The call to action with image keeps both edges straight and
  Testimonials its bottom one: their photos stand on the bottom edge and rise
  above the top one, as on the old site.

The order follows how the old pages used their strokes: a Shaded or Primary
section painted into the Light sections around it, and Light sections painted
into Muslin.

**The shapes**, traced from the old dividers:

- `brush` (the default): the old `section-brush-2` stroke rising from a
  section's top, and `section-brush-2b` hanging from its bottom. 1920 by 60
  units.
- `menu`: the broad stroke the old site drew above its menu sections
  (`section-brush-menu`), mirrored for a bottom edge. 1920 by 128 units. A
  section type gets it by being listed in `sectionBrushShapes` in
  `frontend/components/blocks/index.tsx`.

A stroke spans the full width and its height follows the page width, as the
old dividers did: 3.125vw for `brush` (between 0.75rem and 3.75rem) and
6.667vw for `menu` (between 1.5rem and 8rem). It sits over the neighbouring
section's padding, which is always taller.

## Buttons and icons

The shared `button` type (`studio/schemas/blocks/shared/button.ts`) holds the
text, the link (with "open in new tab"), a colour and an optional icon.
`buttonProjection` (`frontend/sanity/queries/shared/button.ts`) reads it and
`SiteButton` (`frontend/components/site-button.tsx`) draws it at the old
button size (`cta` in `frontend/components/ui/button.tsx`): 18px bold text,
7px corners (14px from the md breakpoint) and a large shadow.

**Colours.** The four old button styles, stored under their old names and
mapped to the Starter's button styles in `frontend/lib/button-colour.ts`:

| Colour (Studio title) | Stored value | Starter style | Look |
| --- | --- | --- | --- |
| Red | `accent` | `primary` | red fill, white text |
| Green | `primary` | `secondary` | green fill, white text |
| White with red text | `light-accent` | `primary-inverted` | white fill, red text; red fill on hover |
| White with green text | `light-primary` | `secondary-inverted` | white fill, green text; green fill on hover |

A button without a colour is red.

**Icons.** The 22 icons of the old `icons` option list, kept as SVG in
`frontend/components/site-icon.tsx` (black in the old files is
`currentColor`, so an icon takes the button's text colour). The list and its
titles live in `shared/site-design.ts`:

`book-spells`, `chef-hat`, `chevron-left`, `chevron-right`,
`delivery-truck`, `documents`, `documents-checked`, `envelope`, `info`,
`info-round`, `hand-asking`, `hand-heart`, `hand-helping`, `heart`,
`hoagie`, `price-tag`, `paper-plane`, `people`, `phone-ringing`, `pizza`,
`search`, `share`.

An icon is 1.5 times the button's text height. Its side is not a field:
`chevron-right` sits after the label, every other icon before it
(`buttonIconSide`). On the old site one button had `people` on the right; it
moves to the left.

## Header, footer and privacy

The site shell (spec decisions 16 to 18) draws only Sanity data; see
`docs/content-model.md`, "Shared content".

- **Header** (`frontend/components/header/`): white and sticky, with the logo
  for light backgrounds. Each dropdown opens a Primary-themed panel with the
  group's name and description (from the `xl` breakpoint) beside two columns of
  links, each with its icon in green, bold label and description. The action
  button is the old outlined green button. Below `lg`, the phone menu draws the
  same groups as an accordion.
- **Footer** (`frontend/components/footer/`): the Primary theme on the old
  footer's darker green (`.footer-scene`), the logo for dark backgrounds, the
  DelGrosso kitchen badge (`public/images/delgrosso-badge.webp`, decorative),
  the phone number, the tagline and parent company, contact details, the
  privacy choices control, the white-with-red button, social icons, the link
  columns and a Legal column, and the copyright line with the computed years
  and the credit link.
- **Privacy and analytics** (`frontend/lib/privacy/`): the iubenda consent
  widget loads in the root layout after `public/privacy-controls.js`, which
  hooks the widget's callbacks and fires `marianna:privacy`. The consent rule
  is `analyticsAllowed` in `consent.ts` (unit-tested): allowed only when the
  widget is ready, has preferences, no US purpose is refused, and the browser
  sends no Global Privacy Control. Google Analytics (`analytics.ts`) loads
  through that rule only, with the measurement ID from `settings`; withdrawing
  consent disables it and clears its cookies. iubenda policy links open in
  iubenda's lightbox. No other third-party script loads in the shell.
- **404**: `components/404.tsx`, on the Shaded ground between the header and
  footer.
- **Static files** in `frontend/public/`: the seven order tally spreadsheets
  at their old `/downloads/...` paths, the favicons, `site.webmanifest` and
  `browserconfig.xml`.
