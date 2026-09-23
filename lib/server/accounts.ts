import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { database } from "@/db/client";
import { accounts, users } from "@/db/schema";

export type AdminAccount = { id: string; name: string; email: string; pending: boolean };

// A person has accepted their invitation once they have set a password.
const passwordSet = and(
  eq(accounts.userId, users.id),
  eq(accounts.providerId, "credential"),
  isNotNull(accounts.password),
);

export async function listAdmins(): Promise<AdminAccount[]> {
  const rows = await database()
    .select({ id: users.id, name: users.name, email: users.email, accountId: accounts.id })
    .from(users)
    .leftJoin(accounts, passwordSet)
    .orderBy(asc(users.name));
  return rows.map(({ accountId, ...admin }) => ({ ...admin, pending: accountId === null }));
}

export async function hasPassword(userId: string) {
  const [row] = await database()
    .select({ id: accounts.id })
    .from(accounts)
    .innerJoin(users, passwordSet)
    .where(eq(users.id, userId));
  return row !== undefined;
}

export async function findAdminByEmail(email: string) {
  const [row] = await database().select().from(users).where(eq(users.email, email));
  return row;
}

export async function findAdmin(id: string) {
  const [row] = await database().select().from(users).where(eq(users.id, id));
  return row;
}

// Without a password the account cannot sign in until the invitation link is used.
export async function createInvitedAdmin(name: string, email: string) {
  await database().insert(users).values({ id: randomUUID(), name, email, emailVerified: true });
}

// Sessions and the password go with the user (on delete cascade).
export async function removeAdmin(id: string) {
  await database().delete(users).where(eq(users.id, id));
}
