import {
  Building2,
  PartyPopper,
  Package,
  Plane,
  Video,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type { CustomPage, IconName, NavLink, Service } from "@/lib/types";

// Client-safe icon map (no fs / server imports) so client components can use it.
export const serviceIcons: Record<IconName, LucideIcon> = {
  Building2,
  PartyPopper,
  Package,
  Plane,
  Video,
  Smartphone,
};

// Re-export types for existing imports (`import type { Service } from "@/lib/site-data"`).
export type { Service, IconName, NavLink } from "@/lib/types";

/** Custom pages that opt into the nav, as nav links. Pure — safe anywhere. */
export function customPageNavLinks(pages: CustomPage[]): NavLink[] {
  return pages
    .filter((p) => p.visible && p.showInNav)
    .map((p) => ({ label: p.title, href: `/${p.slug}` }));
}

/** Build the public nav from the (visible) services + custom pages. */
export function buildNavLinks(
  services: Service[],
  customPages: CustomPage[] = [],
): NavLink[] {
  return [
    { label: "Home", href: "/" },
    ...services.map((s) => ({ label: s.title, href: `/${s.slug}` })),
    ...customPageNavLinks(customPages),
    { label: "Over Ons", href: "/over-ons" },
    { label: "Contact", href: "/contact" },
  ];
}
