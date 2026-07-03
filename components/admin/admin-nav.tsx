"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  FileText,
  ImageIcon,
  FileCode,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Diensten", icon: Images },
  { href: "/admin/pages", label: "Pagina's", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/llms", label: "llms.txt", icon: FileCode },
  { href: "/admin/settings", label: "Instellingen", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav className="flex h-full flex-col gap-1 p-4">
      <Link
        href="/admin"
        className="mb-4 px-2 font-serif text-lg font-semibold text-foreground"
      >
        Noah Visuals
        <span className="ml-2 text-xs font-normal text-muted-foreground">CMS</span>
      </Link>

      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-accent"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}

      <div className="mt-auto flex flex-col gap-1 border-t border-border/60 pt-3">
        <a
          href="/api/preview?v=1&to=/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          Bekijk site (preview)
        </a>
        <button
          onClick={logout}
          className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
        >
          <LogOut className="size-4" />
          Uitloggen
        </button>
      </div>
    </nav>
  );
}
