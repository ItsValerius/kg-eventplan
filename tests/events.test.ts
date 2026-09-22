import { describe, expect, it } from "vitest";
import {
  eventIdSchema,
  eventSchema,
  loginSchema,
  validationMessage,
} from "../lib/events";

const validEvent = {
  title: "Prinzenbiwak",
  date: "2027-01-24",
  time: "11:11",
  location: "Mehrzweckhalle Golkrath",
  description: "Karneval in Golkrath.",
  published: false,
};

function message(input: unknown) {
  const result = eventSchema.safeParse(input);
  expect(result.success).toBe(false);
  if (result.success) throw new Error("Die Testdaten waren unerwartet gültig.");
  return validationMessage(result.error);
}

describe("deutsche Zod-Validierung", () => {
  it("normalisiert gültige Formulardaten", () => {
    expect(eventSchema.parse({ ...validEvent, title: "  Prinzenbiwak  " }).title)
      .toBe("Prinzenbiwak");
  });

  it("erlaubt fehlende Uhrzeit und fehlenden Ort", () => {
    const result = eventSchema.parse({ ...validEvent, time: null, location: "" });
    expect(result.time).toBeNull();
    expect(result.location).toBeNull();
  });

  it.each([
    [{ ...validEvent, title: 12 }, "Bitte gib einen Titel ein."],
    [{ ...validEvent, title: "" }, "Bitte gib einen Titel ein."],
    [{ ...validEvent, date: "2027-02-30" }, "Bitte gib ein gültiges Datum ein."],
    [{ ...validEvent, date: "2028-01-01" }, "Das Datum muss in der Session liegen (September 2026 bis August 2027)."],
    [{ ...validEvent, time: "25:00" }, "Bitte gib eine gültige Uhrzeit ein."],
    [{ ...validEvent, location: "x".repeat(181) }, "Der Ort darf höchstens 180 Zeichen lang sein."],
    [{ ...validEvent, description: 42 }, "Bitte gib eine gültige Beschreibung ein."],
    [{ ...validEvent, published: "ja" }, "Bitte prüfe den Veröffentlichungsstatus."],
  ])("liefert eine deutsche Meldung für ungültige Eventdaten", (input, expected) => {
    expect(message(input)).toBe(expected);
  });

  it("übersetzt ID- und Loginfehler", () => {
    const id = eventIdSchema.safeParse({ id: 3 });
    const login = loginSchema.safeParse({ password: "" });
    expect(id.success).toBe(false);
    expect(login.success).toBe(false);
    if (!id.success) expect(validationMessage(id.error)).toBe("Der Termin fehlt.");
    if (!login.success) expect(validationMessage(login.error)).toBe("Bitte gib das Passwort ein.");
  });
});
