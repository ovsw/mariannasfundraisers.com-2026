// The news card of the old site: the post's main image, title, excerpt, and a
// byline with the author's photo and name, the date and the reading time. The
// news list and the Latest news section draw the same card (spec decision 9).
import { formatNewsDate, readingTimeLabel } from "@/lib/news";
import { postPath } from "@/lib/routes";
import { dataset, projectId } from "@/sanity/lib/env";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";
import { createDataAttribute, stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";

type DataAttribute = (path: string) => string | undefined;

type CardImage = {
  alt?: string | null;
  asset?: {
    _id: string;
    metadata?: {
      lqip?: string | null;
      dimensions?: { height?: number | null; width?: number | null } | null;
    } | null;
  } | null;
} | null;

export type NewsAuthor = {
  _id: string;
  name: string | null;
  image?: CardImage;
} | null;

export type NewsCardData = {
  _id: string;
  title: string | null;
  slug: { current?: string | null } | null;
  publishedAt: string | null;
  readingTime: number | null;
  excerpt: string | null;
  image?: CardImage;
  author?: NewsAuthor;
};

export function documentDataAttribute({
  id,
  stega,
  type,
}: {
  id: string;
  stega: boolean;
  type: "author" | "blogPostSettings" | "post" | "settings";
}): DataAttribute | undefined {
  if (!stega) return undefined;

  return (path: string) =>
    createDataAttribute({
      baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
      dataset,
      id,
      path,
      projectId,
      type,
    }).toString();
}

function getInitials(value: string | null | undefined) {
  const name = stegaClean(value)?.trim();
  if (!name) return "";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** The author's photo, round. Its alt text is the author's name. */
export function AuthorPhoto({
  author,
  className,
  size,
  stega,
}: {
  author: NonNullable<NewsAuthor>;
  className?: string;
  size: number;
  stega: boolean;
}) {
  const dataAttribute = documentDataAttribute({
    id: author._id,
    stega,
    type: "author",
  });
  const image = author.image;
  if (!image?.asset?._id) {
    return (
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground ${className ?? ""}`}
        data-sanity={dataAttribute?.("image")}
        style={{ height: size, width: size }}
      >
        {getInitials(author.name)}
      </span>
    );
  }
  return (
    <Image
      alt={stegaClean(author.name)?.trim() || ""}
      blurDataURL={image.asset.metadata?.lqip || undefined}
      className={`shrink-0 rounded-full object-cover ${className ?? ""}`}
      data-sanity={dataAttribute?.("image")}
      height={size}
      placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
      sizes={`${size}px`}
      src={urlFor(image as SanityImageSource)
        .width(size * 2)
        .height(size * 2)
        .url()}
      width={size}
    />
  );
}

/** "Oct 31, 2025 · 1 min read", or whichever half the post has. */
export function PostDateLine({
  dataAttribute,
  publishedAt,
  readingTime,
}: {
  dataAttribute?: DataAttribute;
  publishedAt: string | null;
  readingTime: number | null;
}) {
  const date = formatNewsDate(stegaClean(publishedAt));
  const reading = readingTimeLabel(readingTime);
  if (!date && !reading) return null;
  return (
    <p className="flex flex-wrap gap-x-1 text-muted-foreground">
      {date ? (
        <time
          data-sanity={dataAttribute?.("publishedAt")}
          dateTime={stegaClean(publishedAt) ?? undefined}
        >
          {date}
        </time>
      ) : null}
      {date && reading ? <span aria-hidden="true">&middot;</span> : null}
      {reading ? (
        <span data-sanity={dataAttribute?.("readingTime")}>{reading}</span>
      ) : null}
    </p>
  );
}

export function NewsCard({
  headingLevel: Heading = "h3",
  post,
  stega,
}: {
  headingLevel?: "h2" | "h3";
  post: NewsCardData;
  stega: boolean;
}) {
  const postHref = postPath(stegaClean(post.slug?.current));
  if (!postHref) return null;
  const dataAttribute = documentDataAttribute({
    id: post._id,
    stega,
    type: "post",
  });
  const image = post.image?.asset?._id ? post.image : null;
  const author = post.author?._id ? post.author : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-card text-card-foreground shadow-lg">
      {/* A post without a main image keeps the card's shape. */}
      <div
        className="relative h-60 w-full shrink-0 bg-muted"
        data-sanity={dataAttribute?.("image")}
      >
        {image ? (
          <Image
            alt={stegaClean(image.alt) || ""}
            blurDataURL={image.asset?.metadata?.lqip || undefined}
            className="object-cover"
            fill
            placeholder={image.asset?.metadata?.lqip ? "blur" : undefined}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 512px, 100vw"
            src={urlFor(image as SanityImageSource).width(900).height(520).url()}
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-6 p-6">
        <Link className="block" href={postHref}>
          <Heading
            className="text-2xl font-semibold text-card-foreground"
            data-sanity={dataAttribute?.("title")}
          >
            {post.title}
          </Heading>
          {stegaClean(post.excerpt)?.trim() ? (
            <p
              className="mt-3 text-muted-foreground"
              data-sanity={dataAttribute?.("excerpt")}
            >
              {post.excerpt}
            </p>
          ) : null}
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {author ? <AuthorPhoto author={author} size={40} stega={stega} /> : null}
          <div>
            {author?.name ? (
              <p className="font-medium text-card-foreground">{author.name}</p>
            ) : null}
            <PostDateLine
              dataAttribute={dataAttribute}
              publishedAt={post.publishedAt}
              readingTime={post.readingTime}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

/** The heading above the cards: "Marianna's" over "News & Events". */
export function NewsHeading({
  as: Heading,
  eyebrow,
  eyebrowAttribute,
  id,
  title,
  titleAttribute,
}: {
  as: "h1" | "h2";
  eyebrow?: string | null;
  eyebrowAttribute?: string;
  id?: string;
  title: string | null;
  titleAttribute?: string;
}) {
  return (
    <Heading className="text-foreground" id={id}>
      {stegaClean(eyebrow)?.trim() ? (
        <span
          className="block font-condensed text-[2.25rem] leading-none font-bold text-link italic md:text-[2.625rem]"
          data-sanity={eyebrowAttribute}
        >
          {eyebrow}
        </span>
      ) : null}
      <span
        className="block text-[2.875rem] leading-tight font-bold md:text-[3.75rem]"
        data-sanity={titleAttribute}
      >
        {title}
      </span>
    </Heading>
  );
}

/** The cards in rows of three on wide screens. */
export function NewsCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-12 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">
      {children}
    </div>
  );
}
