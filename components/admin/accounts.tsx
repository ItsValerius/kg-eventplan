"use client";
import { Mail, Trash2, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  inviteAdminAction,
  removeAdminAction,
  resendInvitationAction,
} from "@/app/admin/account-actions";
import { inviteSchema } from "@/lib/account";
import { validationMessage } from "@/lib/events";
import type { AdminAccount } from "@/lib/server/accounts";

type Result = Awaited<ReturnType<typeof inviteAdminAction>>;

// Who can manage the Sessionsplan: invite people by email, resend or remove access.
export function Accounts({
  initialAccounts,
  selfId,
}: {
  initialAccounts: AdminAccount[];
  selfId: string;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // Which action is running: "invite", or "resend:<id>" / "remove:<id>".
  const [busy, setBusy] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function run(action: string, request: () => Promise<Result>, success: string) {
    setBusy(action);
    setError("");
    setNotice("");
    try {
      const result = await request();
      if (!result.ok) return setError(result.error);
      setAccounts(result.accounts);
      setNotice(success);
      return true;
    } catch {
      setError("Das hat nicht geklappt. Bitte versuche es erneut.");
    } finally {
      setBusy(null);
    }
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    const parsed = inviteSchema.safeParse({ name, email });
    if (!parsed.success) return setError(validationMessage(parsed.error));
    const sent = await run(
      "invite",
      () => inviteAdminAction(parsed.data),
      `Einladung an ${parsed.data.email} verschickt.`,
    );
    if (sent) {
      setName("");
      setEmail("");
    }
  }

  return (
    <section
      aria-labelledby="accounts-heading"
      className="mt-16 border-t border-border pt-10 max-md:mt-12"
    >
      <h2 id="accounts-heading" className="text-[35px] max-md:text-[29px]">
        Zugänge
      </h2>
      <p className="mt-2 max-w-[60ch] text-[13px]">
        Wer eingeladen wird, bekommt eine E-Mail und legt sein Passwort selbst fest. Der Link ist 24
        Stunden gültig.
      </p>
      {notice && (
        <Alert variant="success" role="status" className="my-5">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="my-5">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ul className="mt-6">
        {accounts.map((account) => {
          const self = account.id === selfId;
          return (
            <li
              key={account.id}
              className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border py-4.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-foreground">
                  {account.name}
                  {self && <span className="font-normal text-muted-foreground"> (du)</span>}
                </p>
                <p className="mt-0.5 text-xs break-all">{account.email}</p>
              </div>
              {account.pending && (
                <Badge className="rounded-sm border border-border bg-muted px-1.5 py-0.75 text-[11px] font-normal text-muted-foreground">
                  Einladung offen
                </Badge>
              )}
              <div className="flex gap-2">
                {account.pending && (
                  <Button
                    variant="outline"
                    size="default"
                    disabled={busy !== null}
                    aria-busy={busy === `resend:${account.id}`}
                    onClick={() =>
                      run(
                        `resend:${account.id}`,
                        () => resendInvitationAction({ id: account.id }),
                        `Einladung erneut an ${account.email} verschickt.`,
                      )
                    }
                  >
                    {busy === `resend:${account.id}` ? <Spinner aria-hidden /> : <Mail size={16} />}
                    Erneut senden
                  </Button>
                )}
                {!self && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:bg-destructive-surface"
                    disabled={busy !== null}
                    aria-label={`Zugang von ${account.name} entfernen`}
                    onClick={() => setRemoving(account.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>
              {removing === account.id && (
                <div className="flex basis-full items-center gap-3 bg-destructive-surface p-4.5 max-md:flex-wrap max-md:p-3.5">
                  <p className="flex-1 text-[13px] text-destructive max-md:basis-full">
                    Zugang von {account.name} wirklich entfernen? Die Person wird sofort abgemeldet.
                  </p>
                  <Button
                    variant="destructive"
                    size="default"
                    disabled={busy !== null}
                    aria-busy={busy === `remove:${account.id}`}
                    onClick={async () => {
                      if (
                        await run(
                          `remove:${account.id}`,
                          () => removeAdminAction({ id: account.id }),
                          `Zugang von ${account.name} entfernt.`,
                        )
                      )
                        setRemoving(null);
                    }}
                  >
                    {busy === `remove:${account.id}` && <Spinner aria-hidden />}
                    Ja, entfernen
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    disabled={busy !== null}
                    onClick={() => setRemoving(null)}
                  >
                    Behalten
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <form
        className="mt-8 rounded-xl border border-border bg-muted p-7.5 max-md:px-4 max-md:py-5"
        noValidate
        onSubmit={invite}
      >
        <h3 className="font-sans text-base font-semibold">Jemanden einladen</h3>
        <FieldGroup className="mt-4 grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:gap-4">
          <Field>
            <FieldLabel htmlFor="invite-name" className="text-xs font-semibold">
              Name
            </FieldLabel>
            <Input
              id="invite-name"
              maxLength={80}
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="invite-email" className="text-xs font-semibold">
              E-Mail-Adresse
            </FieldLabel>
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </FieldGroup>
        <Button
          type="submit"
          className="mt-5"
          variant="default"
          size="default"
          disabled={busy !== null}
          aria-busy={busy === "invite"}
        >
          {busy === "invite" ? (
            <Spinner aria-hidden className="size-4.5" />
          ) : (
            <UserPlus size={18} />
          )}
          {busy === "invite" ? "Wird eingeladen …" : "Einladen"}
        </Button>
      </form>
    </section>
  );
}
