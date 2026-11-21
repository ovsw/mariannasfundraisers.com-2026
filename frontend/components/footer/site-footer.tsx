// The old site's footer on dark green, in light grey: logo and kitchen badge
// with the phone number in the third column, then the tagline, parent company,
// contact details, the privacy choices as one white bordered badge, the white
// button and social links beside the link columns and the legal links, then a
// yellow rule and the copyright line with the credit link. Every link list
// comes from Sanity; the privacy choices control belongs to the consent widget.
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import {
  IUBENDA_EMBED_SRC,
  PRIVACY_CONTROLS,
  iubendaEmbedClass,
} from "@/lib/privacy/iubenda";
import { FooterLink } from "./footer-link";
import { FooterIcon, socialIconFor } from "./icons";
import type { FooterColumnModel, FooterLinkModel, FooterModel } from "./model";

const CREDIT = { label: "Studio Rovst", href: "https://studiorovst.com/" };

const linkClass =
  "text-base text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

function LinkList({ links }: { links: FooterLinkModel[] }) {
  return (
    <ul className="mt-4 space-y-4">
      {links.map((link) => (
        <li key={link.key}>
          <FooterLink
            className={[linkClass, iubendaEmbedClass(link.href)]
              .filter(Boolean)
              .join(" ")}
            link={link}
          />
        </li>
      ))}
    </ul>
  );
}

function FooterColumn({
  heading,
  id,
  links,
}: {
  heading: string;
  id: string;
  links: FooterLinkModel[];
}) {
  return (
    <section aria-labelledby={id}>
      <h2 className="text-xl font-bold tracking-wider text-foreground" id={id}>
        {heading}
      </h2>
      <LinkList links={links} />
    </section>
  );
}

function columnId(column: FooterColumnModel) {
  return `footer-column-${column.key}`;
}

