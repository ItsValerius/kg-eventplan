import Image from "next/image";
import { season } from "@/lib/season";

// Season headline beside the club crest and call.
export function Hero() {
  return (
    <section className="grid grid-cols-1 items-center gap-5 pt-7.5 pb-5 md:grid-cols-[minmax(0,1fr)_220px] md:gap-8 md:pt-13.5 md:pb-10.5 lg:grid-cols-[minmax(0,1fr)_255px] lg:gap-14 print:hidden">
      <div className="[&_h1]:text-[clamp(2.5rem,12vw,3.1875rem)] [&_h1]:leading-[1.03] md:[&_h1]:text-[65px] lg:[&_h1]:text-[clamp(48px,5.7vw,80px)]">
        <h1>
          Alle Termine der Knallköpp
          <span className="block text-primary">für die Session {season.label}.</span>
        </h1>
      </div>
      <div className="order-first flex items-center justify-start gap-3 text-left md:order-0 md:justify-end md:gap-4">
        <Image
          className="size-14 object-contain md:size-23 lg:size-25.5"
          src="/images/club-logo.png"
          alt="Wappen der KG Knallköpp Golkrath"
          width={102}
          height={102}
          preload
        />
        <div className="font-display text-xl leading-none font-bold tracking-[.02em] text-primary md:text-[22px] lg:text-[25px]">
          <span className="block">JOLKERE</span>
          <span className="mt-1.5 block">KNALL MÖTT!</span>
        </div>
      </div>
    </section>
  );
}
