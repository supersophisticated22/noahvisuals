"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiEdit } from "@/components/admin/ai-edit";
import type { PagesContent } from "@/lib/types";

export default function ContactEditor() {
  const [pages, setPages] = useState<PagesContent | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/pages")
      .then((r) => r.json())
      .then((d: PagesContent) => setPages(d))
      .catch(() => setStatus("Kon pagina niet laden"));
  }, []);

  function setContact(v: PagesContent["contact"]) {
    setPages((prev) => (prev ? { ...prev, contact: v } : prev));
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
  const c = pages.contact;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button render={<Link href="/admin/pages" />} variant="ghost" size="icon" className="cursor-pointer" aria-label="Terug">
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="font-serif text-2xl font-semibold">Contact</h1>
        </div>
        <Button onClick={save} disabled={saving} className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90">
          {saving ? "Opslaan…" : "Opslaan"}
        </Button>
      </div>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-serif text-xl">Contactgegevens</CardTitle>
          <AiEdit file="pages" section="contact" label="AI" onApply={(u) => setContact(u as PagesContent["contact"])} />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5"><Label>E-mail</Label><Input value={c.email} onChange={(e) => setContact({ ...c, email: e.target.value })} /></div>
          <div className="flex flex-col gap-1.5"><Label>Telefoon</Label><Input value={c.phone} onChange={(e) => setContact({ ...c, phone: e.target.value })} /></div>
          <div className="flex flex-col gap-1.5"><Label>Locatie</Label><Input value={c.location} onChange={(e) => setContact({ ...c, location: e.target.value })} /></div>
          <div className="flex flex-col gap-1.5"><Label>Instagram</Label><Input value={c.instagram} onChange={(e) => setContact({ ...c, instagram: e.target.value })} /></div>
          <div className="flex flex-col gap-1.5"><Label>LinkedIn</Label><Input value={c.linkedin} onChange={(e) => setContact({ ...c, linkedin: e.target.value })} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
