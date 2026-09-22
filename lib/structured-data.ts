import type { ClubEvent } from "./events";
import { isClubEvent } from "./format";

export const siteUrl = "https://sessionsplan.knallkoepp-golkrath.de";
const club = {
  "@type": "Organization",
  name: "KG Knallköpp Golkrath e.V.",
  url: "https://www.knallkoepp-golkrath.de/",
};

// "+01:00" in winter, "+02:00" in summer.
function berlinOffset(date: string, time: string) {
  const offset = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Berlin",
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(`${date}T${time}:00Z`))
    .find((part) => part.type === "timeZoneName")?.value;
  return offset?.replace("GMT", "") || "+01:00";
}

// schema.org events, so search engines can list the dates.
export function eventsJsonLd(events: ClubEvent[]) {
  return {
    "@context": "https://schema.org",
    "@graph": events.map((event) => ({
      "@type": "Event",
      name: event.title,
      startDate: event.time
        ? `${event.date}T${event.time}:00${berlinOffset(event.date, event.time)}`
        : event.date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      url: `${siteUrl}/#termin-${encodeURIComponent(event.id)}`,
      ...(event.description && { description: event.description }),
      ...(event.location && {
        location: { "@type": "Place", name: event.location, address: event.location },
      }),
      ...(isClubEvent(event.title) && { organizer: club }),
    })),
  };
}