export function SiteFooter({
  dataAttribute,
  model,
}: {
  dataAttribute?: (path: string) => string | undefined;
  model: FooterModel;
}) {
  const { contact } = model;
  return (
    <footer
      className="section-scene-primary footer-scene bg-background text-muted-foreground"
      data-footer-state="ready"
    >
      {/* Opens the iubenda policy links in iubenda's lightbox. */}
      <Script src={IUBENDA_EMBED_SRC} strategy="lazyOnload" />
      {/* The old footer's box: 80rem wide with 1rem sides, 1.5rem from `sm`
          and 2rem from `lg`. */}
      <div className="container px-4 pt-16 pb-12 sm:px-6 lg:px-8 min-[84rem]:px-8">
        <div className="mb-10 xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="flex gap-10">
            <Link
              className="flex w-52 items-center text-2xl font-bold text-foreground"
              aria-label={`${model.brand.label} home page`}
              href="/"
            >
              {model.brand.image ? (
                <Image
                  className="h-auto w-full"
                  alt={model.brand.label}
                  height={model.brand.image.height}
                  src={model.brand.image.src}
                  width={model.brand.image.width}
                />
              ) : (
                model.brand.label
              )}
            </Link>
            <Image
              className="size-32 min-w-0 object-contain object-top"
              alt=""
              height={256}
              src="/images/delgrosso-badge.webp"
              width={256}
            />
          </div>
          {contact.phone ? (
            <p className="flex items-center xl:col-start-3">
              <FooterLink
                className="text-4xl tracking-wider text-foreground"
                link={contact.phone}
              />
            </p>
          ) : null}
        </div>
        <div className="grid gap-12 xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            {model.intro ? (
              <p
                className="text-xl font-medium"
                data-sanity={dataAttribute?.("intro")}
              >
                {model.intro}
              </p>
            ) : null}
            {model.affiliation ? (
              <p
                className="text-base font-medium"
                data-sanity={dataAttribute?.("affiliation")}
              >
                {model.affiliation.before}
                <FooterLink
                  className="text-foreground underline underline-offset-2 hover:no-underline"
                  link={model.affiliation.link}
                />
                {model.affiliation.after}
              </p>
            ) : null}
            {contact.email || contact.addressLines.length ? (
              <address className="space-y-4 not-italic">
                {contact.email ? (
                  <p>
                    <FooterLink
                      className="text-foreground underline underline-offset-2 hover:no-underline"
                      link={contact.email}
                    />
                  </p>
                ) : null}
                {contact.addressLines.length ? (
                  <p>
                    {contact.addressLines.map((line, index) => (
                      <span className="block" key={`${index}-${line}`}>
                        {line}
                      </span>
                    ))}
                  </p>
                ) : null}
              </address>
            ) : null}
            {/* iubenda's US privacy controls: one white badge with a dark
                edge, split in two. */}
            <ul className="inline-flex rounded-[4px] border border-card-foreground bg-card text-xs/[18px] font-bold text-card-foreground">
              {PRIVACY_CONTROLS.map((control) => (
                <li
                  className="border-card-foreground not-first:border-l"
                  key={control.key}
                >
                  <a
                    className={`${control.className} flex min-h-10 items-center gap-2.5 px-3 py-2 underline-offset-2 hover:underline`}
                    href={control.href}
                  >
                    {control.icon ? (
                      // A fixed brand mark from iubenda's specification.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        height={14}
                        src="/images/privacy-choices.svg"
                        width={30}
                      />
                    ) : null}
                    {control.label}
                  </a>
                </li>
              ))}
            </ul>
            {model.action || model.socialLinks.length ? (
              <div className="flex flex-wrap items-center gap-6">
                {model.action ? (
                  <Button
                    asChild
                    className="h-auto rounded-[var(--radius-button)] border border-transparent px-4 py-3 text-base leading-5 font-bold shadow-lg sm:px-5 md:rounded-[var(--radius-button-md)]"
                    variant="primary-inverted"
                  >
                    <FooterLink
                      dataSanity={dataAttribute?.("action")}
                      link={model.action}
                    />
                  </Button>
                ) : null}
                {model.socialLinks.length ? (
                  <ul aria-label="Social links" className="flex items-center gap-6">
                    {model.socialLinks.map((link) => {
                      const icon = socialIconFor(link.href);
                      return (
                        <li key={link.key}>
                          <FooterLink
                            className="flex items-center text-foreground/90 hover:text-muted-foreground"
                            link={link}
                          >
                            {icon ? (
                              <>
                                <FooterIcon className="size-8" name={icon} />
                                <span className="sr-only">{link.label}</span>
                              </>
                            ) : (
                              link.label
                            )}
                          </FooterLink>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
          {/* On phones the old columns pair up top to bottom: the first two
              on the left, the next two on the right. */}
          <div
            className="grid grid-flow-col grid-cols-2 grid-rows-[repeat(var(--footer-rows),auto)] gap-x-8 gap-y-12 md:grid-flow-row md:grid-cols-4 md:grid-rows-none xl:col-span-2"
            style={
              {
                "--footer-rows": Math.ceil(
                  (model.columns.length + (model.legalLinks.length ? 1 : 0)) /
                    2,
                ),
              } as CSSProperties
            }
          >
            {model.columns.map((column) => (
              <FooterColumn
                heading={column.heading}
                id={columnId(column)}
                key={column.key}
                links={column.links}
              />
            ))}
            {model.legalLinks.length ? (
              <FooterColumn
                heading="Legal"
                id="footer-column-legal"
                links={model.legalLinks}
              />
            ) : null}
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-base xl:text-center">
            ©{" "}
            <span data-sanity={dataAttribute?.("copyrightStartYear")}>
              {model.copyrightYears}
            </span>{" "}
            <span data-sanity={dataAttribute?.("copyrightOwner")}>
              {model.copyrightOwner}
            </span>{" "}
            All rights reserved. | Website by{" "}
            <a
              className="underline-offset-2 hover:text-foreground hover:underline"
              href={CREDIT.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {CREDIT.label}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
