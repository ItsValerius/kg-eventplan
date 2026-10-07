import { formatDate } from "@/lib/format";
import { useEffect } from "react";
import { loadCalendar, preloadCalendarWhenIdle } from "./month-view";

export function MonthTiles({
  months,
  countByMonth,
  today,
  buttonRef,
  onSelect,
}: {
  months: string[];
  countByMonth: Map<string, number>;
  today: string;
  buttonRef: (month: string, node: HTMLButtonElement | null) => void;
  onSelect: (month: string) => void;
}) {
  useEffect(preloadCalendarWhenIdle, []);
  return (
    // Without data-nosnippet Google quotes the tiles as "Oktober1. November6.".
    <div
      className="grid grid-cols-2 gap-2"
      data-nosnippet
      role="group"
      aria-label="Termine nach Monat filtern"
      onPointerEnter={loadCalendar}
      onFocus={loadCalendar}
    >
      {months.map((value) => {
        const count = countByMonth.get(value) ?? 0;
        const over = value < today.slice(0, 7);
        const name = formatDate(`${value}-01`, { month: "long" });
        return (
          <button
            className={`flex min-h-14 items-center justify-between gap-2 rounded-md px-3.5 text-left text-[13px] font-semibold capitalize transition-colors ${
              count && !over
                ? "bg-muted text-foreground hover:bg-accent hover:text-primary-dark"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
            type="button"
            key={value}
            aria-label={`${name}: ${count === 1 ? "1 Termin" : count ? `${count} Termine` : "keine Termine"}`}
            ref={(node) => buttonRef(value, node)}
            onClick={() => onSelect(value)}
          >
            {name}
            <span
              className={`font-display text-[1.375rem] leading-none tabular-nums ${count && !over ? "text-primary" : ""}`}
              aria-hidden="true"
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
