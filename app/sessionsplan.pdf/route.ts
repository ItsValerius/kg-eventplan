import { sessionPlanBlob } from "@/lib/server/public-events";
import { season } from "@/lib/season";

export async function GET() {
  const blob = await sessionPlanBlob();
  if (!blob) return new Response("Not found", { status: 404 });

  // Bust Vercel Blob's CDN cache on overwrite: the etag changes with content,
  // so appending it forces a fresh fetch instead of a stale cached copy.
  const url = `${blob.url}?v=${encodeURIComponent(blob.etag)}`;
  const upstream = await fetch(url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="knallkoepp-sessionsplan-${season.slug}.pdf"`,
      "Cache-Control": "public, max-age=60",
    },
  });
}
