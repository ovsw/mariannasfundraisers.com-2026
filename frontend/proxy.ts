import {
  calculateBlogPagination,
  isBlogPageOutOfRange,
  parseBlogPageSegment,
} from "@/lib/blog-index";
import { client } from "@/sanity/lib/client";
import { ELIGIBLE_BLOG_POSTS_COUNT_QUERY } from "@/sanity/queries/blog-index";
import type { ELIGIBLE_BLOG_POSTS_COUNT_QUERY_RESULT } from "@/sanity.types";
import { NextRequest, NextResponse } from "next/server";

const BLOG_POST_COUNT_TTL_MS = 60_000;

let blogPostCountCache:
  | { expiresAt: number; value: number }
  | undefined;
let blogPostCountPromise: Promise<number> | undefined;

function getBlogPostCount() {
  if (blogPostCountCache && blogPostCountCache.expiresAt > Date.now()) {
    return Promise.resolve(blogPostCountCache.value);
  }

  if (!blogPostCountPromise) {
    blogPostCountPromise = client
      .fetch<ELIGIBLE_BLOG_POSTS_COUNT_QUERY_RESULT>(ELIGIBLE_BLOG_POSTS_COUNT_QUERY)
      .then((value) => {
        blogPostCountCache = {
          expiresAt: Date.now() + BLOG_POST_COUNT_TTL_MS,
          value,
        };
        return value;
      })
      .finally(() => {
        blogPostCountPromise = undefined;
      });
  }

  return blogPostCountPromise;
}

function notFoundResponse() {
  return new NextResponse("Not Found", {
    headers: { "content-type": "text/plain; charset=utf-8" },
    status: 404,
  });
}

function hasValidatedDraftMode(request: NextRequest) {
  const cookieValue = request.cookies.get("__prerender_bypass")?.value;
  const previewModeId = process.env.__NEXT_PREVIEW_MODE_ID;
  return Boolean(
    cookieValue &&
      previewModeId &&
      (cookieValue === previewModeId ||
        (process.env.NODE_ENV !== "production" &&
          previewModeId === "development-id")),
  );
}

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/news/")) {
    return NextResponse.next();
  }

  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  if (segments.length === 1) return NextResponse.next();

  if (segments.length !== 2) return notFoundResponse();

  const page = parseBlogPageSegment(segments[1]);
  if (!page) {
    return /^\d+$/.test(segments[1])
      ? notFoundResponse()
      : NextResponse.next();
  }

  if (hasValidatedDraftMode(request)) return NextResponse.next();

  let postCount: number;
  try {
    postCount = await getBlogPostCount();
  } catch {
    return NextResponse.next();
  }
  // Every page lists 20 posts, newest first (spec decision 9).
  const { totalPages } = calculateBlogPagination(postCount, page);
  return isBlogPageOutOfRange(page, totalPages)
    ? notFoundResponse()
    : NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
