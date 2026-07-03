"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageInput } from "@/components/admin/image-input";
import { SeoPanel } from "@/components/admin/seo-panel";
import type { PagesContent } from "@/lib/types";

export default function SeoEditor() {
  const [pages, setPages] = useState<PagesContent | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);

  useEffect(() => {
    fetch("/api/content/pages")
      .then((r) => r.json())
      .then((d: PagesContent) => setPages(d))
      .catch(() => setStatus("Kon pagina niet laden"));
  }, []);

  function setSeo(v: PagesContent["seo"]) {
    setPages((prev) => (prev ? { ...prev, seo: v } : prev));
  }

  async function save() {
    if (!pages) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/content/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pages),
      });
      if (!res.ok) throw new Error();
      setStatus("Opgeslagen. Publiceer via Instellingen om live te zetten.");
    } catch {
      setStatus("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  async function improve() {
    if (!pages) return;
    setImproving(true);
    try {
      const res = await fetch("/api/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: `Homepage van Noah Visuals. ${pages.hero.headline} ${pages.hero.tagline} ${pages.about.body}`,
          seoTitle: pages.seo.site_name,
          seoDescription: pages.seo.default_description,
        }),
      });
      const data = await res.json();
      if (res.ok)
        setSeo({ ...pages.seo, site_name: data.seo.title, default_description: data.seo.description });
      else setStatus(data.error || "AI-SEO mislukt");
    } finally {
      setImproving(false);
    }
  }

  if (!pages) return <p className="text-muted-foreground">{status || "Laden…"}</p>;
  const seo = pages.seo;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button render={<Link href="/admin/pages" />} variant="ghost" size="icon" className="cursor-pointer" aria-label="Terug">
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="font-serif text-2xl font-semibold">SEO (globaal)</h1>
        </div>
        <Button onClick={save} disabled={saving} className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90">
          {saving ? "Opslaan…" : "Opslaan"}
        </Button>
      </div>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-1.5">
            <Label>Sitenaam / standaard titel</Label>
            <Input value={seo.site_name} onChange={(e) => setSeo({ ...seo, site_name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Standaard beschrijving</Label>
            <Textarea rows={2} value={seo.default_description} onChange={(e) => setSeo({ ...seo, default_description: e.target.value })} />
          </div>
          <ImageInput label="Standaard OG-afbeelding" value={seo.default_og_image} onChange={(url) => setSeo({ ...seo, default_og_image: url })} />
          <SeoPanel
            input={{
              seoTitle: seo.site_name,
              seoDescription: seo.default_description,
              bodyText: `${pages.hero.tagline} ${pages.about.body}`,
              hasImage: !!seo.default_og_image,
            }}
            onImprove={improve}
            improving={improving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
