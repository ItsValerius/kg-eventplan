import { z } from "zod";
import { formatDate } from "./format";
import { season } from "./season";

const dateSchema = z
  .string({ error: "Bitte gib ein gültiges Datum ein." })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte gib ein gültiges Datum ein.")
  .refine(
    (date) =>
      !Number.isNaN(Date.parse(date)) &&
      new Date(date).toISOString().slice(0, 10) === date,
    "Bitte gib ein gültiges Datum ein.",
  )
  .refine(
    (date) => date >= season.firstDay && date <= season.lastDay,
    `Das Datum muss in der Session liegen (${formatDate(season.firstDay, { month: "long", year: "numeric" })} bis ${formatDate(season.lastDay, { month: "long", year: "numeric" })}).`,
  );

const timeSchema = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z
    .string({ error: "Bitte gib eine gültige Uhrzeit ein." })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Bitte gib eine gültige Uhrzeit ein.")
    .nullable(),
);
// The hosting club, e.g. "KG Knallköpp"; empty for events without one.
const hostSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : (value ?? null)),
  z
    .string({ error: "Bitte gib einen gültigen Verein ein." })
    .trim()
    .max(120, "Der Verein darf höchstens 120 Zeichen lang sein.")
    .nullable(),
);
const locationSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : (value ?? null)),
  z
    .string({ error: "Bitte gib einen Ort ein." })
    .trim()
    .max(180, "Der Ort darf höchstens 180 Zeichen lang sein.")
    .nullable(),
);
export const eventSchema = z.object({
  host: hostSchema,
  title: z.string({ error: "Bitte gib einen Titel ein." }).trim().min(1, "Bitte gib einen Titel ein.").max(120, "Der Titel darf höchstens 120 Zeichen lang sein."),
  date: dateSchema,
  time: timeSchema,
  location: locationSchema,
  description: z.string({ error: "Bitte gib eine gültige Beschreibung ein." }).trim().max(2000, "Die Beschreibung darf höchstens 2.000 Zeichen lang sein."),
  published: z.boolean({ error: "Bitte prüfe den Veröffentlichungsstatus." }),
});
export const eventIdSchema = z.object({
  id: z.string({ error: "Der Termin fehlt." }).trim().min(1, "Der Termin fehlt."),
});
export const storedEventSchema = eventSchema.extend(eventIdSchema.shape);
export type ClubEvent = z.infer<typeof storedEventSchema>;
export type EventInput = z.infer<typeof eventSchema>;

export function validationMessage(error: z.ZodError) {
  return error.issues[0]?.message || "Bitte prüfe deine Eingaben.";
}
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
export function sortEvents(events: ClubEvent[]) {
  return [...events].sort((a, b) =>
    `${a.date}T${a.time ?? "24:00"}`.localeCompare(`${b.date}T${b.time ?? "24:00"}`),
  );
}
export function validateEvent(value: unknown): Omit<ClubEvent, "id"> {
  const result = eventSchema.safeParse(value);
  if (!result.success) throw new Error(validationMessage(result.error));
  return result.data;
}
