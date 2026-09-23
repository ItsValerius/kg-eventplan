import { openPdf } from "@/lib/pdf/storage";
import { season } from "@/lib/season";
import { sessionPlanPdf } from "@/lib/server/public-events";

export async function GET() {
  const pdf = await sessionPlanPdf();
  const body = pdf && (await openPdf(pdf));
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="knallkoepp-sessionsplan-${season.slug}.pdf"`,
      "Cache-Control": "public, max-age=60",
    },
  });
}
