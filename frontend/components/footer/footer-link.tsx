import Link from "next/link";
import type { ReactNode } from "react";
import type { FooterLinkModel } from "./model";

export function FooterLink({
  children,
  className,
  dataSanity,
  link,
}: {
  children?: ReactNode;
  className?: string;
  dataSanity?: string;
  link: FooterLinkModel;
}) {
  return (
    <Link
      className={className}
      data-sanity={dataSanity}
      href={link.href}
      prefetch={false}
      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
      target={link.openInNewTab ? "_blank" : undefined}
    >
      {children ?? link.label}
    </Link>
  );
}
