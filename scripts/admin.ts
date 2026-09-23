import { randomBytes, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { closeDatabase, database } from "../db/client";
import { accounts, sessions, users } from "../db/schema";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const usage =
  "Usage: pnpm admin:create <email> [name]   (creates the admin, or resets their password)\n" +
  "       pnpm admin:remove <email>";

// Hashed the same way Better Auth hashes passwords itself (scrypt), so sign-in accepts it.
// Running create again for an existing admin sets a new password and signs them out everywhere.
async function create(email: string, name: string) {
  const db = database();
  const password = randomBytes(18).toString("base64url");
  const hash = await hashPassword(password);
  await db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing) {
      await tx
        .update(accounts)
        .set({ password: hash })
        .where(and(eq(accounts.userId, existing.id), eq(accounts.providerId, "credential")));
      await tx.delete(sessions).where(eq(sessions.userId, existing.id));
      console.log(`Neues Passwort für ${email} gesetzt; bestehende Sitzungen wurden beendet.`);
      return;
    }
    const id = randomUUID();
    await tx.insert(users).values({ id, name, email, emailVerified: true });
    await tx.insert(accounts).values({
      id: randomUUID(),
      userId: id,
      accountId: id,
      providerId: "credential",
      password: hash,
    });
    console.log(`Admin ${email} angelegt.`);
  });
  console.log(`Passwort (wird nur jetzt angezeigt): ${password}`);
}

async function remove(email: string) {
  // Sessions and accounts are deleted with the user (on delete cascade).
  const deleted = await database().delete(users).where(eq(users.email, email)).returning();
  console.log(deleted.length ? `Admin ${email} entfernt.` : `Kein Admin mit ${email} gefunden.`);
}

async function main() {
  const [command, rawEmail, name] = process.argv.slice(2);
  const email = rawEmail?.trim().toLowerCase();
  if (!email?.includes("@") || !["create", "remove"].includes(command)) throw new Error(usage);
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before managing admins.");
  if (command === "create") await create(email, name?.trim() || email.split("@")[0]);
  else await remove(email);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Admin command failed.");
    process.exitCode = 1;
  })
  .finally(closeDatabase);
