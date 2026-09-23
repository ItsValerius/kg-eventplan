import { Accordion } from "@/components/ui/accordion";
import type { ClubEvent } from "@/lib/events";
import { formatDate, groupByMonth } from "@/lib/format";
import { MonthHeading } from "../month-heading";
import { EventRow } from "./event-row";

// Events grouped under their month heading, each unfoldable; several can be open at once.
// Closed descriptions stay in the page, so search engines and find-in-page reach them.
export function Agenda({
  events,
  today,
  nextDate,
  open,
  onOpenChange,
}: {
  events: ClubEvent[];
  today: string;
  nextDate: string | undefined;
  open: string[];
  onOpenChange: (open: string[]) => void;
}) {
  return (
    <Accordion multiple hiddenUntilFound value={open} onValueChange={onOpenChange}>
      {groupByMonth(events).map(([group, monthEvents]) => (
        <section
          className="mt-5.75 first:mt-0"
          key={group}
          aria-label={formatDate(group + "-01", { month: "long", year: "numeric" })}
        >
          <MonthHeading month={group} className="mb-3" />
          {monthEvents.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              past={event.date < today}
              next={event.date === nextDate}
            />
          ))}
        </section>
      ))}
    </Accordion>
  );
}
