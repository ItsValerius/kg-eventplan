import { sql } from "drizzle-orm";
import { boolean, check, date, index, pgTable, text, time } from "drizzle-orm/pg-core";
import { season } from "../lib/season";

export const events = pgTable("events", {
  id: text().primaryKey(),
  host: text(),
  title: text().notNull(),
  date: date({ mode: "string" }).notNull(),
  time: time({ precision: 0 }),
  location: text(),
  description: text().notNull().default(""),
  published: boolean().notNull().default(false),
}, (table) => [
  index("events_chronological").on(table.date, table.time, table.id),
  check("events_host_length", sql`char_length(btrim(${table.host})) BETWEEN 1 AND 120`),
  check("events_title_length", sql`char_length(btrim(${table.title})) BETWEEN 1 AND 120`),
  check("events_season_date", sql`${table.date} BETWEEN DATE ${sql.raw(`'${season.firstDay}'`)} AND DATE ${sql.raw(`'${season.lastDay}'`)}`),
  check("events_minute_time", sql`EXTRACT(SECOND FROM ${table.time}) = 0`),
  check("events_location_length", sql`char_length(btrim(${table.location})) BETWEEN 1 AND 180`),
  check("events_description_length", sql`char_length(${table.description}) <= 2000`),
]);

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;

export * from "./auth-schema";
