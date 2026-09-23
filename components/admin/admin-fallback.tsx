import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the admin heading, toolbar and event rows while the list loads.
export function AdminFallback() {
  return (
    <div className="animate-settle" role="status" aria-label="Terminverwaltung wird geladen">
      <Skeleton className="h-13 w-3/5 max-w-120 max-md:h-10 max-md:w-4/5" />
      <Skeleton className="mt-5 h-3 w-48 max-md:mt-4" />
      <div className="mt-9 flex items-center justify-between gap-5 border-y border-border py-5.5 max-md:mt-6.5 max-md:py-4.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-11.25 w-44 rounded-md max-md:w-36" />
      </div>
      <div className="mt-12.5 flex h-5.5 items-center gap-2.5 max-md:mt-6">
        <Skeleton className="h-3.5 w-20" />
        <span className="ml-1.5 h-px flex-1 bg-border" />
      </div>
      {["w-1/2", "w-2/5", "w-3/5"].map((width) => (
        <div
          key={width}
          className="grid grid-cols-[1fr_190px_160px] items-center gap-5 border-b border-border py-5 max-lg:grid-cols-[1fr_120px_152px] max-lg:gap-3 max-md:grid-cols-[1fr_auto] max-md:gap-y-3"
        >
          <div className="flex min-w-0 items-center gap-5.5 max-md:col-span-full max-md:gap-3">
            <div className="flex min-w-10.5 flex-col items-center gap-1.5">
              <Skeleton className="h-8.5 w-9" />
              <Skeleton className="h-2.5 w-6" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <Skeleton className={`h-4.5 ${width} max-md:w-4/5`} />
              <Skeleton className="h-3 w-4/5 max-w-80" />
            </div>
          </div>
          <Skeleton className="h-5 w-24 max-md:ml-13.5" />
          <div className="flex justify-end gap-2">
            {[0, 1, 2].map((action) => (
              <Skeleton key={action} className="size-11 rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
