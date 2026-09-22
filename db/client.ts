import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalDatabase = globalThis as typeof globalThis & {
  eventPool?: Pool;
  eventDatabase?: ReturnType<typeof drizzle<typeof schema>>;
};

function poolConfig() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const url = new URL(process.env.DATABASE_URL);
  const sslmode = url.searchParams.get("sslmode");
  url.searchParams.delete("sslmode");
  return {
    connectionString: url.toString(),
    // pg-connection-string warns that sslmode=require/prefer/verify-ca will stop
    // aliasing to verify-full; request full certificate validation explicitly instead.
    ssl: sslmode && sslmode !== "disable" ? { rejectUnauthorized: true } : undefined,
  };
}

export function database() {
  if (globalDatabase.eventDatabase) return globalDatabase.eventDatabase;
  const pool = (globalDatabase.eventPool ??= new Pool({
    ...poolConfig(),
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
