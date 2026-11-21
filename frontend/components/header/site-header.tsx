"use client";

// The old site's header: white, with the logo, three dropdowns, two direct
// links and the outlined green button. The dropdown names are grey with a
// light grey chevron; the direct links are dark. Each dropdown opens a white
// card centred under its name, with a green intro panel (from `xl`) beside two
// columns of links, each an icon over a bold label and a grey description.
// Below `lg` the phone menu is a white card over the top of the page, drawn
// from the same navigation data. The model owns safe destinations.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { HeaderBrand } from "./brand";
import { HeaderLink } from "./header-link";
import type {
  HeaderChildLinkModel,
  HeaderModel,
  HeaderNavigationModel,
} from "./model";
import { NavigationIcon } from "./navigation-icon";

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** The old header's outlined green button (`btn-outlined-primary btn-small`):
 *  16px bold on a 20px line, 7px corners (14px from `md`) and a large shadow. */
const actionClass =
  "h-auto rounded-[var(--radius-button)] border border-transparent bg-background px-5 py-3 text-base leading-5 font-bold text-secondary shadow-lg ring-2 ring-inset ring-secondary hover:bg-secondary-hover hover:text-secondary-foreground md:rounded-[var(--radius-button-md)]";

/** A direct link in the bar: dark and bold. */
const topLinkClass = cn(
  "rounded-sm text-base font-bold text-foreground hover:text-link",
  focusClass,
);

/** A dropdown name in the bar: grey and bold, with a 20px light grey chevron. */
const triggerClass = cn(
  "group inline-flex items-center rounded-sm text-base font-bold text-foreground/85",
  focusClass,
);

const iconButtonClass = cn(
  "-my-2 -mr-2 inline-flex items-center justify-center rounded-md p-2 text-secondary hover:bg-muted hover:text-muted-foreground",
  focusClass,
);

/** Keeps a dropdown card inside the window: the old card is centred under its
 *  name and could run off the left edge at narrower desktop widths. */
function DropdownCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const card = ref.current;
    if (!card) return;
    const edge = 16;
    const { left, right } = card.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    const shift =
      left < edge ? edge - left : right > width - edge ? width - edge - right : 0;
    if (shift) card.style.translate = `${shift}px 0`;
  }, []);
  return (
    <div
      className="flex overflow-hidden rounded-lg shadow-lg ring-1 ring-scrim/5"
      ref={ref}
    >
      {children}
    </div>
  );
}

function DropdownLink({ child }: { child: HeaderChildLinkModel }) {
  return (
    <NavigationMenu.Link asChild>
      <HeaderLink
        className={cn(
          "group -m-3 block rounded-lg p-3 pt-2 hover:bg-accent/70",
          focusClass,
        )}
        link={child.link}
      >
        {child.icon ? (
          <span className="flex h-10 w-12 items-center justify-end text-secondary opacity-90 [&_svg]:size-8">
            <NavigationIcon icon={child.icon} />
          </span>
        ) : null}
        <span className="ml-4 block">
          <span className="block text-base font-bold text-popover-foreground group-hover:text-secondary">
            {child.label}
          </span>
          {child.description ? (
            <span className="mt-1 block text-sm font-medium text-muted-foreground">
              {child.description}
            </span>
          ) : null}
        </span>
      </HeaderLink>
    </NavigationMenu.Link>
  );
}

