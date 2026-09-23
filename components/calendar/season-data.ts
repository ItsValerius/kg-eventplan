import type { ClubEvent } from "@/lib/events";
import { season } from "@/lib/season";

// What the month tiles and the day picker need, derived once from the (sorted) events.
export function summarizeEvents(events: ClubEvent[]) {
  const eventDates = new Set<string>();
  const countByMonth = new Map<string, number>();
  for (const event of events) {
    eventDates.add(event.date);
    const month = event.date.slice(0, 7);
    countByMonth.set(month, (countByMonth.get(month) ?? 0) + 1);
  }
  // Always offer the core session months, plus any month outside them that has events.
  const months = [...new Set([...season.coreMonths, ...countByMonth.keys()])].sort();
  return { eventDates, countByMonth, months };
}

// The overview lists what is still ahead; a month view keeps its past events, muted.
export function visibleEvents(events: ClubEvent[], month: string | null, today: string) {
  return month
    ? events.filter((event) => event.date.startsWith(month))
    : events.filter((event) => event.date >= today);
}
