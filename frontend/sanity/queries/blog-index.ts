import { archiveSharingPhotoQuery } from "./shared/sharing-photo";
import { groq } from "next-sanity";
import { pageBuilderQuery } from "./page-builder";
import { metaQuery } from "./shared/meta";
import { newsCardProjection } from "./shared/news-card";
import type { NEWS_POSTS_QUERY_RESULT } from "@/sanity.types";
import { blogPostOrder, publishedPostFilter } from "./blog-post-listing";

export type NewsCardPost = NEWS_POSTS_QUERY_RESULT[number];

export const BLOG_INDEX_QUERY = groq`
  *[_id == "blogIndex"][0]{
    _id,
    _type,
    eyebrow,
    title,
    description,
    ${pageBuilderQuery},
    ${archiveSharingPhotoQuery},
    ${metaQuery}
  }
`;

// The news list: every published post, newest first, 20 per page (spec
// decision 9).
export const NEWS_POSTS_QUERY = groq`
  *[${publishedPostFilter}] | order(${blogPostOrder})[$start...$end]{
    ${newsCardProjection}
  }
`;

export const ELIGIBLE_BLOG_POSTS_COUNT_QUERY = groq`
  count(*[${publishedPostFilter}])
`;