export function HeaderNavigation({
  navigation,
}: {
  navigation: HeaderNavigationModel;
}) {
  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-1 items-center justify-between gap-10"
    >
      <NavigationMenu.Root className="relative">
        <NavigationMenu.List className="flex items-center gap-5 xl:gap-10">
          {navigation.items.map((item) => (
            <NavigationMenu.Item className="relative" key={item.key}>
              {item.kind === "link" ? (
                <NavigationMenu.Link asChild>
                  <HeaderLink className={topLinkClass} link={item.link} />
                </NavigationMenu.Link>
              ) : (
                <>
                  <NavigationMenu.Trigger className={triggerClass}>
                    <span className="group-hover:text-link">{item.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className="ml-2 size-5 text-border-strong group-hover:text-link/40"
                    />
                  </NavigationMenu.Trigger>
                  {/* The top padding bridges the gap between the name and
                      the card, so the pointer can cross it. */}
                  <NavigationMenu.Content className="absolute top-6 left-1/2 z-10 w-screen max-w-xl -translate-x-1/2 pt-7 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 xl:max-w-4xl">
                    <DropdownCard>
                      {item.description ? (
                        <div className="section-scene-primary hidden min-w-max bg-background py-14 pr-4 pl-6 xl:block">
                          <p className="text-3xl font-bold text-foreground">
                            {item.label}
                          </p>
                          <p className="mt-2 max-w-[200px] text-base font-medium text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      ) : null}
                      <ul className="relative grid flex-1 content-start gap-8 bg-popover p-8 pb-12 lg:grid-cols-2">
                        {item.links.map((child) => (
                          <li key={child.key}>
                            <DropdownLink child={child} />
                          </li>
                        ))}
                      </ul>
                    </DropdownCard>
                  </NavigationMenu.Content>
                </>
              )}
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>
      </NavigationMenu.Root>
      {navigation.actions.length ? (
        <div className="flex gap-2">
          {navigation.actions.map((action) => (
            <Button asChild className={actionClass} key={action.key}>
              <HeaderLink link={action.link} />
            </Button>
          ))}
        </div>
      ) : null}
    </nav>
  );
}

function HomeLink({
  className,
  model,
  onClick,
}: {
  className?: string;
  model: HeaderModel;
  onClick?: () => void;
}) {
  return (
    <Link
      className={cn("flex shrink-0 items-center", className)}
      aria-label={`${model.brand.label} home page`}
      href="/"
      onClick={onClick}
    >
      <HeaderBrand brand={model.brand} />
    </Link>
  );
}

/** The old phone menu: a white card with a green edge over the top of the
 *  page, the logo and close button, the navigation rows, then the button. */
function PhoneMenu({ model }: { model: HeaderModel }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const rowClass = cn(
    "flex min-h-10 items-center rounded-lg text-base font-medium text-foreground hover:text-link",
    focusClass,
  );
  return (
    <Sheet modal={false} open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open navigation"
          className={cn(iconButtonClass, "md:mr-0")}
          type="button"
        >
          <Menu aria-hidden="true" className="size-6" />
        </button>
      </SheetTrigger>
      <SheetContent
        className="inset-x-2 top-2 max-h-[calc(100dvh-1rem)] gap-0 divide-y-2 divide-border overflow-y-auto rounded-lg border-2 border-secondary/80 bg-popover text-popover-foreground shadow-lg ring-1 ring-scrim/5"
        showCloseButton={false}
        side="top"
      >
        <SheetTitle className="sr-only">{model.brand.label}</SheetTitle>
        <SheetDescription className="sr-only">Website navigation</SheetDescription>
        <div className="px-5 pt-4 pb-6">
          <div className="flex items-start">
            <HomeLink className="mr-auto w-24 pt-1" model={model} onClick={close} />
            <SheetClose asChild>
              <button className={cn(iconButtonClass, "my-0")} type="button">
                <X aria-hidden="true" className="size-6" />
                <span className="sr-only">Close navigation</span>
              </button>
            </SheetClose>
          </div>
          <nav aria-label="Mobile navigation" className="mt-6">
            <Accordion className="grid gap-4" collapsible type="single">
              {model.navigation.items.map((item) =>
                item.kind === "link" ? (
                  <HeaderLink
                    className={rowClass}
                    key={item.key}
                    link={item.link}
                    onClick={close}
                  />
                ) : (
                  <AccordionItem
                    className="border-b-0"
                    key={item.key}
                    value={item.key}
                  >
                    <AccordionTrigger className="min-h-10 items-center py-0 text-base font-medium text-foreground hover:text-link hover:no-underline [&>svg]:size-5 [&>svg]:translate-y-0 [&>svg]:text-border-strong">
                      {item.label}
                    </AccordionTrigger>
                    <AccordionContent className="grid gap-4 pt-4 pb-0">
                      {item.links.map((child) => (
                        <HeaderLink
                          className={cn(rowClass, "group gap-4")}
                          key={child.key}
                          link={child.link}
                          onClick={close}
                        >
                          {child.icon ? (
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground [&_svg]:size-6">
                              <NavigationIcon icon={child.icon} />
                            </span>
                          ) : null}
                          {child.label}
                        </HeaderLink>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          </nav>
        </div>
        {model.navigation.actions.length ? (
          <div className="grid gap-4 px-5 py-6">
            {model.navigation.actions.map((action) => (
              <Button
                asChild
                className="h-auto w-full rounded-[var(--radius-button)] border border-transparent px-5 py-3 text-base leading-5 font-bold shadow-lg md:rounded-[var(--radius-button-md)]"
                key={action.key}
                variant="secondary"
              >
                <HeaderLink link={action.link} onClick={close} />
              </Button>
            ))}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function Header({ model }: { model: HeaderModel }) {
  return (
    <header
      className="sticky top-0 z-50 bg-background shadow-md"
      data-header-state="ready"
    >
      {/* The old header's box: 80rem wide with 1rem sides, 1.5rem from `sm`
          and 2rem from `lg`. */}
      <div className="container px-4 py-4 sm:px-6 md:py-6 lg:px-8 min-[84rem]:px-8">
        <div className="hidden items-center gap-10 lg:flex">
          <HomeLink className="h-10 w-36" model={model} />
          <HeaderNavigation navigation={model.navigation} />
        </div>
        <div className="flex items-center justify-between gap-4 lg:hidden">
          <HomeLink
            className="w-40 pt-2 pb-1.5 md:h-10 md:items-start md:py-0"
            model={model}
          />
          <div className="flex items-center gap-10">
            {model.navigation.actions.map((action) => (
              <Button
                asChild
                className={cn(actionClass, "hidden md:inline-flex")}
                key={action.key}
              >
                <HeaderLink link={action.link} />
              </Button>
            ))}
            <PhoneMenu model={model} />
          </div>
        </div>
      </div>
    </header>
  );
}
