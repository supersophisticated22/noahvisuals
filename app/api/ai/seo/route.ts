import { NextResponse } from "next/server";
import { AI_MODEL, getClient, MissingKeyError, responseText, extractJson } from "@/lib/ai";

const SYSTEM =
  "You are an SEO copywriter for Noah Visuals, a Dutch photography and videography studio. " +
  "Write in Dutch. Return only valid JSON: {\"title\": string, \"description\": string}. " +
  "The title must be 30-60 characters. The description must be 50-160 characters. " +
  "No markdown, no explanation.";

export async function POST(request: Request) {
  let body: { context?: string; seoTitle?: string; seoDescription?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  try {
    const client = getClient();
    const resp = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content:
            `Context over de pagina/dienst:\n${body.context ?? ""}\n\n` +
            `Huidige SEO-titel: ${body.seoTitle || "(leeg)"}\n` +
            `Huidige meta-beschrijving: ${body.seoDescription || "(leeg)"}\n\n` +
            "Genereer een geoptimaliseerde SEO-titel en meta-beschrijving.",
        },
      ],
    });
    const updated = extractJson<{ title: string; description: string }>(
      responseText(resp),
    );
    return NextResponse.json({ seo: updated });
  } catch (err) {
    if (err instanceof MissingKeyError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    const message = err instanceof Error ? err.message : "AI-aanvraag mislukt";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
