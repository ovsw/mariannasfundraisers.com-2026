import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  BLOG_POSTS_PER_PAGE,
  calculateBlogPagination,
  getBlogCanonicalPath,
  getBlogPageTitle,
  getBlogPaginationUrl,
  getBlogPostWindow,
  getBlogResultsLabel,
  parseBlogPageSegment,
  isBlogPageOutOfRange,
} from "./blog-index.ts";

test("keeps 20 posts per page and calculates three pages for 57 posts", () => {
  assert.equal(BLOG_POSTS_PER_PAGE, 20);
  assert.deepEqual(calculateBlogPagination(57, 1), {
    currentPage: 1,
    hasNextPage: true,
    hasPreviousPage: false,
    itemsPerPage: 20,
    totalItems: 57,
    totalPages: 3,
  });
});

test("pages the posts 20 at a time from the newest", () => {
  assert.deepEqual(getBlogPostWindow(1), { end: 20, start: 0 });
  assert.deepEqual(getBlogPostWindow(2), { end: 40, start: 20 });
  assert.deepEqual(getBlogPostWindow(3), { end: 60, start: 40 });
  // The old site's 18 posts fit on one page.
  assert.equal(calculateBlogPagination(18, 1).totalPages, 1);
});

test("the news list GROQ lists every published post, newest first, in a fixed order", () => {
  const source = readFileSync(
    new URL("../sanity/queries/blog-index.ts", import.meta.url),
    "utf8",
  );
  const listingSource = readFileSync(
    new URL("../sanity/queries/blog-post-listing.ts", import.meta.url),
    "utf8",
  );
  assert.match(listingSource, /publishedAt desc, _createdAt desc, _id asc/);
  assert.match(
    source,
    /\*\[\$\{publishedPostFilter\}\] \| order\(\$\{blogPostOrder\}\)\[\$start\.\.\.\$end\]/,
  );
  assert.doesNotMatch(source, /latestPostId/);
});

test("news cards expose every visible post field to Presentation", () => {
  const cardSource = readFileSync(
    new URL("../components/blog-card.tsx", import.meta.url),
    "utf8",
  );
  const querySource = readFileSync(
    new URL("../sanity/queries/shared/news-card.ts", import.meta.url),
    "utf8",
  );

  for (const path of ["excerpt", "image", "publishedAt", "readingTime", "title"]) {
    assert.match(cardSource, new RegExp(`dataAttribute\\?\\.\\("${path}"\\)`));
  }
  for (const field of ["readingTime", "author->", "excerpt", "image"]) {
    assert.ok(querySource.includes(field), `the card query has no ${field}`);
  }
  assert.doesNotMatch(querySource, /category/);
  assert.doesNotMatch(cardSource, /category/i);
});

test("accepts only pagination route segments greater than one", () => {
  assert.equal(parseBlogPageSegment("2"), 2);
  assert.equal(parseBlogPageSegment("12"), 12);
  for (const value of ["1", "0", "-1", "1.5", "two", "02", "", undefined]) {
    assert.equal(parseBlogPageSegment(value), undefined);
  }
});

test("rejects page one aliases and pages beyond the last", () => {
  assert.equal(isBlogPageOutOfRange(1, 0), false);
  assert.equal(isBlogPageOutOfRange(2, 0), true);
  assert.equal(isBlogPageOutOfRange(5, 5), false);
  assert.equal(isBlogPageOutOfRange(6, 5), true);
});

test("builds canonical news pagination paths", () => {
  assert.equal(getBlogPaginationUrl(1), "/news");
  assert.equal(getBlogPaginationUrl(2), "/news/2");
  assert.equal(getBlogCanonicalPath(1), "/news");
  assert.equal(getBlogCanonicalPath(3), "/news/3");
});

test("makes metadata titles unique after page one", () => {
  assert.equal(getBlogPageTitle("Insights", 1), "Insights");
  assert.equal(getBlogPageTitle("Insights", 2), "Insights - Page 2");
});

test("reports result counts", () => {
  assert.equal(getBlogResultsLabel(1, 20, 57), "Showing 1–20 of 57 posts");
  assert.equal(getBlogResultsLabel(3, 17, 57), "Showing 41–57 of 57 posts");
  assert.equal(getBlogResultsLabel(1, 0, 0), "No posts");
});
