import Link from "next/link";
import { AtSign, Mail, Phone } from "lucide-react";
import type { NavLink, PagesContent } from "@/lib/types";

export function SiteFooter({
  navLinks,
  contact,
}: {
  navLinks: NavLink[];
  contact: PagesContent["contact"];
}) {
  const email = contact.email || "hello@noahvisuals.nl";
  const phone = contact.phone || "+31 6 12 34 56 78";
  const instagram = contact.instagram || "https://instagram.com";
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3 md:px-10">
        <div>
          <p className="font-serif text-xl font-semibold text-foreground">
            Noah Visuals
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Premium fotografie, video en contentcreatie voor merken die
            gezien willen worden.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Navigatie</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="cursor-pointer text-sm text-muted-foreground transition-colors duration-200 hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Contact</p>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-accent" aria-hidden="true" />
              <a
                href={`mailto:${email}`}
                className="cursor-pointer transition-colors duration-200 hover:text-accent"
              >
                {email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-accent" aria-hidden="true" />
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="cursor-pointer transition-colors duration-200 hover:text-accent"
              >
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <AtSign className="size-4 text-accent" aria-hidden="true" />
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer transition-colors duration-200 hover:text-accent"
                aria-label="Noah Visuals op Instagram"
              >
                @noahvisuals
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 px-6 py-6 text-center text-xs text-muted-foreground md:px-10">
        © {new Date().getFullYear()} Noah Visuals. Alle rechten voorbehouden.
      </div>
    </footer>
  );
}
