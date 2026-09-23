import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the month tiles and event rows while the calendar loads.
export function CalendarFallback() {
  return (
    <div
      className="grid animate-settle grid-cols-[300px_minmax(0,1fr)] gap-12 pt-6 max-lg:grid-cols-[270px_minmax(0,1fr)] max-lg:gap-8 max-md:flex max-md:flex-col max-md:gap-8 max-md:pt-5"
      role="status"
      aria-label="Kalender wird geladen"
    >
      <div className="mb-2 grid grid-cols-2 gap-2 border-b md:self-start border-border pb-6">
        {[0, 1, 2, 3].map((tile) => (
          <Skeleton key={tile} className="h-14 rounded-md" />
        ))}
      </div>
      <div>
        <div className="mb-3 flex h-5.5 items-center gap-2.5">
          <Skeleton className="h-3.5 w-20" />
          <span className="ml-1.5 h-px flex-1 bg-border" />
        </div>
        {["w-3/5", "w-2/5", "w-1/2"].map((width) => (
          <div
            key={width}
            className="flex items-center gap-6 border-b border-border px-1 py-5.5 max-lg:gap-4 max-md:gap-3.25 max-md:px-0 max-md:py-5"
          >
            <div className="flex w-12.5 shrink-0 flex-col items-center gap-1.5 max-md:w-11">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-2.5 w-6" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <Skeleton className={`h-5 ${width} max-md:w-4/5`} />
              <Skeleton className="h-3 w-44 max-w-full" />
            </div>
            <Skeleton className="size-7.5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
