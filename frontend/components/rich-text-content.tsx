import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// Shadcnblocks blogpost1: Typography prose, alert, and native table.
import {
  PortableText,
  type PortableTextBlockComponent,
  type PortableTextProps,
} from "@portabletext/react";
import { buttonVariants } from "@/components/ui/button";
import { CustomLinkMarkRenderer } from "@/components/portable-text/custom-link-mark";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { headingAnchorId } from "../../shared/heading-anchor";

type GetHeadingId = (block: { _key?: string }) => string | undefined;
type RichTextBlockComponents = Extract<
  NonNullable<PortableTextProps["components"]>["block"],
  Record<string, unknown>
>;

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

function createHeadingComponent(
  Tag: HeadingTag,
  getHeadingId?: GetHeadingId,
): PortableTextBlockComponent {
  return function RichTextHeading({ children, value }) {
    return (
      <Tag
        className={getHeadingId ? "scroll-mt-28" : undefined}
        id={getHeadingId?.(value)}
      >
        {children}
      </Tag>
    );
  };
}

// Headings, paragraphs and lists take the typography plugin's own sizes and
// spacing, as the old site's running text did; a caller sets the size with a
// prose size class.
function createRichTextHeadingComponents(getHeadingId?: GetHeadingId) {
  return {
    h2: createHeadingComponent("h2", getHeadingId),
    h3: createHeadingComponent("h3", getHeadingId),
    h4: createHeadingComponent("h4", getHeadingId),
    h5: createHeadingComponent("h5", getHeadingId),
    h6: createHeadingComponent("h6", getHeadingId),
  };
}

// A heading's id is its text as an anchor, so a link to #<anchor> lands on it.
const headingTextId: GetHeadingId = (block) => {
  const text = (block as { children?: Array<{ text?: unknown }> }).children
    ?.map((child) => (typeof child.text === "string" ? stegaClean(child.text) : ""))
    .join("");
  return text ? headingAnchorId(text) || undefined : undefined;
};

const richTextBlockComponents = {
  normal: ({ children }) => <p>{children}</p>,
  ...createRichTextHeadingComponents(headingTextId),
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  inline: ({ children }) => <span>{children}</span>,
} satisfies RichTextBlockComponents;

export const richTextContentComponents: PortableTextProps["components"] = {
  block: richTextBlockComponents,
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  marks: {
    customLink: CustomLinkMarkRenderer,
    buttonLink: ({ children, value }) => {
      const href = getSafeLinkHref(value?.href);
      return href ? (
        <Link
          className={cn(
            buttonVariants({ variant: "default" }),
            "not-prose my-2 no-underline",
          )}
          href={href}
          rel={value.openInNewTab ? "noopener noreferrer" : undefined}
          target={value.openInNewTab ? "_blank" : undefined}
        >
          {children}
        </Link>
      ) : (
        <span>{children}</span>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const asset = value.resolvedAsset;
      if (!asset?.url) return null;

      return (
        <figure className="my-4">
          <Image
            alt={stegaClean(value.alt) || ""}
            blurDataURL={asset.metadata?.lqip || undefined}
            className="h-auto w-full rounded-card"
            height={asset.metadata?.dimensions?.height ?? 900}
            placeholder={asset.metadata?.lqip ? "blur" : undefined}
            quality={100}
            sizes="(min-width: 1024px) 896px, calc(100vw - 2rem)"
            src={urlFor({ asset }).width(1600).fit("max").url()}
            width={asset.metadata?.dimensions?.width ?? 1600}
          />
          {value.caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    table: ({ value }) => {
      const rows = Array.isArray(value.rows)
        ? value.rows.filter(
            (row: { cells?: unknown[] }) =>
              Array.isArray(row.cells) && row.cells.length > 0,
          )
        : [];
      const [headerRow, ...bodyRows] = rows;
      if (!headerRow) return null;

      // The old site's price table: a green block of white system-sans text,
      // a bold header row and a thin rule above each body row. The same on
      // every theme; on the Primary ground its rules carry it.
      return (
        <div className="not-prose relative my-6 overflow-x-auto">
          <table className="w-full border-collapse bg-secondary text-left font-[ui-sans-serif,system-ui,sans-serif] text-lg text-secondary-foreground">
            {value.title ? (
              <caption className="sr-only">{value.title}</caption>
            ) : null}
            <thead>
              <tr>
                {headerRow.cells.map((cell: string, index: number) => (
                  <th
                    className="px-4 py-1 font-bold"
                    key={`${headerRow._key ?? "header"}-${index}`}
                    scope="col"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map(
                (row: { _key?: string; cells: string[] }, rowIndex: number) => (
                  <tr
                    className="border-t border-border-strong"
                    key={row._key ?? `row-${rowIndex}`}
                  >
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        className="px-4 py-1"
                        key={`${row._key ?? rowIndex}-${cellIndex}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      );
    },
    callout: ({ value }) => {
      const title = stegaClean(value.title)?.trim();
      const body = stegaClean(value.body)?.trim();
      if (!(title || body)) return null;

      return (
        <Alert role="note" className="not-prose my-8">
          {title && <AlertTitle>{title}</AlertTitle>}
          {body && <AlertDescription>{body}</AlertDescription>}
        </Alert>
      );
    },
  },
};

function createPostRichTextComponents(
  getHeadingId: GetHeadingId,
): PortableTextProps["components"] {
  return {
    ...richTextContentComponents,
    block: {
      ...richTextBlockComponents,
      ...createRichTextHeadingComponents(getHeadingId),
    },
  };
}

export default function RichTextContent({
  className,
  dataSanity,
  getHeadingId,
  value,
}: Readonly<{
  className?: string;
  dataSanity?: string;
  getHeadingId?: GetHeadingId;
  value: PortableTextProps["value"];
}>) {
  return (
    <div
      className={cn(
        // The old running text: grey paragraphs and list items under ink
        // headings, with ink links (see CustomLinkMarkRenderer).
        "prose max-w-none prose-a:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-img:rounded-lg [&_li]:marker:text-border",
        className,
      )}
      data-sanity={dataSanity}
    >
      <PortableText
        components={
          getHeadingId
            ? createPostRichTextComponents(getHeadingId)
            : richTextContentComponents
        }
        value={value}
      />
    </div>
  );
}
