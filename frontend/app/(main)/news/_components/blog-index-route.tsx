import Blocks from "@/components/blocks";
import BreadcrumbJsonLd from "@/components/breadcrumb-json-ld";
import { NewsCard, NewsCardGrid, NewsHeading } from "@/components/blog-card";
import BlogPagination from "@/components/blog-pagination";
import { sectionSceneClassName } from "@/components/blocks/section-boundaries";
import {
  calculateBlogPagination,
  getBlogCanonicalPath,
  getBlogPostWindow,
  isBlogPageOutOfRange,
} from "@/lib/blog-index";
import {
  fetchBlogIndex,
  fetchNewsPostCount,
  fetchNewsPosts,
} from "@/sanity/lib/fetch";
import type { DynamicFetchOptions } from "@/sanity/lib/live";
import { createDataAttribute } from "next-sanity";
import { notFound } from "next/navigation";
import { dataset, projectId } from "@/sanity/lib/env";
import { siteUrl } from "@/lib/site-url";

// The news list: every published post, newest first, 20 per page, as cards
// under the page's heading (spec decision 9).
export async function BlogIndexRoute({
  currentPage,
  perspective,
  stega,
}: { currentPage: number } & DynamicFetchOptions) {
  const [blogIndex, postCount, posts] = await Promise.all([
    fetchBlogIndex({ perspective, stega }),
    fetchNewsPostCount({ perspective, stega }),
    fetchNewsPosts({ ...getBlogPostWindow(currentPage), perspective, stega }),
  ]);
  if (!blogIndex) notFound();

  const pagination = calculateBlogPagination(postCount, currentPage);
  if (isBlogPageOutOfRange(currentPage, pagination.totalPages)) {
    notFound();
  }

  const fieldDataAttribute = stega
    ? (path: "description" | "eyebrow" | "title") =>
        createDataAttribute({
          baseUrl:
            process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
          dataset,
          id: blogIndex._id,
          path,
          projectId,
          type: "blogIndex",
        }).toString()
    : undefined;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: getBlogCanonicalPath(currentPage) },
        ]}
        siteUrl={siteUrl}
      />
      <section className={sectionSceneClassName("shaded", "outer", "outer")}>
        <div className="container">
          <NewsHeading
            as="h1"
            eyebrow={blogIndex.eyebrow}
            eyebrowAttribute={fieldDataAttribute?.("eyebrow")}
            title={blogIndex.title}
            titleAttribute={fieldDataAttribute?.("title")}
          />
          {blogIndex.description?.trim() ? (
            <p
              className="mt-6 max-w-3xl text-lg text-muted-foreground"
              data-sanity={fieldDataAttribute?.("description")}
            >
              {blogIndex.description}
            </p>
          ) : null}
          {posts.length ? (
            <>
              <NewsCardGrid>
                {posts.map((post) => (
                  <NewsCard
                    headingLevel="h2"
                    key={post._id}
                    post={post}
                    stega={stega}
                  />
                ))}
              </NewsCardGrid>
              <BlogPagination pagination={pagination} />
            </>
          ) : (
            <p className="mt-12 text-muted-foreground">No posts yet.</p>
          )}
        </div>
      </section>

      <Blocks
        blocks={blogIndex.blocks ?? []}
        documentId={blogIndex._id}
        documentType="blogIndex"
        perspective={perspective}
        stega={stega}
      />
    </>
  );
}
