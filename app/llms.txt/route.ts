import { getLlms } from "@/lib/content";

// Public: serves the published llms.txt at /llms.txt.
export async function GET() {
  const text = await getLlms(false);
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
