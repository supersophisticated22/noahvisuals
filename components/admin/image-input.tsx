"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/media/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload mislukt");
  return data.url as string;
}

export { uploadFile };

type Props = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
};

/** Shows the actual image with an upload/replace button — no raw URL fields. */
export function ImageInput({ label, value, onChange, aspect = "aspect-video" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label>{label}</Label>}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
        onChange={onPick}
      />
      {value ? (
        <div className={`group relative w-full overflow-hidden rounded-lg border border-border ${aspect}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="cursor-pointer gap-2"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              Vervang
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="cursor-pointer gap-2"
              onClick={() => onChange("")}
            >
              <Trash2 className="size-4" />
              Verwijder
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={`flex ${aspect} w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:border-accent hover:text-foreground`}
        >
          {busy ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <ImagePlus className="size-6" />
          )}
          <span className="text-sm">Upload afbeelding</span>
        </button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
