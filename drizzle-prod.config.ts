import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

for (const file of [".env.prod"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
  verbose: true,
});
