import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { ClubEvent } from "@/lib/events";
import { currentDay } from "@/components/calendar/dates";
import { linkedEvent } from "@/components/calendar/event-links";

// Shared links (#termin-<id>) open their event, switching to its month when the
// current view doesn't list it (another month, or a past event on the overview).
export function useLinkedEvent(
  events: ClubEvent[],
  setMonth: Dispatch<SetStateAction<string | null>>,
  openEvent: (id: string) => void,
) {
  useEffect(() => {
    const follow = () => {
      const event = linkedEvent(events);
      if (!event) return;
      const eventMonth = event.date.slice(0, 7);
      const upcoming = event.date >= currentDay();
      setMonth((current) =>
        current === eventMonth || (!current && upcoming) ? current : eventMonth,
      );
      openEvent(event.id);
    };
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [events, setMonth, openEvent]);
}
