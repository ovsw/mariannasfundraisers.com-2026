// The news post's fixed header, drawn by the post template above its sections
// (spec decision 9): the title, the author's photo and name, the date and the
// reading time. The main image is the card and sharing photo; the post's own
// photos are in its sections.
import {
  AuthorPhoto,
  documentDataAttribute,
  PostDateLine,
} from "@/components/blog-card";
import type { POST_QUERY_RESULT } from "@/sanity.types";

type PostHeroProps = {
  post: NonNullable<POST_QUERY_RESULT>;
  stega: boolean;
};

export default function PostHero({ post, stega }: PostHeroProps) {
  const { title } = post;
  const author = post.author?._id ? post.author : null;
  const postDataAttribute = documentDataAttribute({
    id: post._id,
    stega,
    type: "post",
  });
  const authorDataAttribute = author
    ? documentDataAttribute({ id: author._id, stega, type: "author" })
    : undefined;

  return (
    // The old post header: an extra bold 56px green title, solid-leaded, in a
    // column 715px wide (65 characters of its 20px text), 3rem above the
    // author's photo and name.
    // The headline is the old 3.5rem. On a phone it gives a little, so a long
    // word ("Pennsylvania") stays inside our wider side margins.
    <header className="container py-10 md:pb-20">
      <div className="mx-auto max-w-[44.6875rem]">
        <h1
          className="text-[clamp(2.75rem,14vw,3.5rem)] leading-none font-extrabold wrap-break-word text-emphasis"
          data-sanity={postDataAttribute?.("title")}
        >
          {title}
        </h1>
        <div className="mt-12 flex items-center gap-4">
          {author ? <AuthorPhoto author={author} size={80} stega={stega} /> : null}
          <div className="space-y-2 text-sm">
            {author?.name ? (
              <p className="text-foreground">
                by{" "}
                <strong data-sanity={authorDataAttribute?.("name")}>
                  {author.name}
                </strong>
              </p>
            ) : null}
            <PostDateLine
              dataAttribute={postDataAttribute}
              publishedAt={post.publishedAt}
              readingTime={post.readingTime}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
