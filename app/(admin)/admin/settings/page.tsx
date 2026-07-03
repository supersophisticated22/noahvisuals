"use client";

import { useEffect, useState } from "react";
import { RotateCcw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HistoryEntry = { name: string; createdAt: string; files: string[] };

export default function SettingsAdmin() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  async function loadHistory() {
    const res = await fetch("/api/history");
    setHistory(await res.json());
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function publish() {
    if (!confirm("Concept publiceren naar de live site?")) return;
    setPublishing(true);
    setPublishMsg(null);
    try {
      const res = await fetch("/api/publish", { method: "POST" });
      if (!res.ok) throw new Error();
      setPublishMsg("Gepubliceerd. De live site is bijgewerkt.");
      await loadHistory();
    } catch {
      setPublishMsg("Publiceren mislukt");
    } finally {
      setPublishing(false);
    }
  }

  async function restore(name: string) {
    if (!confirm("Deze versie terugzetten naar het concept? (nog niet live)"))
      return;
    const res = await fetch(
      `/api/history/restore/${encodeURIComponent(name)}`,
      { method: "POST" },
    );
    if (res.ok) {
      setPublishMsg("Versie teruggezet naar concept. Controleer en publiceer.");
    } else {
      setPublishMsg("Terugzetten mislukt");
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPass, newPass }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setPwMsg("Wachtwoord gewijzigd.");
      setCurrentPass("");
      setNewPass("");
    } else {
      setPwMsg(data.error || "Wijzigen mislukt");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Instellingen</h1>
        <p className="mt-1 text-muted-foreground">
          Publiceer wijzigingen, herstel versies en beheer je account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Publiceren</CardTitle>
          <CardDescription>
            Zet de concept-versie live. Er wordt automatisch een back-up gemaakt.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            onClick={publish}
            disabled={publishing}
            className="w-fit cursor-pointer gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UploadCloud className="size-4" />
            {publishing ? "Publiceren…" : "Nu publiceren"}
          </Button>
          {publishMsg && (
            <p className="text-sm text-muted-foreground">{publishMsg}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Versiegeschiedenis</CardTitle>
          <CardDescription>
            Herstel een eerdere versie naar het concept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nog geen gepubliceerde versies.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/60">
              {history.map((h) => (
                <li
                  key={h.name}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(h.createdAt).toLocaleString("nl-NL")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {h.files.join(", ")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-2"
                    onClick={() => restore(h.name)}
                  >
                    <RotateCcw className="size-3.5" />
                    Terugzetten
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Wachtwoord wijzigen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="flex max-w-sm flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cur">Huidig wachtwoord</Label>
              <Input
                id="cur"
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new">Nieuw wachtwoord (min. 8 tekens)</Label>
              <Input
                id="new"
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            {pwMsg && <p className="text-sm text-muted-foreground">{pwMsg}</p>}
            <Button
              type="submit"
              className="w-fit cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Wachtwoord wijzigen
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
