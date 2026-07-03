"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageInput } from "@/components/admin/image-input";
import { AiEdit } from "@/components/admin/ai-edit";
import type { PagesContent } from "@/lib/types";

export default function HomeEditor() {
  const [pages, setPages] = useState<PagesContent | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/pages")
      .then((r) => r.json())
      .then((d: PagesContent) => setPages(d))
      .catch(() => setStatus("Kon pagina niet laden"));
  }, []);

  function set<K extends keyof PagesContent>(k: K, v: PagesContent[K]) {
    setPages((prev) => (prev ? { ...prev, [k]: v } : prev));
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

  if (!pages) return <p className="text-muted-foreground">{status || "Laden…"}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button render={<Link href="/admin/pages" />} variant="ghost" size="icon" className="cursor-pointer" aria-label="Terug">
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="font-serif text-2xl font-semibold">Startpagina</h1>
        </div>
        <Button onClick={save} disabled={saving} className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90">
          {saving ? "Opslaan…" : "Opslaan"}
        </Button>
      </div>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-serif text-xl">Hero</CardTitle>
          <AiEdit file="pages" section="hero" label="AI" onApply={(u) => set("hero", u as PagesContent["hero"])} />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Headline</Label>
            <Input value={pages.hero.headline} onChange={(e) => set("hero", { ...pages.hero, headline: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>CTA-label</Label>
            <Input value={pages.hero.cta_label} onChange={(e) => set("hero", { ...pages.hero, cta_label: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Tagline</Label>
            <Input value={pages.hero.tagline} onChange={(e) => set("hero", { ...pages.hero, tagline: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>CTA-URL</Label>
            <Input value={pages.hero.cta_url} onChange={(e) => set("hero", { ...pages.hero, cta_url: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-serif text-xl">Over ons</CardTitle>
          <AiEdit file="pages" section="about" label="AI" onApply={(u) => set("about", u as PagesContent["about"])} />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Kop</Label>
            <Input value={pages.about.heading} onChange={(e) => set("about", { ...pages.about, heading: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tekst</Label>
            <Textarea rows={4} value={pages.about.body} onChange={(e) => set("about", { ...pages.about, body: e.target.value })} />
          </div>
          <ImageInput label="Foto" value={pages.about.photo} onChange={(url) => set("about", { ...pages.about, photo: url })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-serif text-xl">Proces</CardTitle>
          <AiEdit file="pages" section="process" label="AI" onApply={(u) => set("process", u as PagesContent["process"])} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {pages.process.map((step, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[80px_1fr]">
              <div className="flex flex-col gap-1.5">
                <Label>Stap</Label>
                <Input
                  value={step.step}
                  onChange={(e) => {
                    const next = [...pages.process];
                    next[i] = { ...next[i], step: e.target.value };
                    set("process", next);
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Titel</Label>
                  <Input
                    value={step.title}
                    onChange={(e) => {
                      const next = [...pages.process];
                      next[i] = { ...next[i], title: e.target.value };
                      set("process", next);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Beschrijving</Label>
                  <Textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => {
                      const next = [...pages.process];
                      next[i] = { ...next[i], description: e.target.value };
                      set("process", next);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
