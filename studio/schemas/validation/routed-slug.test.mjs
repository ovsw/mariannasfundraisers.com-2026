import assert from "node:assert/strict";
import test from "node:test";

import { uniqueRoutedSlug } from "./routed-slug.ts";

// A client over a small dataset. It answers the collision query the way the
// Content Lake does: documents of the asked types whose slug is one of the
// asked slugs, without any version of the document being checked.
function context(document, dataset = [], inspectFetch = () => {}) {
  const client = {
    fetch: async (query, params) => {
      inspectFetch(query, params);
      const baseId = (id) => id.replace(/^drafts\./, "").replace(/^versions\.[^.]+\./, "");
      return dataset
        .filter((doc) => params.types.includes(doc._type))
        .filter((doc) => baseId(doc._id) !== params.publishedId)
        .filter((doc) => params.slugs.includes(doc.slug?.current))
        .map((doc) => ({ _id: doc._id, _type: doc._type, kind: doc.kind ?? null, slug: doc.slug.current }));
    },
    withConfig: () => client,
  };
  return { document, getClient: () => client };
}

const page = (id, slug) => ({ _id: id, _type: "page", slug: { current: slug } });
const product = (id, kind, slug) => ({ _id: id, _type: "product", kind, slug: { current: slug } });

test("accepts one clean segment and checks uniqueness within its route type", async () => {
  assert.equal(
    await uniqueRoutedSlug({ current: "about" }, context({ _id: "drafts.page-id", _type: "page" })),
    true,
  );
  assert.match(
    await uniqueRoutedSlug(
      { current: "about" },
      context({ _id: "drafts.page-id", _type: "page" }, [page("other-page", "about")]),
    ),
    /already used by another page/,
  );
  // The document's own published version is not a collision.
  assert.equal(
    await uniqueRoutedSlug(
      { current: "about" },
      context({ _id: "drafts.page-id", _type: "page" }, [page("page-id", "about")]),
    ),
    true,
  );
});

test("checks legacy surrounding-slash variants for route collisions", async () => {
  let observed;
  const result = await uniqueRoutedSlug(
    { current: "about" },
    context({ _id: "drafts.page-id", _type: "page" }, [page("legacy", "/about/")], (query, params) => {
      observed = { query, params };
    }),
  );
  assert.match(result, /already used by another page/);
  assert.match(observed.query, /slug\.current in \$slugs/);
  assert.deepEqual(observed.params.slugs, ["about", "/about", "about/", "/about/"]);
});

test("accepts nested page slugs but rejects nested post slugs", async () => {
  const pageContext = context({ _id: "page-id", _type: "page" });
  const postContext = context({ _id: "post-id", _type: "post" });

  assert.equal(
    await uniqueRoutedSlug({ current: "staff/available-positions" }, pageContext),
    true,
  );
  assert.match(await uniqueRoutedSlug({ current: "nested/page" }, postContext), /lowercase/);
});

test("rejects malformed and application-owned slugs", async () => {
  const pageContext = context({ _id: "page-id", _type: "page" });
  const postContext = context({ _id: "post-id", _type: "post" });

  assert.match(await uniqueRoutedSlug({ current: "News" }, pageContext), /lowercase/);
  assert.match(await uniqueRoutedSlug({ current: "/nested/page/" }, pageContext), /no leading or trailing slash/);
  assert.match(await uniqueRoutedSlug({ current: "news" }, pageContext), /reserved/);
  assert.match(await uniqueRoutedSlug({ current: "news/post" }, pageContext), /reserved/);
  assert.match(await uniqueRoutedSlug({ current: "api" }, pageContext), /reserved/);
  assert.match(await uniqueRoutedSlug({ current: "2" }, postContext), /reserved/);
});

test("a post never meets a page or a product", async () => {
  const dataset = [page("p", "italian-hoagie"), product("x", "hoagie", "italian-hoagie")];
  assert.equal(
    await uniqueRoutedSlug({ current: "italian-hoagie" }, context({ _id: "post-id", _type: "post" }, dataset)),
    true,
  );
});

// Products and pages share one address space (spec decision 8).
const salsaMenuPage = page("page-salsa-menu", "flavored-salsas/menu");
const mphSalsa = product("product-mph", "salsa", "mph-salsa");
const italianHoagie = product("product-italian", "hoagie", "italian-hoagie");

test("rejects a product whose address a page already uses", async () => {
  const dataset = [salsaMenuPage];
  assert.match(
    await uniqueRoutedSlug(
      { current: "menu" },
      context({ _id: "drafts.product-new", _type: "product", kind: "salsa" }, dataset),
    ),
    /\/flavored-salsas\/menu, is already used by the page flavored-salsas\/menu/,
  );
  // The same slug under the other prefix is a different address.
  assert.equal(
    await uniqueRoutedSlug(
      { current: "menu" },
      context({ _id: "drafts.product-new", _type: "product", kind: "hoagie" }, dataset),
    ),
    true,
  );
});

test("rejects a page whose address a product already uses", async () => {
  const dataset = [mphSalsa, italianHoagie];
  assert.match(
    await uniqueRoutedSlug(
      { current: "flavored-salsas/mph-salsa" },
      context({ _id: "drafts.page-new", _type: "page" }, dataset),
    ),
    /\/flavored-salsas\/mph-salsa, is already used by a product/,
  );
  assert.match(
    await uniqueRoutedSlug(
      { current: "products/italian-hoagie" },
      context({ _id: "drafts.page-new", _type: "page" }, dataset),
    ),
    /already used by a product/,
  );
  // A product's slug alone is not a page address.
  assert.equal(
    await uniqueRoutedSlug({ current: "mph-salsa" }, context({ _id: "drafts.page-new", _type: "page" }, dataset)),
    true,
  );
  assert.equal(
    await uniqueRoutedSlug(
      { current: "products/mph-salsa" },
      context({ _id: "drafts.page-new", _type: "page" }, dataset),
    ),
    true,
  );
});

test("hoagies and pizzas share /products; salsas have their own prefix", async () => {
  const dataset = [italianHoagie, mphSalsa];
  assert.match(
    await uniqueRoutedSlug(
      { current: "italian-hoagie" },
      context({ _id: "product-new", _type: "product", kind: "pizza" }, dataset),
    ),
    /already used by another product/,
  );
  assert.equal(
    await uniqueRoutedSlug(
      { current: "italian-hoagie" },
      context({ _id: "product-new", _type: "product", kind: "salsa" }, dataset),
    ),
    true,
  );
  assert.equal(
    await uniqueRoutedSlug(
      { current: "italian-hoagie" },
      context({ _id: "drafts.product-italian", _type: "product", kind: "hoagie" }, dataset),
    ),
    true,
  );
});

test("a product needs a one-segment slug and a kind", async () => {
  assert.match(
    await uniqueRoutedSlug({ current: "two/segments" }, context({ _id: "p", _type: "product", kind: "salsa" })),
    /lowercase/,
  );
  assert.match(
    await uniqueRoutedSlug({ current: "mph-salsa" }, context({ _id: "p", _type: "product" })),
    /Choose the kind/,
  );
});
