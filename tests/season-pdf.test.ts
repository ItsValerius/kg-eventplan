import { describe, expect, it, vi } from "vitest";
import type { ClubEvent } from "../lib/events";

const put = vi.fn().mockResolvedValue({ url: "https://example.public.blob.vercel-storage.com/sessionsplan.pdf" });
vi.mock("@vercel/blob", () => ({ put: (...args: unknown[]) => put(...args) }));

const { regenerateSeasonPlanPdf } = await import("../lib/season-pdf");

const sampleEvent: ClubEvent = {
  id: "test-1",
  title: "Prinzenbiwak",
  date: "2027-01-24",
  time: "11:11",
  location: "Mehrzweckhalle Golkrath",
  description: "Karneval in Golkrath.",
  published: true,
};

function uploadedBuffer() {
  const [, body] = put.mock.calls.at(-1) as [string, Buffer];
  return body;
}

describe("regenerateSeasonPlanPdf", () => {
  it("lädt eine gültige PDF-Datei hoch", async () => {
    await regenerateSeasonPlanPdf([sampleEvent]);
    const buffer = uploadedBuffer();
    expect(buffer.subarray(0, 4).toString("latin1")).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("erzeugt eine Leerzustand-PDF ohne Termine", async () => {
    await regenerateSeasonPlanPdf([]);
    const buffer = uploadedBuffer();
    expect(buffer.subarray(0, 4).toString("latin1")).toBe("%PDF");
  });

  it("verarbeitet eine Beschreibung nahe der Zeichenobergrenze", async () => {
    const longEvent: ClubEvent = { ...sampleEvent, description: "x".repeat(1999) };
    await regenerateSeasonPlanPdf([longEvent]);
    const buffer = uploadedBuffer();
    expect(buffer.subarray(0, 4).toString("latin1")).toBe("%PDF");
  });
});
