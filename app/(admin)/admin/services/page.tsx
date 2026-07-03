"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Eye, EyeOff, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Service } from "@/lib/types";

export default function ServicesList() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch("/api/content/services")
      .then((r) => r.json())
      .then((data: Service[]) =>
        setServices([...data].sort((a, b) => a.order - b.order)),
      )
      .catch(() => setStatus("Kon diensten niet laden"));
  }, []);

  function move(index: number, dir: -1 | 1) {
    setServices((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
    setDirty(true);
  }

  function toggle(index: number) {
    setServices((prev) =>
      prev
        ? prev.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s))
        : prev,
    );
    setDirty(true);
  }

  async function save() {
    if (!services) return;
    setSaving(true);
    setStatus(null);
    try {
      const normalized = services.map((s, i) => ({ ...s, order: i + 1 }));
      const res = await fetch("/api/content/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });
      if (!res.ok) throw new Error();
      setStatus("Volgorde/zichtbaarheid opgeslagen.");
      setDirty(false);
    } catch {
      setStatus("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  if (!services) {
    return <p className="text-muted-foreground">{status || "Laden…"}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Diensten</h1>
          <p className="mt-1 text-muted-foreground">
            Klik op een dienst om te bewerken. Sleep-vrije volgorde met de pijlen.
          </p>
        </div>
        {dirty && (
          <Button
            onClick={save}
            disabled={saving}
            className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? "Opslaan…" : "Volgorde opslaan"}
          </Button>
        )}
      </div>

      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <div className="flex flex-col gap-2">
        {services.map((service, index) => (
          <Card
            key={service.slug}
            className="flex-row items-center justify-between gap-3 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="cursor-pointer"
                  aria-label="Omhoog"
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="cursor-pointer"
                  aria-label="Omlaag"
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>
              {service.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={service.image}
                  alt=""
                  className="size-12 rounded-md object-cover"
                />
              )}
              <div>
                <p className="font-medium">{service.title}</p>
                <p className="text-xs text-muted-foreground">/{service.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={() => toggle(index)}
              >
                {service.visible ? (
                  <Eye className="size-4 text-emerald-500" />
                ) : (
                  <EyeOff className="size-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                render={<Link href={`/admin/services/${service.slug}`} />}
                variant="outline"
                size="sm"
                className="cursor-pointer gap-2"
              >
                <Pencil className="size-3.5" />
                Bewerk
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
