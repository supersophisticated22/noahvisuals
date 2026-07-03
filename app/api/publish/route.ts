import { NextResponse } from "next/server";
import { publish } from "@/lib/content";

export async function POST() {
  const result = await publish();
  return NextResponse.json({ ok: true, snapshot: result.snapshot });
}
