import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { closeDatabase, database } from "../db/client";
import { events } from "../db/schema";
import { initialEvents, validateEvent, type ClubEvent } from "../lib/events";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

async function main() {
  const command = process.argv[2];
  if (!["migrate", "seed"].includes(command))
    throw new Error("Usage: tsx scripts/db.ts migrate|seed [events.json]");
  if (!process.env.DATABASE_URL)
    throw new Error("Set DATABASE_URL before running database commands.");

  const db = database();
  if (command === "migrate") {
    const table = await db.execute<{ name: string | null }>(sql`SELECT to_regclass('public.events')::text AS name`);
    const drizzleTable = await db.execute<{ name: string | null }>(sql`SELECT to_regclass('drizzle.__drizzle_migrations')::text AS name`);
    if (table.rows[0]?.name && !drizzleTable.rows[0]?.name) {
      // Upgrade databases created before Drizzle, once, without rebuilding or losing data.
      await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(20262027)`);
      await tx.execute(sql`CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now()
      )`);
      const directory = path.join(process.cwd(), "db/migrations");
      for (const name of (await readdir(directory)).filter((entry) => entry.endsWith(".sql")).sort()) {
        const applied = await tx.execute(
          sql`SELECT 1 FROM schema_migrations WHERE name = ${name}`,
        );
        if (applied.rows.length) continue;
        await tx.execute(sql.raw(await readFile(path.join(directory, name), "utf8")));
        await tx.execute(sql`INSERT INTO schema_migrations (name) VALUES (${name})`);
        console.log(`Applied ${name}`);
      }
        const [baseline] = readMigrationFiles({ migrationsFolder: "drizzle" });
        await tx.execute(sql`CREATE SCHEMA IF NOT EXISTS drizzle`);
        await tx.execute(sql`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
          id serial PRIMARY KEY, hash text NOT NULL, created_at bigint
        )`);
        await tx.execute(sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
          SELECT ${baseline.hash}, ${baseline.folderMillis}
          WHERE NOT EXISTS (
            SELECT 1 FROM drizzle.__drizzle_migrations WHERE created_at = ${baseline.folderMillis}
          )`);
      });
    }
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Database ready.");
    return;
  }

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(20262027)`);
    if ((await tx.select({ id: events.id }).from(events).limit(1)).length) {
      console.log("Database already has events; leaving them unchanged.");
      return;
    }

    const filename = process.argv[3] || path.join(process.env.EVENT_DATA_DIR || "data", "events.json");
    let source: unknown;
    try {
      source = JSON.parse(await readFile(filename, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT" || process.argv[3]) throw error;
      source = initialEvents;
    }
    if (!Array.isArray(source)) throw new Error("Event import must be an array.");
    const importedEvents: ClubEvent[] = source.map((value) => {
      if (typeof value?.id !== "string" || !value.id)
        throw new Error("Every imported event needs an ID.");
      return { ...validateEvent(value), id: value.id };
    });
    if (importedEvents.length) await tx.insert(events).values(importedEvents);
    console.log(`Imported ${importedEvents.length} events. Existing JSON files are retained as a backup.`);
  });
  console.log("Database ready.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Database command failed.");
    process.exitCode = 1;
  })
  .finally(closeDatabase);
