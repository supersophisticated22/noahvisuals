"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-border bg-card p-8 text-center"
      >
        <p className="font-serif text-xl text-foreground">Bedankt!</p>
        <p className="mt-2 text-muted-foreground">
          Je bericht is verzonden. We nemen zo snel mogelijk contact met je
          op.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Naam</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Bericht</Label>
        <Textarea id="message" name="message" rows={5} required />
      </div>

      <Button
        type="submit"
        size="lg"
        className="cursor-pointer w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
      >
        Versturen
      </Button>
    </form>
  );
}
