"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CustomPage } from "@/lib/types";

type Generated = {
  title: string;
  slug: string;
  html: string;
  seo: { title: string; description: string };
};

export default function NewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<Generated | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brief }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Genereren mislukt");
      else setPage(data.page);
    } catch {
      setError("Er ging iets mis.");
    } finally {
      setGenerating(false);
    }
  }

  async function saveNew() {
    if (!page) return;
    setSaving(true);
    setError(null);
    try {
      const existing: CustomPage[] = await fetch("/api/content/custom-pages").then((r) => r.json());
      // Ensure unique slug.
      let slug = page.slug || "pagina";
      const slugs = new Set(existing.map((p) => p.slug));
      if (slugs.has(slug)) {
        let n = 2;
        while (slugs.has(`${slug}-${n}`)) n += 1;
        slug = `${slug}-${n}`;
      }
      const newPage: CustomPage = {
        id: crypto.randomUUID(),
        title: page.title || title || "Nieuwe pagina",
        slug,
        html: page.html,
        visible: true,
        showInNav: true,
        order: existing.length + 1,
        seo: page.seo || { title: "", description: "" },
      };
      const res = await fetch("/api/content/custom-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([...existing, newPage]),
      });
      if (!res.ok) throw new Error();
      router.replace(`/admin/pages/custom/${newPage.id}`);
    } catch {
      setError("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button render={<Link href="/admin/pages" />} variant="ghost" size="icon" className="cursor-pointer" aria-label="Terug">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="font-serif text-2xl font-semibold">Nieuwe pagina</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-1.5">
            <Label>Titel (optioneel)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bijv. Prijzen" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Beschrijf de pagina — Claude bouwt de pagina met opmaak</Label>
            <Textarea
              rows={4}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Bijv. 'Een prijzenpagina met drie pakketten (Basis, Pro, Premium), korte uitleg per pakket en een contact-CTA onderaan.'"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={generate}
            disabled={generating || (!brief.trim() && !title.trim())}
            className="w-fit cursor-pointer gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Sparkles className="size-4" />
            {generating ? "Genereren…" : "Genereer met AI"}
          </Button>
        </CardContent>
      </Card>

      {page && (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div>
              <p className="font-medium">{page.title}</p>
              <p className="text-xs text-muted-foreground">/{page.slug}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div dangerouslySetInnerHTML={{ __html: page.html }} />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveNew} disabled={saving} className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90">
                {saving ? "Opslaan…" : "Pagina opslaan"}
              </Button>
              <Button variant="ghost" className="cursor-pointer" onClick={() => setPage(null)}>
                Opnieuw
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
