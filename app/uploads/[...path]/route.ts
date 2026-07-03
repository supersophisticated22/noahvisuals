import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Serves user-uploaded media. Lives outside /api and /admin so it is public
// (the marketing site references these URLs) and not gated by proxy.ts.
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  // Reassemble and resolve, then confirm it stays inside UPLOADS_DIR.
  const target = path.resolve(UPLOADS_DIR, ...segments);
  if (target !== UPLOADS_DIR && !target.startsWith(UPLOADS_DIR + path.sep)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const data = await fs.readFile(target);
    const type = MIME[path.extname(target).toLowerCase()] || "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
