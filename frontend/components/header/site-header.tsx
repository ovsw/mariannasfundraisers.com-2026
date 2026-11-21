"use client";

// The old site's header: logo, three dropdowns with a green intro panel and
// two columns of described links, two direct links, and the action button.
// The phone menu draws the same navigation data. The model owns safe
// destinations.
import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import type { HeaderModel, HeaderNavigationModel } from "./model";
import { NavigationIcon } from "./navigation-icon";

/** The old header's outlined green button (`btn-outlined-primary btn-small`). */
const actionClass =
  "h-auto rounded-[var(--radius-button)] bg-background px-4 py-3 text-base font-bold text-secondary shadow-none ring-2 ring-inset ring-secondary hover:bg-secondary-hover hover:text-secondary-foreground sm:px-5";

const topLinkClass =
  "rounded-md px-2 py-2 text-base font-bold text-foreground hover:text-link focus-visible:text-link";

export function HeaderNavigation({
  navigation,
}: {
  navigation: HeaderNavigationModel;
}) {
  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-1 items-center justify-between gap-6"
    >
      <NavigationMenu className="flex-none">
        <NavigationMenuList className="gap-3 xl:gap-8">
          {navigation.items.map((item) => (
            <NavigationMenuItem key={item.key}>
              {item.kind === "link" ? (
                <NavigationMenuLink asChild>
                  <HeaderLink className={topLinkClass} link={item.link} />
                </NavigationMenuLink>
              ) : (
                <>
                  <NavigationMenuTrigger className="h-auto bg-transparent px-2 py-2 text-base font-bold text-foreground hover:bg-transparent hover:text-link focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-link">
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-0">
                    <div className="flex w-[min(56rem,calc(100vw-16rem))] overflow-hidden rounded-lg">
                      {item.description ? (
                        <div className="section-scene-primary hidden w-60 shrink-0 bg-background px-6 py-14 xl:block">
                          <p className="text-3xl font-bold text-foreground">
                            {item.label}
                          </p>
                          <p className="mt-2 text-base font-medium text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      ) : null}
                      <ul className="grid flex-1 content-start gap-2 bg-popover p-5 lg:grid-cols-2 lg:p-6">
                        {item.links.map((child) => (
                          <li key={child.key}>
                            <NavigationMenuLink asChild>
                              <HeaderLink
                                className="group flex items-start gap-4 rounded-lg p-3 hover:bg-accent focus-visible:bg-accent"
                                link={child.link}
                              >
                                {child.icon ? (
                                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center text-secondary [&_svg]:size-8 [&_svg]:stroke-[1.5]">
                                    <NavigationIcon icon={child.icon} />
                                  </span>
                                ) : null}
                                <span>
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
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
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
}: {
  className?: string;
  model: HeaderModel;
}) {
  return (
    <Link
      className={cn("flex shrink-0 items-center", className)}
      aria-label={`${model.brand.label} home page`}
      href="/"
    >
      <HeaderBrand brand={model.brand} />
    </Link>
  );
}

export function Header({ model }: { model: HeaderModel }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="sticky top-0 z-50 bg-background shadow-md"
      data-header-state="ready"
    >
      <div className="container py-4 md:py-6 min-[84rem]:px-8">
        <div className="hidden items-center gap-10 lg:flex">
          <HomeLink className="w-36 xl:w-40" model={model} />
          <HeaderNavigation navigation={model.navigation} />
        </div>
        <div className="flex items-center justify-between gap-4 lg:hidden">
          <HomeLink className="w-40" model={model} />
          <div className="flex items-center gap-3">
            {model.navigation.actions.map((action) => (
              <Button
                asChild
                className={cn(actionClass, "hidden md:inline-flex")}
                key={action.key}
              >
                <HeaderLink link={action.link} />
              </Button>
            ))}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  className="text-secondary"
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation"
                >
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{model.brand.label}</SheetTitle>
                  <SheetDescription className="sr-only">
                    Website navigation
                  </SheetDescription>
                </SheetHeader>
                <nav
                  aria-label="Mobile navigation"
                  className="flex flex-col gap-6 p-4"
                >
                  <Accordion type="single" collapsible>
                    {model.navigation.items.map((item) =>
                      item.kind === "link" ? (
                        <HeaderLink
                          className="block border-b py-4 text-base font-bold text-foreground hover:text-link"
                          key={item.key}
                          link={item.link}
                          onClick={() => setOpen(false)}
                        />
                      ) : (
                        <AccordionItem value={item.key} key={item.key}>
                          <AccordionTrigger className="text-base font-bold">
                            {item.label}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {item.links.map((child) => (
                                <HeaderLink
                                  className="group flex items-start gap-3"
                                  key={child.key}
                                  link={child.link}
                                  onClick={() => setOpen(false)}
                                >
                                  {child.icon ? (
                                    <span className="flex size-6 shrink-0 items-center justify-center text-secondary [&_svg]:size-6 [&_svg]:stroke-[1.5]">
                                      <NavigationIcon icon={child.icon} />
                                    </span>
                                  ) : null}
                                  <span className="font-bold text-foreground group-hover:text-secondary">
                                    {child.label}
                                  </span>
                                </HeaderLink>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ),
                    )}
                  </Accordion>
                  <div className="flex flex-col gap-3">
                    {model.navigation.actions.map((action) => (
                      <Button asChild className={actionClass} key={action.key}>
                        <HeaderLink
                          link={action.link}
                          onClick={() => setOpen(false)}
                        />
                      </Button>
                    ))}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
