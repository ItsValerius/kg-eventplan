import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { regenerateSeasonPlanPdf } from "../lib/season-pdf";
import type { ClubEvent } from "../lib/events";

const sampleEvent: ClubEvent = {
  id: "test-1",
  title: "Prinzenbiwak",
  date: "2027-01-24",
  time: "11:11",
  location: "Mehrzweckhalle Golkrath",
  description: "Karneval in Golkrath.",
  published: true,
};

let dir: string | undefined;

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
  dir = undefined;
});

async function targetPath() {
  dir = await mkdtemp(path.join(tmpdir(), "season-pdf-test-"));
  return path.join(dir, "sessionsplan.pdf");
}

describe("regenerateSeasonPlanPdf", () => {
  it("schreibt eine gültige PDF-Datei", async () => {
    const target = await targetPath();
    await regenerateSeasonPlanPdf([sampleEvent], target);
    const buffer = await readFile(target);
    expect(buffer.subarray(0, 4).toString("latin1")).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("erzeugt eine Leerzustand-PDF ohne Termine", async () => {
    const target = await targetPath();
    await regenerateSeasonPlanPdf([], target);
    const buffer = await readFile(target);
    expect(buffer.subarray(0, 4).toString("latin1")).toBe("%PDF");
  });

  it("verarbeitet eine Beschreibung nahe der Zeichenobergrenze", async () => {
    const target = await targetPath();
    const longEvent: ClubEvent = { ...sampleEvent, description: "x".repeat(1999) };
    await regenerateSeasonPlanPdf([longEvent], target);
    const buffer = await readFile(target);
    expect(buffer.subarray(0, 4).toString("latin1")).toBe("%PDF");
  });
});
