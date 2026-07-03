"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Mail, Search, Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomPage } from "@/lib/types";

const builtIns = [
  { href: "/admin/pages/home", label: "Startpagina", desc: "Hero, over ons, proces", icon: Home },
  { href: "/admin/pages/contact", label: "Contact", desc: "Contactgegevens", icon: Mail },
  { href: "/admin/pages/seo", label: "SEO (globaal)", desc: "Sitenaam & standaard meta", icon: Search },
];

export default function PagesHub() {
  const [custom, setCustom] = useState<CustomPage[] | null>(null);

  useEffect(() => {
    fetch("/api/content/custom-pages")
      .then((r) => r.json())
      .then((d: CustomPage[]) => setCustom([...d].sort((a, b) => a.order - b.order)))
      .catch(() => setCustom([]));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Pagina&apos;s</h1>
        <p className="mt-1 text-muted-foreground">
          Bewerk vaste pagina&apos;s of maak nieuwe pagina&apos;s met AI.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Vaste pagina&apos;s</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {builtIns.map(({ href, label, desc, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="h-full cursor-pointer transition-colors hover:border-accent/60">
                <CardContent className="flex flex-col gap-2 pt-6">
                  <Icon className="size-5 text-accent" />
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Eigen pagina&apos;s</h2>
          <Button
            render={<Link href="/admin/pages/new" />}
            size="sm"
            className="cursor-pointer gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="size-4" />
            Nieuwe pagina
          </Button>
        </div>

        {custom === null ? (
          <p className="text-muted-foreground">Laden…</p>
        ) : custom.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen eigen pagina&apos;s. Maak er een met AI.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {custom.map((p) => (
              <Card key={p.id} className="flex-row items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">/{p.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {p.visible ? (
                      <Eye className="size-3.5 text-emerald-500" />
                    ) : (
                      <EyeOff className="size-3.5" />
                    )}
                    {p.showInNav ? "in menu" : "niet in menu"}
                  </span>
                  <Button
                    render={<Link href={`/admin/pages/custom/${p.id}`} />}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-2"
                  >
                    <Pencil className="size-3.5" />
                    Bewerk
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
