// The site shell's three global documents, `settings`, `navigation` and
// `footer`, from the hard-coded content of the old code (spec decisions 16, 17
// and 21; ticket #14). The source is the reference capture's seed file,
// docs/migration/seed/hard-coded-content.json. Pure: links are resolved through
// `site`, logo files through `fileRef`, icon artwork through `iconSvg`.
//
// Keys come from the labels, so a second run builds the same documents and
// writes nothing. Links the seed marks `dropped` (they went nowhere, or were
// commented out in the old code) are left out.

/** The old logos, as files in the old repository at the seed's commit. */
export function logoUrl(seed, file) {
  return `https://raw.githubusercontent.com/ovsw/mfr-web-next2/${seed.source.commit}/${file}`;
}

/**
 * The navigation icon for each Heroicons outline icon the old menu drew: the
 * nearest Lucide icon, which the Studio's navigation icon picker offers.
 */
export const NAVIGATION_ICONS = {
  BookOpenIcon: "book-open",
  CalendarIcon: "calendar",
  ChartBarIcon: "chart-column",
  ChatAltIcon: "message-square",
  ClipboardCheckIcon: "clipboard-check",
  ClockIcon: "clock",
  CurrencyDollarIcon: "circle-dollar-sign",
  DocumentAddIcon: "file-plus",
  DocumentTextIcon: "file-text",
  HeartIcon: "heart",
  NewspaperIcon: "newspaper",
  PhoneIcon: "phone",
  PlayIcon: "play",
  QuestionMarkCircleIcon: "circle-question-mark",
  SearchIcon: "search",
  SparklesIcon: "sparkles",
  StarIcon: "star",
  TemplateIcon: "layout-template",
  UserGroupIcon: "users-round",
  UsersIcon: "users",
};

/** The Lucide icon names the seed's navigation uses. */
export function navigationIconNames(seed) {
  const names = new Set();
  for (const item of seed.navigation.items) {
    for (const link of item.links ?? []) {
      if (!link.dropped && link.oldIcon) names.add(iconName(link.oldIcon));
    }
  }
  return [...names].sort();
}

function iconName(oldIcon) {
  const name = NAVIGATION_ICONS[oldIcon];
  if (!name) throw new Error(`No navigation icon for the old icon ${oldIcon}`);
  return name;
}

/** `Schedule Free Tasting` becomes `schedule-free-tasting`. */
export function keyFrom(label) {
  const key = String(label)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!key) throw new Error(`No key for the label ${JSON.stringify(label)}`);
  return key;
}

/** Array members with their `_key`: from the label, numbered when two match. */
function keyed(items, labelOf) {
  const used = new Map();
  return items.map((item) => {
    const base = keyFrom(labelOf(item));
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return { _key: seen ? `${base}-${seen + 1}` : base, ...item };
  });
}

/** Site paths that are routes in code, not stories: the news index (spec decision 5). */
const CODE_ROUTES = new Set(["/news"]);

const kept = (links) => (links ?? []).filter((link) => !link.dropped);

/**
 * A destination object of the given type: a reference to the imported page at
 * a site path, or the URL as an external destination (another site, phone,
 * email, or a site path no imported page owns yet, such as `/news`).
 */
function destination(type, link, context) {
  const href = link.href?.trim();
  if (!href) throw new Error(`The seed link ${link.label} has no href`);
  const base = { _type: type, openInNewTab: link.openInNewTab === true };
  if (href.startsWith("/")) {
    const target = context.site.byPath(href);
    if (target?.ref) return { ...base, kind: "internal", internal: { _type: "reference", _ref: target.ref._ref } };
    if (!target && !CODE_ROUTES.has(href)) context.missingPath(href, link.label);
  }
  return { ...base, kind: "external", external: href };
}

