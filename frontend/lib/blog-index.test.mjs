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
  getRegularPostQueryParams,
  getBlogResultsLabel,
  parseBlogPageSegment,
  isBlogPageOutOfRange,
} from "./blog-index.ts";

test("keeps 20 regular posts per page and calculates three pages for 57 posts", () => {
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

test("calculates regular-post query windows independently of the latest post", () => {
  assert.deepEqual(getBlogPostWindow(1), { end: 20, start: 0 });
  assert.deepEqual(getBlogPostWindow(2), { end: 40, start: 20 });
  assert.deepEqual(getBlogPostWindow(3), { end: 60, start: 40 });
});

test("passes the latest post ID as an explicit regular-list exclusion", () => {
  assert.deepEqual(getRegularPostQueryParams("latest-post", 2), {
    end: 40,
    latestPostId: "latest-post",
    start: 20,
  });
});

test("the regular-post GROQ excludes the one latest post and uses deterministic ordering", () => {
  const source = readFileSync(
    new URL("../sanity/queries/blog-index.ts", import.meta.url),
    "utf8",
  );
  const listingSource = readFileSync(
    new URL("../sanity/queries/blog-post-listing.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /_id != \$latestPostId/);
  assert.match(listingSource, /publishedAt desc, _createdAt desc, _id asc/);
  assert.match(source, /order\(\$\{blogPostOrder\}\)\[0\]/);
});

test("listing cards expose every visible post field to Presentation", () => {
  const cardSource = readFileSync(
    new URL("../components/blog-card.tsx", import.meta.url),
    "utf8",
  );
  const querySource = readFileSync(
    new URL("../sanity/queries/blog-index.ts", import.meta.url),
    "utf8",
  );

  for (const path of ["excerpt", "image", "publishedAt", "title"]) {
    assert.match(cardSource, new RegExp(`dataAttribute\\?\\.\\("${path}"\\)`));
  }
  assert.match(cardSource, /href=\{postHref\}/);
  assert.match(cardSource, /title=\{post\.title\}/);
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

test("rejects page one aliases and pages beyond the regular-list total", () => {
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

test("reports result counts for the regular collection only", () => {
  assert.equal(getBlogResultsLabel(1, 20, 57), "Showing 1–20 of 57 posts");
  assert.equal(getBlogResultsLabel(3, 17, 57), "Showing 41–57 of 57 posts");
  assert.equal(getBlogResultsLabel(1, 0, 0), "No posts");
});

test("the first news page shows a clear one-post archive empty state", () => {
  const source = readFileSync(
    new URL(
      "../app/(main)/news/_components/blog-index-route.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /const hasRegularPosts = regularPosts\.length > 0/);
  assert.match(source, /hasRegularPosts \?/);
  assert.match(source, /No more posts yet\./);
});
