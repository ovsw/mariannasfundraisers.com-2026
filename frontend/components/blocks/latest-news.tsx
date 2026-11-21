import { NewsCard, NewsCardGrid, NewsHeading } from "@/components/blog-card";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import {
  resolveSectionTheme,
  sectionSceneClassName,
  type SectionSceneProps,
} from "./section-boundaries";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type LatestNewsBlock = Extract<PageBlock, { _type: "latestNews" }>;

type LatestNewsProps = LatestNewsBlock & {
  dataAttribute?: (path: string) => string | undefined;
} & SectionSceneProps;

// The Page Builder excludes sections without content from visible adjacency.
// Keep this rule aligned with the renderer's empty result below. The title is
// required in Studio; with no published posts yet (which the editor does not
// control here) the section draws nothing.
export function hasLatestNewsContent(
  block: Pick<LatestNewsBlock, "posts" | "title">,
) {
  return Boolean(stegaClean(block.title)?.trim() && block.posts?.length);
}

export default function LatestNews({
  _key,
  bottom = "outer",
  dataAttribute,
  eyebrow,
  posts,
  theme,
  title,
  top = "outer",
}: LatestNewsProps) {
  if (!hasLatestNewsContent({ posts, title })) return null;

  const headingId = `latest-news-${stegaClean(_key)}-title`;
  // Presentation passes a data attribute only in draft mode, where the cards
  // also mark their fields for click-to-edit.
  const stega = Boolean(dataAttribute);

  return (
    <section
      aria-labelledby={headingId}
      className={sectionSceneClassName(resolveSectionTheme(theme), top, bottom)}
      data-sanity={dataAttribute?.("theme")}
    >
      <div className="container">
        <NewsHeading
          as="h2"
          eyebrow={eyebrow}
          eyebrowAttribute={dataAttribute?.("eyebrow")}
          id={headingId}
          title={title}
          titleAttribute={dataAttribute?.("title")}
        />
        <NewsCardGrid>
          {posts.map((post) => (
            <NewsCard key={post._id} post={post} stega={stega} />
          ))}
        </NewsCardGrid>
      </div>
    </section>
  );
}