function settingsDocument(seed, context) {
  const { settings } = seed;
  const document = {
    _id: "settings",
    _type: "settings",
    siteName: settings.siteName,
    logo: {
      light: logoImage(seed, settings.logos.header.oldFile, context),
      dark: logoImage(seed, settings.logos.footer.oldFile, context),
    },
    contact: {
      _type: "contactDetails",
      email: settings.email,
      phone: settings.phone.display,
      addressLines: [...settings.address],
    },
    socialLinks: keyed(kept(settings.social), (link) => link.label).map((link) => ({
      _key: link._key,
      _type: "socialLink",
      label: link.label,
      url: link.href,
    })),
  };
  if (context.gaMeasurementId) document.googleAnalyticsMeasurementId = context.gaMeasurementId;
  return document;
}

function logoImage(seed, file, context) {
  return { _type: "image", asset: { _type: "reference", _ref: context.fileRef(logoUrl(seed, file), "image") } };
}

function navigationDocument(seed, context) {
  const dest = (link) => destination("navigationDestination", link, context);
  const items = keyed(seed.navigation.items, (item) => item.title ?? item.label).map((item) => {
    if (item.type === "link") {
      return { _key: item._key, _type: "navigationLink", label: item.label, destination: dest(item) };
    }
    const group = { _key: item._key, _type: "navigationGroup", label: item.title };
    if (item.description) group.description = item.description;
    group.links = keyed(kept(item.links), (link) => link.label).map((link) => {
      const child = { _key: link._key, _type: "navigationChildLink", label: link.label };
      if (link.description) child.description = link.description;
      if (link.oldIcon) {
        const name = iconName(link.oldIcon);
        child.icon = { name, svg: context.iconSvg(name) };
      }
      child.destination = dest(link);
      return child;
    });
    return group;
  });
  const actions = keyed(kept(seed.navigation.actionButtons), (link) => link.label).map((link) => ({
    _key: link._key,
    _type: "navigationAction",
    label: link.label,
    destination: dest(link),
  }));
  return { _id: "navigation", _type: "navigation", items, actions };
}

function footerLink(link, context, key) {
  const value = { _type: "footerLink", label: link.label, destination: destination("footerDestination", link, context) };
  return key ? { _key: key, ...value } : value;
}

function footerLinks(links, context) {
  return keyed(kept(links), (link) => link.label).map((link) => footerLink(link, context, link._key));
}

function footerDocument(seed, context) {
  const { footer } = seed;
  return {
    _id: "footer",
    _type: "footer",
    intro: footer.tagline,
    affiliation: {
      text: footer.parentCompany.text,
      link: footerLink(footer.parentCompany.link, context),
    },
    action: footerLink(footer.button, context),
    columns: keyed(footer.columns, (column) => column.title).map((column) => ({
      _key: column._key,
      _type: "footerColumn",
      heading: column.title,
      links: footerLinks(column.links, context),
    })),
    legalLinks: footerLinks(footer.legalLinks, context),
    copyrightStartYear: footer.copyright.startYear,
    copyrightOwner: footer.copyright.owner,
  };
}

/**
 * The `settings`, `navigation` and `footer` documents. `options.site` resolves
 * site paths (`createSite`); `options.fileRef(url, "image")` gives the logo
 * assets; `options.iconSvg(name)` gives a navigation icon's SVG markup;
 * `options.gaMeasurementId` is the Google Analytics measurement ID, left out
 * when empty; `options.missingPath(path, label)` hears of a site path no story
 * owns.
 */
export function siteShellDocuments(seed, options) {
  const context = {
    site: options.site,
    fileRef: options.fileRef,
    iconSvg: options.iconSvg,
    gaMeasurementId: options.gaMeasurementId?.trim() || null,
    missingPath: options.missingPath ?? (() => {}),
  };
  return [settingsDocument(seed, context), navigationDocument(seed, context), footerDocument(seed, context)];
}

/** The logo files the settings use, as entries for the importer's file map. */
export function siteShellFiles(seed) {
  const { logos } = seed.settings;
  return [logos.header, logos.footer].map((logo) => ({
    url: logoUrl(seed, logo.oldFile),
    asImage: true,
    asLink: false,
    alt: logo.alt ?? "",
    title: "",
    storyblokId: null,
  }));
}
