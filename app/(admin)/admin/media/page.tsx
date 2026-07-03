"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Trash2, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type MediaFile = { name: string; url: string; size: number; modified: string };

export default function MediaAdmin() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/media");
    setFiles(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Upload mislukt");
      } else {
        await load();
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function copy(url: string) {
    const full = window.location.origin + url;
    await navigator.clipboard.writeText(full);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  async function remove(name: string) {
    if (!confirm(`"${name}" verwijderen?`)) return;
    await fetch(`/api/media?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Media</h1>
          <p className="mt-1 text-muted-foreground">
            Upload en beheer afbeeldingen en video&apos;s.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,.mp4"
            className="hidden"
            onChange={onUpload}
          />
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="cursor-pointer gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Upload className="size-4" />
            {uploading ? "Uploaden…" : "Upload"}
          </Button>
        </div>
      </div>

      {status && <p className="text-sm text-destructive">{status}</p>}

      {files.length === 0 ? (
        <p className="text-muted-foreground">Nog geen media geüpload.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((f) => {
            const isVideo = f.name.toLowerCase().endsWith(".mp4");
            return (
              <Card key={f.name} className="overflow-hidden p-0">
                <div className="relative aspect-square bg-secondary">
                  {isVideo ? (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      MP4
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.url}
                      alt={f.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 p-2">
                  <span className="truncate text-xs text-muted-foreground" title={f.name}>
                    {f.name}
                  </span>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 cursor-pointer"
                      aria-label="Kopieer URL"
                      onClick={() => copy(f.url)}
                    >
                      {copied === f.url ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 cursor-pointer text-muted-foreground hover:text-destructive"
                      aria-label="Verwijder"
                      onClick={() => remove(f.name)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
