import { NextResponse } from "next/server";
import { AI_MODEL, getClient, MissingKeyError, responseText, extractJson } from "@/lib/ai";

const SYSTEM = `You are a web page designer for Noah Visuals, a premium Dutch photography and videography studio.
You generate a single content page WITH layout as an HTML fragment, written in Dutch.

Design system (Tailwind CSS, dark theme) — use ONLY these conventions:
- Do NOT output <html>, <head>, <body>, <style>, or <script>. Only the inner markup.
- Wrap sections in <section class="mx-auto max-w-7xl px-6 py-20 md:px-10"> (or max-w-3xl for text-only).
- Headings: class="font-serif text-3xl font-semibold text-foreground md:text-5xl".
- Body text: class="text-muted-foreground leading-relaxed".
- Accent color via text-accent / bg-accent text-accent-foreground for buttons/links.
- Cards: class="rounded-2xl border border-border bg-card p-6".
- Images: use <img> with class="rounded-2xl object-cover w-full" and real https://images.unsplash.com URLs relevant to the topic.
- Keep it clean, editorial, and consistent with a premium studio.

Return ONLY valid JSON, no markdown fences:
{"title": string, "slug": string, "html": string, "seo": {"title": string, "description": string}}
- slug: lowercase, hyphens, from the title, no leading slash.
- seo.title 30-60 chars, seo.description 50-160 chars.`;

export async function POST(request: Request) {
  let body: { title?: string; brief?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }
  if (!body.brief && !body.title) {
    return NextResponse.json(
      { error: "Geef een titel of beschrijving op" },
      { status: 400 },
    );
  }

  try {
    const client = getClient();
    const resp = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 8192,
      thinking: { type: "disabled" },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content:
            `Titel (optioneel): ${body.title || "(bedenk zelf)"}\n\n` +
            `Beschrijving / opdracht voor de pagina:\n${body.brief || body.title}`,
        },
      ],
    });
    const page = extractJson<{
      title: string;
      slug: string;
      html: string;
      seo: { title: string; description: string };
    }>(responseText(resp));
    return NextResponse.json({ page });
  } catch (err) {
    if (err instanceof MissingKeyError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    const message = err instanceof Error ? err.message : "AI-aanvraag mislukt";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
