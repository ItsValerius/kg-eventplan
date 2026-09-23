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

async function listed() {
  return { ok: true as const, accounts: await listAdmins() };
}

export async function inviteAdminAction(input: unknown) {
  if (!(await currentAdmin())) return signedOut;
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: validationMessage(parsed.error) };
  const { name, email } = parsed.data;
  if (await findAdminByEmail(email))
    return { ok: false as const, error: "Für diese E-Mail-Adresse gibt es schon einen Zugang." };

  try {
    // Fail before creating the account if the mailbox login is wrong.
    await checkMailer();
  } catch (error) {
    console.error("SMTP check failed:", error);
    return mailFailed;
  }
  await createInvitedAdmin(name, email);
  await sendInvitation(email);
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
  await sendInvitation(admin.email);
  return listed();
}

export async function removeAdminAction(input: unknown) {
  const self = await currentAdmin();
  if (!self) return signedOut;
  const parsed = adminIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: validationMessage(parsed.error) };
  if (parsed.data.id === self.id)
    return { ok: false as const, error: "Du kannst deinen eigenen Zugang nicht entfernen." };

  await removeAdmin(parsed.data.id);
  return listed();
}
