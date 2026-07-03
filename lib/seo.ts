// Lightweight, dependency-free SEO heuristics. Client- and server-safe.

export type SeoCheck = {
  id: string;
  label: string;
  ok: boolean;
  hint: string;
};

export type SeoResult = {
  score: number; // 0-100
  checks: SeoCheck[];
};

export type SeoInput = {
  seoTitle?: string;
  seoDescription?: string;
  /** Main body/copy used to gauge content depth. */
  bodyText?: string;
  hasImage?: boolean;
  hasGallery?: boolean;
};

function len(s?: string): number {
  return (s ?? "").trim().length;
}

export function scoreSeo(input: SeoInput): SeoResult {
  const titleLen = len(input.seoTitle);
  const descLen = len(input.seoDescription);
  const bodyLen = len(input.bodyText);

  const checks: SeoCheck[] = [
    {
      id: "title-present",
      label: "SEO-titel ingevuld",
      ok: titleLen > 0,
      hint: "Voeg een SEO-titel toe.",
    },
    {
      id: "title-length",
      label: "SEO-titel 30–60 tekens",
      ok: titleLen >= 30 && titleLen <= 60,
      hint: `Nu ${titleLen} tekens; streef naar 30–60.`,
    },
    {
      id: "desc-present",
      label: "Meta-beschrijving ingevuld",
      ok: descLen > 0,
      hint: "Voeg een meta-beschrijving toe.",
    },
    {
      id: "desc-length",
      label: "Meta-beschrijving 50–160 tekens",
      ok: descLen >= 50 && descLen <= 160,
      hint: `Nu ${descLen} tekens; streef naar 50–160.`,
    },
    {
      id: "body-depth",
      label: "Voldoende inhoud (≥120 tekens)",
      ok: bodyLen >= 120,
      hint: `Nu ${bodyLen} tekens; voeg meer beschrijvende tekst toe.`,
    },
  ];

  if (input.hasImage !== undefined) {
    checks.push({
      id: "image",
      label: "Hoofdafbeelding aanwezig",
      ok: !!input.hasImage,
      hint: "Voeg een hoofdafbeelding toe.",
    });
  }
  if (input.hasGallery !== undefined) {
    checks.push({
      id: "gallery",
      label: "Galerij met beelden",
      ok: !!input.hasGallery,
      hint: "Voeg minstens één galerij-afbeelding toe.",
    });
  }

  const ok = checks.filter((c) => c.ok).length;
  const score = Math.round((ok / checks.length) * 100);
  return { score, checks };
}

/** Strip HTML tags for a rough text-length estimate. */
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
