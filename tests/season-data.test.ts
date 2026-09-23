import { describe, expect, it } from "vitest";
import type { ClubEvent } from "../lib/events";
import { summarizeEvents, visibleEvents } from "../components/calendar/season-data";

const event = (id: string, date: string): ClubEvent => ({
  id,
  title: id,
  date,
  time: null,
  location: null,
  description: "",
  published: true,
});
const events = [
  event("a", "2026-09-12"),
  event("b", "2026-11-11"),
  event("c", "2026-11-28"),
  event("d", "2027-01-16"),
];

describe("summarizeEvents", () => {
  it("zählt Termine je Monat und ergänzt die Kernmonate", () => {
    const { eventDates, countByMonth, months } = summarizeEvents(events);
    expect(eventDates.has("2026-11-28")).toBe(true);
    expect(countByMonth.get("2026-11")).toBe(2);
    expect(months).toEqual(["2026-09", "2026-11", "2026-12", "2027-01", "2027-02"]);
  });
});

describe("visibleEvents", () => {
  it("zeigt in der Übersicht nur kommende Termine", () => {
    expect(visibleEvents(events, null, "2026-11-28").map((e) => e.id)).toEqual(["c", "d"]);
  });

  it("zeigt im Monat auch vergangene Termine", () => {
    expect(visibleEvents(events, "2026-11", "2027-01-01").map((e) => e.id)).toEqual(["b", "c"]);
  });
});
