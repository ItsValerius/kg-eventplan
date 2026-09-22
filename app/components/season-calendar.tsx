"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useRef, useState } from "react";
import { ClubEvent, formatDate } from "@/lib/events";
import { downloadCalendar } from "@/lib/calendar";
import { Icon } from "./icons";
import { de } from "date-fns/locale";

const coreSessionMonths = ["2026-11", "2026-12", "2027-01", "2027-02"];

function toLocalDate(value: string) {
  const [year, month, day = 1] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toMonthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
export default function SeasonCalendar({
  events,
  hasSessionPlanPdf,
}: {
  events: ClubEvent[];
  hasSessionPlanPdf: boolean;
}) {
  const [month, setMonth] = useState<string | null>(null);
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
  const eventDates = events.map((event) => toLocalDate(event.date));
  // Always offer the core session months, plus any month outside them that has events.
  const sessionMonths = [
    ...new Set([...coreSessionMonths, ...events.map((e) => e.date.slice(0, 7))]),
  ].sort();
  const filtered = events.filter(
    (event) => !month || event.date.startsWith(month),
  );
  const groups = [...new Set(filtered.map((e) => e.date.slice(0, 7)))];
  return (
    <section
      className="pt-6 max-md:pt-5 print:pt-5"
      id="termine"
      aria-label="Termine der Session 2026/2027"
    >
      <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-12 max-lg:grid-cols-[270px_minmax(0,1fr)] max-lg:gap-8 max-md:flex max-md:flex-col max-md:gap-8 print:block">
        <aside className="print:hidden">
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
          <div
            className="border-b border-border pb-6 mb-2"
            aria-label="Termine nach Monat filtern"
          >
            {!month ? (
              <div className="grid grid-cols-2 gap-2 ">
                {sessionMonths.map((value) => (
                  <button
                    className="grid min-h-12 place-items-center rounded-md bg-muted px-2 text-center text-[13px] font-semibold capitalize text-foreground transition-colors hover:bg-accent hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring md:aspect-square"
                    type="button"
                    key={value}
                    ref={(node) => {
                      if (node) monthButtons.current.set(value, node);
                      else monthButtons.current.delete(value);
                    }}
                    onClick={() => {
                      focusTarget.current = value;
                      setMonth(value);
                    }}
                  >
                    {formatDate(`${value}-01`, { month: "long" })}
                  </button>
                ))}
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
                    month_caption:
                      "flex h-11 w-full items-center justify-center px-11",
                    caption_label:
                      "font-display text-[27px] font-bold capitalize tracking-[-.02em] text-primary-dark",
                    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between",
                    button_previous:
                      "inline-flex size-11 items-center justify-center rounded-md p-0 text-primary hover:bg-muted disabled:cursor-default disabled:opacity-40",
                    button_next:
                      "inline-flex size-11 items-center justify-center rounded-md p-0 text-primary hover:bg-muted disabled:cursor-default disabled:opacity-40",
                    month_grid: "w-full table-fixed border-collapse",
                    weekdays: "flex",
                    weekday:
                      "flex-1 pb-1 text-center text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground",
                    week: "mt-1 flex w-full",
                    day: "relative flex h-9 flex-1 items-center justify-center rounded-md p-0 text-center text-[13px] tabular-nums",
                    outside: "text-[#9aa598]",
                    today: "bg-muted text-foreground",
                  }}
                  locale={de}
                  month={toLocalDate(`${month}-01`)}
                  startMonth={toLocalDate(`${sessionMonths[0]}-01`)}
                  endMonth={toLocalDate(`${sessionMonths.at(-1)}-01`)}
                  showOutsideDays={false}
                  modifiers={{ hasEvents: eventDates }}
                  modifiersClassNames={{
                    hasEvents:
                      "bg-accent font-bold text-primary-dark after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-primary",
                  }}
                  labels={{
                    labelNav: () => "Monatsnavigation",
                    labelPrevious: () => "Vorheriger Monat",
                    labelNext: () => "Nächster Monat",
                    labelGridcell: (date, modifiers) =>
                      `${date.toLocaleDateString("de-DE", { dateStyle: "full" })}${modifiers?.hasEvents ? ", mit Veranstaltung" : ""}`,
                  }}
                  onMonthChange={(date) => setMonth(toMonthValue(date))}
                />
              </div>
            )}
          </div>
        </aside>
        <div className="min-w-0">
          {groups.map((group) => (
            <section
              className="mt-[23px] first:mt-0"
              key={group}
              aria-label={formatDate(group + "-01", {
                month: "long",
                year: "numeric",
              })}
            >
              <h2 className="mb-3 flex items-center gap-2.5 font-sans text-[15px] font-normal tracking-normal [&>span:first-of-type]:text-xs [&>span:first-of-type]:font-normal [&>span:first-of-type]:text-muted-foreground">
                {formatDate(group + "-01", { month: "long" })}
                <span>{group.slice(0, 4)}</span>
                <span className="ml-1.5 h-px flex-1 bg-border" />
              </h2>
              {filtered
                .filter((e) => e.date.startsWith(group))
                .map((event) => (
                  <details
                    className="group/event border-b border-border open:bg-[#fafcf7] [&_summary]:flex [&_summary]:cursor-pointer [&_summary]:list-none [&_summary]:items-center [&_summary]:gap-6 [&_summary]:px-1 [&_summary]:py-[22px] [&_summary::-webkit-details-marker]:hidden [&_summary:hover]:bg-muted max-lg:[&_summary]:gap-4 max-md:[&_summary]:gap-[13px] max-md:[&_summary]:px-0 max-md:[&_summary]:py-5 print:break-inside-avoid print:[&_summary]:py-3.5"
                    key={event.id}
                  >
                    <summary>
                      <span className="flex min-w-[50px] flex-col items-center self-start [&_strong]:font-display [&_strong]:text-[43px] [&_strong]:leading-none [&_strong]:text-primary-dark [&_strong]:tabular-nums [&>span]:mt-1.5 [&>span]:text-[11px] [&>span]:text-muted-foreground [&>span]:uppercase max-md:min-w-10 max-md:[&_strong]:text-[39px]">
                        <strong>{event.date.slice(8)}</strong>
                        <span>
                          {formatDate(event.date, { weekday: "short" }).replace(
                            ".",
                            "",
                          )}
                        </span>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-[7px]">
                        <span className="text-xl leading-[1.25] font-semibold tracking-[-.025em] max-md:text-lg max-[370px]:text-base">
                          {event.title}
                        </span>
                        <span className="flex flex-wrap gap-x-5 gap-y-[5px] text-[13px] text-muted-foreground [&>span]:flex [&>span]:items-center [&>span]:gap-[5px] max-lg:gap-x-2.5 max-md:flex-col max-md:gap-[5px]">
                          <span>
                            <Icon name="clock" size={14} />
                            {event.time ? `${event.time} Uhr` : "Uhrzeit steht noch nicht fest"}
                          </span>
                          <span>
                            <Icon name="pin" size={14} />
                            {event.location || "Ort steht noch nicht fest"}
                          </span>
                        </span>
                      </span>
                      <span className="flex items-center gap-5 max-lg:gap-2 max-md:flex-col-reverse max-md:gap-[13px]">
                        <span className="grid size-[30px] place-items-center rounded-full text-primary transition-[transform,background] duration-250 ease-out group-open/event:rotate-45 group-open/event:bg-accent print:hidden">
                          <Icon name="plus" size={20} />
                        </span>
                      </span>
                    </summary>
                    <div className="animate-unfold pr-[60px] pb-6 pl-[78px] [&_p]:max-w-[65ch] [&_p]:text-[13px] [&_p]:leading-[1.75] [&_[data-slot=button]]:mt-[15px] max-lg:pr-6 max-lg:pl-[70px] max-md:pr-4 max-md:pb-[22px] max-md:pl-[53px] max-md:[&_p]:text-xs print:block">
                      <p>
                        {event.description || "Weitere Informationen folgen."}
                      </p>
                      <Button
                        className="min-h-11 text-[13px]"
                        variant="link"
                        size="link"
                        onClick={() => downloadCalendar([event])}
                      >
                        <Icon name="calendar" size={17} /> Im Kalender speichern{" "}
                        <Icon name="arrow" size={16} />
                      </Button>
                    </div>
                  </details>
                ))}
            </section>
          ))}
          {!filtered.length && (
            <div className="mt-[22px] bg-muted px-5 py-[55px] text-center [&>svg]:mx-auto [&>svg]:mb-4 [&>svg]:text-primary [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-normal [&_h2]:tracking-normal [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:mb-5 [&_p]:max-w-[46ch] [&_p]:text-[13px] max-md:px-3.5">
              <Icon name="calendar" size={32} />
              <h2>
                {events.length
                  ? "Hier ist noch Platz für Vorfreude."
                  : "Die Session nimmt Gestalt an."}
              </h2>
              <p>
                {events.length
                  ? "Für diesen Monat gibt es keine Termine. Wähle einen anderen Monat."
                  : "Sobald die ersten Termine feststehen, findest du sie hier."}
              </p>
            </div>
          )}
          <p className="pt-[27px] pb-5 text-center text-[11px]">
            Änderungen vorbehalten. Wir halten euch hier auf dem Laufenden.
          </p>
        </div>
      </div>
    </section>
  );
}
