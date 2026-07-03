"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { serviceIcons } from "@/lib/site-data";
import type { NavLink, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

const primaryLinks = [{ label: "Home", href: "/" }];
const secondaryLinks = [
  { label: "Over Ons", href: "/over-ons" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader({
  services,
  pages = [],
}: {
  services: Service[];
  pages?: NavLink[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onServicePage = services.some((s) => pathname === `/${s.slug}`);
  const mobileLinks = [
    ...primaryLinks,
    ...services.map((s) => ({ label: s.title, href: `/${s.slug}` })),
    ...pages,
    ...secondaryLinks,
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-foreground"
        >
          Noah Visuals
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <Link
            href="/"
            className={cn(
              "cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-medium tracking-wide transition-colors duration-200 hover:text-accent",
              pathname === "/" ? "text-accent" : "text-muted-foreground",
            )}
          >
            Home
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    "bg-transparent text-sm font-medium tracking-wide hover:bg-transparent focus:bg-transparent",
                    onServicePage ? "text-accent" : "text-muted-foreground",
                  )}
                >
                  Diensten
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[320px] gap-1 p-1 sm:w-[420px] sm:grid-cols-2">
                    {services.map((service) => {
                      const Icon = serviceIcons[service.icon];
                      return (
                        <li key={service.slug}>
                          <NavigationMenuLink
                            render={<Link href={`/${service.slug}`} />}
                            className="flex-col items-start gap-1"
                          >
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              <Icon className="size-4 text-accent" />
                              {service.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {service.tagline}
                            </span>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {[...pages, ...secondaryLinks].map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-medium tracking-wide transition-colors duration-200 hover:text-accent",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <Button
            render={<Link href="/contact" />}
            className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Neem contact op
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="cursor-pointer lg:hidden"
              />
            }
          >
            <Menu className="size-6" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-background w-72">
            <SheetHeader>
              <SheetTitle className="font-serif text-lg">
                Noah Visuals
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {mobileLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "cursor-pointer rounded-md px-2 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-secondary hover:text-accent",
                      active ? "text-accent" : "text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
