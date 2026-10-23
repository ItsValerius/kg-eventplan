import { existsSync } from "node:fs";
import { afterAll, describe, expect, it, vi } from "vitest";
import { like } from "drizzle-orm";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/server/auth", () => ({
  auth: { api: { requestPasswordReset: vi.fn() } },
  currentAdmin: async () => ({ id: "self" }),
}));
vi.mock("@/lib/server/mail", () => ({ checkMailer: vi.fn() }));

const { closeDatabase, database } = await import("../db/client");
const { users } = await import("../db/schema");
const { inviteAdminAction } = await import("../app/admin/account-actions");
const { serialisePdfWrite } = await import("../lib/server/store");

const prefix = `concurrency-${Date.now()}`;

afterAll(async () => {
  await database()
    .delete(users)
    .where(like(users.email, `${prefix}%`));
  await closeDatabase();
});

describe("Gleichzeitige Zugriffe auf PostgreSQL", () => {
  it("legt bei gleichzeitigen Einladungen derselben Adresse genau einen Zugang an", async () => {
    const invite = { name: "Anna", email: `${prefix}@example.org` };
    const results = await Promise.all(Array.from({ length: 5 }, () => inviteAdminAction(invite)));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    for (const result of results.filter((r) => !r.ok)) {
      expect(result).toEqual({
        ok: false,
        error: "Für diese E-Mail-Adresse gibt es schon einen Zugang.",
      });
    }
  });

  it("schreibt den Sessionsplan nie gleichzeitig", async () => {
    const log: string[] = [];
    await Promise.all(
      [1, 2, 3].map((n) =>
        serialisePdfWrite(async () => {
          log.push(`start ${n}`);
          await new Promise((resolve) => setTimeout(resolve, 100));
          log.push(`end ${n}`);
        }),
      ),
    );
    for (let i = 0; i < log.length; i += 2) {
      expect(log[i + 1]).toBe(log[i].replace("start", "end"));
    }
  });
});
