// The old site's redirects from the seed file (spec decision 6, ticket #20).
// The internal ones become `redirect` documents. The three to iubenda go to
// another site, which a `redirect` document cannot hold (its destination is a
// reference to a page), so the Website's config holds them
// (`EXTERNAL_REDIRECTS` in `shared/content-routes.ts`). Pure, like the rest of
// the transform.

/** Site paths that are routes in code, not stories, and the document each one shows. */
const CODE_ROUTE_DOCUMENTS = { "/": "homePage", "/news": "blogIndex" };

/** The ID of the `redirect` document for an old source path (`/about-us/our-team`). */
export function seedRedirectId(source) {
  const name = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!name) throw new Error(`No redirect ID for the source ${JSON.stringify(source)}`);
  return `redirect-seed-${name}`;
}

/**
 * The `redirect` documents of the seed's internal redirects, those redirects
 * (`internal`), and the external ones left to the Website's config.
 * `options.site` finds the imported page at a path;
 * `options.missingPath(source, destination)` hears of a destination no
 * imported page owns, and that redirect is left out.
 */
export function seedRedirects(seed, options) {
  const documents = [];
  const internal = [];
  const external = [];
  for (const item of seed.redirects?.items ?? []) {
    if (item.external) {
      external.push({ source: item.source, destination: item.destination });
      continue;
    }
    const ref = CODE_ROUTE_DOCUMENTS[item.destination] ?? options.site.byPath(item.destination)?.ref?._ref;
    if (!ref) {
      options.missingPath(item.source, item.destination);
      continue;
    }
    documents.push({
      _id: seedRedirectId(item.source),
      _type: "redirect",
      status: "active",
      source: { _type: "slug", current: item.source },
      destinationReference: { _type: "reference", _ref: ref },
      permanent: item.permanent === false ? "false" : "true",
    });
    internal.push({ source: item.source, destination: item.destination });
  }
  return { documents, internal, external };
}
