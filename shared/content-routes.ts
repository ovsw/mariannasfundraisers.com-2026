export type RoutedDocumentType = "page" | "post";

const ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function cleanSlug(value?: string | null) {
  return value?.trim().replace(/^\/+|\/+$/g, "") ?? "";
}

export function isRouteSlug(value?: string | null) {
  return Boolean(value && ROUTE_SLUG_PATTERN.test(value));
}

export function isPageSlug(value?: string | null) {
  const slug = cleanSlug(value);
  return Boolean(slug && slug.split("/").every(isRouteSlug));
}

export function pagePath(value?: string | null) {
  const slug = cleanSlug(value);
  return isPageSlug(slug) ? `/${slug}` : null;
}

export function postPath(value?: string | null) {
  const slug = cleanSlug(value);
  return isRouteSlug(slug) ? `/news/${slug}` : null;
}

// Products (spec decision 8): the kind sets the address. Hoagies and pizzas
// live at /products/<slug>, salsas at /flavored-salsas/<slug>. A page can own
// a path under the same prefix (flavored-salsas/menu is a page), so the slug
// rule (studio/schemas/validation/routed-slug.ts) keeps the two apart.
export const productKinds = ["hoagie", "pizza", "salsa"] as const;
export type ProductKind = (typeof productKinds)[number];

export function isProductKind(value?: string | null): value is ProductKind {
  return (productKinds as readonly string[]).includes(value ?? "");
}

/** The first path segment of a product of this kind. */
export function productPathPrefix(kind: ProductKind) {
  return kind === "salsa" ? "flavored-salsas" : "products";
}

export function productPath(kind?: string | null, value?: string | null) {
  const slug = cleanSlug(value);
  if (!isProductKind(kind) || !isRouteSlug(slug)) return null;
  return `/${productPathPrefix(kind)}/${slug}`;
}

/**
 * The product kinds and slug a path could belong to, or null when no product
 * can own it: `/products/<slug>` holds a hoagie or a pizza,
 * `/flavored-salsas/<slug>` a salsa.
 */
export function productRoute(value?: string | null) {
  const path = normalizePublicPath(value);
  const [prefix, slug, ...rest] = path.split("/").filter(Boolean);
  if (rest.length || !slug || !isRouteSlug(slug)) return null;
  const kinds = productKinds.filter((kind) => productPathPrefix(kind) === prefix);
  return kinds.length ? { kinds, slug } : null;
}

/**
 * GROQ for a product's path, read from the document at `prefix` (empty for
 * the current document, `internal->` through a reference). Keep it in step
 * with `productPath`.
 */
export function productPathGroq(prefix = "") {
  return `select(${prefix}kind == "salsa" => "/flavored-salsas/", "/products/") + ${prefix}slug.current`;
}

/** `productPathGroq()` as a literal, for queries that TypeGen reads. */
export const PRODUCT_PATH_GROQ =
  'select(kind == "salsa" => "/flavored-salsas/", "/products/") + slug.current';

export function routedDocumentPath(
  documentType: RoutedDocumentType,
  value?: string | null,
) {
  if (documentType === "post") return postPath(value);
  return pagePath(value);
}

export function normalizePublicPath(value?: string | null) {
  const trimmed = value?.trim();
  if (
    !trimmed ||
    !trimmed.startsWith("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("?") ||
    trimmed.includes("#")
  ) {
    return "";
  }

  const segments = trimmed.split("/").filter(Boolean);
  return segments.length ? `/${segments.join("/")}` : "/";
}

/**
 * Redirects to another site, which a `redirect` document cannot hold (its
 * destination is a page): the old site sent its policy addresses to iubenda
 * (spec decision 6). The Website's config answers them, permanently, as the
 * old site did, so their sources belong to the application.
 */
export const EXTERNAL_REDIRECTS = [
  {
    source: "/terms-and-conditions",
    destination: "https://www.iubenda.com/terms-and-conditions/52141374",
    permanent: true,
  },
  {
    source: "/cookie-policy",
    destination: "https://www.iubenda.com/privacy-policy/52141374/cookie-policy",
    permanent: true,
  },
  {
    source: "/privacy-policy",
    destination: "https://www.iubenda.com/privacy-policy/52141374",
    permanent: true,
  },
] as const;

/** Paths owned by the application rather than an editor-created document. */
export function isApplicationPath(value?: string | null) {
  const path = normalizePublicPath(value);
  if (!path) return false;

  if (EXTERNAL_REDIRECTS.some((redirect) => redirect.source === path)) {
    return true;
  }

  if (
    path === "/" ||
    path === "/news" ||
    path === "/contact/thanks" ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml"
  ) {
    return true;
  }

  if (path === "/api" || path.startsWith("/api/")) return true;
  if (path === "/_next" || path.startsWith("/_next/")) return true;
  return /^\/news\/\d+$/.test(path);
}

/** Paths that an editor-created page cannot own. */
export function isReservedPagePath(value?: string | null) {
  const path = normalizePublicPath(value);
  return Boolean(
    path &&
    (isApplicationPath(path) || path === "/news" || path.startsWith("/news/")),
  );
}
