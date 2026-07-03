import { NextResponse } from "next/server";
import { generateLlms } from "@/lib/content";

// Builds llms.txt from the current draft content. Does not save.
export async function POST() {
  const text = await generateLlms();
  return NextResponse.json({ text });
}
