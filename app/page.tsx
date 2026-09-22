import Image from "next/image";
import { Footer } from "./components/shell";
import SeasonCalendar from "./components/season-calendar";
import { hasSessionPlanPdf, readPublicEvents } from "@/lib/public-events";
import { Suspense } from "react";

function CalendarFallback() {
  return (
    <div
      className="grid grid-cols-[300px_minmax(0,1fr)] gap-12 pt-6 max-lg:grid-cols-[270px_minmax(0,1fr)] max-lg:gap-8 max-md:flex max-md:flex-col max-md:gap-8"
      role="status"
      aria-label="Kalender wird geladen"
    >
      <div className="h-[300px] animate-pulse border-b border-border bg-muted/60 max-md:h-[104px]" />
      <div className="pt-3">
        <div className="h-3 w-20 animate-pulse bg-muted" />
        <div className="mt-7 h-px bg-border" />
        <div className="mt-7 h-[86px] animate-pulse bg-muted/60" />
        <div className="mt-px h-[86px] animate-pulse bg-muted/60" />
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
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-[1280px] px-12 max-lg:px-[30px] max-md:px-5 max-[370px]:px-[15px] min-[1500px]:max-w-[1360px]"
      >
        <section className="grid grid-cols-1 items-center gap-5 pt-[30px] pb-5 md:grid-cols-[minmax(0,1fr)_220px] md:gap-8 md:pt-[54px] md:pb-[42px] lg:grid-cols-[minmax(0,1fr)_255px] lg:gap-14 print:hidden">
          <div className="[&_h1]:text-[clamp(2.5rem,12vw,3.1875rem)] [&_h1]:leading-[1.03] md:[&_h1]:text-[65px] lg:[&_h1]:text-[clamp(48px,5.7vw,80px)]">
            <h1>
              Alle Termine der Knallköpp
              <span className="block text-primary">
                für die Session 2026/2027.
              </span>
            </h1>
          </div>
          <div
            className="order-first flex items-center justify-start gap-3 text-left md:order-none md:justify-end md:gap-4"
            aria-label="KG Knallköpp Golkrath – Jolkere, Knall Mött!"
          >
            <Image
              className="size-14 object-contain md:size-[92px] lg:size-[104px]"
              src="/images/club-logo.png"
              alt="Wappen der KG Knallköpp Golkrath"
              width={150}
              height={150}
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
