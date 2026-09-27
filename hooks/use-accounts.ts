import { useState } from "react";
import {
  inviteAdminAction,
  removeAdminAction,
  resendInvitationAction,
} from "@/app/admin/account-actions";
import { fail, notify } from "@/components/admin/feedback";
import type { InviteInput } from "@/lib/account";
import type { AdminAccount } from "@/lib/server/accounts";

type Result = Awaited<ReturnType<typeof inviteAdminAction>>;

// The admin accounts and the server actions that change them. One action runs at a time;
// `busy` names it: "invite", or "resend:<id>" / "remove:<id>". Each action reports through
// toasts and resolves to whether it succeeded.
export function useAccounts(initialAccounts: AdminAccount[]) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: string, request: () => Promise<Result>, success: string) {
    setBusy(action);
    try {
      const result = await request();
      if (!result.ok) {
        fail(result.error);
        return false;
      }
      setAccounts(result.accounts);
      notify(success);
      return true;
    } catch {
      fail("Das hat nicht geklappt. Bitte versuche es erneut.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  return {
    accounts,
    busy,
    invite: (input: InviteInput) =>
      run("invite", () => inviteAdminAction(input), `Einladung an ${input.email} verschickt.`),
    resend: (account: AdminAccount) =>
      run(
        `resend:${account.id}`,
        () => resendInvitationAction({ id: account.id }),
        `Einladung erneut an ${account.email} verschickt.`,
      ),
    remove: (account: AdminAccount) =>
      run(
        `remove:${account.id}`,
        () => removeAdminAction({ id: account.id }),
        `Zugang von ${account.name} entfernt.`,
      ),
  };
}
