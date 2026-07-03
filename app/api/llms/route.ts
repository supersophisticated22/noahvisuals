import { NextResponse } from "next/server";
import { readLlmsDraft, writeLlmsDraft } from "@/lib/content";

export async function GET() {
  const text = await readLlmsDraft();
  return NextResponse.json({ text });
}

export async function PUT(request: Request) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }
  await writeLlmsDraft(body.text ?? "");
  return NextResponse.json({ ok: true });
}
