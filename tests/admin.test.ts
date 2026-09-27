import { describe, expect, it } from "vitest";
import { copyOf, focusFor, savedId, savedMessage } from "../components/admin/draft";
import { matchesDate, matchesQuery, matchesStatus } from "../components/admin/event-columns";
import type { ClubEvent } from "../lib/events";
import { eventLabel } from "../lib/format";

const event: ClubEvent = {
  id: "a",
  host: "KG Knallköpp",
  title: "Prinzenbiwak",
  date: "2027-01-24",
  time: "11:11",
  location: "Mehrzweckhalle Golkrath",
  description: "",
  published: true,
};

describe("Terminentwurf", () => {
  it("kopiert alles außer Datum, ID und Veröffentlichung", () => {
    expect(copyOf(event)).toEqual({ ...event, id: undefined, date: "", published: false });
  });

  it("fokussiert je nach Aktion das passende Feld", () => {
    expect(focusFor(undefined, false)).toBe("host");
    expect(focusFor(event, false)).toBe("title");
    expect(focusFor(event, true)).toBe("date");
  });

  it("findet den gespeicherten Termin", () => {
    const added = { ...event, id: "b" };
    expect(savedId(event, [event], [event])).toBe("a");
    expect(savedId(copyOf(event), [event], [event, added])).toBe("b");
  });

  it("meldet Speichern, Entwurf und Veröffentlichung", () => {
    expect(savedMessage(event, true)).toBe(`„${eventLabel(event)}“ wurde gespeichert.`);
    expect(savedMessage({ ...event, published: false }, false)).toMatch(/als Entwurf hinzugefügt/);
    expect(savedMessage(event, false)).toMatch(/im Sessionsplan sichtbar/);
  });
});

describe("Terminfilter", () => {
  it("sucht ohne Rücksicht auf Umlaute und Groß-/Kleinschreibung", () => {
    expect(matchesQuery(event, "koepp")).toBe(true);
    expect(matchesQuery(event, "  KNALLKÖPP ")).toBe(true);
    expect(matchesQuery(event, "golkrath")).toBe(true);
    expect(matchesQuery(event, "Sitzung")).toBe(false);
  });

  it("filtert nach Monat und blendet Vergangenes aus", () => {
    expect(matchesDate(event, { month: "2027-01", upcoming: false, today: "" })).toBe(true);
    expect(matchesDate(event, { month: "2027-02", upcoming: false, today: "" })).toBe(false);
    expect(matchesDate(event, { month: "", upcoming: true, today: "2027-01-24" })).toBe(true);
    expect(matchesDate(event, { month: "", upcoming: true, today: "2027-01-25" })).toBe(false);
  });

  it("unterscheidet Veröffentlichtes und Entwürfe", () => {
    expect(matchesStatus(event, "veroeffentlicht")).toBe(true);
    expect(matchesStatus(event, "entwurf")).toBe(false);
  });
});
