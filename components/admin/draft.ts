import type { ClubEvent, EventInput } from "@/lib/events";
import { eventLabel, isClubEvent } from "@/lib/format";

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
// A copy keeps club, title, time, venue and description; the date is what changes.
export const copyOf = (event: ClubEvent): Draft => ({
  ...event,
  id: undefined,
  date: "",
  published: false,
});
// A copy only needs a new date; an edit usually changes the title, not the optional club.
export const focusFor = (event: ClubEvent | undefined, copy: boolean): FieldName =>
  copy ? "date" : event ? "title" : "host";

// The saved row: the edited one, or the one id the list did not have before.
export function savedId(draft: Draft, before: ClubEvent[], after: ClubEvent[]) {
  return draft.id ?? after.find((e) => !before.some((known) => known.id === e.id))?.id;
}

export function savedMessage(event: EventInput, edited: boolean) {
  const label = `„${eventLabel(event)}“`;
  if (edited) return `${label} wurde gespeichert.`;
  return event.published
    ? `${label} wurde hinzugefügt und ist im Sessionsplan sichtbar.`
    : `${label} wurde als Entwurf hinzugefügt.`;
}

export function publishedMessage(event: ClubEvent, published: boolean) {
  return published
    ? `„${eventLabel(event)}“ ist jetzt im Sessionsplan sichtbar.`
    : `„${eventLabel(event)}“ ist wieder ein Entwurf.`;
}
