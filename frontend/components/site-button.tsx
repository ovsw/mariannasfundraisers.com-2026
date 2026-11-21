// The site's button: an editor's `button` (text, link, colour, optional icon)
// drawn as the old site drew it. Sections pass the result of the
// `buttonProjection` GROQ fragment (sanity/queries/shared/button.ts).
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { buttonVariants } from "@/components/ui/button";
import { SiteIcon } from "@/components/site-icon";
import { buttonVariantForColour } from "@/lib/button-colour";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { buttonIconSide, isSiteIconName } from "../../shared/site-design";

export type SiteButtonData = {
  text?: string | null;
  href?: string | null;
  openInNewTab?: boolean | null;
  colour?: string | null;
  icon?: string | null;
};

/** True when the button has what it needs to draw: text and a safe link. */
export function hasSiteButtonContent(button: SiteButtonData) {
  return Boolean(stegaClean(button.text)?.trim() && getSafeLinkHref(button.href));
}

export function SiteButton({
  button,
  className,
  dataSanity,
}: {
  button: SiteButtonData;
  className?: string;
  dataSanity?: string;
}) {
  const href = getSafeLinkHref(button.href);
  if (!href || !stegaClean(button.text)?.trim()) return null;

  const iconName = stegaClean(button.icon);
  const icon = isSiteIconName(iconName) ? (
    <SiteIcon name={iconName} />
  ) : null;
  const side = isSiteIconName(iconName) ? buttonIconSide(iconName) : null;
  const content = (
    <>
      {side === "before" ? icon : null}
      <span>{button.text}</span>
      {side === "after" ? icon : null}
    </>
  );
  const classes = cn(
    buttonVariants({
      variant: buttonVariantForColour(button.colour),
      size: "cta",
    }),
    // An editor's long text wraps at phone width instead of running off the
    // page ("Schedule a free tasting with me today!" in a news post).
    "max-w-full whitespace-normal text-center",
    className,
  );

  const isInternal =
    (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#");
  if (isInternal) {
    return (
      <Link className={classes} data-sanity={dataSanity} href={href}>
        {content}
      </Link>
    );
  }

  const opensNewTab =
    stegaClean(button.openInNewTab) === true && /^https?:\/\//i.test(href);
  return (
    <a
      className={classes}
      data-sanity={dataSanity}
      href={href}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      target={opensNewTab ? "_blank" : undefined}
    >
      {content}
    </a>
  );
}
