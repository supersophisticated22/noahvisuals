"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageInput } from "@/components/admin/image-input";
import { GalleryInput } from "@/components/admin/gallery-input";
import { SeoPanel } from "@/components/admin/seo-panel";
import { AiEdit } from "@/components/admin/ai-edit";
import type { Service } from "@/lib/types";

export default function ServiceEditor() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [all, setAll] = useState<Service[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);

  useEffect(() => {
    fetch("/api/content/services")
      .then((r) => r.json())
      .then((data: Service[]) => setAll(data))
      .catch(() => setStatus("Kon dienst niet laden"));
  }, []);

  const index = all?.findIndex((s) => s.slug === slug) ?? -1;
  const service = index >= 0 ? all![index] : null;

  function patch(p: Partial<Service>) {
    setAll((prev) =>
      prev ? prev.map((s, i) => (i === index ? { ...s, ...p } : s)) : prev,
    );
  }

  async function save() {
    if (!all) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/content/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(all),
      });
      if (!res.ok) throw new Error();
      setStatus("Opgeslagen. Publiceer via Instellingen om live te zetten.");
    } catch {
      setStatus("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  async function improveSeo() {
    if (!service) return;
    setImproving(true);
    try {
      const res = await fetch("/api/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: `Dienst: ${service.title}. ${service.tagline} ${service.description}`,
          seoTitle: service.seo?.title,
          seoDescription: service.seo?.description,
        }),
      });
      const data = await res.json();
      if (res.ok) patch({ seo: data.seo });
      else setStatus(data.error || "AI-SEO mislukt");
    } finally {
      setImproving(false);
    }
  }

  if (!all) return <p className="text-muted-foreground">{status || "Laden…"}</p>;
  if (!service)
    return (
      <div>
        <p className="text-muted-foreground">Dienst niet gevonden.</p>
        <Button render={<Link href="/admin/services" />} variant="outline" className="mt-3 cursor-pointer">
          Terug
        </Button>
      </div>
    );

  const seo = service.seo ?? { title: "", description: "" };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            render={<Link href="/admin/services" />}
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            aria-label="Terug"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-semibold">{service.title}</h1>
            <p className="text-xs text-muted-foreground">/{service.slug}</p>
          </div>
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {saving ? "Opslaan…" : "Opslaan"}
        </Button>
      </div>

      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Titel</Label>
              <Input value={service.title} onChange={(e) => patch({ title: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tagline</Label>
              <Input value={service.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Korte beschrijving</Label>
            <Textarea rows={2} value={service.description} onChange={(e) => patch({ description: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Lange beschrijving</Label>
            <Textarea rows={4} value={service.longDescription} onChange={(e) => patch({ longDescription: e.target.value })} />
          </div>
          <ImageInput
            label="Hoofdafbeelding"
            value={service.image}
            onChange={(url) => patch({ image: url })}
          />
          <GalleryInput
            label="Galerij"
            value={service.gallery}
            onChange={(urls) => patch({ gallery: urls })}
          />
          <AiEdit
            file="services"
            section={service.slug}
            label="AI: hele dienst herschrijven"
            onApply={(u) => patch(u as Partial<Service>)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">SEO</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>SEO-titel</Label>
              <Input value={seo.title} onChange={(e) => patch({ seo: { ...seo, title: e.target.value } })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Meta-beschrijving</Label>
              <Input value={seo.description} onChange={(e) => patch({ seo: { ...seo, description: e.target.value } })} />
            </div>
          </div>
          <SeoPanel
            input={{
              seoTitle: seo.title,
              seoDescription: seo.description,
              bodyText: `${service.description} ${service.longDescription}`,
              hasImage: !!service.image,
              hasGallery: service.gallery.length > 0,
            }}
            onImprove={improveSeo}
            improving={improving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
