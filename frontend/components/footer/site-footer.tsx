// The old site's footer on dark green: logo and kitchen badge with the phone
// number, then the tagline, parent company, contact details, privacy choices,
// button and social links beside the link columns and the legal links, then
// the copyright line with the credit link. Every link list comes from Sanity;
// the privacy choices control belongs to the consent widget.
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
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
      <div className="container pt-16 pb-12 min-[84rem]:px-6">
        <div className="mb-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-10">
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
              className="size-24 md:size-32"
              alt=""
              height={256}
              src="/images/delgrosso-badge.webp"
              width={256}
            />
          </div>
          {contact.phone ? (
            <p className="text-3xl tracking-wider text-foreground md:text-4xl">
              <FooterLink link={contact.phone} />
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
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {PRIVACY_CONTROLS.map((control) => (
                <li key={control.key}>
                  <a
                    className={`${control.className} inline-flex items-center gap-2 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline`}
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
                    className="h-auto rounded-[var(--radius-button)] px-4 py-3 text-base font-bold sm:px-5"
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
                            className="flex items-center text-muted-foreground hover:text-foreground"
                            link={link}
                          >
                            {icon ? (
                              <>
                                <FooterIcon className="size-6" name={icon} />
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 xl:col-span-2">
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
              className="text-foreground underline underline-offset-2 hover:no-underline"
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
