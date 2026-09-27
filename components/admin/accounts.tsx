"use client";
import { Mail, Trash2, UserPlus } from "lucide-react";
import { useRef } from "react";
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
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAccounts } from "@/hooks/use-accounts";
import { useConfirmRemoval } from "@/hooks/use-confirm-removal";
import { useInviteForm } from "@/hooks/use-invite-form";
import type { AdminAccount } from "@/lib/server/accounts";
import { FormField } from "./form-field";

const displayTitle = "font-display text-[32px] leading-[1.03] font-bold tracking-[-.02em]";

// Who can manage the Sessionsplan: invite people by email, resend or remove access.
export function Accounts({
  initialAccounts,
  selfId,
}: {
  initialAccounts: AdminAccount[];
  selfId: string;
}) {
  const { accounts, busy, ...actions } = useAccounts(initialAccounts);
  const invitation = useInviteForm(actions.invite);
  const { form } = invitation;
  // The account whose removal confirmation is open. After a removal its row is gone, so
  // focus lands on "Jemanden einladen".
  const inviteButton = useRef<HTMLButtonElement>(null);
  const confirm = useConfirmRemoval<AdminAccount>();

  async function remove(account: AdminAccount) {
    if (!(await actions.remove(account))) return;
    confirm.done();
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
          onClick={invitation.open}
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
                    onClick={() => actions.resend(account)}
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
                    onClick={() => confirm.ask(account)}
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
        open={invitation.isOpen}
        onOpenChange={(open) => !open && busy !== "invite" && invitation.close()}
      >
        <DialogContent
          initialFocus={() => document.getElementById("invite-name")}
          className="gap-0 bg-background p-7.5 max-md:px-4 max-md:py-5 sm:max-w-lg"
        >
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <DialogTitle className={`pr-12 ${displayTitle}`}>Jemanden einladen</DialogTitle>
            <FieldGroup className="mt-6.25 gap-5">
              <form.Field name="name">
                {(field) => (
                  <FormField field={field} id="invite-name" label="Name">
                    {(control) => (
                      <Input
                        {...control}
                        maxLength={80}
                        autoComplete="off"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>
              <form.Field name="email">
                {(field) => (
                  <FormField field={field} id="invite-email" label="E-Mail-Adresse">
                    {(control) => (
                      <Input
                        {...control}
                        type="email"
                        autoComplete="off"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>
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
                onClick={invitation.close}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirm.target !== null}
        onOpenChange={(open) => !open && busy === null && confirm.cancel()}
      >
        <AlertDialogContent finalFocus={confirm.removed ? inviteButton : true}>
          <AlertDialogHeader>
            <AlertDialogTitle className={displayTitle}>Zugang entfernen?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              {confirm.target?.name} wird sofort abgemeldet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy !== null}>Behalten</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busy !== null}
              aria-busy={busy !== null}
              onClick={() => confirm.target && remove(confirm.target)}
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
