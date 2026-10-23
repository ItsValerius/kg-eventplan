"use server";

import { headers } from "next/headers";
import { adminIdSchema, inviteSchema } from "@/lib/account";
import { validationMessage } from "@/lib/events";
import {
  createInvitedAdmin,
  findAdmin,
  findAdminByEmail,
  listAdmins,
  removeAdmin,
} from "@/lib/server/accounts";
import { auth, currentAdmin } from "@/lib/server/auth";
import { checkMailer } from "@/lib/server/mail";

const signedOut = { ok: false as const, error: "Bitte melde dich erneut an." };
const mailFailed = {
  ok: false as const,
  error:
    "Die E-Mail konnte nicht gesendet werden. Bitte prüfe die E-Mail-Einstellungen (SMTP_USER, SMTP_PASSWORD).",
};

// Sends the invitation (a password link) through Better Auth; see account-mail.ts.
async function sendInvitation(email: string) {
  await auth.api.requestPasswordReset({
    body: { email, redirectTo: "/admin/passwort" },
    headers: await headers(),
  });
}

const failed = {
  ok: false as const,
  error: "Das hat nicht geklappt. Bitte lade die Seite neu und versuche es erneut.",
};
const emailTaken = {
  ok: false as const,
  error: "Für diese E-Mail-Adresse gibt es schon einen Zugang.",
};

// Postgres unique_violation; Drizzle wraps the driver error in `cause`.
function isUniqueViolation(error: unknown) {
  const code = (e: unknown) => (e as { code?: string } | null)?.code;
  return code(error) === "23505" || code((error as { cause?: unknown } | null)?.cause) === "23505";
}

async function listed() {
  return { ok: true as const, accounts: await listAdmins() };
}

export async function inviteAdminAction(input: unknown) {
  if (!(await currentAdmin())) return signedOut;
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: validationMessage(parsed.error) };
  const { name, email } = parsed.data;
  if (await findAdminByEmail(email)) return emailTaken;

  try {
    // Fail before creating the account if the mailbox login is wrong.
    await checkMailer();
  } catch (error) {
    console.error("SMTP check failed:", error);
    return mailFailed;
  }
  try {
    await createInvitedAdmin(name, email);
  } catch (error) {
    // Two admins inviting the same address at once: the second insert hits the constraint.
    if (isUniqueViolation(error)) return emailTaken;
    console.error("Invite failed:", error);
    return failed;
  }
  try {
    await sendInvitation(email);
  } catch (error) {
    console.error("Invitation mail failed:", error);
    // The pending account stays, so the invitation can be sent again from the list.
    return {
      ok: false as const,
      error:
        "Der Zugang wurde angelegt, aber die Einladung konnte nicht gesendet werden. Bitte lade die Seite neu und nutze „Erneut senden“.",
    };
  }
  return listed();
}

export async function resendInvitationAction(input: unknown) {
  if (!(await currentAdmin())) return signedOut;
  const parsed = adminIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: validationMessage(parsed.error) };
  const admin = await findAdmin(parsed.data.id);
  if (!admin) return { ok: false as const, error: "Diesen Zugang gibt es nicht mehr." };

  try {
    await checkMailer();
  } catch (error) {
    console.error("SMTP check failed:", error);
    return mailFailed;
  }
  try {
    await sendInvitation(admin.email);
  } catch (error) {
    console.error("Invitation mail failed:", error);
    return failed;
  }
  return listed();
}

export async function removeAdminAction(input: unknown) {
  const self = await currentAdmin();
  if (!self) return signedOut;
  const parsed = adminIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: validationMessage(parsed.error) };
  if (parsed.data.id === self.id)
    return { ok: false as const, error: "Du kannst deinen eigenen Zugang nicht entfernen." };

  try {
    await removeAdmin(parsed.data.id);
  } catch (error) {
    console.error("Remove admin failed:", error);
    return failed;
  }
  return listed();
}
