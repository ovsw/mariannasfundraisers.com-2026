// The iubenda consent widget and privacy choices control of the old site
// (spec decision 17). These IDs belong to the site's iubenda account and are
// public: the widget loads them in every visitor's browser.

/** The unified iubenda loader: consent banner, US privacy choices, and their links. */
export const IUBENDA_WIDGET_SRC =
  "https://embeds.iubenda.com/widgets/b61db3fb-b9eb-4e39-8e27-10397f92a865.js";

/** iubenda's script that opens its policy links (class `iubenda-embed`) in a lightbox. */
export const IUBENDA_EMBED_SRC = "https://cdn.iubenda.com/iubenda.js";

const POLICY = "https://www.iubenda.com/privacy-policy/52141374";

/**
 * The privacy choices control: two links the widget binds by class. They are
 * part of the consent widget, not editable content.
 */
export const PRIVACY_CONTROLS = [
  {
    key: "notice-at-collection",
    label: "Notice at Collection",
    href: `${POLICY}/cookie-policy?an=no&s_ck=false&newmarkup=yes`,
    className: "iubenda-cs-uspr-link",
    icon: false,
  },
  {
    key: "your-privacy-choices",
    label: "Your Privacy Choices",
    href: `${POLICY}/legal?an=no&s_ck=false&newmarkup=yes#privacy_rights_under_us_state_laws`,
    className: "iubenda-cs-preferences-link",
    icon: true,
  },
] as const;

/** iubenda policy pages open in iubenda's lightbox, as on the old site. */
export function iubendaEmbedClass(href: string): string | undefined {
  return href.startsWith("https://www.iubenda.com/")
    ? "iubenda-nostyle no-brand iubenda-noiframe iubenda-embed"
    : undefined;
}
