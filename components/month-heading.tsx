import { formatDate } from "@/lib/format";
import { cn } from "cn";

// Month name, year and a rule running to the edge, above each month's events.
export function MonthHeading({ month, className }: { month: string; className?: string }) {
  return (
    <h2
      className={cn(
        "flex items-center gap-2.5 font-sans text-[15px] font-semibold tracking-normal",
        className,
      )}
    >
      {formatDate(`${month}-01`, { month: "long" })}
      <span className="text-xs font-normal text-muted-foreground">{month.slice(0, 4)}</span>
      <span className="ml-1.5 h-px flex-1 bg-border" />
    </h2>
  );
}
