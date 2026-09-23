import type { ClubEvent } from "../events";
import { isClubEvent } from "../format";

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

// The host is the part of the title before the dash ("Ratheimer Karnevalsgesellschaft – Biwak").
function organizer(title: string) {
  if (isClubEvent(title)) return club;
  const host = title.split(/\s[–-]\s/)[0]?.trim();
  return host && host !== title.trim() ? { "@type": "Organization", name: host } : undefined;
}

// schema.org events, so search engines can list the dates. Google requires a venue,
// so events without one are left out until it is entered.
export function eventsJsonLd(events: ClubEvent[]) {
  return {
    "@context": "https://schema.org",
    "@graph": events.filter((event) => event.location).map((event) => {
      const host = organizer(event.title);
      return {
        "@type": "Event",
        name: event.title,
        startDate: event.time
          ? `${event.date}T${event.time}:00${berlinOffset(event.date, event.time)}`
          : event.date,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        url: `${siteUrl}/#termin-${encodeURIComponent(event.id)}`,
        image: `${siteUrl}/opengraph-image`,
        ...(event.description && { description: event.description }),
        location: { "@type": "Place", name: event.location, address: event.location },
        ...(host && { organizer: host }),
      };
    }),
  };
}
