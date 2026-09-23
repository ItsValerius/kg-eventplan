import type { ClubEvent } from "@/lib/events";
import { replaceUrl } from "./history";

// The shareable address of one event row.
export function eventHash(id: string) {
  return `#termin-${encodeURIComponent(id)}`;
}

// Drops a shared #termin-<id> from the address bar, e.g. once the visitor moves on.
export function clearEventLink(hash = location.hash) {
  if (hash.startsWith("#termin-") && location.hash === hash)
    replaceUrl(location.pathname + location.search);
}

// The event a #termin-<id> address points to, if it exists.
export function linkedEvent(events: ClubEvent[]) {
  const match = location.hash.match(/^#termin-(.+)$/);
  return match ? events.find((event) => event.id === decodeURIComponent(match[1])) : undefined;
}
