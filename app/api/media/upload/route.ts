import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4"]);

function sanitize(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.replace(/_+/g, "_");
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED.has(ext)) {
    return NextResponse.json(
      { error: `Bestandstype ${ext || "onbekend"} niet toegestaan` },
      { status: 400 },
    );
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  let filename = sanitize(file.name);
  // Avoid clobbering an existing file.
  const stem = path.basename(filename, ext);
  let candidate = filename;
  let n = 1;
  while (true) {
    try {
      await fs.access(path.join(UPLOADS_DIR, candidate));
      candidate = `${stem}-${n}${ext}`;
      n += 1;
    } catch {
      break;
    }
  }
  filename = candidate;

  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOADS_DIR, filename), bytes);

  return NextResponse.json({ ok: true, name: filename, url: `/uploads/${filename}` });
}
