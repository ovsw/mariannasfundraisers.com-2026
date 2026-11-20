import { groq } from "next-sanity";
import { blogPostOrder, publishedPostFilter } from "./blog-post-listing";
import { newsCardProjection } from "./shared/news-card";

// The section stores only its heading; the posts are always the three newest.
// @sanity-typegen-ignore
export const latestNewsQuery = groq`
  _type == "latestNews" => {
    theme,
    eyebrow,
    title,
    "posts": *[${publishedPostFilter}] | order(${blogPostOrder})[0...3]{
      ${newsCardProjection}
    }
  }
`;
