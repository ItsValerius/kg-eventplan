import Image from "next/image";
import { Footer } from "./components/shell";
import SeasonCalendar from "./components/season-calendar";
import { hasSessionPlanPdf, readPublicEvents } from "@/lib/public-events";
import { Suspense } from "react";
import { season } from "@/lib/season";
import { eventsJsonLd } from "@/lib/structured-data";

function CalendarFallback() {
  return (
    <div
      className="grid grid-cols-[300px_minmax(0,1fr)] gap-12 pt-6 max-lg:grid-cols-[270px_minmax(0,1fr)] max-lg:gap-8 max-md:flex max-md:flex-col max-md:gap-8"
      role="status"
      aria-label="Kalender wird geladen"
    >
      <div className="h-75 animate-pulse border-b border-border bg-muted/60 max-md:h-26" />
      <div className="pt-3">
        <div className="h-3 w-20 animate-pulse bg-muted" />
        <div className="mt-7 h-px bg-border" />
        <div className="mt-7 h-21.5 animate-pulse bg-muted/60" />
        <div className="mt-px h-21.5 animate-pulse bg-muted/60" />
      </div>
    </div>
  );
}

export default async function Home() {
  const [events, pdfAvailable] = await Promise.all([
    readPublicEvents(),
    hasSessionPlanPdf(),
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventsJsonLd(events)).replace(/</g, "\\u003c"),
        }}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-12 max-lg:px-7.5 max-md:px-5 max-[370px]:px-3.75 min-[1500px]:max-w-340"
      >
        <section className="grid grid-cols-1 items-center gap-5 pt-7.5 pb-5 md:grid-cols-[minmax(0,1fr)_220px] md:gap-8 md:pt-13.5 md:pb-10.5 lg:grid-cols-[minmax(0,1fr)_255px] lg:gap-14 print:hidden">
          <div className="[&_h1]:text-[clamp(2.5rem,12vw,3.1875rem)] [&_h1]:leading-[1.03] md:[&_h1]:text-[65px] lg:[&_h1]:text-[clamp(48px,5.7vw,80px)]">
            <h1>
              Alle Termine der Knallköpp
              <span className="block text-primary">
                für die Session {season.label}.
              </span>
            </h1>
          </div>
          <div
            className="order-first flex items-center justify-start gap-3 text-left md:order-0 md:justify-end md:gap-4"
          >
            <Image
              className="size-14 object-contain md:size-23 lg:size-25.5"
              src="/images/club-logo.png"
              alt="Wappen der KG Knallköpp Golkrath"
              width={102}
              height={102}
              priority
            />
            <div className="font-display text-xl leading-none font-bold tracking-[.02em] text-primary md:text-[22px] lg:text-[25px]">
              <span className="block">JOLKERE</span>
              <span className="mt-1.5 block">KNALL MÖTT!</span>
            </div>
          </div>
        </section>
        <Suspense fallback={<CalendarFallback />}>
          <SeasonCalendar events={events} hasSessionPlanPdf={pdfAvailable} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
