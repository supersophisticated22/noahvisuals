import { NextResponse } from "next/server";
import { restoreSnapshot } from "@/lib/content";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  try {
    await restoreSnapshot(filename);
  } catch {
    return NextResponse.json(
      { error: "Snapshot niet gevonden of ongeldig" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
