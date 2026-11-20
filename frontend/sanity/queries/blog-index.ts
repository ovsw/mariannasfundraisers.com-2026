import { archiveSharingPhotoQuery } from "./shared/sharing-photo";
import { groq } from "next-sanity";
import { pageBuilderQuery } from "./page-builder";
import { imageQuery } from "./shared/image";
import { metaQuery } from "./shared/meta";
import type { LATEST_POST_QUERY_RESULT } from "@/sanity.types";
import { blogPostOrder, publishedPostFilter } from "./blog-post-listing";

export type BlogPost = NonNullable<LATEST_POST_QUERY_RESULT>;

const blogPostProjection = `
  _id,
  title,
  slug,
  publishedAt,
  "excerpt": pt::text(excerpt),
  image {${imageQuery}}
`;

export const BLOG_INDEX_QUERY = groq`
  *[_id == "blogIndex"][0]{
    _id,
    _type,
    title,
    description,
    ${pageBuilderQuery},
    ${archiveSharingPhotoQuery},
    ${metaQuery}
  }
`;

export const LATEST_POST_QUERY = groq`
  *[${publishedPostFilter}] | order(${blogPostOrder})[0]{
    ${blogPostProjection}
  }
`;

export const REGULAR_POSTS_QUERY = groq`
  *[${publishedPostFilter} && _id != $latestPostId]
    | order(${blogPostOrder})[$start...$end]{
      ${blogPostProjection}
    }
`;

export const REGULAR_POSTS_COUNT_QUERY = groq`
  count(*[${publishedPostFilter} && _id != $latestPostId])
`;

export const ELIGIBLE_BLOG_POSTS_COUNT_QUERY = groq`
  count(*[${publishedPostFilter}])
`;
