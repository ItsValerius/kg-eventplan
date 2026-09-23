"use client";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState, type Ref } from "react";
import type { DayButtonProps } from "react-day-picker";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toDateValue, toLocalDate, toMonthValue } from "./dates";

type CalendarComponent = typeof import("@/components/ui/calendar").Calendar;
// The day picker stays out of the initial bundle, but is fetched once the page is idle,
// so choosing a month shows it at once instead of waiting for the download.
let loaded: CalendarComponent | null = null;
export const loadCalendar = () =>
  import("@/components/ui/calendar").then((m) => (loaded = m.Calendar));
export function preloadCalendarWhenIdle() {
  if ("requestIdleCallback" in window) {
    const id = requestIdleCallback(loadCalendar, { timeout: 2000 });
    return () => cancelIdleCallback(id);
  }
  const timer = setTimeout(loadCalendar, 500);
  return () => clearTimeout(timer);
}

function CalendarPlaceholder() {
  return (
    <div className="flex animate-settle flex-col gap-4" aria-hidden="true">
      <div className="flex h-11 items-center justify-center">
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-[226px] rounded-md max-md:hidden" />
    </div>
  );
}

function CalendarDay({ day, modifiers, className, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return (
    <button
      ref={ref}
      {...props}
      data-day={day.isoDate}
      className={`${className ?? ""} flex size-full items-center justify-center rounded-md text-[13px] tabular-nums transition-colors enabled:bg-accent enabled:font-bold enabled:text-primary-dark enabled:hover:bg-primary enabled:hover:text-primary-foreground disabled:cursor-default`}
    />
  );
}

export function MonthView({
  month,
  months,
  eventDates,
  returnRef,
  onBack,
  onMonthChange,
  onDayClick,
}: {
  month: string;
  months: string[];
  eventDates: Set<string>;
  returnRef: Ref<HTMLButtonElement>;
  onBack: () => void;
  onMonthChange: (month: string) => void;
  onDayClick: (date: Date) => void;
}) {
  const [Calendar, setCalendar] = useState<CalendarComponent | null>(() => loaded);
  useEffect(() => {
    if (!Calendar) loadCalendar().then((component) => setCalendar(() => component));
  }, [Calendar]);
  return (
    <div>
      <Button
        ref={returnRef}
        className="mb-2 min-h-11 gap-2 px-2 py-2 text-[13px] font-normal text-primary"
        variant="ghost"
        size="month"
        onClick={onBack}
      >
        <ArrowLeft size={15} />
        Alle Monate
      </Button>
      {!Calendar ? (
        <CalendarPlaceholder />
      ) : (
        <Calendar
          className="w-full bg-transparent p-0 [--cell-size:36px]"
          classNames={{
            root: "w-full",
            months: "relative w-full",
            month: "flex w-full flex-col gap-4",
            month_caption: "flex h-11 w-full items-center justify-center px-11",
            caption_label:
              "font-display text-[27px] font-bold capitalize tracking-[-.02em] text-primary-dark",
            nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between",
            button_previous:
              "inline-flex size-11 items-center justify-center rounded-md p-0 text-primary hover:bg-muted disabled:cursor-default disabled:opacity-40",
            button_next:
              "inline-flex size-11 items-center justify-center rounded-md p-0 text-primary hover:bg-muted disabled:cursor-default disabled:opacity-40",
            // On phones the month's events follow directly; the grid would push them below the fold.
            month_grid: "w-full table-fixed border-collapse max-md:hidden",
            weekdays: "flex",
            weekday:
              "flex-1 pb-1 text-center text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground",
            week: "mt-1 flex w-full",
            day: "relative flex h-9 flex-1 items-center justify-center p-0 text-center",
            today: "rounded-md ring-1 ring-input ring-inset",
            disabled: "text-muted-foreground",
          }}
          components={{ DayButton: CalendarDay }}
          locale={de}
          month={toLocalDate(`${month}-01`)}
          startMonth={toLocalDate(`${months[0]}-01`)}
          endMonth={toLocalDate(`${months.at(-1)}-01`)}
          showOutsideDays={false}
          disabled={(date) => !eventDates.has(toDateValue(date))}
          onDayClick={onDayClick}
          labels={{
            labelNav: () => "Monatsnavigation",
            labelPrevious: () => "Vorheriger Monat",
            labelNext: () => "Nächster Monat",
            labelDayButton: (date, modifiers) =>
              `${date.toLocaleDateString("de-DE", { dateStyle: "full" })}${modifiers?.disabled ? "" : ", zur Veranstaltung"}`,
          }}
          onMonthChange={(date) => onMonthChange(toMonthValue(date))}
        />
      )}
    </div>
  );
}
