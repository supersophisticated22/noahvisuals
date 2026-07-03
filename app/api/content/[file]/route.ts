import { NextResponse } from "next/server";
import { readContent, writeContent } from "@/lib/content";
import { CONTENT_FILES, type ContentFile } from "@/lib/types";

function isValid(file: string): file is ContentFile {
  return CONTENT_FILES.includes(file as ContentFile);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!isValid(file)) {
    return NextResponse.json({ error: "Onbekend bestand" }, { status: 404 });
  }
  const data = await readContent("draft", file);
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!isValid(file)) {
    return NextResponse.json({ error: "Onbekend bestand" }, { status: 404 });
  }
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }
  await writeContent("draft", file, data);
  return NextResponse.json({ ok: true });
}
