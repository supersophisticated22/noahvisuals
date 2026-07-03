import { NextResponse } from "next/server";
import { AI_MODEL, getClient, MissingKeyError, responseText } from "@/lib/ai";

const SYSTEM = `You optimize an llms.txt file for Noah Visuals, a Dutch photography and videography studio.
llms.txt is a plain-text/Markdown file that helps LLMs understand the site.
Keep the standard structure: an H1 with the site name, a > blockquote summary, then H2 sections
(e.g. Diensten, Pagina's, Contact) with concise bullet links. Write in Dutch.
Return ONLY the optimized llms.txt content — no code fences, no commentary.`;

export async function POST(request: Request) {
  let body: { current?: string; instruction?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  try {
    const client = getClient();
    const resp = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      thinking: { type: "disabled" },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content:
            `Huidige llms.txt:\n\n${body.current ?? ""}\n\n` +
            `Instructie: ${body.instruction || "Optimaliseer voor duidelijkheid en volledigheid."}`,
        },
      ],
    });
    return NextResponse.json({ text: responseText(resp).trim() + "\n" });
  } catch (err) {
    if (err instanceof MissingKeyError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    const message = err instanceof Error ? err.message : "AI-aanvraag mislukt";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
