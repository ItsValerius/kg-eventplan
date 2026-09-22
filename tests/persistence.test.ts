import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, like } from "drizzle-orm";
import { closeDatabase, database } from "../db/client";
import { events } from "../db/schema";
import type { EventInput } from "../lib/events";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const prefix = `Integration-${randomUUID()}`;
const id = randomUUID();
const event: EventInput = {
  title: `${prefix}-draft`,
  date: "2027-02-06",
  time: "12:34",
  location: "Prüfort ' & ä",
  description: "Temporary integration test",
  published: false,
};

describe("Drizzle/PostgreSQL persistence", () => {
  beforeAll(() => {
    expect(process.env.DATABASE_URL, "DATABASE_URL muss gesetzt sein").toBeTruthy();
  });

  afterAll(async () => {
    await database().delete(events).where(like(events.title, `${prefix}%`));
    await closeDatabase();
  });

  it("speichert lokale Datums- und Zeitwerte sowie den Entwurfsstatus", async () => {
    await database().insert(events).values({ id, ...event });
    const [stored] = await database().select().from(events).where(eq(events.id, id));
    expect(stored).toMatchObject({
      date: event.date,
      time: `${event.time}:00`,
      location: event.location,
      published: false,
    });
  });

  it("veröffentlicht einen vorhandenen Entwurf", async () => {
    await database()
      .update(events)
      .set({ published: true, title: `${prefix}-published` })
      .where(eq(events.id, id));
    const [published] = await database().select().from(events).where(eq(events.id, id));
    expect(published.published).toBe(true);
  });

  it("verliert bei parallelen Inserts keine Termine", async () => {
    await Promise.all([0, 1, 2].map((number) =>
      database().insert(events).values({
        id: randomUUID(),
        ...event,
        title: `${prefix}-parallel-${number}`,
      }),
    ));
    const rows = await database()
      .select({ id: events.id })
      .from(events)
      .where(like(events.title, `${prefix}-parallel-%`));
    expect(rows).toHaveLength(3);
  });

  it("erzwingt die Saison auch als Datenbank-Constraint", async () => {
    try {
      await database().insert(events).values({
        id: randomUUID(),
        ...event,
        date: "2028-01-01",
      });
      expect.unreachable("Die Datenbank hätte das Datum ablehnen müssen.");
    } catch (error) {
      expect((error as { cause?: { code?: string } }).cause?.code).toBe("23514");
    }
  });
});
