"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SeoPanel } from "@/components/admin/seo-panel";
import { htmlToText } from "@/lib/seo";
import type { CustomPage } from "@/lib/types";

export default function CustomPageEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [all, setAll] = useState<CustomPage[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);
  const [regenPrompt, setRegenPrompt] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetch("/api/content/custom-pages")
      .then((r) => r.json())
      .then((d: CustomPage[]) => setAll(d))
      .catch(() => setStatus("Kon pagina niet laden"));
  }, []);

  const index = all?.findIndex((p) => p.id === id) ?? -1;
  const page = index >= 0 ? all![index] : null;

  function patch(p: Partial<CustomPage>) {
    setAll((prev) => (prev ? prev.map((x, i) => (i === index ? { ...x, ...p } : x)) : prev));
  }

  async function persist(next: CustomPage[]) {
    const res = await fetch("/api/content/custom-pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    return res.ok;
  }

  async function save() {
    if (!all) return;
    setSaving(true);
    setStatus(null);
    const ok = await persist(all);
    setStatus(ok ? "Opgeslagen. Publiceer via Instellingen om live te zetten." : "Opslaan mislukt");
    setSaving(false);
  }

  async function remove() {
    if (!all || !page) return;
    if (!confirm(`Pagina "${page.title}" verwijderen?`)) return;
    const next = all.filter((_, i) => i !== index);
    if (await persist(next)) router.replace("/admin/pages");
    else setStatus("Verwijderen mislukt");
  }

  async function improveSeo() {
    if (!page) return;
    setImproving(true);
    try {
      const res = await fetch("/api/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: `Pagina: ${page.title}. ${htmlToText(page.html).slice(0, 500)}`,
          seoTitle: page.seo.title,
          seoDescription: page.seo.description,
        }),
      });
      const data = await res.json();
      if (res.ok) patch({ seo: data.seo });
      else setStatus(data.error || "AI-SEO mislukt");
    } finally {
      setImproving(false);
    }
  }

  async function regenerate() {
    if (!page) return;
    setRegenerating(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ai/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: page.title, brief: regenPrompt || page.title }),
      });
      const data = await res.json();
      if (res.ok) {
        patch({ html: data.page.html, seo: data.page.seo, title: data.page.title || page.title });
        setRegenPrompt("");
      } else setStatus(data.error || "Genereren mislukt");
    } finally {
      setRegenerating(false);
    }
  }

  if (!all) return <p className="text-muted-foreground">{status || "Laden…"}</p>;
  if (!page)
    return (
      <div>
        <p className="text-muted-foreground">Pagina niet gevonden.</p>
        <Button render={<Link href="/admin/pages" />} variant="outline" className="mt-3 cursor-pointer">Terug</Button>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button render={<Link href="/admin/pages" />} variant="ghost" size="icon" className="cursor-pointer" aria-label="Terug">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-semibold">{page.title}</h1>
            <p className="text-xs text-muted-foreground">/{page.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="cursor-pointer text-muted-foreground hover:text-destructive" aria-label="Verwijder" onClick={remove}>
            <Trash2 className="size-4" />
          </Button>
          <Button onClick={save} disabled={saving} className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? "Opslaan…" : "Opslaan"}
          </Button>
        </div>
      </div>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Titel</Label>
              <Input value={page.title} onChange={(e) => patch({ title: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Slug (URL)</Label>
              <Input value={page.slug} onChange={(e) => patch({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={page.visible} onChange={(e) => patch({ visible: e.target.checked })} />
              Zichtbaar (publiceerbaar)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={page.showInNav} onChange={(e) => patch({ showInNav: e.target.checked })} />
              Toon in menu
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-serif text-xl">Inhoud (met AI gegenereerd)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-3">
            <Label className="text-xs">Opnieuw genereren met AI</Label>
            <div className="flex gap-2">
              <Input
                value={regenPrompt}
                onChange={(e) => setRegenPrompt(e.target.value)}
                placeholder="Bijv. 'maak het zakelijker en voeg een prijssectie toe'"
              />
              <Button type="button" onClick={regenerate} disabled={regenerating} className="cursor-pointer gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Sparkles className="size-4" />
                {regenerating ? "Bezig…" : "Genereer"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>HTML</Label>
            <Textarea rows={10} className="font-mono text-xs" value={page.html} onChange={(e) => patch({ html: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Voorbeeld</Label>
            <div className="rounded-lg border border-border bg-background p-4">
              <div dangerouslySetInnerHTML={{ __html: page.html }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-serif text-xl">SEO</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>SEO-titel</Label>
              <Input value={page.seo.title} onChange={(e) => patch({ seo: { ...page.seo, title: e.target.value } })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Meta-beschrijving</Label>
              <Input value={page.seo.description} onChange={(e) => patch({ seo: { ...page.seo, description: e.target.value } })} />
            </div>
          </div>
          <SeoPanel
            input={{
              seoTitle: page.seo.title,
              seoDescription: page.seo.description,
              bodyText: htmlToText(page.html),
              hasImage: /<img/i.test(page.html),
            }}
            onImprove={improveSeo}
            improving={improving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
