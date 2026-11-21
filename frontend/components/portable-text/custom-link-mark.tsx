import { getSafeLinkHref } from "@/lib/safe-href";
import type { PortableTextMarkComponent } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Link from "next/link";

type CustomLinkMark = {
  _type: "customLink";
  href?: string | null;
  openInNewTab?: boolean | null;
};

/**
 * Shared rendering and safety rules for every inline Portable Text link. As on
 * the old site, a link in running text is ink, medium weight and underlined.
 */
export const CustomLinkMarkRenderer: PortableTextMarkComponent<CustomLinkMark> = ({
  children,
  value,
}) => {
  const href = getSafeLinkHref(value?.href);
  if (!href) return <span>{children}</span>;

  const openInNewTab = stegaClean(value?.openInNewTab) === true;

  return (
    <Link
      className="font-medium text-foreground underline hover:decoration-2"
      href={href}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      target={openInNewTab ? "_blank" : undefined}
    >
      {children}
    </Link>
  );
};
