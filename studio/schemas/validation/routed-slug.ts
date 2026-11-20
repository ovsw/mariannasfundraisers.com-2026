import type { ValidationContext } from "sanity";

import {
  isApplicationPath,
  isReservedPagePath,
  isRouteSlug,
  pagePath,
  productPath,
  productRoute,
  routedDocumentPath,
  type RoutedDocumentType,
} from "../../../shared/content-routes.ts";

type SlugValue = { current?: string };

/** A routed document as the collision check reads it. */
export type RouteCandidate = {
  _id: string;
  _type: string;
  kind?: string | null;
  slug?: string | null;
};

const ROUTED_TYPES = new Set(["page", "post", "product"]);

function slugVariants(slug: string) {
  return [slug, `/${slug}`, `${slug}/`, `/${slug}/`];
}

/** The public path a routed document owns, or null when its slug is not valid. */
export function candidatePath(candidate: Pick<RouteCandidate, "_type" | "kind" | "slug">) {
  if (candidate._type === "product") return productPath(candidate.kind, candidate.slug);
  if (candidate._type === "page" || candidate._type === "post") {
    return routedDocumentPath(candidate._type, candidate.slug);
  }
  return null;
}

/**
 * The slugs to look up for a document that would own `path`: documents of
 * its own type with the same slug, and the other type that can claim the
 * same address. A page at `products/<slug>` or `flavored-salsas/<slug>` can
 * meet a product; a product can meet the page with its full path.
 */
export function collisionLookup(documentType: string, slug: string, path: string) {
  const slugs = new Set(slugVariants(slug));
  if (documentType === "page") {
    const route = productRoute(path);
    if (route) slugs.add(route.slug);
  }
  if (documentType === "product") {
    for (const variant of slugVariants(path.slice(1))) slugs.add(variant);
  }
  return [...slugs];
}

/**
 * The first candidate that owns the same public path. Pages and products
 * share one address space (`flavored-salsas/menu` is a page), posts live
 * under /news alone.
 */
export function findRouteCollision(
  document: { _type: string },
  path: string,
  candidates: RouteCandidate[],
) {
  const sharesSpace = (type: string) =>
    document._type === "post" ? type === "post" : type === "page" || type === "product";
  return (
    candidates.find(
      (candidate) => sharesSpace(candidate._type) && candidatePath(candidate) === path,
    ) ?? null
  );
}

function collisionMessage(documentType: string, candidate: RouteCandidate, path: string) {
  if (candidate._type === documentType) {
    return `This route is already used by another ${documentType}: ${candidate.slug}`;
  }
  return candidate._type === "page"
    ? `This address, ${path}, is already used by the page ${candidate.slug}`
    : `This address, ${path}, is already used by a product`;
}

export async function uniqueRoutedSlug(
  value: SlugValue | undefined,
  context: ValidationContext,
) {
  const current = value?.current;
  const documentId = context.document?._id;
  const documentType = context.document?._type;
  if (!current || !documentId || !documentType || !ROUTED_TYPES.has(documentType)) return true;

  let route: string | null;
  if (documentType === "page") {
    if (pagePath(current) !== `/${current}`) {
      return "Use slash-separated lowercase words, numbers, and single hyphens, with no leading or trailing slash";
    }
    route = pagePath(current);
    if (isReservedPagePath(route)) return `This slug is reserved by the Website route ${route}`;
  } else {
    if (!isRouteSlug(current)) return "Use lowercase letters, numbers, and single hyphens only";
    if (documentType === "product") {
      route = productPath(context.document?.kind as string | undefined, current);
      if (!route) return "Choose the kind first: it sets the product's address";
    } else {
      route = routedDocumentPath(documentType as RoutedDocumentType, current);
      if (isApplicationPath(route)) return `This slug is reserved by the Website route ${route}`;
    }
  }
  if (!route) return true;

  const publishedId = documentId
    .replace(/^drafts\./, "")
    .replace(/^versions\.[^.]+\./, "");
  const client = context
    .getClient({ apiVersion: "2026-03-23" })
    .withConfig({ perspective: "raw" });
  const types = documentType === "post" ? ["post"] : ["page", "product"];
  const candidates = await client.fetch<RouteCandidate[] | null>(
    `*[
      _type in $types &&
      !sanity::versionOf($publishedId) &&
      slug.current in $slugs
    ]{_id, _type, kind, "slug": slug.current}`,
    {
      publishedId,
      slugs: collisionLookup(documentType, current, route),
      types,
    },
  );
  const collision = findRouteCollision({ _type: documentType }, route, candidates ?? []);
  return collision ? collisionMessage(documentType, collision, route) : true;
}
