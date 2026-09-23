import { useSyncExternalStore } from "react";
import { currentDay } from "@/components/calendar/dates";

// Re-check the date every minute so an open tab rolls over at midnight.
function subscribeToClock(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

// Today in Berlin ("YYYY-MM-DD"). Hydration starts from the day the page was
// rendered on the server, then follows the visitor's clock.
export function useToday(renderedOn: string) {
  return useSyncExternalStore(subscribeToClock, currentDay, () => renderedOn);
}
