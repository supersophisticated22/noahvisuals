"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/components/admin/image-input";

type Props = {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
};

/** Grid of thumbnails with upload/remove — no raw URL fields. */
export function GalleryInput({ label, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadFile(f));
      onChange([...value, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label>{label}</Label>}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        multiple
        className="hidden"
        onChange={onPick}
      />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="group relative aspect-square overflow-hidden rounded-md border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Verwijder"
              className="absolute right-1 top-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="text-xs">Upload</span>
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
