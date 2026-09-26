import "server-only";
import { randomUUID } from "node:crypto";
import { asc, eq, sql } from "drizzle-orm";
import { database } from "@/db/client";
import { events } from "@/db/schema";
import type { ClubEvent } from "../events";

const eventFields = {
  id: events.id,
  host: events.host,
  title: events.title,
  date: sql<string>`to_char(${events.date}, 'YYYY-MM-DD')`,
  time: sql<string | null>`to_char(${events.time}, 'HH24:MI')`,
  location: events.location,
  description: events.description,
  published: events.published,
};

export async function readEvents(): Promise<ClubEvent[]> {
  return database()
    .select(eventFields)
    .from(events)
    .orderBy(asc(events.date), asc(events.time), asc(events.id));
}

export async function readPublishedEvents(): Promise<ClubEvent[]> {
  return database()
    .select(eventFields)
    .from(events)
    .where(eq(events.published, true))
    .orderBy(asc(events.date), asc(events.time), asc(events.id));
}

export async function createEvent(event: Omit<ClubEvent, "id">) {
  await database()
    .insert(events)
    .values({ id: randomUUID(), ...event });
}

export async function updateEvent(id: string, event: Omit<ClubEvent, "id">) {
  const updated = await database()
    .update(events)
    .set(event)
    .where(eq(events.id, id))
    .returning({ id: events.id });
  return updated.length === 1;
}

export async function deleteEvent(id: string) {
  const deleted = await database()
    .delete(events)
    .where(eq(events.id, id))
    .returning({ id: events.id });
  return deleted.length === 1;
}

export async function setPublished(id: string, published: boolean) {
  const updated = await database()
    .update(events)
    .set({ published })
    .where(eq(events.id, id))
    .returning({ id: events.id });
  return updated.length === 1;
}
