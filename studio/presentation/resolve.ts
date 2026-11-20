import {
  defineLocations,
  defineDocuments,
} from "sanity/presentation";
import type { PresentationPluginOptions } from "sanity/presentation";
import { ROOT_SLUG_FILTER } from "../../shared/root-slug-filter.ts";
import { productPath } from "../../shared/content-routes.ts";
import {
  getPresentationPath,
  resolveContentPath,
} from "./routes.ts";

export { resolveContentPath } from "./routes.ts";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    page: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => {
        const href = resolveContentPath(doc?.slug);
        return {
          locations: href
            ? [{ title: doc?.title || "Untitled", href }]
            : [],
        };
      },
    }),
    post: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled",
            href: getPresentationPath("post", doc?.slug) ?? "/news",
          },
          { title: "News", href: "/news" },
        ],
      }),
    }),
    product: defineLocations({
      select: {
        title: "name",
        slug: "slug.current",
        kind: "kind",
      },
      resolve: (doc) => {
        const href = productPath(doc?.kind, doc?.slug);
        return {
          locations: href
            ? [{ title: doc?.title || "Untitled", href }]
            : [],
        };
      },
    }),
    blogIndex: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || "News Index", href: "/news" }],
      }),
    }),
    homePage: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || "Home Page", href: "/" }],
      }),
    }),
  },
  mainDocuments: defineDocuments([
    {
      route: "/news",
      filter: `_id == "blogIndex"`,
    },
    {
      route: "/",
      filter: `_id == 'homePage' && _type == 'homePage'`,
    },
    {
      route: "/news/:slug",
      filter: `_type == 'post' && ${ROOT_SLUG_FILTER}`,
    },
    // A product address can also be a page (flavored-salsas/menu is one);
    // the slug rule keeps the two from sharing an address, so whichever
    // exists is the main document.
    {
      route: "/products/:slug",
      filter: `(_type == "product" && kind in ["hoagie", "pizza"] && slug.current == $slug) || (_type == "page" && slug.current in ["products/" + $slug, "/products/" + $slug, "products/" + $slug + "/", "/products/" + $slug + "/"])`,
    },
    {
      route: "/flavored-salsas/:slug",
      filter: `(_type == "product" && kind == "salsa" && slug.current == $slug) || (_type == "page" && slug.current in ["flavored-salsas/" + $slug, "/flavored-salsas/" + $slug, "flavored-salsas/" + $slug + "/", "/flavored-salsas/" + $slug + "/"])`,
    },
    {
      route: "/:slug(.+)",
      filter: `_type == 'page' && ${ROOT_SLUG_FILTER}`,
    },
  ]),
};
