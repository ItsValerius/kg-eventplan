import { z } from "zod";
import { formatDate } from "./format";
import { season } from "./season";

const dateSchema = z
  .string({ error: "Bitte gib ein gültiges Datum ein." })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte gib ein gültiges Datum ein.")
  .refine(
    (date) => !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date,
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
  title: z
    .string({ error: "Bitte gib einen Titel ein." })
    .trim()
    .min(1, "Bitte gib einen Titel ein.")
    .max(120, "Der Titel darf höchstens 120 Zeichen lang sein."),
  date: dateSchema,
  time: timeSchema,
  location: locationSchema,
  description: z
    .string({ error: "Bitte gib eine gültige Beschreibung ein." })
    .trim()
    .max(2000, "Die Beschreibung darf höchstens 2.000 Zeichen lang sein."),
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

export function sortEvents(events: ClubEvent[]) {
  return [...events].sort((a, b) =>
    `${a.date}T${a.time ?? "24:00"}`.localeCompare(`${b.date}T${b.time ?? "24:00"}`),
  );
}
