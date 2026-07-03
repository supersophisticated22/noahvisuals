"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  file: "services" | "pages";
  section: string;
  label?: string;
  onApply: (updated: unknown) => void;
};

/** Prompt → /api/ai/edit → preview → apply/discard. Does not persist. */
export function AiEdit({ file, section, label, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<unknown>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file, section, prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "AI-bewerking mislukt");
        return;
      }
      setPreview(data.updated);
    } catch {
      setError("Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  }

  function apply() {
    if (preview !== null) onApply(preview);
    reset();
  }

  function reset() {
    setOpen(false);
    setPrompt("");
    setPreview(null);
    setError(null);
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer gap-2"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="size-4 text-accent" />
        {label || "AI-bewerking"}
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Sparkles className="size-4 text-accent" />
        AI-bewerking {label ? `— ${label}` : ""}
      </p>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Beschrijf de gewenste wijziging, bijv. 'Maak de tagline korter en energieker.'"
        rows={3}
      />
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={loading || !prompt.trim()}
          onClick={generate}
          className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {loading ? "Bezig…" : "Genereer voorstel"}
        </Button>
        <Button type="button" size="sm" variant="ghost" className="cursor-pointer" onClick={reset}>
          Annuleren
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {preview !== null && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Voorstel (voorbeeld):
          </p>
          <pre className="max-h-64 overflow-auto rounded-md border border-border bg-background p-3 text-xs">
            {JSON.stringify(preview, null, 2)}
          </pre>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={apply}
              className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Toepassen
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={() => setPreview(null)}
            >
              Verwerpen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
