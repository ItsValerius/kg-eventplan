"use client";
import { ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useForgotPassword, useSetPassword } from "@/hooks/use-password-reset";
import { PASSWORD_MIN } from "@/lib/account";
import { FormField } from "./form-field";

type Submittable = { handleSubmit: () => Promise<void> };
const submitWith = (form: Submittable) => (event: React.FormEvent) => {
  event.preventDefault();
  form.handleSubmit();
};

function Card({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="max-w-110 rounded-xl border border-border bg-muted p-9 max-md:p-6.5">
      <KeyRound size={28} className="mb-5 text-primary" />
      <h1 className="text-4xl">{title}</h1>
      <p className="mt-4 mb-6.25 text-[13px] leading-[1.8]">{intro}</p>
      {children}
    </div>
  );
}

function Submit({ busy, label, busyLabel }: { busy: boolean; label: string; busyLabel: string }) {
  return (
    <Button
      type="submit"
      className="mt-4 w-full justify-between"
      variant="default"
      size="default"
      disabled={busy}
      aria-busy={busy}
    >
      {busy ? busyLabel : label}
      {busy ? <Spinner aria-hidden className="size-4.5" /> : <ArrowRight size={18} />}
    </Button>
  );
}

function Problem({ children }: { children: ReactNode }) {
  return (
    <Alert variant="destructive" className="my-5 max-md:text-xs">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

function BackToLogin() {
  return (
    <Button
      variant="link"
      size="link"
      className="mt-4"
      nativeButton={false}
      render={<Link href="/admin" />}
    >
      Zur Anmeldung <ArrowRight size={15} />
    </Button>
  );
}

// Requests a reset link. The answer is the same whether or not the address has an account.
export function ForgotPassword() {
  const { form, error, done, busy } = useForgotPassword();

  return (
    <Card
      title="Passwort vergessen?"
      intro="Gib die E-Mail-Adresse deines Zugangs ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst."
    >
      {done ? (
        <Alert variant="success" role="status">
          <AlertDescription>
            Wenn es für diese Adresse einen Zugang gibt, ist der Link unterwegs. Er ist 24 Stunden
            gültig.
          </AlertDescription>
        </Alert>
      ) : (
        <form noValidate onSubmit={submitWith(form)}>
          <form.Field name="email">
            {(field) => (
              <FormField field={field} label="E-Mail-Adresse">
                {(control) => (
                  <Input
                    {...control}
                    type="email"
                    autoComplete="username"
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
          <Submit busy={busy} label="Link anfordern" busyLabel="Wird gesendet …" />
          {error && <Problem>{error}</Problem>}
        </form>
      )}
      <BackToLogin />
    </Card>
  );
}

// Sets the password from an invitation or reset link (/admin/passwort?token=…).
export function SetPassword() {
  const params = useSearchParams();
  const token = params.get("token");
  const expired = !token || params.get("error") === "INVALID_TOKEN";
  const { form, error, done, busy } = useSetPassword(token ?? "");

  return (
    <Card title="Passwort festlegen" intro="Wähle ein Passwort für deinen Zugang zum Sessionsplan.">
      {expired ? (
        <>
          <Problem>
            Der Link ist abgelaufen oder wurde schon benutzt. Fordere unter{" "}
            <Link href="/admin/passwort-vergessen">Passwort vergessen</Link> einen neuen an.
          </Problem>
          <BackToLogin />
        </>
      ) : done ? (
        <>
          <Alert variant="success" role="status">
            <AlertDescription>
              Dein Passwort ist gespeichert. Du kannst dich jetzt anmelden.
            </AlertDescription>
          </Alert>
          <BackToLogin />
        </>
      ) : (
        <form noValidate onSubmit={submitWith(form)}>
          <FieldGroup className="gap-4">
            <form.Field name="password">
              {(field) => (
                <FormField field={field} label="Neues Passwort">
                  {(control) => (
                    <>
                      <Input
                        {...control}
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={PASSWORD_MIN}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldDescription className="text-xs">
                        Mindestens {PASSWORD_MIN} Zeichen.
                      </FieldDescription>
                    </>
                  )}
                </FormField>
              )}
            </form.Field>
            <form.Field name="repeat">
              {(field) => (
                <FormField field={field} label="Passwort wiederholen">
                  {(control) => (
                    <Input
                      {...control}
                      type="password"
                      autoComplete="new-password"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                </FormField>
              )}
            </form.Field>
          </FieldGroup>
          <Submit busy={busy} label="Passwort speichern" busyLabel="Wird gespeichert …" />
          {error && <Problem>{error}</Problem>}
        </form>
      )}
    </Card>
  );
}
