import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readContent } from "@/lib/content";
import { CONTENT_FILES, type ContentFile, type PagesContent } from "@/lib/types";

const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT =
  "You are a content editor for Noah Visuals, a Dutch photography and videography studio. " +
  "Return only valid JSON matching the exact structure provided. " +
  "Do not add or remove fields. Do not include markdown or explanation.";

/** Pull the JSON object out of a model response that may wrap it in fences. */
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : trimmed;
  return JSON.parse(raw);
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is niet geconfigureerd" },
      { status: 500 },
    );
  }

  let body: { file?: string; section?: string; prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const { file, section, prompt } = body;
  if (!file || !section || !prompt) {
    return NextResponse.json(
      { error: "file, section en prompt zijn verplicht" },
      { status: 400 },
    );
  }
  if (!CONTENT_FILES.includes(file as ContentFile)) {
    return NextResponse.json({ error: "Onbekend bestand" }, { status: 404 });
  }

  // Extract the section to edit from the current draft.
  let current: unknown;
  if (file === "pages") {
    const pages = await readContent<PagesContent>("draft", "pages");
    if (!(section in pages)) {
      return NextResponse.json({ error: "Onbekende sectie" }, { status: 404 });
    }
    current = pages[section as keyof PagesContent];
  } else {
    const services = await readContent<Array<{ slug: string }>>("draft", "services");
    current = services.find((s) => s.slug === section);
    if (!current) {
      return NextResponse.json({ error: "Onbekende dienst" }, { status: 404 });
    }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "disabled" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            `Here is the current JSON for the "${section}" section:\n\n` +
            "```json\n" +
            JSON.stringify(current, null, 2) +
            "\n```\n\n" +
            `Apply this edit request: ${prompt}\n\n` +
            "Return the full updated JSON object with the exact same structure and keys.",
        },
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI-aanvraag mislukt";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json(
      { error: "Geen antwoord van AI" },
      { status: 502 },
    );
  }

  let updated: unknown;
  try {
    updated = extractJson(textBlock.text);
  } catch {
    return NextResponse.json(
      { error: "AI gaf ongeldige JSON terug", raw: textBlock.text },
      { status: 502 },
    );
  }

  return NextResponse.json({ section, updated });
}
