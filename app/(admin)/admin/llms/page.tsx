"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LlmsEditor() {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    fetch("/api/llms")
      .then((r) => r.json())
      .then((d: { text: string }) => {
        setText(d.text);
        setLoaded(true);
      })
      .catch(() => setStatus("Kon llms.txt niet laden"));
  }, []);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/llms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      setStatus("Opgeslagen. Publiceer via Instellingen om live te zetten.");
    } catch {
      setStatus("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setStatus(null);
    try {
      const res = await fetch("/api/llms/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) setText(data.text);
      else setStatus(data.error || "Genereren mislukt");
    } finally {
      setGenerating(false);
    }
  }

  async function optimize() {
    setOptimizing(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ai/llms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: text, instruction }),
      });
      const data = await res.json();
      if (res.ok) setText(data.text);
      else setStatus(data.error || "AI-optimalisatie mislukt");
    } finally {
      setOptimizing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">llms.txt</h1>
          <p className="mt-1 text-muted-foreground">
            Beschrijving van je site voor AI-assistenten. Live op{" "}
            <a href="/llms.txt" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
              /llms.txt <ExternalLink className="size-3" />
            </a>
          </p>
        </div>
        <Button onClick={save} disabled={saving || !loaded} className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90">
          {saving ? "Opslaan…" : "Concept opslaan"}
        </Button>
      </div>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="cursor-pointer gap-2" disabled={generating} onClick={generate}>
              <RefreshCw className="size-4" />
              {generating ? "Genereren…" : "Genereer uit content"}
            </Button>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-3">
            <Label className="text-xs">Optimaliseren met AI (optionele instructie)</Label>
            <div className="flex gap-2">
              <Input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Bijv. 'korter en met focus op zakelijke klanten'" />
              <Button type="button" onClick={optimize} disabled={optimizing} className="cursor-pointer gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Sparkles className="size-4" />
                {optimizing ? "Bezig…" : "Optimaliseer"}
              </Button>
            </div>
          </div>

          <Textarea rows={20} className="font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
        </CardContent>
      </Card>
    </div>
  );
}
