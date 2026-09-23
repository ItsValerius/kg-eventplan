import type { ClubEvent } from "@/lib/events";
import { isClubEvent } from "@/lib/format";

export type Draft = Omit<ClubEvent, "id"> & { id?: string };
export type FieldName = "host" | "title" | "date" | "time" | "location" | "description";
export const fieldOrder: FieldName[] = ["host", "title", "date", "time", "location", "description"];
// Prefill the venue the club itself uses most, so new club events need no retyping.
function usualVenue(events: ClubEvent[]) {
  const counts = new Map<string, number>();
  for (const event of events)
    if (event.location && isClubEvent(event.host))
      counts.set(event.location, (counts.get(event.location) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Mehrzweckhalle Golkrath";
}
export const blank = (events: ClubEvent[]): Draft => ({
  host: null,
  title: "",
  date: "",
  time: "19:11",
  location: usualVenue(events),
  description: "",
  published: false,
});
