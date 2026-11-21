import { defineQuery } from "next-sanity";
import { PRODUCT_PATH_GROQ } from "../../../shared/content-routes";
import { ROOT_SLUG_FILTER } from "../../../shared/root-slug-filter";
import {
  archiveSharingPhotoQuery,
  pageSharingPhotoQuery,
} from "./shared/sharing-photo";

export const HOME_PAGE_OG_IMAGE_QUERY = defineQuery(`
  *[_id == "homePage" && _type == "homePage"][0]{
    "overrideTitle": meta.title,
    title,
    ${pageSharingPhotoQuery}
  }
`);

// A page, or else the product that owns the address (spec decision 8): the
// product's name heads its card, and its hero photo stands in for a banner.
export const PAGE_OG_IMAGE_QUERY = defineQuery(`
  coalesce(
    *[_type == "page" && ${ROOT_SLUG_FILTER}][0]{
      "title": coalesce(title, meta.title),
      ${pageSharingPhotoQuery}
    },
    *[_type == "product" && ${PRODUCT_PATH_GROQ} == "/" + $slug][0]{
      "title": coalesce(name, meta.title),
      "sharingPhoto": select(
        defined(meta.image.asset) => meta.image,
        defined(heroImage.asset) => heroImage
      ){ asset, crop, hotspot }
    }
  )
`);

export const BLOG_INDEX_OG_IMAGE_QUERY = defineQuery(`
  *[_id == "blogIndex" && _type == "blogIndex"][0]{
    "title": coalesce(title, meta.title),
    ${archiveSharingPhotoQuery}
  }
`);
