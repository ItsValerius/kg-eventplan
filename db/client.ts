import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalDatabase = globalThis as typeof globalThis & {
  eventPool?: Pool;
  eventDatabase?: ReturnType<typeof drizzle<typeof schema>>;
};

function connectionString() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  return process.env.DATABASE_URL;
}

export function database() {
  if (globalDatabase.eventDatabase) return globalDatabase.eventDatabase;
  const pool = (globalDatabase.eventPool ??= new Pool({
    connectionString: connectionString(),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 10_000,
  }).on("error", (error) =>
    console.error("Idle database connection failed:", error.message),
  ));
  return (globalDatabase.eventDatabase = drizzle(pool, { schema }));
}

export async function closeDatabase() {
  if (!globalDatabase.eventPool) return;
  await globalDatabase.eventPool.end();
  delete globalDatabase.eventPool;
  delete globalDatabase.eventDatabase;
}
