import { createDataAttribute, stegaClean } from "next-sanity";
import Blocks from "@/components/blocks";
import { blocksDrawPageTitle } from "@/components/blocks/page-title";
import BlogPostingJsonLd from "@/components/blog-posting-json-ld";
import BreadcrumbJsonLd from "@/components/breadcrumb-json-ld";
import { siteUrl } from "@/lib/site-url";
import VideoJsonLd from "@/components/video-json-ld";
import PostHero from "@/components/blocks/post-hero";
import { postPath } from "@/lib/routes";
import {
  createPostBodyModel,
  getPostReadTime,
  type BlogPostSidebar,
} from "@/components/post-sidebar/model";
import {
  PostSidebar,
  PostTableOfContentsRail,
} from "@/components/post-sidebar/post-sidebar";
import { documentDataAttribute } from "@/components/blog-card";
import RichTextContent from "@/components/rich-text-content";
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
  post,
  stega,
}: {
  blogPostSidebar: BlogPostSidebar | null;
  post: NonNullable<POST_QUERY_RESULT>;
  stega: boolean;
}) {
  const body = post.body ?? [];
  const bodyModel = createPostBodyModel(body);
  const layoutName = "single-column";
  const readTime = getPostReadTime(body);
  const postSlug = post.slug?.current?.replace(/^\/+|\/+$/g, "") || "";
  const postCanonicalPath = postPath(postSlug) || "/news";
  const blogPostSettingsDataAttribute = blogPostSidebar
    ? documentDataAttribute({
        id: blogPostSidebar._id,
        stega,
        type: blogPostSidebar._type,
      })
    : undefined;
  const bodyDataAttribute = stega
    ? createDataAttribute({
        baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
        dataset,
        id: post._id,
        path: "body",
        projectId,
        type: "post",
      }).toString()
    : undefined;

  return (
    <section className="py-32">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
          { name: post.title || "Post", path: postCanonicalPath },
        ]}
        siteUrl={siteUrl}
      />
      <BlogPostingJsonLd post={post} siteUrl={siteUrl} />
      <VideoJsonLd content={body} />
      <PostHero post={post} readTime={readTime} stega={stega} />
      <div className="container" data-post-layout={layoutName}>
        <div className="mx-auto max-w-3xl">
          {bodyModel.showTableOfContents && (
            <PostTableOfContentsRail headings={bodyModel.headings} />
          )}
          <article>
            {body.length ? (
              <RichTextContent
                dataSanity={bodyDataAttribute}
                getHeadingId={bodyModel.getHeadingId}
                value={body}
              />
            ) : null}
          </article>
        </div>
      </div>
      <PostSidebar
        dataAttribute={blogPostSettingsDataAttribute}
        sidebar={blogPostSidebar}
      />
    </section>
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
      post={content}
      stega={stega}
    />
  ) : (
    <PageContent page={content} perspective={perspective} stega={stega} />
  );
}
