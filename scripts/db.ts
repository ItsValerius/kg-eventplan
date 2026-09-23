// Database commands:
//   migrate  applies pending migrations from drizzle/ (create them with `pnpm db:generate`)
//   deploy   the same, run by Vercel's build (buildCommand in vercel.json); production only
//   seed     first setup: imports events into an empty database
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { migrate as applyMigrations } from "drizzle-orm/node-postgres/migrator";
import { connect, type Database } from "../db/client";
import { events } from "../db/schema";
import { initialEvents, validateEvent, type ClubEvent } from "../lib/events";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const usage = "Usage: tsx scripts/db.ts migrate | deploy | seed [events.json]";

// Neon recommends a direct connection for schema changes: its pooled URL runs PgBouncer in
// transaction mode. Vercel provides DATABASE_URL_UNPOOLED; locally DATABASE_URL is direct.
function databaseUrl() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL before running database commands.");
  return url;
}

// Previews share the production database, so only production builds migrate: an unmerged
// branch must never change it. The previous deployment keeps serving while the build runs,
// so migrations have to stay backward compatible.
function shouldMigrateOnDeploy() {
  return process.env.VERCEL_ENV === "production";
}

async function migrate(db: Database) {
  await applyMigrations(db, { migrationsFolder: "drizzle" });
  console.log("Migrations applied.");
}

// A database that already has events is left unchanged, so seeding never overwrites edits.
async function seed(db: Database, file?: string) {
  await db.transaction(async (tx) => {
    // Serialises concurrent seed runs.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(20262027)`);
    if ((await tx.select({ id: events.id }).from(events).limit(1)).length) {
      console.log("Database already has events; leaving them unchanged.");
      return;
    }
    const imported = await readSeedEvents(file);
    if (imported.length) await tx.insert(events).values(imported);
    console.log(`Imported ${imported.length} events.`);
  });
}

// Events from the given JSON file, else data/events.json (or $EVENT_DATA_DIR), else the
// sample planning dates. Every event is validated and keeps its ID.
async function readSeedEvents(file?: string): Promise<ClubEvent[]> {
  const filename = file ?? path.join(process.env.EVENT_DATA_DIR || "data", "events.json");
  let source: unknown;
  try {
    source = JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    if (file || (error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return initialEvents;
  }
  if (!Array.isArray(source)) throw new Error("Event import must be an array.");
  return source.map((value) => {
    if (typeof value?.id !== "string" || !value.id) throw new Error("Every imported event needs an ID.");
    return withHost({ ...validateEvent(value), id: value.id });
  });
}

// Older exports kept the club in the title ("Host – Title"); split it like migration 0005.
function withHost(event: ClubEvent): ClubEvent {
  const match = event.host ? null : event.title.match(/^(.+?)\s[–-]\s(.+)$/);
  return match ? { ...event, host: match[1].trim(), title: match[2].trim() } : event;
}

async function main() {
  const [command, file] = process.argv.slice(2);
  if (!["migrate", "deploy", "seed"].includes(command)) throw new Error(usage);
  if (command === "deploy" && !shouldMigrateOnDeploy()) {
    console.log(`Skipping migrations for ${process.env.VERCEL_ENV ?? "local"} builds.`);
    return;
  }

  const { db, close } = connect(databaseUrl());
  try {
    if (command === "seed") await seed(db, file);
    else await migrate(db);
  } finally {
    await close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Database command failed.");
  process.exitCode = 1;
});
