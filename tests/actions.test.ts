import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ admin: null as { id: string } | null }));
const accounts = vi.hoisted(() => ({
  createInvitedAdmin: vi.fn(),
  findAdmin: vi.fn(),
  findAdminByEmail: vi.fn(),
  listAdmins: vi.fn(async () => []),
  removeAdmin: vi.fn(),
}));
const store = vi.hoisted(() => ({
  createEvent: vi.fn(),
  deleteEvent: vi.fn(),
  readEvents: vi.fn(async () => []),
  readPublishedEvents: vi.fn(async () => []),
  serialisePdfWrite: vi.fn(async (write: () => Promise<void>) => write()),
  setPublished: vi.fn(),
  updateEvent: vi.fn(),
}));
const requestPasswordReset = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ updateTag: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/server/auth", () => ({
  auth: { api: { requestPasswordReset } },
  currentAdmin: async () => session.admin,
  isAdmin: async () => session.admin !== null,
}));
vi.mock("@/lib/server/accounts", () => accounts);
vi.mock("@/lib/server/store", () => store);
vi.mock("@/lib/server/mail", () => ({ checkMailer: vi.fn() }));
vi.mock("@/lib/server/public-events", () => ({ EVENTS_CACHE_TAG: "events" }));
vi.mock("@/lib/pdf/season-pdf", () => ({ regenerateSeasonPlanPdf: vi.fn() }));

const { inviteAdminAction, removeAdminAction, resendInvitationAction } =
  await import("../app/admin/account-actions");
const { deleteEventAction, saveEventAction, setPublishedAction } =
  await import("../app/admin/actions");

const signedOut = { ok: false, error: "Bitte melde dich erneut an." };
const invite = { name: "Anna", email: "anna@example.org" };

beforeEach(() => {
  vi.clearAllMocks();
  session.admin = { id: "self" };
});

describe("Serveraktionen ohne Anmeldung", () => {
  it("lehnen jede Aktion ab und schreiben nichts", async () => {
    session.admin = null;
    expect(await inviteAdminAction(invite)).toEqual(signedOut);
    expect(await resendInvitationAction({ id: "x" })).toEqual(signedOut);
    expect(await removeAdminAction({ id: "x" })).toEqual(signedOut);
    expect(await saveEventAction({})).toEqual(signedOut);
    expect(await deleteEventAction({ id: "x" })).toEqual(signedOut);
    expect(await setPublishedAction({ id: "x", published: true })).toEqual(signedOut);
    for (const fn of [...Object.values(accounts), ...Object.values(store)]) {
      if (fn !== accounts.listAdmins) expect(fn).not.toHaveBeenCalled();
    }
  });
});

describe("Zugänge verwalten", () => {
  it("verhindert, dass man sich selbst entfernt", async () => {
    const result = await removeAdminAction({ id: "self" });
    expect(result.ok).toBe(false);
    expect(accounts.removeAdmin).not.toHaveBeenCalled();
  });

  it("meldet eine gleichzeitig angelegte E-Mail-Adresse als vergeben", async () => {
    accounts.createInvitedAdmin.mockRejectedValueOnce(
      Object.assign(new Error("insert failed"), { cause: { code: "23505" } }),
    );
    expect(await inviteAdminAction(invite)).toEqual({
      ok: false,
      error: "Für diese E-Mail-Adresse gibt es schon einen Zugang.",
    });
  });

  it("meldet eine fehlgeschlagene Einladung, ohne den Zugang zu verlieren", async () => {
    requestPasswordReset.mockRejectedValueOnce(new Error("smtp down"));
    const result = await inviteAdminAction(invite);
    expect(result.ok).toBe(false);
    expect(accounts.createInvitedAdmin).toHaveBeenCalledWith("Anna", "anna@example.org");
  });

  it("fängt Datenbankfehler beim Entfernen ab", async () => {
    accounts.removeAdmin.mockRejectedValueOnce(new Error("db down"));
    expect((await removeAdminAction({ id: "other" })).ok).toBe(false);
  });
});
