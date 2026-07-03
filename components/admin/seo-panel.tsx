"use client";

import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scoreSeo, type SeoInput } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Props = {
  input: SeoInput;
  onImprove?: () => void;
  improving?: boolean;
};

function ring(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-destructive";
}

export function SeoPanel({ input, onImprove, improving }: Props) {
  const { score, checks } = scoreSeo(input);

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("font-serif text-3xl font-semibold", ring(score))}>
            {score}
          </span>
          <div>
            <p className="text-sm font-medium">SEO-score</p>
            <p className="text-xs text-muted-foreground">
              {checks.filter((c) => c.ok).length}/{checks.length} checks
            </p>
          </div>
        </div>
        {onImprove && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-pointer gap-2"
            disabled={improving}
            onClick={onImprove}
          >
            <Sparkles className="size-4 text-accent" />
            {improving ? "Bezig…" : "Verbeter met AI"}
          </Button>
        )}
      </div>

      <ul className="mt-3 flex flex-col gap-1.5">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-sm">
            {c.ok ? (
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-destructive" />
            )}
            <span className={c.ok ? "text-muted-foreground" : "text-foreground"}>
              {c.label}
              {!c.ok && (
                <span className="block text-xs text-muted-foreground">{c.hint}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
