import { describe, expect, it } from "vitest";
import {
  eventIdSchema,
  eventSchema,
  loginSchema,
  validationMessage,
} from "../lib/events";
import { eventName, groupByMonth, isClubEvent } from "../lib/format";

const validEvent = {
  host: "KG Knallköpp",
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

  it("erlaubt fehlende Uhrzeit, fehlenden Ort und fehlenden Verein", () => {
    const result = eventSchema.parse({ ...validEvent, time: null, location: "", host: "  " });
    expect(result.time).toBeNull();
    expect(result.location).toBeNull();
    expect(result.host).toBeNull();
  });

  it.each([
    [{ ...validEvent, title: 12 }, "Bitte gib einen Titel ein."],
    [{ ...validEvent, title: "" }, "Bitte gib einen Titel ein."],
    [{ ...validEvent, date: "2027-02-30" }, "Bitte gib ein gültiges Datum ein."],
    [{ ...validEvent, date: "2028-01-01" }, "Das Datum muss in der Session liegen (September 2026 bis August 2027)."],
    [{ ...validEvent, time: "25:00" }, "Bitte gib eine gültige Uhrzeit ein."],
    [{ ...validEvent, location: "x".repeat(181) }, "Der Ort darf höchstens 180 Zeichen lang sein."],
    [{ ...validEvent, host: "x".repeat(121) }, "Der Verein darf höchstens 120 Zeichen lang sein."],
    [{ ...validEvent, description: 42 }, "Bitte gib eine gültige Beschreibung ein."],
    [{ ...validEvent, published: "ja" }, "Bitte prüfe den Veröffentlichungsstatus."],
  ])("liefert eine deutsche Meldung für ungültige Eventdaten", (input, expected) => {
    expect(message(input)).toBe(expected);
  });

  it("übersetzt ID- und Loginfehler", () => {
    const id = eventIdSchema.safeParse({ id: 3 });
    const login = loginSchema.safeParse({ email: "admin@example.com", password: "" });
    expect(id.success).toBe(false);
    expect(login.success).toBe(false);
    if (!id.success) expect(validationMessage(id.error)).toBe("Der Termin fehlt.");
    if (!login.success) expect(validationMessage(login.error)).toBe("Bitte gib das Passwort ein.");
  });
});

describe("groupByMonth", () => {
  it("gruppiert sortierte Termine nach Monat und behält die Reihenfolge", () => {
    const events = [
      { id: "a", date: "2026-11-11" },
      { id: "b", date: "2026-11-28" },
      { id: "c", date: "2027-01-16" },
    ];
    expect(groupByMonth(events)).toEqual([
      ["2026-11", [events[0], events[1]]],
      ["2027-01", [events[2]]],
    ]);
  });
});

describe("eventName", () => {
  it("setzt Verein und Titel wie bisher zusammen", () => {
    expect(eventName({ host: "Ratheimer Karnevalsgesellschaft", title: "Biwak" })).toBe(
      "Ratheimer Karnevalsgesellschaft – Biwak",
    );
  });

  it("zeigt ohne Verein nur den Titel", () => {
    expect(eventName({ host: null, title: "Hoppeditzerwachen" })).toBe("Hoppeditzerwachen");
  });
});

describe("isClubEvent", () => {
  it.each([
    ["KG Knallköpp", true],
    ["Knallkoepp Golkrath", true],
    ["KG Eierköpp Baal", false],
    [null, false],
  ])("erkennt eigene Termine am Verein (%s)", (host, expected) => {
    expect(isClubEvent(host)).toBe(expected);
  });
});
