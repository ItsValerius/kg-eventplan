"use client";
import { Mail, Trash2, UserPlus } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  inviteAdminAction,
  removeAdminAction,
  resendInvitationAction,
} from "@/app/admin/account-actions";
import { inviteSchema } from "@/lib/account";
import type { AdminAccount } from "@/lib/server/accounts";

type Result = Awaited<ReturnType<typeof inviteAdminAction>>;
type InviteField = "name" | "email";

// Same feedback as the event list: toasts, so the list never shifts. Errors stay until dismissed.
const notify = (title: string) => toast.add({ title, type: "success", timeout: 3000 });
const fail = (title: string) => toast.add({ title, type: "error", timeout: 0 });
const displayTitle = "font-display text-[32px] leading-[1.03] font-bold tracking-[-.02em]";

// Who can manage the Sessionsplan: invite people by email, resend or remove access.
export function Accounts({
  initialAccounts,
  selfId,
}: {
  initialAccounts: AdminAccount[];
  selfId: string;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<InviteField, string>>>({});
  // Which action is running: "invite", or "resend:<id>" / "remove:<id>".
  const [busy, setBusy] = useState<string | null>(null);
  // The account whose removal confirmation is open.
  const [removing, setRemoving] = useState<AdminAccount | null>(null);
  const inviteButton = useRef<HTMLButtonElement>(null);
  const justRemoved = useRef(false);

  async function run(action: string, request: () => Promise<Result>, success: string) {
    setBusy(action);
    try {
      const result = await request();
      if (!result.ok) return fail(result.error);
      setAccounts(result.accounts);
      notify(success);
      return true;
    } catch {
      fail("Das hat nicht geklappt. Bitte versuche es erneut.");
    } finally {
      setBusy(null);
    }
  }

  function openInvite() {
    setName("");
    setEmail("");
    setFieldErrors({});
    setInviting(true);
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    const parsed = inviteSchema.safeParse({ name, email });
    if (!parsed.success) {
      // Each problem under its field, focus on the first, like the event form.
      const errors: Partial<Record<InviteField, string>> = {};
      for (const issue of parsed.error.issues)
        errors[issue.path[0] as InviteField] ??= issue.message;
      setFieldErrors(errors);
      document.getElementById(errors.name ? "invite-name" : "invite-email")?.focus();
      return;
    }
    setFieldErrors({});
    const sent = await run(
      "invite",
      () => inviteAdminAction(parsed.data),
      `Einladung an ${parsed.data.email} verschickt.`,
    );
    if (sent) setInviting(false);
  }

  async function remove(account: AdminAccount) {
    const removed = await run(
      `remove:${account.id}`,
      () => removeAdminAction({ id: account.id }),
      `Zugang von ${account.name} entfernt.`,
    );
    if (removed) {
      justRemoved.current = true;
      setRemoving(null);
    }
  }

  function fieldProps(field: InviteField) {
    return {
      id: `invite-${field}`,
      "aria-invalid": fieldErrors[field] ? true : undefined,
      "aria-describedby": fieldErrors[field] ? `invite-${field}-error` : undefined,
    };
  }

  return (
    <section
      aria-labelledby="accounts-heading"
      className="mt-16 border-t border-border pt-10 max-md:mt-12"
    >
      <div className="flex items-start justify-between gap-5 max-md:flex-col max-md:gap-4">
        <div>
          <h2 id="accounts-heading" tabIndex={-1} className="scroll-mt-6 text-[32px]">
            Zugänge
          </h2>
          <p className="mt-2 max-w-[60ch] text-[13px]">
            Wer eingeladen wird, bekommt eine E-Mail und legt sein Passwort selbst fest. Der Link
            ist 24 Stunden gültig.
          </p>
        </div>
        <Button
          ref={inviteButton}
          variant="outline"
          size="default"
          aria-haspopup="dialog"
          disabled={busy !== null}
          onClick={openInvite}
        >
          <UserPlus size={18} />
          Jemanden einladen
        </Button>
      </div>

      <ul className="mt-6">
        {accounts.map((account) => {
          const self = account.id === selfId;
          return (
            <li
              key={account.id}
              className="group/row flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border py-4.5"
            >
              {/* A real basis, so the badge and buttons wrap below instead of squeezing the address. */}
              <div className="min-w-0 flex-[1_1_16rem]">
                <p className="text-[15px] font-semibold break-words text-foreground">
                  {account.name}
                  {self && <span className="font-normal text-muted-foreground"> (du)</span>}
                </p>
                <p className="mt-0.5 text-xs wrap-anywhere">{account.email}</p>
              </div>
              {account.pending && (
                <Badge className="rounded-sm border border-border bg-muted px-1.5 py-0.75 text-[11px] font-normal text-muted-foreground">
                  Einladung offen
                </Badge>
              )}
              {/* ml-auto keeps the buttons on the right edge when they wrap below the name. */}
              <div className="ml-auto flex gap-2">
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
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground group-hover/row:text-destructive hover:bg-destructive-surface hover:text-destructive focus-visible:text-destructive"
                    disabled={busy !== null}
                    aria-label={`Zugang von ${account.name} entfernen`}
                    onClick={() => setRemoving(account)}
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={inviting}
        onOpenChange={(open) => !open && busy !== "invite" && setInviting(false)}
      >
        <DialogContent
          initialFocus={() => document.getElementById("invite-name")}
          className="gap-0 bg-background p-7.5 max-md:px-4 max-md:py-5 sm:max-w-lg"
        >
          <form noValidate onSubmit={invite}>
            <DialogTitle className={`pr-12 ${displayTitle}`}>Jemanden einladen</DialogTitle>
            <FieldGroup className="mt-6.25 gap-5">
              <Field data-invalid={fieldErrors.name ? true : undefined}>
                <FieldLabel htmlFor="invite-name" className="text-xs font-semibold">
                  Name
                </FieldLabel>
                <Input
                  {...fieldProps("name")}
                  maxLength={80}
                  autoComplete="off"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFieldErrors((errors) => ({ ...errors, name: undefined }));
                  }}
                />
                <FieldError id="invite-name-error" className="text-xs">
                  {fieldErrors.name}
                </FieldError>
              </Field>
              <Field data-invalid={fieldErrors.email ? true : undefined}>
                <FieldLabel htmlFor="invite-email" className="text-xs font-semibold">
                  E-Mail-Adresse
                </FieldLabel>
                <Input
                  {...fieldProps("email")}
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((errors) => ({ ...errors, email: undefined }));
                  }}
                />
                <FieldError id="invite-email-error" className="text-xs">
                  {fieldErrors.email}
                </FieldError>
              </Field>
            </FieldGroup>
            <div className="mt-6.5 flex flex-wrap gap-3">
              <Button
                type="submit"
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
              <Button
                variant="outline"
                size="default"
                type="button"
                disabled={busy === "invite"}
                onClick={() => setInviting(false)}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={removing !== null}
        onOpenChange={(open) => !open && busy === null && setRemoving(null)}
      >
        {/* After a removal its row is gone, so focus lands on "Jemanden einladen". */}
        <AlertDialogContent
          finalFocus={() => {
            const removed = justRemoved.current;
            justRemoved.current = false;
            return removed ? inviteButton.current : true;
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className={displayTitle}>Zugang entfernen?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              {removing?.name} wird sofort abgemeldet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy !== null}>Behalten</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busy !== null}
              aria-busy={busy !== null}
              onClick={() => removing && remove(removing)}
            >
              {busy !== null && <Spinner aria-hidden />}
              {busy !== null ? "Wird entfernt …" : "Ja, entfernen"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
