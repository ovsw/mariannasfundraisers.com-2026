import { pagePath, postPath, productPath } from "../../shared/content-routes.ts";

const PRESENTATION_DOCUMENT_TYPES = new Set([
  "page",
  "post",
  "blogIndex",
  "homePage",
  "product",
]);

function readKind(document: unknown) {
  if (!document || typeof document !== "object" || !("kind" in document)) {
    return undefined;
  }
  return typeof document.kind === "string" ? document.kind : undefined;
}

function readSlug(document: unknown) {
  if (!document || typeof document !== "object" || !("slug" in document)) {
    return undefined;
  }

  const slug = document.slug;
  if (!slug || typeof slug !== "object" || !("current" in slug)) {
    return undefined;
  }

  return typeof slug.current === "string" ? slug.current : undefined;
}

export function isPresentationDocumentType(documentType: string) {
  return PRESENTATION_DOCUMENT_TYPES.has(documentType);
}

export function resolveContentPath(value?: string | null) {
  return pagePath(value);
}

/** `kind` is a product's kind, which sets its address (spec decision 8). */
export function getPresentationPath(
  documentType: string,
  slug?: string | null,
  kind?: string | null,
) {
  if (documentType === "blogIndex") return "/news";
  if (documentType === "homePage") return "/";
  if (!isPresentationDocumentType(documentType) || !slug?.trim()) return null;
  if (documentType === "page") return pagePath(slug);
  if (documentType === "post") return postPath(slug);
  if (documentType === "product") return productPath(kind, slug);
  return null;
}

export function getDocumentSlug(
  draft?: unknown,
  published?: unknown,
) {
  return draft ? readSlug(draft) : readSlug(published);
}

/** A product's kind, read like its slug: an existing draft is authoritative. */
export function getDocumentKind(
  draft?: unknown,
  published?: unknown,
) {
  return draft ? readKind(draft) : readKind(published);
}
