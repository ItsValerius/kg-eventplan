import { Footer, Main } from "@/components/shell";
import { Hero } from "@/components/hero";
import SeasonCalendar from "@/components/calendar/season-calendar";
import { CalendarFallback } from "@/components/calendar/calendar-fallback";
import { readPublicEvents, renderDay, sessionPlanPdf } from "@/lib/server/public-events";
import { Suspense } from "react";
import { eventsJsonLd } from "@/lib/seo/structured-data";

export default async function Home() {
  const [events, pdf, renderedOn] = await Promise.all([
    readPublicEvents(),
    sessionPlanPdf(),
    renderDay(),
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventsJsonLd(events)).replace(/</g, "\\u003c"),
        }}
      />
      <Main>
        <Hero />
        <Suspense fallback={<CalendarFallback />}>
          <SeasonCalendar
            events={events}
            hasSessionPlanPdf={pdf !== null}
            renderedOn={renderedOn}
          />
        </Suspense>
      </Main>
      <Footer />
    </>
  );
}
