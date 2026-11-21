import { imageQuery } from "./image";

// What a news card draws (the news list and the Latest news section): the
// post's main image, title, excerpt, author, publish date and reading time.
export const newsCardProjection = `
  _id,
  _type,
  title,
  slug,
  publishedAt,
  readingTime,
  "excerpt": pt::text(excerpt),
  image {${imageQuery}},
  author->{
    _id,
    name,
    image {${imageQuery}}
  }
`;
