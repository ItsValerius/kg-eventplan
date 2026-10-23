// Sample season used by `pnpm db:seed` when no events file is given. Kept out of lib/ so
// it never ships with the app.
import { eventSchema, validationMessage, type ClubEvent } from "../lib/events";

export const initialEvents: ClubEvent[] = [
  {
    host: null,
    id: "sample-1",
    title: "Hoppeditzerwachen",
    date: "2026-11-14",
    time: "19:11",
    location: "Mehrzweckhalle Golkrath",
    description:
      "Die fünfte Jahreszeit kann kommen! Gemeinsam starten wir in die neue Session. Dieser Termin dient als Beispiel; Datum, Uhrzeit und Programm sind noch nicht bestätigt.",
    published: false,
  },
  {
    host: null,
    id: "sample-2",
    title: "Möhnenhängen",
    date: "2027-01-23",
    time: "11:11",
    location: "Golkrath",
    description:
      "Eine Golkrather Tradition gehört in jeden Sessionskalender. Beispieltermin – weitere Informationen folgen nach Bestätigung durch den Verein.",
    published: false,
  },
  {
    host: null,
    id: "sample-3",
    title: "Prinzenbiwak",
    date: "2027-01-24",
    time: "11:11",
    location: "Mehrzweckhalle Golkrath",
    description:
      "Karneval zum Anfassen mit unseren Gästen und befreundeten Gesellschaften. Alle Angaben sind beispielhaft und noch nicht bestätigt.",
    published: false,
  },
  {
    host: null,
    id: "sample-4",
    title: "Kindersitzung",
    date: "2027-01-31",
    time: "14:11",
    location: "Mehrzweckhalle Golkrath",
    description:
      "Ein Nachmittag für die kleinen Jecken und ihre Familien. Beispieltermin; Programm und Teilnahmeinformationen stehen noch nicht fest.",
    published: false,
  },
  {
    host: null,
    id: "sample-5",
    title: "Altweiber in Golkrath",
    date: "2027-02-04",
    time: "11:11",
    location: "Golkrath",
    description:
      "Die tollen Tage beginnen. Geplante Besuche und Treffpunkte werden nach Bestätigung ergänzt. Dies ist ein Beispieltermin.",
    published: false,
  },
  {
    host: null,
    id: "sample-6",
    title: "Jeck op Kölsch",
    date: "2027-02-05",
    time: "20:00",
    location: "Mehrzweckhalle Golkrath",
    description:
      "Kölsche Töne, gute Gesellschaft und ein Abend voller Karneval. Datum und Uhrzeit sind Beispieldaten; es werden noch keine Tickets angeboten.",
    published: false,
  },
  {
    host: null,
    id: "sample-7",
    title: "Rosenmontag im Dorf",
    date: "2027-02-08",
    time: "14:11",
    location: "Golkrath",
    description:
      "Gemeinsam durch unser Dorf: lachen, singen und Karneval feiern. Beispieltermin – Startzeit und Treffpunkt sind noch nicht bestätigt.",
    published: false,
  },
  {
    host: null,
    id: "sample-8",
    title: "Fischessen zum Sessionsausklang",
    date: "2027-02-10",
    time: "19:00",
    location: "Golkrath · Ort folgt",
    description:
      "Zum Abschluss der Session kommen die Aktiven zusammen. Dies ist ein Beispiel; Einladung und genaue Angaben folgen durch den Verein.",
    published: false,
  },
];

export function validateEvent(value: unknown): Omit<ClubEvent, "id"> {
  const result = eventSchema.safeParse(value);
  if (!result.success) throw new Error(validationMessage(result.error));
  return result.data;
}
