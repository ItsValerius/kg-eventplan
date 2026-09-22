"use client";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { DayButtonProps } from "react-day-picker";
import type { ClubEvent } from "@/lib/events";
import { formatDate, todayInBerlin } from "@/lib/format";
import { Icon } from "./icons";
import { de } from "date-fns/locale";

const coreSessionMonths = ["2026-11", "2026-12", "2027-01", "2027-02"];
// Aschermittwoch ends the session (Rosenmontag is 8 February 2027).
const sessionEnd = "2027-02-10";

// The day picker is only needed once a month is chosen.
const loadCalendar = () =>
  import("@/components/ui/calendar").then((m) => m.Calendar);
const Calendar = dynamic(loadCalendar, {
  ssr: false,
  loading: () => <div className="h-11 md:h-[286px]" />,
});

function toLocalDate(value: string) {
  const [year, month, day = 1] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toMonthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toDateValue(date: Date) {
  return `${toMonthValue(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

// Development only: preview another day with ?heute=2027-01-20.
function currentDay() {
  if (process.env.NODE_ENV !== "production") {
    const preview = new URLSearchParams(location.search).get("heute");
    if (preview && /^\d{4}-\d{2}-\d{2}$/.test(preview)) return preview;
  }
  return todayInBerlin();
}

// Re-check the date every minute so an open tab rolls over at midnight.
function subscribeToClock(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

export default function SeasonCalendar({
  events,
  hasSessionPlanPdf,
}: {
  events: ClubEvent[];
  hasSessionPlanPdf: boolean;
}) {
  const [month, setMonth] = useState<string | null>(null);
  const today = useSyncExternalStore(subscribeToClock, currentDay, () => null);
  const returnButton = useRef<HTMLButtonElement>(null);
  const monthButtons = useRef(new Map<string, HTMLButtonElement>());
  const focusTarget = useRef<string | null>(null);
  useEffect(() => {
    const target = focusTarget.current;
    if (!target) return;
    if (month) returnButton.current?.focus();
    else monthButtons.current.get(target)?.focus();
    focusTarget.current = null;
  }, [month]);
  const eventDates = new Set(events.map((event) => event.date));
  const countByMonth = new Map<string, number>();
  for (const event of events) {
    const key = event.date.slice(0, 7);
    countByMonth.set(key, (countByMonth.get(key) ?? 0) + 1);
  }
  // Always offer the core session months, plus any month outside them that has events.
  const sessionMonths = [...new Set([...coreSessionMonths, ...countByMonth.keys()])].sort();
  const isPast = (event: ClubEvent) => today !== null && event.date < today;
  const nextDate = today ? events.find((event) => event.date >= today)?.date : undefined;
  const filtered = events.filter((event) => !month || event.date.startsWith(month));
  // The overview lists what is still ahead; a month view keeps its past events, muted.
  const shown = month ? filtered : filtered.filter((event) => !isPast(event));

  function jumpToDay(date: Date) {
    const row = document.querySelector<HTMLDetailsElement>(
      `details[data-date="${toDateValue(date)}"]`,
    );
    if (!row) return;
    row.open = true;
    row.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    row.querySelector("summary")?.focus({ preventScroll: true });
  }

  function renderGroups(list: ClubEvent[]) {
    const groups = [...new Set(list.map((e) => e.date.slice(0, 7)))];
    return groups.map((group) => (
      <section
        className="mt-5.75 first:mt-0"
        key={group}
        aria-label={formatDate(group + "-01", { month: "long", year: "numeric" })}
      >
        <h2 className="mb-3 flex items-center gap-2.5 font-sans text-[15px] font-semibold tracking-normal [&>span:first-of-type]:text-xs [&>span:first-of-type]:font-normal [&>span:first-of-type]:text-muted-foreground">
          {formatDate(group + "-01", { month: "long" })}
          <span>{group.slice(0, 4)}</span>
          <span className="ml-1.5 h-px flex-1 bg-border" />
        </h2>
        {list
          .filter((e) => e.date.startsWith(group))
          .map((event) => (
            <EventRow
              key={event.id}
              event={event}
              past={isPast(event)}
              next={event.date === nextDate}
            />
          ))}
      </section>
    ));
  }

  return (
    <section
      className="pt-6 max-md:pt-5 print:pt-5"
      id="termine"
      aria-label="Termine der Session 2026/2027"
    >
      <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-12 max-lg:grid-cols-[270px_minmax(0,1fr)] max-lg:gap-8 max-md:flex max-md:flex-col max-md:gap-8 print:block">
        <aside className="md:sticky md:top-6 md:self-start print:hidden">
          {hasSessionPlanPdf && (
            <Button
              className="mb-4 w-full justify-center gap-2.5"
              variant="outline"
              size="default"
              nativeButton={false}
              render={
                <a
                  href="/sessionsplan.pdf"
                  download="knallkoepp-sessionsplan-2026-2027.pdf"
                />
              }
            >
              <Icon name="download" size={18} /> Sessionsplan als PDF
            </Button>
          )}
          <div className="mb-2 border-b border-border pb-6">
            {!month ? (
              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-label="Termine nach Monat filtern"
                onPointerEnter={loadCalendar}
                onFocus={loadCalendar}
              >
                {sessionMonths.map((value) => {
                  const count = countByMonth.get(value) ?? 0;
                  const name = formatDate(`${value}-01`, { month: "long" });
                  return (
                    <button
                      className={`flex min-h-14 items-center justify-between gap-2 rounded-md px-3.5 text-left text-[13px] font-semibold capitalize transition-colors ${
                        count
                          ? "bg-muted text-foreground hover:bg-accent hover:text-primary-dark"
                          : "border border-border text-muted-foreground hover:bg-muted"
                      }`}
                      type="button"
                      key={value}
                      aria-label={`${name}: ${count === 1 ? "1 Termin" : count ? `${count} Termine` : "keine Termine"}`}
                      ref={(node) => {
                        if (node) monthButtons.current.set(value, node);
                        else monthButtons.current.delete(value);
                      }}
                      onClick={() => {
                        focusTarget.current = value;
                        setMonth(value);
                      }}
                    >
                      {name}
                      <span
                        className={`font-display text-[1.375rem] leading-none tabular-nums ${count ? "text-primary" : ""}`}
                        aria-hidden="true"
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <Button
                  ref={returnButton}
                  className="mb-2 min-h-11 gap-2 px-2 py-2 text-[13px] font-normal text-primary"
                  variant="ghost"
                  size="month"
                  onClick={() => {
                    focusTarget.current = month;
                    setMonth(null);
                  }}
                >
                  <span className="rotate-180">
                    <Icon name="arrow" size={15} />
                  </span>
                  Alle Monate
                </Button>
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
                  startMonth={toLocalDate(`${sessionMonths[0]}-01`)}
                  endMonth={toLocalDate(`${sessionMonths.at(-1)}-01`)}
                  showOutsideDays={false}
                  disabled={(date) => !eventDates.has(toDateValue(date))}
                  onDayClick={jumpToDay}
                  labels={{
                    labelNav: () => "Monatsnavigation",
                    labelPrevious: () => "Vorheriger Monat",
                    labelNext: () => "Nächster Monat",
                    labelDayButton: (date, modifiers) =>
                      `${date.toLocaleDateString("de-DE", { dateStyle: "full" })}${modifiers?.disabled ? "" : ", zur Veranstaltung"}`,
                  }}
                  onMonthChange={(date) => setMonth(toMonthValue(date))}
                />
              </div>
            )}
          </div>
        </aside>
        <div className="min-w-0">
          {renderGroups(shown)}
          {!shown.length && (
            <div className="mt-5.5 flex flex-col items-center bg-muted px-5 py-12 text-center max-md:px-3.5 [&_h2]:font-sans [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-normal [&_p]:mt-2 [&_p]:max-w-[46ch] [&_p]:text-[13px] [&>svg]:mb-3 [&>svg]:text-primary">
              <Icon name="calendar" size={28} />
              {!events.length ? (
                <>
                  <h2>Die Session nimmt Gestalt an.</h2>
                  <p>Sobald die ersten Termine feststehen, findest du sie hier.</p>
                </>
              ) : month ? (
                <h2>
                  {today && (today > sessionEnd || month < today.slice(0, 7))
                    ? `Im ${formatDate(`${month}-01`, { month: "long" })} gab es keine Termine.`
                    : `Für ${formatDate(`${month}-01`, { month: "long" })} stehen noch keine Termine fest.`}
                </h2>
              ) : today && today > sessionEnd ? (
                <>
                  <h2>Die Session 2026/2027 ist vorbei.</h2>
                  <p>Alle Termine findest du weiterhin über die Monate.</p>
                </>
              ) : (
                <h2>Weitere Termine stehen noch nicht fest.</h2>
              )}
            </div>
          )}
          <p className="pt-6.75 pb-5 text-center text-xs">
            Änderungen vorbehalten. Wir halten euch hier auf dem Laufenden.
          </p>
        </div>
      </div>
    </section>
  );
}

function EventRow({
  event,
  past,
  next,
}: {
  event: ClubEvent;
  past: boolean;
  next: boolean;
}) {
  return (
    <details
      className="group/event border-b border-border open:bg-surface-open print:break-inside-avoid [&_summary]:flex [&_summary]:cursor-pointer [&_summary]:list-none [&_summary]:items-center [&_summary]:gap-6 [&_summary]:px-1 [&_summary]:py-5.5 [&_summary::-webkit-details-marker]:hidden [&_summary:hover]:bg-muted max-lg:[&_summary]:gap-4 max-md:[&_summary]:gap-3.25 max-md:[&_summary]:px-0 max-md:[&_summary]:py-5 print:[&_summary]:py-3.5"
      id={`termin-${event.id}`}
      data-date={event.date}
    >
      <summary>
        <span
          className={`flex w-12.5 shrink-0 flex-col items-center self-start rounded-md max-md:w-11 [&_strong]:font-display [&_strong]:text-[43px] [&_strong]:leading-none [&_strong]:tabular-nums max-md:[&_strong]:text-[39px] [&>span]:mt-1.5 [&>span]:text-[11px] [&>span]:uppercase ${
            next
              ? "[&_strong]:text-primary [&>span]:font-bold [&>span]:text-primary"
              : past
                ? "[&_strong]:text-muted-foreground [&>span]:text-muted-foreground"
                : "[&_strong]:text-primary-dark [&>span]:text-muted-foreground"
          }`}
        >
          {next && <span className="sr-only">Nächster Termin: </span>}
          <strong>{event.date.slice(8)}</strong>
          <span>{formatDate(event.date, { weekday: "short" }).replace(".", "")}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.75">
          <span
            className={`text-xl leading-tight font-semibold tracking-tight break-words hyphens-auto max-md:text-lg max-[370px]:text-base ${past ? "text-muted-foreground" : ""}`}
          >
            {event.title}
          </span>
          <span className="flex flex-wrap gap-x-5 gap-y-1.25 text-[13px] text-muted-foreground max-lg:gap-x-2.5 max-md:flex-col max-md:gap-1.25 [&>span]:flex [&>span]:items-center [&>span]:gap-1.25">
            <span>
              <Icon name="clock" size={14} />
              {event.time ? `${event.time} Uhr` : "Uhrzeit folgt"}
            </span>
            <span>
              <Icon name="pin" size={14} />
              {event.location || "Ort folgt"}
            </span>
          </span>
        </span>
        <span className="grid size-7.5 shrink-0 place-items-center rounded-full text-primary transition-[transform,background] duration-250 ease-out group-open/event:rotate-45 group-open/event:bg-accent print:hidden">
          <Icon name="plus" size={20} />
        </span>
      </summary>
      <div className="animate-unfold pr-15 pb-6 pl-19.5 max-lg:pr-6 max-lg:pl-17.5 max-md:pr-4 max-md:pb-5.5 max-md:pl-14.25 print:block [&_p]:max-w-[65ch] [&_p]:text-[13px] [&_p]:leading-[1.75] max-md:[&_p]:text-xs">
        <p>{event.description || "Weitere Informationen folgen."}</p>
      </div>
    </details>
  );
}
