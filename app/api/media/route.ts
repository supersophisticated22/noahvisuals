import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function GET() {
  let names: string[];
  try {
    names = await fs.readdir(UPLOADS_DIR);
  } catch {
    return NextResponse.json([]);
  }
  const files = [];
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const stat = await fs.stat(path.join(UPLOADS_DIR, name));
    if (!stat.isFile()) continue;
    files.push({
      name,
      url: `/uploads/${name}`,
      size: stat.size,
      modified: stat.mtime.toISOString(),
    });
  }
  files.sort((a, b) => (a.modified < b.modified ? 1 : -1));
  return NextResponse.json(files);
}

export async function DELETE(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!name || name.includes("/") || name.includes("..")) {
    return NextResponse.json({ error: "Ongeldige bestandsnaam" }, { status: 400 });
  }
  try {
    await fs.unlink(path.join(UPLOADS_DIR, path.basename(name)));
  } catch {
    return NextResponse.json({ error: "Bestand niet gevonden" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
