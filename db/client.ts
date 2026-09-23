import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

const globalDatabase = globalThis as typeof globalThis & {
  eventPool?: Pool;
  eventDatabase?: Database;
};

function createPool(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const sslmode = url.searchParams.get("sslmode");
  url.searchParams.delete("sslmode");
  return new Pool({
    connectionString: url.toString(),
    // pg-connection-string warns that sslmode=require/prefer/verify-ca will stop
    // aliasing to verify-full; request full certificate validation explicitly instead.
    ssl: sslmode && sslmode !== "disable" ? { rejectUnauthorized: true } : undefined,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 10_000,
  }).on("error", (error) => console.error("Idle database connection failed:", error.message));
}

// The app's shared connection, reused across requests and hot reloads.
export function database() {
  if (globalDatabase.eventDatabase) return globalDatabase.eventDatabase;
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const pool = (globalDatabase.eventPool ??= createPool(process.env.DATABASE_URL));
  return (globalDatabase.eventDatabase = drizzle(pool, { schema }));
}

export async function closeDatabase() {
  if (!globalDatabase.eventPool) return;
  await globalDatabase.eventPool.end();
  delete globalDatabase.eventPool;
  delete globalDatabase.eventDatabase;
}

// A one-off connection for scripts that need a specific URL, e.g. the direct one for migrations.
export function connect(databaseUrl: string) {
  const pool = createPool(databaseUrl);
  return { db: drizzle(pool, { schema }), close: () => pool.end() };
}
