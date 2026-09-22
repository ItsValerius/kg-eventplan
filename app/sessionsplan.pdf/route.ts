import { BlobNotFoundError, head } from "@vercel/blob";
import { SESSION_PLAN_BLOB_PATHNAME } from "@/lib/season-pdf-path";

export async function GET() {
  let blob;
  try {
    blob = await head(SESSION_PLAN_BLOB_PATHNAME);
  } catch (error) {
    if (error instanceof BlobNotFoundError) return new Response("Not found", { status: 404 });
    throw error;
  }

  const upstream = await fetch(blob.url);
  if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="knallkoepp-sessionsplan-2026-2027.pdf"',
      "Cache-Control": "public, max-age=60",
    },
  });
}
