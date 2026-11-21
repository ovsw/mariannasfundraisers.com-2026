import { createDataAttribute, stegaClean } from "next-sanity";
import Blocks from "@/components/blocks";
import { blocksDrawPageTitle } from "@/components/blocks/page-title";
import BlogPostingJsonLd from "@/components/blog-posting-json-ld";
import BreadcrumbJsonLd from "@/components/breadcrumb-json-ld";
import { siteUrl } from "@/lib/site-url";
import VideoJsonLd from "@/components/video-json-ld";
import PostHero from "@/components/blocks/post-hero";
import { postPath } from "@/lib/routes";
import { type BlogPostSidebar } from "@/components/post-sidebar/model";
import { PostSidebar } from "@/components/post-sidebar/post-sidebar";
import { documentDataAttribute } from "@/components/blog-card";
import { dataset, projectId } from "@/sanity/lib/env";
import type { DynamicFetchOptions } from "@/sanity/lib/live";
import type { PAGE_QUERY_RESULT, POST_QUERY_RESULT } from "@/sanity.types";

function PageContent({
  page,
  perspective,
  stega,
}: {
  page: NonNullable<PAGE_QUERY_RESULT>;
  perspective: DynamicFetchOptions["perspective"];
  stega: boolean;
}) {
  const blocks = page.blocks ?? [];
  // A Page heading or a titled Page banner draws the page's h1 (as on the old
  // site). Otherwise the title is the h1, visible to screen readers only, so
  // the page keeps one main heading without a design the old site never had.
  const needsTitleHeader =
    stegaClean(page.title)?.trim() && !blocksDrawPageTitle(blocks);
  const rootDataAttribute = stega
    ? (path: "title") =>
        createDataAttribute({
          baseUrl:
            process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
          dataset,
          id: page._id,
          path,
          projectId,
          type: "page",
        }).toString()
    : undefined;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: page.title || "Page", path: `/${page.slug}` },
        ]}
        siteUrl={siteUrl}
      />
      <VideoJsonLd content={blocks} />
      {needsTitleHeader ? (
        <h1 className="sr-only" data-sanity={rootDataAttribute?.("title")}>
          {page.title}
        </h1>
      ) : null}
      <Blocks
        blocks={blocks}
        documentId={page._id}
        perspective={perspective}
        stega={stega}
      />
    </>
  );
}

function PostContent({
  blogPostSidebar,
  perspective,
  post,
  stega,
}: {
  blogPostSidebar: BlogPostSidebar | null;
  perspective: DynamicFetchOptions["perspective"];
  post: NonNullable<POST_QUERY_RESULT>;
  stega: boolean;
}) {
  const blocks = post.blocks ?? [];
  const postSlug = post.slug?.current?.replace(/^\/+|\/+$/g, "") || "";
  const postCanonicalPath = postPath(postSlug) || "/news";
  const blogPostSettingsDataAttribute = blogPostSidebar
    ? documentDataAttribute({
        id: blogPostSidebar._id,
        stega,
        type: blogPostSidebar._type,
      })
    : undefined;

  // The header is fixed in code; the post's body is its sections (spec
  // decision 9), drawn by the Page Builder as on a page.
  return (
    <article>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
          { name: post.title || "Post", path: postCanonicalPath },
        ]}
        siteUrl={siteUrl}
      />
      <BlogPostingJsonLd post={post} siteUrl={siteUrl} />
      <VideoJsonLd content={blocks} />
      <PostHero post={post} stega={stega} />
      <Blocks
        blocks={blocks}
        documentId={post._id}
        documentType="post"
        perspective={perspective}
        stega={stega}
      />
      <PostSidebar
        dataAttribute={blogPostSettingsDataAttribute}
        sidebar={blogPostSidebar}
      />
    </article>
  );
}

export function RootContentView({
  blogPostSidebar = null,
  content,
  perspective,
  stega,
}: {
  blogPostSidebar?: BlogPostSidebar | null;
  content: NonNullable<PAGE_QUERY_RESULT | POST_QUERY_RESULT>;
  perspective: DynamicFetchOptions["perspective"];
  stega: boolean;
}) {
  return content._type === "post" ? (
    <PostContent
      blogPostSidebar={blogPostSidebar}
      perspective={perspective}
      post={content}
      stega={stega}
    />
  ) : (
    <PageContent page={content} perspective={perspective} stega={stega} />
  );
}
