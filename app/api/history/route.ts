import { NextResponse } from "next/server";
import { listHistory } from "@/lib/content";

export async function GET() {
  const entries = await listHistory();
  return NextResponse.json(entries);
}
