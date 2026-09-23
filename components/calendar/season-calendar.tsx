"use client";
import { useMemo } from "react";
import { useLinkedEvent } from "@/hooks/use-linked-event";
import { useMonthSelection } from "@/hooks/use-month-selection";
import { useOpenEvents } from "@/hooks/use-open-events";
import { useToday } from "@/hooks/use-today";
import type { ClubEvent } from "@/lib/events";
import { season } from "@/lib/season";
import { Agenda } from "./agenda";
import { AgendaEmpty } from "./agenda-empty";
import { toDateValue } from "./dates";
import { MonthTiles } from "./month-tiles";
import { MonthView } from "./month-view";
import { PdfDownload } from "./pdf-download";
import { summarizeEvents, visibleEvents } from "./season-data";

export default function SeasonCalendar({
  events,
  hasSessionPlanPdf,
  renderedOn,
}: {
  events: ClubEvent[];
  hasSessionPlanPdf: boolean;
  renderedOn: string;
}) {
  const today = useToday(renderedOn);
  const { month, setMonth, backButton, tileRef, openMonth, changeMonth, showAllMonths } =
    useMonthSelection();
  const { open, openEvent, toggle } = useOpenEvents();
  useLinkedEvent(events, setMonth, openEvent);

  const { eventDates, countByMonth, months } = useMemo(() => summarizeEvents(events), [events]);
  const shown = visibleEvents(events, month, today);
  const nextDate = events.find((event) => event.date >= today)?.date;

  return (
    <section
      className="pt-6 max-md:pt-5 print:pt-5"
      id="termine"
      aria-label={`Termine der Session ${season.label}`}
    >
      <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-12 max-lg:grid-cols-[270px_minmax(0,1fr)] max-lg:gap-8 max-md:flex max-md:flex-col max-md:gap-8 print:block">
        <aside className="md:sticky md:top-6 md:self-start print:hidden">
          {hasSessionPlanPdf && <PdfDownload />}
          <div className="mb-2 border-b border-border pb-6">
            {month ? (
              <MonthView
                month={month}
                months={months}
                eventDates={eventDates}
                returnRef={backButton}
                onBack={showAllMonths}
                onMonthChange={changeMonth}
                onDayClick={(date) => {
                  // A day picked in the month view opens its first event.
                  const day = toDateValue(date);
                  const first = events.find((event) => event.date === day);
                  if (first) openEvent(first.id);
                }}
              />
            ) : (
              <MonthTiles
                months={months}
                countByMonth={countByMonth}
                today={today}
                buttonRef={tileRef}
                onSelect={openMonth}
              />
            )}
          </div>
        </aside>
        <div className="min-w-0">
          <Agenda
            events={shown}
            today={today}
            nextDate={nextDate}
            open={open}
            onOpenChange={toggle}
          />
          {!shown.length && (
            <AgendaEmpty hasEvents={events.length > 0} month={month} today={today} />
          )}
          <p className="pt-6.75 pb-5 text-center text-xs">
            Änderungen vorbehalten. Wir halten euch hier auf dem Laufenden.
          </p>
        </div>
      </div>
    </section>
  );
}
